import { json } from '@/lib/security';
import { getCurrentUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return json({ user: user || null });
  } catch (err) {
    console.error('Error saat GET /api/auth/me:', err.message);
    return json({ user: null });
  }
}
