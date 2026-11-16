import { execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import {
  json,
  sameOrigin,
  readJson,
  clean,
  getIp,
  isThrottled,
  recordAttempt,
} from '@/lib/security';
import { products } from '@/data/products/index';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return json({ error: 'Parameter productId diperlukan.' }, 400);
  }

  // Validasi ID produk terdapat di katalog
  const productExists = products.some((p) => String(p.id) === String(productId));
  if (!productExists) {
    return json({ error: 'Produk tidak ditemukan dalam katalog.' }, 404);
  }

  try {
    const [rows] = await execute(
      `SELECT r.id, r.product_id, r.user_id, u.name as user_name, r.rating, r.comment, r.created_at, r.updated_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [String(productId)]
    );

    const formatted = (rows || []).map((row) => ({
      id: String(row.id),
      productId: row.product_id,
      userId: row.user_id,
      userName: row.user_name,
      rating: Number(row.rating),
      comment: row.comment,
      date: row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : new Date(row.created_at).toISOString().slice(0, 10),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return json({ success: true, reviews: formatted });
  } catch (err) {
    console.error('Error saat GET reviews:', err.message);
    return json({ error: 'Gagal memuat ulasan.' }, 500);
  }
}

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Reviews POST cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk terlebih dahulu untuk memberikan ulasan.' }, 401);
  }

  // Throttle: 10 per jam per user
  const userBucket = `reviews:user:${user.id}`;
  if (await isThrottled(userBucket, 10, 3600)) {
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Data ulasan tidak valid.' }, 400);
  }

  const productId = String(body.productId || '');
  const rating = Number(body.rating);
  const rawComment = typeof body.comment === 'string' ? body.comment : '';
  const comment = clean(rawComment, 1000);

  const productExists = products.some((p) => String(p.id) === productId);
  if (!productExists) {
    return json({ error: 'Produk tidak ditemukan dalam katalog.' }, 400);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: 'Rating harus berupa angka 1 sampai 5.' }, 400);
  }

  if (comment.length < 3 || comment.length > 1000) {
    return json({ error: 'Komentar ulasan harus memiliki panjang 3 sampai 1000 karakter.' }, 400);
  }

  await recordAttempt(userBucket);

  try {
    await execute(
      `INSERT INTO reviews (product_id, user_id, rating, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), updated_at = UTC_TIMESTAMP()`,
      [productId, user.id, rating, comment]
    );

    return json({ success: true });
  } catch (err) {
    console.error('Error saat menyimpan review:', err.message);
    return json({ error: 'Gagal menyimpan ulasan.' }, 500);
  }
}

export async function DELETE(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Reviews DELETE cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk terlebih dahulu.' }, 401);
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return json({ error: 'Parameter productId diperlukan.' }, 400);
  }

  try {
    const [result] = await execute(
      'DELETE FROM reviews WHERE product_id = ? AND user_id = ?',
      [String(productId), user.id]
    );

    if (result.affectedRows === 0) {
      return json({ error: 'Ulasan tidak ditemukan atau Anda tidak memiliki akses.' }, 404);
    }

    return json({ success: true });
  } catch (err) {
    console.error('Error saat menghapus review:', err.message);
    return json({ error: 'Gagal menghapus ulasan.' }, 500);
  }
}
