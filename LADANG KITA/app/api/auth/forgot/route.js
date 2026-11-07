import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
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
    await logEvent('csrf_blocked', { ip, detail: 'Forgot cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const ipBucket = `forgot:ip:${ip}`;
  if (await isThrottled(ipBucket, 10, 3600)) {
    await logEvent('security_question_throttled', { ip, detail: 'IP throttled' });
    return json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, 429);
  }

  const body = await readJson(request);
  const email = body ? normalizeEmail(body.email) : null;
  const neutralResponse = {
    success: true,
    message: 'Jika akun dapat dipulihkan, ikuti pertanyaan keamanan.',
    question: 'Jika ini akun lama tanpa pertanyaan keamanan, masuk untuk mendaftarkannya terlebih dahulu.',
  };
  if (!email) return json(neutralResponse);

  const emailBucket = `security-question:lookup:${sha256(email)}`;
  if (await isThrottled(emailBucket, 5, 900)) {
    await logEvent('security_question_throttled', { ip, detail: 'Account lookup throttled' });
    return json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, 429);
  }

  await recordAttempt(ipBucket);
  await recordAttempt(emailBucket);

  try {
    const [rows] = await execute(
      `SELECT q.user_id, q.question
         FROM users u
         JOIN account_security_questions q ON q.user_id = u.id
        WHERE u.email = ?
        LIMIT 1`,
      [email]
    );
    if (!rows || rows.length === 0) return json(neutralResponse);

    await logEvent('security_question_requested', { ip, userId: rows[0].user_id });
    return json({ ...neutralResponse, question: rows[0].question });
  } catch (error) {
    console.error('Error saat meminta pertanyaan keamanan:', error.message);
    return json({ error: 'Pemulihan akun belum dapat diproses. Coba lagi nanti.' }, 500);
  }
}
