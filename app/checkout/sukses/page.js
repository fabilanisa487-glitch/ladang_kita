'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, AlertCircle, LoaderCircle } from 'lucide-react';
import { formatPrice } from '@/data/products/index';

function SuksesContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get('order_id') : null;

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'pending', 'paid', 'failed', 'error'
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      return;
    }

    let active = true;
    let timer = null;

    async function checkStatus() {
      try {
        const res = await fetch(`/api/order-status?order_id=${encodeURIComponent(orderId)}`, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const data = await res.json();

        if (!active) return;

        if (res.ok && data.success && data.order) {
          setOrder(data.order);
          const currentStatus = data.order.status;
          setStatus(currentStatus);

          if (currentStatus === 'pending' && pollCount < 15) {
            timer = setTimeout(() => {
              setPollCount((prev) => prev + 1);
            }, 4000);
          }
        } else {
          setStatus('error');
        }
      } catch {
        if (active) setStatus('error');
      }
    }

    checkStatus();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, pollCount]);

  if (status === 'loading') {
    return (
      <main className="page-main content-width">
        <section className="empty-state">
          <LoaderCircle className="spinner" size={42} />
          <h1>Memeriksa status pesanan</h1>
          <p>Sedang mengonfirmasi transaksi pembayaran...</p>
        </section>
      </main>
    );
  }

  if (status === 'paid') {
    return (
      <main className="page-main content-width">
        <section className="empty-state">
          <CheckCircle2 size={48} style={{ color: '#2e7d32' }} />
          <h1>Pembayaran Berhasil!</h1>
          <p>
            Pesanan <strong>{order?.orderId || orderId}</strong> telah lunas.
            {order?.subtotal ? ` Total pembayaran: ${formatPrice(order.subtotal)}.` : ''} Hasil panen segar sedang disiapkan oleh para petani.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link className="primary-button" href="/katalog">
              Kembali ke Katalog
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (status === 'pending') {
    return (
      <main className="page-main content-width">
        <section className="empty-state">
          <Clock size={48} style={{ color: '#f57c00' }} />
          <h1>Menunggu Pembayaran</h1>
          <p>
            Pesanan <strong>{order?.orderId || orderId}</strong> sedang menunggu penyelesaian pembayaran. Jika sudah membayar, status akan diperbarui otomatis dalam beberapa saat.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="primary-button"
              type="button"
              onClick={() => setPollCount((prev) => prev + 1)}
            >
              Perbarui Status
            </button>
            <Link className="primary-button" href="/katalog" style={{ background: '#555' }}>
              Kembali Belanja
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (status === 'failed') {
    return (
      <main className="page-main content-width">
        <section className="empty-state">
          <AlertCircle size={48} style={{ color: '#d32f2f' }} />
          <h1>Pembayaran Gagal atau Dibatalkan</h1>
          <p>
            Transaksi untuk pesanan <strong>{orderId}</strong> tidak berhasil atau waktu pembayaran telah kedaluwarsa.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link className="primary-button" href="/keranjang">
              Coba Pesan Ulang
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-main content-width">
      <section className="empty-state">
        <AlertCircle size={48} style={{ color: '#d32f2f' }} />
        <h1>Data Pesanan Tidak Ditemukan</h1>
        <p>Nomor pesanan tidak valid atau Anda belum masuk dengan akun yang bersangkutan.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link className="primary-button" href="/katalog">
            Kembali ke Katalog
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="page-main content-width">
          <section className="empty-state">
            <LoaderCircle className="spinner" size={42} />
            <p>Memuat informasi pesanan...</p>
          </section>
        </main>
      }
    >
      <SuksesContent />
    </Suspense>
  );
}
