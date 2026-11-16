import { execute } from '@/lib/db';
import { json, readJson, getIp } from '@/lib/security';
import { verifySignature, getTransactionStatus, mapStatus } from '@/lib/midtrans';
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

  try {
    // 2. Konfirmasi ulang status langsung ke API Midtrans
    const confirmed = await getTransactionStatus(orderId);
    if (!confirmed || !confirmed.transaction_status) {
      return json({ error: 'Gagal mengonfirmasi status ke Midtrans API.' }, 502);
    }

    const mappedStatus = mapStatus(confirmed);

    // 3. Update orders secara idempoten (status 'paid' adalah final)
    await execute(
      "UPDATE orders SET status = ? WHERE order_id = ? AND status <> 'paid'",
      [mappedStatus, orderId]
    );

    return json({ success: true });
  } catch (err) {
    console.error('Error saat memproses webhook Midtrans:', err.message);
    return json({ error: 'Gagal memproses notifikasi pembayaran.' }, 500);
  }
}
