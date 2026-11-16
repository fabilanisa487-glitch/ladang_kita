import crypto from 'node:crypto';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizePhone,
  hmac,
  getIp,
  isThrottled,
  recordAttempt,
} from '@/lib/security';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function maskEmail(email) {
  if (!email || !email.includes('@')) return '****@****';
  const [local, domain] = email.split('@');
  const maskedLocal = (local[0] || 'u') + '****';
  const dotIdx = domain.lastIndexOf('.');
  let domainName = domain;
  let tld = '';
  if (dotIdx !== -1) {
    domainName = domain.slice(0, dotIdx);
    tld = domain.slice(dotIdx);
  }
  const maskedDomain = (domainName[0] || 'd') + '****' + tld;
  return `${maskedLocal}@${maskedDomain}`;
}

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Recover email verify cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 10 / 15 menit
  const ipBucket = `verify-otp:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 900)) {
    await logEvent('otp_throttled', { ip, detail: 'Recover email verify IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Permintaan tidak valid.' }, 400);
  }

  const phone = normalizePhone(body.phone);
  const code = String(body.code || '').trim();

  if (!phone || !code || !/^\d{6}$/.test(code)) {
    return json({ error: 'Nomor HP dan kode verifikasi 6 digit wajib diisi.' }, 400);
  }

  await recordAttempt(ipBucket);

  try {
    const [rows] = await execute(
      `SELECT pr.id, pr.user_id, pr.code_hash, pr.attempts, u.email
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.phone = ? AND pr.purpose = 'email' AND pr.verified = 0 AND pr.expires_at > UTC_TIMESTAMP()
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [phone]
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

    // Sukses: hapus reset record dan kembalikan email tersamar
    await execute('DELETE FROM password_resets WHERE id = ?', [pr.id]);

    return json({
      success: true,
      email: maskEmail(pr.email),
    });
  } catch (err) {
    console.error('Error saat verifikasi pemulihan email:', err.message);
    return json({ error: 'Terjadi kesalahan sistem saat memverifikasi kode.' }, 500);
  }
}
