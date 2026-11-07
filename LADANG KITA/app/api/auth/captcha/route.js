import { json, getIp, isThrottled, recordAttempt, issueCaptcha } from '@/lib/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const bucket = `captcha:ip:${getIp(request)}`;

  if (await isThrottled(bucket, 30, 600)) {
    return json({ error: 'Terlalu banyak permintaan CAPTCHA. Coba lagi nanti.' }, 429);
  }

  await recordAttempt(bucket);

  try {
    return json(await issueCaptcha());
  } catch (error) {
    if (error.code === 'OTP_SECRET_MISSING') {
      return json({ error: 'Layanan keamanan belum dikonfigurasi.' }, 503);
    }
    console.error('Gagal membuat CAPTCHA:', error.message);
    return json({ error: 'CAPTCHA belum dapat dibuat. Coba lagi nanti.' }, 500);
  }
}
