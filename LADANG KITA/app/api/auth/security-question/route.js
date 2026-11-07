import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import { clean, json, normalizeSecurityAnswer, sameOrigin, readJson, getIp } from '@/lib/security';
import { getCurrentUser } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);
  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Security question enrollment cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk untuk menyiapkan pertanyaan keamanan.' }, 401);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Data pertanyaan keamanan tidak valid.' }, 400);
  }

  const question = clean(body.question, 160);
  const answer = normalizeSecurityAnswer(body.answer);
  if (question.length < 8 || !answer) {
    return json({
      error: 'Pertanyaan minimal 8 karakter dan jawaban harus 4 hingga 120 karakter (maksimal 72 byte).',
    }, 400);
  }

  try {
    const [existing] = await execute(
      'SELECT user_id FROM account_security_questions WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    if (existing && existing.length > 0) {
      return json({ error: 'Pertanyaan keamanan akun sudah terdaftar.' }, 409);
    }

    const answerHash = await bcrypt.hash(answer, 12);
    await execute(
      `INSERT INTO account_security_questions (user_id, question, answer_hash, created_at, updated_at)
       VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [user.id, question, answerHash]
    );
    await logEvent('security_question_enrolled', { ip, userId: user.id });

    return json({ success: true, user });
  } catch (error) {
    console.error('Gagal menyimpan pertanyaan keamanan:', error.message);
    return json({ error: 'Pertanyaan keamanan belum dapat disimpan. Coba lagi nanti.' }, 500);
  }
}
