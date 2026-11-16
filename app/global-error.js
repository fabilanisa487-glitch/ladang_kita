'use client';

import Link from 'next/link';

export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body>
        <main className="page-main content-width" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <section className="empty-state">
            <h1>Terjadi Kesalahan Sistem</h1>
            <p>Maaf, sistem mengalami kendala teknis sementara. Silakan coba beberapa saat lagi.</p>
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
      </body>
    </html>
  );
}
