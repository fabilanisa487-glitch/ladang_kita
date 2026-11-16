import { execute } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { json } from '@/lib/security';
import { getTransactionStatus, mapStatus } from '@/lib/midtrans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) {
    return json({ error: 'Silakan masuk untuk melihat status pesanan.' }, 401);
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId || !/^LK-\d{10,15}-[a-f0-9]{8}$/.test(orderId)) {
    return json({ error: 'Format order ID tidak valid.' }, 400);
  }

  try {
    const [rows] = await execute(
      `SELECT order_id, user_id, customer_name, subtotal, status, created_at
       FROM orders
       WHERE order_id = ? AND user_id = ?
       LIMIT 1`,
      [orderId, user.id]
    );

    if (!rows || rows.length === 0) {
      return json({ error: 'Pesanan tidak ditemukan atau bukan milik akun Anda.' }, 404);
    }

    const order = rows[0];
    let currentStatus = order.status;

    // Jika status belum 'paid', tanyakan ke API Midtrans
    if (currentStatus !== 'paid' && process.env.MIDTRANS_SERVER_KEY) {
      try {
        const midtransData = await getTransactionStatus(orderId);
        if (midtransData && midtransData.transaction_status) {
          const mapped = mapStatus(midtransData);
          if (mapped !== currentStatus) {
            currentStatus = mapped;
            await execute(
              "UPDATE orders SET status = ? WHERE order_id = ? AND status <> 'paid'",
              [mapped, orderId]
            );
          }
        }
      } catch (err) {
        // Jika query Midtrans gagal/timeout, gunakan status lokal
        console.error('Midtrans status check warning:', err.message);
      }
    }

    return json({
      success: true,
      order: {
        orderId: order.order_id,
        status: currentStatus,
        subtotal: order.subtotal,
        customerName: order.customer_name,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    console.error('Error saat get order-status:', err.message);
    return json({ error: 'Gagal memuat status pesanan.' }, 500);
  }
}
