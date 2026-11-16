import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  validatePassword,
  sha256,
  getIp,
} from '@/lib/security';
import { destroyAllSessions } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Reset password cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Permintaan tidak valid.' }, 400);
  }

  const email = normalizeEmail(body.email);
  const resetToken = typeof body.resetToken === 'string' ? body.resetToken.trim() : '';
  const newPassword = body.newPassword;

  if (!email || !resetToken) {
    return json({ error: 'Token reset atau email tidak valid.' }, 400);
  }

  const passwordCheck = validatePassword(newPassword, email);
  if (!passwordCheck.valid) {
    return json({ error: passwordCheck.error }, 400);
  }

  try {
    const tokenHash = sha256(resetToken);
    const [rows] = await execute(
      `SELECT pr.id, pr.user_id, u.password_hash
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE u.email = ? AND pr.purpose = 'password' AND pr.verified = 1
         AND pr.reset_token_hash = ? AND pr.expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [email, tokenHash]
    );

    if (!rows || rows.length === 0) {
      return json(
        { error: 'Token reset tidak valid atau telah kedaluwarsa. Silakan ulangi langkah pemulihan.' },
        400
      );
    }

    const pr = rows[0];

    // Password baru harus beda dari password lama
    const isOldPassword = await bcrypt.compare(newPassword, pr.password_hash);
    if (isOldPassword) {
      return json({ error: 'Password baru harus berbeda dari password sebelumnya.' }, 400);
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password user
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, pr.user_id]);

    // Hapus seluruh sesi user (agar sesi lama hangus)
    await destroyAllSessions(pr.user_id);

    // Hapus baris password_resets untuk user ini
    await execute("DELETE FROM password_resets WHERE user_id = ? AND purpose = 'password'", [pr.user_id]);

    await logEvent('password_reset', { ip, userId: pr.user_id });

    return json({
      success: true,
      message: 'Password berhasil diubah. Silakan masuk kembali dengan password baru.',
    });
  } catch (err) {
    console.error('Error saat reset password:', err.message);
    return json({ error: 'Terjadi kesalahan sistem saat mengatur ulang password.' }, 500);
  }
}
