import crypto from 'node:crypto';
import {
  json,
  getLoginIp,
  isThrottled,
  recordAttempt,
  issueCaptcha,
  loginSessionCookieName,
  getRequestCookie,
  sha256,
} from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const ip = getLoginIp(request);
  const bucket = `captcha:ip:${sha256(ip)}`;

  if (await isThrottled(bucket, 30, 600)) {
    return json({ error: 'Terlalu banyak permintaan CAPTCHA. Coba lagi nanti.' }, 429);
  }

  try {
    await recordAttempt(bucket);
    const existingSession = getRequestCookie(request, loginSessionCookieName());
    const sessionToken = /^[A-Za-z0-9_-]{43}$/.test(existingSession)
      ? existingSession
      : crypto.randomBytes(32).toString('base64url');
    const response = json(await issueCaptcha(sessionToken));
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.headers.append(
      'Set-Cookie',
      `${loginSessionCookieName()}=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=600${secure}`
    );
    return response;
  } catch (error) {
    if (error.code === 'OTP_SECRET_MISSING') {
      return json({ error: 'Layanan keamanan belum dikonfigurasi.' }, 503);
    }
    console.error('Gagal membuat CAPTCHA:', error.message);
    return json({ error: 'CAPTCHA belum dapat dibuat. Coba lagi nanti.' }, 500);
  }
}
