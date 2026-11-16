import { execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { json, sameOrigin, readJson, getIp } from '@/lib/security';
import { products } from '@/data/products/index';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return json({ success: true, items: [] });
  }

  try {
    const [rows] = await execute(
      'SELECT product_id FROM wishlists WHERE user_id = ? ORDER BY created_at DESC',
      [user.id]
    );

    const items = (rows || []).map((r) => r.product_id);
    return json({ success: true, items });
  } catch (err) {
    console.error('Error saat GET wishlist:', err.message);
    return json({ error: 'Gagal memuat wishlist.' }, 500);
  }
}

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Wishlist POST cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk terlebih dahulu untuk menyimpan wishlist.' }, 401);
  }

  const body = await readJson(request);
  const productId = String(body?.productId || '');

  const productExists = products.some((p) => String(p.id) === productId);
  if (!productExists) {
    return json({ error: 'Produk tidak ditemukan dalam katalog.' }, 400);
  }

  try {
    await execute(
      'INSERT IGNORE INTO wishlists (user_id, product_id, created_at) VALUES (?, ?, UTC_TIMESTAMP())',
      [user.id, productId]
    );

    return json({ success: true });
  } catch (err) {
    console.error('Error saat menambah wishlist:', err.message);
    return json({ error: 'Gagal menyimpan ke wishlist.' }, 500);
  }
}

export async function DELETE(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Wishlist DELETE cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk terlebih dahulu.' }, 401);
  }

  let productId = new URL(request.url).searchParams.get('productId');
  if (!productId) {
    const body = await readJson(request);
    productId = body?.productId ? String(body.productId) : null;
  }

  if (!productId) {
    return json({ error: 'Parameter productId diperlukan.' }, 400);
  }

  try {
    await execute('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [user.id, String(productId)]);
    return json({ success: true });
  } catch (err) {
    console.error('Error saat menghapus wishlist:', err.message);
    return json({ error: 'Gagal menghapus dari wishlist.' }, 500);
  }
}
