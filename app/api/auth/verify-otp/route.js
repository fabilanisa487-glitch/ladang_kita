import crypto from 'node:crypto';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  hmac,
  sha256,
  getIp,
  isThrottled,
  recordAttempt,
} from '@/lib/security';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Verify OTP cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 10 / 15 menit
  const ipBucket = `verify-otp:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 900)) {
    await logEvent('otp_throttled', { ip, detail: 'Verify OTP IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Permintaan tidak valid.' }, 400);
  }

  const email = normalizeEmail(body.email);
  const code = String(body.code || '').trim();

  if (!email || !code || !/^\d{6}$/.test(code)) {
    return json({ error: 'Kode verifikasi harus berupa 6 digit angka.' }, 400);
  }

  await recordAttempt(ipBucket);

  try {
    const [rows] = await execute(
      `SELECT pr.id, pr.user_id, pr.code_hash, pr.attempts
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.email = ? AND pr.purpose = 'password' AND pr.verified = 0 AND pr.expires_at > UTC_TIMESTAMP()
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [email]
    );

    if (!rows || rows.length === 0) {
      return json({ error: 'Kode verifikasi tidak valid atau telah kedaluwarsa. Minta kode baru.' }, 400);
    }

    const pr = rows[0];

    if (pr.attempts >= 5) {
      return json({ error: 'Kode verifikasi hangus karena melebihi batas percobaan. Minta kode baru.' }, 400);
    }

    const actualHash = hmac(code);
    const expectedHash = pr.code_hash;

    const bufA = Buffer.from(actualHash, 'hex');
    const bufB = Buffer.from(expectedHash, 'hex');
    const matched = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

    if (!matched) {
      const newAttempts = pr.attempts + 1;
      await execute('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?', [pr.id]);
      await logEvent('otp_failed', { ip, userId: pr.user_id });

      const remaining = Math.max(0, 5 - newAttempts);
      if (remaining === 0) {
        return json({ error: 'Kode verifikasi hangus karena batas percobaan tercapai. Minta kode baru.' }, 400);
      }
      return json({ error: `Kode verifikasi salah. Sisa ${remaining} percobaan.` }, 400);
    }

    // Sukses: Buat resetToken acak berlaku 10 menit
    const resetToken = crypto.randomBytes(32).toString('base64url');
    const resetTokenHash = sha256(resetToken);

    await execute(
      `UPDATE password_resets
       SET verified = 1, reset_token_hash = ?, expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE)
       WHERE id = ?`,
      [resetTokenHash, pr.id]
    );

    return json({ success: true, resetToken });
  } catch (err) {
    console.error('Error saat verifikasi OTP:', err.message);
    return json({ error: 'Terjadi kesalahan sistem saat memverifikasi kode.' }, 500);
  }
}
