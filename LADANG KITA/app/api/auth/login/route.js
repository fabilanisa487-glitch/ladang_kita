import bcrypt from 'bcryptjs';
import { execute, withTransaction } from '@/lib/db';
import {
  json,
  sameOrigin,
  readJson,
  normalizeEmail,
  getLoginIp,
  consumeLoginIpLimit,
  loginSessionCookieName,
  getRequestCookie,
  sha256,
  loginLockState,
  verifyCaptcha,
  verifyLoginCsrf,
} from '@/lib/security';
import { createSession } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hash dummy untuk mencegah enumerasi akun via timing attack
const DUMMY_BCRYPT_HASH = '$2a$12$6uX7eWf7oU8uB9X2O4Z0I.e4UfN91Q8PZ.8r8g1o7K7L5y1M3Z3uq';

export async function POST(request) {
  const ip = getLoginIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Login cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  if (!await consumeLoginIpLimit(ip)) {
    await logEvent('login_throttled', { ip, detail: 'IP throttled' });
    return json({ error: 'Terlalu banyak permintaan login. Coba lagi dalam 60 detik.' }, 429);
  }

  if (!verifyLoginCsrf(request, request.headers.get('x-csrf-token'))) {
    return json({
      error: 'Sesi keamanan telah berakhir. Muat ulang halaman dan coba lagi.',
      csrfRequired: true,
    }, 403);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Email atau password salah.' }, 400);
  }

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const remember = body.remember !== false;

  if (!email || password.length < 1 || password.length > 200) {
    return json({ error: 'Email atau password salah.' }, 400);
  }

  const emailBucket = `login:email:${sha256(email)}`;

  try {
    const lockState = await loginLockState(emailBucket);
    if (lockState.captchaRequired) {
      const captchaSession = getRequestCookie(request, loginSessionCookieName());
      const validCaptcha = await verifyCaptcha(
        body.captchaId,
        body.captchaAnswer,
        captchaSession
      );
      if (!validCaptcha) {
        return json({
          error: 'Jawab CAPTCHA yang berlaku untuk sesi ini.',
          captchaRequired: true,
        }, 400);
      }
    }

    const authentication = await withTransaction(async (connection) => {
      const [rows] = await connection.execute(
        `SELECT id, name, email, phone, address, password_hash
           FROM users
          WHERE email = ?
          LIMIT 1
          FOR UPDATE`,
        [email]
      );
      const user = rows && rows.length > 0 ? rows[0] : null;

      if (!user) {
        await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
        await connection.execute(
          'INSERT INTO auth_attempts (bucket, created_at) VALUES (?, UTC_TIMESTAMP())',
          [emailBucket]
        );
        return { success: false };
      }

      await connection.execute(
        `INSERT INTO login_account_lockouts (user_id, failed_attempts, locked_until, updated_at)
         VALUES (?, 0, NULL, UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE failed_attempts = failed_attempts`,
        [user.id]
      );
      await connection.execute(
        `UPDATE login_account_lockouts
            SET locked_until = DATE_ADD(updated_at, INTERVAL 17 MINUTE)
          WHERE user_id = ?
            AND locked_until > DATE_ADD(updated_at, INTERVAL 17 MINUTE)`,
        [user.id]
      );
      const [lockRows] = await connection.execute(
        `SELECT failed_attempts, locked_until,
                (locked_until IS NOT NULL AND locked_until > UTC_TIMESTAMP()) AS is_locked
           FROM login_account_lockouts
          WHERE user_id = ?
          FOR UPDATE`,
        [user.id]
      );
      const lock = lockRows[0];
      if (Number(lock.is_locked)) {
        await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
        return { success: false, locked: true };
      }

      let failedAttempts = Number(lock.failed_attempts);
      if (lock.locked_until) {
        failedAttempts = 0;
        await connection.execute(
          `UPDATE login_account_lockouts
              SET failed_attempts = 0, locked_until = NULL, updated_at = UTC_TIMESTAMP()
            WHERE user_id = ?`,
          [user.id]
        );
      }

      const matched = await bcrypt.compare(password, user.password_hash);
      if (!matched) {
        const nextFailures = failedAttempts + 1;
        await connection.execute(
          `UPDATE login_account_lockouts
              SET failed_attempts = ?,
                  locked_until = IF(? >= 3, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 17 MINUTE), NULL),
                  updated_at = UTC_TIMESTAMP()
            WHERE user_id = ?`,
          [nextFailures, nextFailures, user.id]
        );
        await connection.execute(
          'INSERT INTO auth_attempts (bucket, created_at) VALUES (?, UTC_TIMESTAMP())',
          [emailBucket]
        );
        return { success: false };
      }

      await connection.execute(
        `UPDATE login_account_lockouts
            SET failed_attempts = 0, locked_until = NULL, updated_at = UTC_TIMESTAMP()
          WHERE user_id = ?`,
        [user.id]
      );
      await connection.execute('DELETE FROM auth_attempts WHERE bucket = ?', [emailBucket]);
      await createSession(user.id, remember, connection);
      return { success: true, user };
    });

    if (!authentication.success) {
      await logEvent('login_failed', { ip, detail: email.slice(0, 3) + '...' });
      const updatedLockState = await loginLockState(emailBucket);
      return json({
        error: 'Email atau password salah.',
        captchaRequired: updatedLockState.captchaRequired,
      }, 401);
    }

    const user = authentication.user;
    await logEvent('login_success', { ip, userId: user.id });

    const [securityRows] = await execute(
      'SELECT user_id FROM account_security_questions WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    if (!securityRows || securityRows.length === 0) {
      return json({ success: true, requiresSecuritySetup: true });
    }

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
