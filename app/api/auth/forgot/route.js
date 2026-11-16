import crypto from 'node:crypto';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  hmac,
  getIp,
  isThrottled,
  recordAttempt,
} from '@/lib/security';
import { sendOtpEmail } from '@/lib/mailer';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Forgot cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 10 / jam
  const ipBucket = `forgot:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 3600)) {
    await logEvent('otp_throttled', { ip, detail: 'Forgot IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  const email = body ? normalizeEmail(body.email) : null;

  // Respons standar yang identik apakah email valid/terdaftar atau tidak
  const neutralResponse = {
    ok: true,
    message: 'Jika email terdaftar, kode verifikasi telah dikirim.',
    resendAfter: 60,
  };

  if (!email) {
    return json(neutralResponse);
  }

  // Throttle per email: 3 / jam
  const emailBucket = `forgot:email:${email}`;
  if (await isThrottled(emailBucket, 3, 3600)) {
    await logEvent('otp_throttled', { ip, detail: email.slice(0, 3) + '...' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  await recordAttempt(ipBucket);

  try {
    const [rows] = await execute('SELECT id, email FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows || rows.length === 0) {
      // Email tidak terdaftar: tetap kembalikan respons netral
      return json(neutralResponse);
    }

    const user = rows[0];

    // Cek cooldown 60 detik untuk user ini
    const [recent] = await execute(
      `SELECT id FROM password_resets WHERE user_id = ? AND purpose = 'password' AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 60 SECOND) LIMIT 1`,
      [user.id]
    );

    if (recent && recent.length > 0) {
      return json(neutralResponse);
    }

    await recordAttempt(emailBucket);

    // Buat OTP 6 digit
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = hmac(code);

    // Bersihkan request reset password belum terverifikasi sebelumnya
    await execute("DELETE FROM password_resets WHERE user_id = ? AND purpose = 'password' AND verified = 0", [user.id]);

    // Simpan ke database dengan masa berlaku 5 menit
    await execute(
      `INSERT INTO password_resets (user_id, purpose, code_hash, attempts, verified, reset_token_hash, expires_at, created_at)
       VALUES (?, 'password', ?, 0, 0, NULL, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE), UTC_TIMESTAMP())`,
      [user.id, codeHash]
    );

    // Kirim email (atau catat di server console jika driver console)
    await sendOtpEmail(user.email, code, 'password');
    await logEvent('otp_requested', { ip, userId: user.id, detail: 'password' });

    return json(neutralResponse);
  } catch (err) {
    console.error('Error saat request forgot password:', err.message);
    return json(neutralResponse);
  }
}
