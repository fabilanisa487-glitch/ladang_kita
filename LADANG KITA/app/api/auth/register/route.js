import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  clean,
  normalizeEmail,
  normalizePhone,
  normalizeSecurityAnswer,
  validatePassword,
  getIp,
  isThrottled,
  recordAttempt,
} from '@/lib/security';
import { createSession } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Register cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 5 percobaan / jam
  const bucket = `register:ip:${ip}`;
  if (await isThrottled(bucket, 5, 3600)) {
    await logEvent('register_throttled', { ip });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Data pendaftaran tidak valid.' }, 400);
  }

  const name = clean(body.name, 80);
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);
  const password = body.password;
  const securityQuestion = clean(body.securityQuestion, 160);
  const securityAnswer = normalizeSecurityAnswer(body.securityAnswer);

  if (!name || name.length < 2 || name.length > 80) {
    return json({ error: 'Nama harus memiliki panjang 2 hingga 80 karakter.' }, 400);
  }

  if (!email) {
    return json({ error: 'Format alamat email tidak valid.' }, 400);
  }

  if (phone === null) {
    return json({ error: 'Format nomor telepon tidak valid.' }, 400);
  }

  if (securityQuestion.length < 8 || !securityAnswer) {
    return json({
      error: 'Pertanyaan keamanan minimal 8 karakter dan jawaban harus 4 hingga 120 karakter (maksimal 72 byte).',
    }, 400);
  }

  const passwordCheck = validatePassword(password, email);
  if (!passwordCheck.valid) {
    return json({ error: passwordCheck.error }, 400);
  }

  await recordAttempt(bucket);

  try {
    const [existing] = await execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing && existing.length > 0) {
      return json({ error: 'Email sudah terdaftar.' }, 400);
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const securityAnswerHash = await bcrypt.hash(securityAnswer, 12);

    await execute(
      'INSERT INTO users (id, name, email, phone, address, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())',
      [userId, name, email, phone || null, '', passwordHash]
    );
    await execute(
      `INSERT INTO account_security_questions (user_id, question, answer_hash, created_at, updated_at)
       VALUES (?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())`,
      [userId, securityQuestion, securityAnswerHash]
    );

    await createSession(userId, true);
    await logEvent('register', { ip, userId, detail: email.slice(0, 3) + '...' });

    return json({
      success: true,
      user: {
        id: userId,
        name,
        email,
        phone: phone || '',
        address: '',
      },
    });
  } catch (err) {
    console.error('Error saat registrasi:', err.message);
    if (err.message && err.message.includes('ER_DUP_ENTRY')) {
      return json({ error: 'Email sudah terdaftar.' }, 400);
    }
    return json({ error: 'Pendaftaran belum dapat diproses. Coba lagi nanti.' }, 500);
  }
}
