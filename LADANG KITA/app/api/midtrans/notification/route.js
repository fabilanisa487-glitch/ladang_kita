import { execute } from '@/lib/db';
import { json, readJson, getIp } from '@/lib/security';
import { verifySignature, getTransactionStatus, mapStatus, matchesOrderPayment } from '@/lib/midtrans';
import { logEvent } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const ip = getIp(request);
  const notification = await readJson(request, 20000);

  if (!notification) {
    return json({ error: 'Payload notifikasi tidak valid.' }, 400);
  }

  // 1. Verifikasi tanda tangan SHA-512
  const isValid = verifySignature(notification);
  if (!isValid) {
    await logEvent('webhook_invalid_signature', {
      ip,
      detail: String(notification.order_id || 'unknown').slice(0, 50),
    });
    return json({ error: 'Tanda tangan webhook tidak valid.' }, 401);
  }

  const orderId = notification.order_id;

  if (typeof orderId !== 'string' || !/^LK-\d{10,15}-[a-f0-9]{8}$/.test(orderId)) {
    return json({ error: 'Format order ID tidak valid.' }, 400);
  }

  try {
    // Ambil nilai resmi pesanan lokal sebelum mempertimbangkan status pembayaran.
    const [orders] = await execute(
      'SELECT order_id, subtotal, status FROM orders WHERE order_id = ? LIMIT 1',
      [orderId]
    );
    if (!orders || orders.length === 0) {
      return json({ error: 'Pesanan tidak ditemukan.' }, 404);
    }
    const order = orders[0];

    // 2. Konfirmasi ulang status dan nominal langsung ke API Midtrans.
    const confirmed = await getTransactionStatus(orderId);
    if (!matchesOrderPayment(confirmed, order) || !confirmed.transaction_status) {
      await logEvent('payment_mismatch', {
        ip,
        detail: String(orderId).slice(0, 50),
      });
      return json({ error: 'Gagal mengonfirmasi status ke Midtrans API.' }, 502);
    }

    // Pastikan notifikasi bertanda tangan juga cocok dengan order dan nominal DB.
    const notificationAmount = Number(notification.gross_amount);
    if (Number.isSafeInteger(Number(order.subtotal)) && notificationAmount !== Number(order.subtotal)) {
      await logEvent('payment_mismatch', { ip, detail: String(orderId).slice(0, 50) });
      return json({ error: 'Nominal notifikasi tidak sesuai dengan pesanan.' }, 409);
    }

    const mappedStatus = mapStatus(confirmed);

    // 3. Update hanya bila status masih seperti saat dibaca; 'paid' tetap final.
    await execute(
      "UPDATE orders SET status = ? WHERE order_id = ? AND subtotal = ? AND status = ? AND status <> 'paid'",
      [mappedStatus, orderId, order.subtotal, order.status]
    );

    return json({ success: true });
  } catch (err) {
    console.error('Error saat memproses webhook Midtrans:', err.message);
    return json({ error: 'Gagal memproses notifikasi pembayaran.' }, 500);
  }
}
