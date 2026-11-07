import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  normalizeSecurityAnswer,
  sha256,
  getIp,
  isThrottled,
  recordAttempt,
  clearAttempts,
} from '@/lib/security';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);
  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Security answer cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const ipBucket = `verify-security:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 900)) {
    await logEvent('security_question_throttled', { ip, detail: 'Verification IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, 429);
  }

  const body = await readJson(request);
  const email = body ? normalizeEmail(body.email) : null;
  const answer = body ? normalizeSecurityAnswer(body.answer) : null;
  if (!email || !answer) {
    return json({ error: 'Email atau jawaban keamanan tidak valid.' }, 400);
  }

  const emailBucket = `verify-security:email:${sha256(email)}`;
  if (await isThrottled(emailBucket, 5, 900)) {
    await logEvent('security_question_throttled', { ip, detail: 'Account verification throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, 429);
  }

  await recordAttempt(ipBucket);

  try {
    const [rows] = await execute(
      `SELECT q.user_id, q.answer_hash
         FROM users u
         JOIN account_security_questions q ON q.user_id = u.id
        WHERE u.email = ?
        LIMIT 1`,
      [email]
    );
    const questionRecord = rows && rows.length > 0 ? rows[0] : null;
    const matched = questionRecord
      ? await bcrypt.compare(answer, questionRecord.answer_hash)
      : await bcrypt.compare(answer, '$2a$12$6uX7eWf7oU8uB9X2O4Z0I.e4UfN91Q8PZ.8r8g1o7K7L5y1M3Z3uq');

    if (!questionRecord || !matched) {
      await recordAttempt(emailBucket);
      if (questionRecord) {
        await logEvent('security_question_failed', { ip, userId: questionRecord.user_id });
      } else {
        await logEvent('security_question_failed', { ip });
      }
      return json({ error: 'Jawaban keamanan tidak sesuai atau pemulihan akun tidak tersedia.' }, 400);
    }

    await clearAttempts(emailBucket);

    const resetToken = crypto.randomBytes(32).toString('base64url');
    const resetTokenHash = sha256(resetToken);
    await execute(
      "DELETE FROM password_resets WHERE user_id = ? AND purpose = 'password'",
      [questionRecord.user_id]
    );
    await execute(
      `INSERT INTO password_resets
        (user_id, purpose, code_hash, attempts, verified, reset_token_hash, expires_at, created_at)
       VALUES (?, 'password', ?, 0, 1, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), UTC_TIMESTAMP())`,
      [questionRecord.user_id, sha256(resetToken), resetTokenHash]
    );

    await logEvent('security_question_verified', { ip, userId: questionRecord.user_id });
    return json({ success: true, resetToken });
  } catch (error) {
    console.error('Error saat verifikasi pertanyaan keamanan:', error.message);
    return json({ error: 'Terjadi kesalahan sistem saat memverifikasi jawaban.' }, 500);
  }
}
