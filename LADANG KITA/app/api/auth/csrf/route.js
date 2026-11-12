import crypto from 'node:crypto';
import { json, loginCsrfCookieName } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const token = crypto.randomBytes(32).toString('base64url');
  const response = json({ token });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append(
    'Set-Cookie',
    `${loginCsrfCookieName()}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=600${secure}`
  );
  return response;
}
