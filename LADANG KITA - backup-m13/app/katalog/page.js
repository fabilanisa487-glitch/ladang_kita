import ProductCatalog from '@/components/ProductCatalog';

export const metadata = {
  title: 'Katalog Hasil Panen',
  description: 'Cari sayur, buah, beras, rempah, dan bumbu langsung dari petani lokal.',
};

export default function CatalogPage({ searchParams }) {
  return (
    <main className="page-main content-width">
      <div className="page-intro"><div className="eyebrow"><span /> KATALOG LADANG KITA</div><h1>Belanja hasil panen</h1><p>Temukan bahan segar pilihan untuk menemani masakan di rumah.</p></div>
      <ProductCatalog initialCategory={searchParams?.kategori || 'semua'} />
    </main>
  );
}