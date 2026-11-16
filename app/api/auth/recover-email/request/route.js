import crypto from 'node:crypto';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  clean,
  normalizePhone,
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
    await logEvent('csrf_blocked', { ip, detail: 'Recover email request cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 10 / jam
  const ipBucket = `recover:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 3600)) {
    await logEvent('otp_throttled', { ip, detail: 'Recover email IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  const phone = body ? normalizePhone(body.phone) : null;
  const name = body ? clean(body.name, 80) : '';

  const neutralResponse = {
    ok: true,
    message: 'Jika data cocok dengan akun terdaftar, kode verifikasi telah dikirim ke email terdaftar.',
    resendAfter: 60,
  };

  if (!phone || !name) {
    return json(neutralResponse);
  }

  // Throttle per nomor HP: 3 / jam
  const phoneBucket = `recover:phone:${phone}`;
  if (await isThrottled(phoneBucket, 3, 3600)) {
    await logEvent('otp_throttled', { ip, detail: 'Phone throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  await recordAttempt(ipBucket);

  try {
    const [rows] = await execute('SELECT id, name, email, phone FROM users WHERE phone = ? LIMIT 1', [phone]);

    if (!rows || rows.length === 0) {
      return json(neutralResponse);
    }

    const user = rows[0];

    // Cocokkan nama secara case-insensitive
    if (user.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
      return json(neutralResponse);
    }

    // Periksa cooldown 60 detik
    const [recent] = await execute(
      `SELECT id FROM password_resets WHERE user_id = ? AND purpose = 'email' AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 60 SECOND) LIMIT 1`,
      [user.id]
    );

    if (recent && recent.length > 0) {
      return json(neutralResponse);
    }

    await recordAttempt(phoneBucket);

    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = hmac(code);

    await execute("DELETE FROM password_resets WHERE user_id = ? AND purpose = 'email' AND verified = 0", [user.id]);

    await execute(
      `INSERT INTO password_resets (user_id, purpose, code_hash, attempts, verified, reset_token_hash, expires_at, created_at)
       VALUES (?, 'email', ?, 0, 0, NULL, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 MINUTE), UTC_TIMESTAMP())`,
      [user.id, codeHash]
    );

    await sendOtpEmail(user.email, code, 'email');
    await logEvent('otp_requested', { ip, userId: user.id, detail: 'email_recovery' });

    return json(neutralResponse);
  } catch (err) {
    console.error('Error saat request recover email:', err.message);
    return json(neutralResponse);
  }
}
