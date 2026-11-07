import crypto from 'node:crypto';

/**
 * Utilitas integrasi Midtrans Snap (server-side only)
 */

export function isMidtransProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true';
}

export function getSnapBaseUrl() {
  return isMidtransProduction()
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1';
}

export function getApiBaseUrl() {
  return isMidtransProduction()
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2';
}

function getAuthHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  return 'Basic ' + Buffer.from(serverKey + ':').toString('base64');
}

/**
 * Membuat transaksi Snap Midtrans baru
 */
export async function createSnapTransaction(payload) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY_MISSING');
  }

  const url = `${getSnapBaseUrl()}/transactions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000), // Timeout 10 detik
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error_messages ? data.error_messages.join(', ') : 'Gagal membuat transaksi Midtrans';
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Mengecek status transaksi ke Midtrans API
 */
export async function getTransactionStatus(orderId) {
  const orderIdRegex = /^LK-\d{10,15}-[a-f0-9]{8}$/;
  if (!orderIdRegex.test(orderId)) {
    return { status_code: '400', error: 'Format order ID tidak valid' };
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY_MISSING');
  }

  const url = `${getApiBaseUrl()}/${orderId}/status`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: getAuthHeader(),
    },
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 404) {
    return { status_code: '404', message: 'Pesanan tidak ditemukan di Midtrans' };
  }

  return response.json();
}

/**
 * Memverifikasi tanda tangan webhook notifikasi dari Midtrans (SHA-512)
 */
export function verifySignature(notification) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  if (!serverKey) return false;

  const { order_id, status_code, gross_amount, signature_key } = notification || {};
  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return false;
  }

  const raw = `${order_id}${status_code}${gross_amount}${serverKey}`;
  const calculated = crypto.createHash('sha512').update(raw).digest('hex');

  const bufA = Buffer.from(calculated, 'utf8');
  const bufB = Buffer.from(String(signature_key), 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validasi bahwa respons Midtrans merujuk transaksi dan nominal pesanan yang sama.
 * Midtrans mengirim gross_amount sebagai string desimal; pesanan lokal disimpan
 * dalam rupiah integer.
 */
export function matchesOrderPayment(transaction, order) {
  if (!transaction || !order) return false;
  if (transaction.order_id !== order.order_id) return false;
  if (String(transaction.status_code) !== '200') return false;

  const expectedAmount = Number(order.subtotal);
  const receivedAmount = Number(transaction.gross_amount);
  return Number.isSafeInteger(expectedAmount) &&
    expectedAmount > 0 &&
    Number.isFinite(receivedAmount) &&
    receivedAmount === expectedAmount;
}

/**
 * Memetakan transaction_status Midtrans ke status internal ('paid', 'failed', 'pending')
 */
export function mapStatus(notification) {
  const status = notification?.transaction_status;
  const fraud = notification?.fraud_status;

  if (status === 'settlement') return 'paid';
  if (status === 'capture') {
    return fraud === 'accept' ? 'paid' : 'pending';
  }
  if (['deny', 'cancel', 'expire', 'failure'].includes(status)) {
    return 'failed';
  }
  return 'pending';
}
