import { json, sameOrigin, getIp } from '@/lib/security';
import { destroySession } from '@/lib/session';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Logout cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  await destroySession();
  return json({ success: true });
}
