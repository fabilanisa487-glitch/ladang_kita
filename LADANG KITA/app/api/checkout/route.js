import crypto from 'node:crypto';
import { getPool } from '@/lib/db';
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
import { priceCart } from '@/lib/orderPricing';
import { createSnapTransaction } from '@/lib/midtrans';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);

  if (!sameOrigin(request)) {
    await logEvent('csrf_blocked', { ip, detail: 'Checkout cross-origin blocked' });
    return json({ error: 'Akses ditolak.' }, 403);
  }

  // Wajib ada sesi pengguna yang valid
  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk terlebih dahulu untuk melanjutkan pemesanan.' }, 401);
  }

  // Throttle: 10 checkout per 10 menit per user
  const userBucket = `checkout:user:${user.id}`;
  if (await isThrottled(userBucket, 10, 600)) {
    return json({ error: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.' }, 429);
  }

  const body = await readJson(request);
  if (!body) {
    return json({ error: 'Data formulir checkout tidak valid.' }, 400);
  }

  const customerName = clean(body.name, 80);
  const phone = clean(body.phone, 20);
  const address = clean(body.address, 300);
  const city = clean(body.city, 60);
  const postalCode = clean(body.postalCode, 5);

  if (customerName.length < 2 || customerName.length > 80) {
    return json({ error: 'Nama penerima harus memiliki panjang 2 sampai 80 karakter.' }, 400);
  }

  if (!/^\+?[0-9]{8,15}$/.test(phone.replace(/[\s()-]/g, ''))) {
    return json({ error: 'Nomor telepon penerima tidak valid (8-15 digit).' }, 400);
  }

  if (address.length < 12 || address.length > 300) {
    return json({ error: 'Alamat pengiriman minimal 12 karakter dan maksimal 300 karakter.' }, 400);
  }

  if (city.length < 2 || city.length > 60) {
    return json({ error: 'Kota penerima harus valid (2-60 karakter).' }, 400);
  }

  if (!/^[0-9]{5}$/.test(postalCode)) {
    return json({ error: 'Kode pos harus berupa 5 digit angka.' }, 400);
  }

  // Hitung ulang harga secara otoritatif dari katalog server
  const priced = priceCart(body.items);
  if (!priced.valid) {
    return json({ error: priced.error }, 400);
  }

  // Cek apakah kunci server Midtrans tersedia
  if (!process.env.MIDTRANS_SERVER_KEY) {
    return json({ error: 'Pembayaran belum dikonfigurasi.' }, 503);
  }

  // Buat order ID dengan pola LK-<timestamp>-<hex8>
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const orderId = `LK-${Date.now()}-${randomSuffix}`;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const snapPayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: priced.subtotal,
    },
    item_details: priced.items.map((i) => ({
      id: i.id,
      price: i.price,
      quantity: i.quantity,
      name: i.name,
    })),
    customer_details: {
      first_name: customerName,
      email: user.email,
      phone: phone,
      shipping_address: {
        first_name: customerName,
        phone: phone,
        address: address,
        city: city,
        postal_code: postalCode,
        country_code: 'IDN',
      },
    },
    expiry: {
      unit: 'day',
      duration: 1,
    },
    callbacks: {
      finish: `${siteUrl}/checkout/sukses`,
    },
  };

  let snapResponse;
  try {
    snapResponse = await createSnapTransaction(snapPayload);
  } catch (err) {
    console.error('Midtrans Snap error:', err.message);
    return json({ error: 'Gagal membuat sesi pembayaran. Coba beberapa saat lagi.' }, 502);
  }

  // Simpan transaksi dan item ke database secara transaksional
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO orders (order_id, user_id, customer_name, phone, address, city, postal_code, subtotal, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', UTC_TIMESTAMP())`,
      [orderId, user.id, customerName, phone, address, city, postalCode, priced.subtotal]
    );

    for (const item of priced.items) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id, item.name, item.price, item.quantity]
      );
    }

    await conn.commit();
  } catch (dbErr) {
    await conn.rollback();
    console.error('Database order insert error:', dbErr.message);
    return json({ error: 'Gagal menyimpan data pesanan.' }, 500);
  } finally {
    conn.release();
  }

  await recordAttempt(userBucket);
  await logEvent('checkout_created', { ip, userId: user.id, detail: orderId });

  return json({
    success: true,
    token: snapResponse.token,
    orderId,
  });
}
