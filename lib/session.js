import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { execute } from './db';
import { sha256 } from './security';

const COOKIE_NAME = process.env.NODE_ENV === 'production' ? '__Host-lk_session' : 'lk_session';

/**
 * Membersihkan sesi kedaluwarsa secara acak (~2% peluang setiap request)
 */
async function maybePurgeExpiredSessions() {
  if (Math.random() < 0.02) {
    try {
      await execute('DELETE FROM sessions WHERE expires_at < UTC_TIMESTAMP()');
    } catch {
      // Abaikan kegagalan pembersihan background
    }
  }
}

/**
 * Membuat sesi baru dan menyimpan cookie HttpOnly
 * remember = true (30 hari), false (12 jam, tanpa maxAge di cookie)
 */
export async function createSession(userId, remember = true) {
  await maybePurgeExpiredSessions();

  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = sha256(token);
  const hours = remember ? 720 : 12; // 30 hari atau 12 jam

  await execute(
    `INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${hours} HOUR), UTC_TIMESTAMP())`,
    [tokenHash, userId]
  );

  const cookieStore = cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  if (remember) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60; // 30 hari dalam detik
  }

  cookieStore.set(COOKIE_NAME, token, cookieOptions);
  return token;
}

/**
 * Mengambil pengguna yang sedang login berdasarkan cookie sesi
 */
export async function getCurrentUser() {
  await maybePurgeExpiredSessions();

  const cookieStore = cookies();
  const token =
    cookieStore.get(COOKIE_NAME)?.value ||
    cookieStore.get('lk_session')?.value ||
    cookieStore.get('__Host-lk_session')?.value;

  if (!token) return null;

  try {
    const tokenHash = sha256(token);
    const [rows] = await execute(
      `SELECT u.id, u.name, u.email, u.phone, u.address, u.created_at
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [tokenHash]
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      address: row.address || '',
      createdAt: row.created_at,
    };
  } catch (err) {
    console.error('Error saat getCurrentUser:', err.message);
    return null;
  }
}

/**
 * Menghapus sesi saat ini dari database dan menghapus cookie
 */
export async function destroySession() {
  const cookieStore = cookies();
  const token =
    cookieStore.get(COOKIE_NAME)?.value ||
    cookieStore.get('lk_session')?.value ||
    cookieStore.get('__Host-lk_session')?.value;

  if (token) {
    try {
      const tokenHash = sha256(token);
      await execute('DELETE FROM sessions WHERE token_hash = ?', [tokenHash]);
    } catch (err) {
      console.error('Error saat destroySession:', err.message);
    }
  }

  const deleteOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };

  try {
    cookieStore.set(COOKIE_NAME, '', deleteOptions);
    cookieStore.set('lk_session', '', deleteOptions);
    cookieStore.set('__Host-lk_session', '', deleteOptions);
  } catch {
    // Abaikan jika cookie context read-only
  }
}

/**
 * Menghapus semua sesi milik pengguna tertentu (misalnya setelah ganti password)
 */
export async function destroyAllSessions(userId) {
  try {
    await execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
  } catch (err) {
    console.error('Error saat destroyAllSessions:', err.message);
  }
  await destroySession();
}
