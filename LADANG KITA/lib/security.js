import crypto from 'node:crypto';
import net from 'node:net';
import { execute } from './db';
import { withTransaction } from './db';

/**
 * Mengembalikan respons JSON dengan header Cache-Control: no-store
 */
export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

/**
 * Memeriksa Origin/Sec-Fetch-Site untuk mencegah CSRF pada POST/PATCH/DELETE
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Jika tidak ada header Origin, periksa sec-fetch-site
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite && !['same-origin', 'none'].includes(secFetchSite)) {
    return false;
  }

  return true;
}

/**
 * Membaca JSON body secara aman dengan batas ukuran maksimum (default 10KB)
 */
export async function readJson(request, maxBytes = 10000) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return null;
    }

    const text = await request.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      return null;
    }

    if (!text.trim()) {
      return null;
    }

    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Membersihkan input teks: hapus karakter kontrol, hilangkan < dan >, potong panjang
 */
export function clean(str, max = 255) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

export function normalizeSecurityAnswer(answer) {
  if (typeof answer !== 'string') return null;
  const normalized = answer.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
  if (normalized.length < 4 || normalized.length > 120 || Buffer.byteLength(normalized, 'utf8') > 72) {
    return null;
  }
  return normalized;
}

/**
 * Normalisasi dan validasi email
 */
export function normalizeEmail(email) {
  if (typeof email !== 'string') return null;
  const cleaned = email.trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > 191) return null;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) return null;
  return cleaned;
}

/**
 * Normalisasi dan validasi nomor telepon Indonesia
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const compact = phone.replace(/[\s().-]/g, '').trim();
  if (!compact) return '';

  let normalized = compact;
  if (normalized.startsWith('0')) {
    normalized = '+62' + normalized.slice(1);
  } else if (normalized.startsWith('62')) {
    normalized = '+' + normalized;
  } else if (!normalized.startsWith('+62')) {
    normalized = '+62' + normalized;
  }

  if (/^\+62[0-9]{8,13}$/.test(normalized)) {
    return normalized;
  }
  return null;
}

/**
 * Validasi kebijakan password
 * 8-72 byte, mengandung huruf dan angka, tidak boleh sama dengan email
 */
export function validatePassword(password, email = '') {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password wajib diisi.' };
  }

  const byteLength = Buffer.byteLength(password, 'utf8');
  if (byteLength < 8 || byteLength > 72) {
    return { valid: false, error: 'Password harus memiliki panjang 8 hingga 72 karakter.' };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung kombinasi huruf dan angka.' };
  }

  if (email && password.toLowerCase() === email.toLowerCase()) {
    return { valid: false, error: 'Password tidak boleh sama dengan alamat email.' };
  }

  return { valid: true };
}

/**
 * Hash SHA-256
 */
export function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

/**
 * HMAC-SHA256 untuk OTP menggunakan OTP_SECRET
 */
export function hmac(code) {
  const secret = process.env.OTP_SECRET || 'ladang-kita-otp-secret-key-fallback';
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

export async function loginLockState(bucket) {
  const [rows] = await execute(
    `SELECT COUNT(*) AS n
       FROM auth_attempts
      WHERE bucket = ? AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1800 SECOND)`,
    [bucket]
  );
  const row = rows && rows[0] ? rows[0] : null;
  const n = Number(row && row.n ? row.n : 0);
  return {
    captchaRequired: n >= 3,
  };
}

export async function issueCaptcha(sessionToken) {
  const secret = process.env.OTP_SECRET;
  if (typeof secret !== 'string' || !secret.trim()) {
    const error = new Error('OTP_SECRET belum dikonfigurasi.');
    error.code = 'OTP_SECRET_MISSING';
    throw error;
  }

  const a = crypto.randomInt(1, 10);
  const b = crypto.randomInt(1, 10);
  const id = crypto.randomBytes(16).toString('hex');
  if (typeof sessionToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) {
    throw new Error('Sesi CAPTCHA tidak valid.');
  }
  const answerHash = crypto.createHmac('sha256', secret).update(`${id}:${a + b}`).digest('hex');

  await execute(
    `INSERT INTO login_captcha_challenges (id, answer_hash, session_hash, used, expires_at, created_at)
     VALUES (?, ?, ?, 0, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 300 SECOND), UTC_TIMESTAMP())`,
    [id, answerHash, sha256(sessionToken)]
  );

  if (crypto.randomInt(1, 51) === 1) {
    await execute('DELETE FROM login_captcha_challenges WHERE expires_at <= UTC_TIMESTAMP()');
  }

  return { id, question: `Berapa ${a} + ${b}?` };
}

export async function verifyCaptcha(id, answer, sessionToken) {
  if (typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id)) return false;
  if (typeof answer !== 'string' || !/^[0-9]{1,3}$/.test(answer)) return false;
  if (typeof sessionToken !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(sessionToken)) return false;

  const [rows] = await execute(
    `SELECT answer_hash FROM login_captcha_challenges
      WHERE id = ? AND session_hash = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()
      LIMIT 1`,
    [id, sha256(sessionToken)]
  );
  if (!rows || rows.length === 0) return false;

  const [result] = await execute(
    `UPDATE login_captcha_challenges
        SET used = 1
      WHERE id = ? AND session_hash = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()`,
    [id, sha256(sessionToken)]
  );
  if (!result || result.affectedRows !== 1) return false;

  const expected = rows[0].answer_hash;
  const actual = crypto.createHmac('sha256', process.env.OTP_SECRET)
    .update(`${id}:${answer}`)
    .digest('hex');
  const expectedBytes = Buffer.from(expected, 'hex');
  const actualBytes = Buffer.from(actual, 'hex');
  return expectedBytes.length === actualBytes.length &&
    crypto.timingSafeEqual(expectedBytes, actualBytes);
}

/**
 * Mengambil IP langsung dari runtime atau dari rantai proxy yang dikonfigurasi tepercaya.
 */
export function getLoginIp(request) {
  const directIp = typeof request.ip === 'string' ? request.ip.trim() : '';
  if (net.isIP(directIp)) return directIp;

  const trustedProxyHops = Number.parseInt(process.env.LOGIN_TRUSTED_PROXY_HOPS || '', 10);
  if (Number.isInteger(trustedProxyHops) && trustedProxyHops > 0) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const chain = forwardedFor ? forwardedFor.split(',').map((part) => part.trim()) : [];
    const clientIndex = chain.length - trustedProxyHops;
    const clientIp = clientIndex >= 0 ? chain[clientIndex] : '';
    if (net.isIP(clientIp)) return clientIp;
  }

  return 'unknown';
}

// Dipertahankan untuk route non-login yang masih memakai perilaku lama.
export function getIp(request) {
  const nfIp = request.headers.get('x-nf-client-connection-ip');
  if (nfIp) return nfIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    const last = parts[parts.length - 1].trim();
    if (last) return last;
  }

  return 'local';
}

export async function consumeLoginIpLimit(ip) {
  const ipHash = sha256(ip);
  const bucket = `login:ip:${ipHash}`;
  if (Math.random() < 0.01) {
    await execute(
      'DELETE FROM login_ip_limits WHERE last_seen_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)'
    );
  }

  return withTransaction(async (connection) => {
    await connection.execute(
      'INSERT IGNORE INTO login_ip_limits (ip_hash, last_seen_at) VALUES (?, UTC_TIMESTAMP())',
      [ipHash]
    );
    await connection.execute(
      'UPDATE login_ip_limits SET last_seen_at = UTC_TIMESTAMP() WHERE ip_hash = ?',
      [ipHash]
    );
    const [rows] = await connection.execute(
      `SELECT COUNT(*) AS count
         FROM auth_attempts
        WHERE bucket = ? AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 60 SECOND)`,
      [bucket]
    );
    if (Number(rows?.[0]?.count || 0) >= 3) return false;

    await connection.execute(
      'INSERT INTO auth_attempts (bucket, created_at) VALUES (?, UTC_TIMESTAMP())',
      [bucket]
    );
    return true;
  });
}

export function getRequestCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return '';
    }
  }
  return '';
}

export function loginCsrfCookieName() {
  return process.env.NODE_ENV === 'production' ? '__Host-lk_login_csrf' : 'lk_login_csrf';
}

export function loginSessionCookieName() {
  return process.env.NODE_ENV === 'production' ? '__Host-lk_login_session' : 'lk_login_session';
}

export function verifyLoginCsrf(request, token) {
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const cookieToken = getRequestCookie(request, loginCsrfCookieName());
  if (!/^[A-Za-z0-9_-]{43}$/.test(cookieToken)) return false;
  const tokenBytes = Buffer.from(token);
  const cookieBytes = Buffer.from(cookieToken);
  return tokenBytes.length === cookieBytes.length &&
    crypto.timingSafeEqual(tokenBytes, cookieBytes);
}

/**
 * Memeriksa apakah suatu bucket rate limit ter-throttle
 */
export async function isThrottled(bucket, maxAttempts, windowSec) {
  try {
    const sec = Number.isInteger(windowSec) ? windowSec : 900;
    const [rows] = await execute(
      `SELECT COUNT(*) as count FROM auth_attempts WHERE bucket = ? AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${sec} SECOND)`,
      [bucket]
    );
    const count = rows && rows[0] ? rows[0].count : 0;
    return count >= maxAttempts;
  } catch (err) {
    // Jika DB bermasalah saat cek throttle, jangan crash alur build/dev tapi catat
    console.error('Peringatan: Gagal memeriksa rate limit:', err.message);
    return false;
  }
}

/**
 * Mencatat percobaan aksi pada bucket rate limit
 */
export async function recordAttempt(bucket) {
  try {
    await execute('INSERT INTO auth_attempts (bucket, created_at) VALUES (?, UTC_TIMESTAMP())', [bucket]);
  } catch (err) {
    console.error('Peringatan: Gagal mencatat rate limit attempt:', err.message);
  }
}

/**
 * Menghapus catatan percobaan setelah sukses (misal login berhasil)
 */
export async function clearAttempts(bucket) {
  try {
    await execute('DELETE FROM auth_attempts WHERE bucket = ?', [bucket]);
  } catch (err) {
    console.error('Peringatan: Gagal menghapus rate limit bucket:', err.message);
  }
}

/**
 * Memastikan parameter redirect URL aman (mencegah open redirect)
 * Hanya path internal yang diawali '/', bukan '//', tanpa '\' atau ':'
 */
export function safeNextPath(next) {
  if (typeof next !== 'string') return '/';
  const trimmed = next.trim();
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.includes('\\') &&
    !trimmed.includes(':')
  ) {
    return trimmed;
  }
  return '/';
}
