import bcrypt from 'bcryptjs';
import { execute } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  getIp,
  isThrottled,
  recordAttempt,
  clearAttempts,
} from '@/lib/security';
import { createSession } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hash dummy untuk mencegah enumerasi akun via timing attack
const DUMMY_BCRYPT_HASH = '$2a$12$6uX7eWf7oU8uB9X2O4Z0I.e4UfN91Q8PZ.8r8g1o7K7L5y1M3Z3uq';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Login cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Throttle per IP: 20 percobaan / 15 menit
  const ipBucket = `login:ip:${ip}`;
  if (await isThrottled(ipBucket, 20, 900)) {
    await logEvent('login_throttled', { ip, detail: 'IP throttled' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Email atau password salah.' }, 400);
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = body.remember !== false;

  if (!email || !password) {
    return json({ error: 'Email atau password salah.' }, 400);
  }

  // Throttle per email: 5 percobaan / 15 menit
  const emailBucket = `login:email:${email}`;
  if (await isThrottled(emailBucket, 5, 900)) {
    await logEvent('login_throttled', { ip, detail: email.slice(0, 3) + '...' });
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  try {
    const [rows] = await execute(
      'SELECT id, name, email, phone, address, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows && rows.length > 0 ? rows[0] : null;
    const targetHash = user ? user.password_hash : DUMMY_BCRYPT_HASH;

    const matched = await bcrypt.compare(password, targetHash);

    if (!user || !matched) {
      await recordAttempt(emailBucket);
      await recordAttempt(ipBucket);
      await logEvent('login_failed', { ip, detail: email.slice(0, 3) + '...' });
      return json({ error: 'Email atau password salah.' }, 401);
    }

    // Sukses: bersihkan percobaan login email
    await clearAttempts(emailBucket);
    await createSession(user.id, remember);
    await logEvent('login_success', { ip, userId: user.id });

    return json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
      },
    });
  } catch (err) {
    console.error('Error saat login:', err.message);
    return json({ error: 'Terjadi kesalahan sistem. Coba lagi nanti.' }, 500);
  }
}
