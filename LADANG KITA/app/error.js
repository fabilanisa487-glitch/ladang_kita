'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage({ reset }) {
  return (
    <main className="page-main content-width">
      <section className="empty-state">
        <AlertTriangle size={48} style={{ color: '#d32f2f' }} />
        <h1>Terjadi Kendala</h1>
        <p>Maaf, halaman tidak dapat dimuat saat ini. Silakan coba muat ulang atau kembali ke beranda.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {reset && (
            <button className="primary-button" type="button" onClick={() => reset()}>
              Coba Lagi
            </button>
          )}
          <Link className="primary-button" href="/" style={{ background: '#555' }}>
            Ke Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
