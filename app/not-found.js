import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="page-main content-width">
      <section className="empty-state">
        <Search size={48} style={{ color: '#666' }} />
        <h1>Halaman Tidak Ditemukan</h1>
        <p>Halaman atau produk yang kamu cari tidak tersedia atau alamat URL telah dipindahkan.</p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link className="primary-button" href="/">
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
