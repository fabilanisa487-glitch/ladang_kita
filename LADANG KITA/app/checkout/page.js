'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, LoaderCircle } from 'lucide-react';
import { formatPrice } from '@/data/products/index';
import { useCart } from '@/data/data/context/context/CartContext';

function loadSnapScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window not available'));
    if (window.snap) return resolve(window.snap);

    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const snapUrl = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    const existing = document.querySelector(`script[src="${snapUrl}"]`);
    if (existing) {
      if (window.snap) return resolve(window.snap);
      existing.addEventListener('load', () => resolve(window.snap));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => resolve(window.snap);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function placeOrder(event) {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get('name'),
      phone: form.get('phone'),
      address: form.get('address'),
      city: form.get('city'),
      postalCode: form.get('postalCode'),
      items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Pesanan belum dapat diproses.');
        setSubmitting(false);
        return;
      }

      const snap = await loadSnapScript();
      if (!snap || typeof snap.pay !== 'function') {
        setError('Gagal memuat sistem pembayaran Midtrans. Coba muat ulang halaman.');
        setSubmitting(false);
        return;
      }

      snap.pay(result.token, {
        onSuccess: () => {
          clearCart();
          router.push(`/checkout/sukses?order_id=${encodeURIComponent(result.orderId)}`);
        },
        onPending: () => {
          clearCart();
          router.push(`/checkout/sukses?order_id=${encodeURIComponent(result.orderId)}`);
        },
        onError: () => {
          setError('Pembayaran gagal atau dibatalkan.');
          setSubmitting(false);
        },
        onClose: () => {
          setError('Jendela pembayaran ditutup sebelum transaksi diselesaikan.');
          setSubmitting(false);
        },
      });
    } catch {
      setError('Terjadi kendala koneksi ke server. Coba lagi beberapa saat lagi.');
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <main className="page-main content-width">
        <section className="empty-state">
          <h1>Belum ada pesanan</h1>
          <p>Tambahkan hasil panen ke keranjang sebelum melanjutkan checkout.</p>
          <Link className="primary-button" href="/katalog">
            Lihat katalog
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-main content-width">
      <div className="page-intro">
        <div className="eyebrow">
          <span /> LANGKAH TERAKHIR
        </div>
        <h1>Checkout</h1>
        <p>Lengkapi detail pengiriman dan selesaikan pembayaran.</p>
      </div>
      <form className="checkout-layout" onSubmit={placeOrder}>
        <div className="form-panel">
          <h2>Informasi penerima</h2>
          <div className="form-grid">
            <label className="field">
              Nama lengkap
              <input name="name" autoComplete="name" maxLength={80} required placeholder="Nama penerima" />
            </label>
            <label className="field">
              Nomor WhatsApp
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={20}
                required
                pattern="\+?[0-9]{8,15}"
                placeholder="08xxxxxxxxxx"
              />
            </label>
            <label className="field field-full">
              Alamat lengkap
              <textarea
                name="address"
                autoComplete="street-address"
                required
                minLength={12}
                maxLength={300}
                placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan"
              />
            </label>
            <label className="field">
              Kota
              <input name="city" autoComplete="address-level2" maxLength={60} required placeholder="Kota tujuan" />
            </label>
            <label className="field">
              Kode pos
              <input
                name="postalCode"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={5}
                required
                pattern="[0-9]{5}"
                placeholder="5 digit kode pos"
              />
            </label>
          </div>
          <h2 className="checkout-subheading">Metode pembayaran</h2>
          <p className="summary-note" style={{ margin: '0.5rem 0 1rem 0' }}>
            Metode pembayaran (QRIS, transfer bank/Virtual Account, e-Wallet, kartu) akan dipilih secara aman melalui jendela Midtrans Snap.
          </p>
        </div>
        <aside className="summary-panel">
          <h2>Pesananmu</h2>
          <div className="checkout-summary-items">
            {items.map((item) => (
              <div className="checkout-summary-item" key={item.id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Total produk</span>
            <span>{totalItems} item</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="summary-row">
            <span>Ongkos kirim</span>
            <span>Dikonfirmasi kemudian</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total sementara</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <LoaderCircle className="spinner" size={17} /> Memproses Pembayaran...
              </>
            ) : (
              <>
                Lanjut ke Pembayaran <CheckCircle2 size={17} />
              </>
            )}
          </button>
          {error && (
            <p className="auth-message auth-error" role="alert">
              {error}
            </p>
          )}
          <Link className="back-link" href="/keranjang">
            <ArrowLeft size={14} /> Kembali ke keranjang
          </Link>
        </aside>
      </form>
    </main>
  );
}