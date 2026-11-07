import crypto from 'node:crypto';
import { execute } from './db';

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

/**
 * Mengambil client IP yang tepercaya (x-nf-client-connection-ip, entri terakhir x-forwarded-for, atau local)
 */
export function getIp(request) {
  const nfIp = request.headers.get('x-nf-client-connection-ip');
  if (nfIp) return nfIp.trim();

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const parts = xForwardedFor.split(',');
    const last = parts[parts.length - 1].trim();
    if (last) return last;
  }

  return 'local';
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
