import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, ShieldCheck, Sprout, Truck } from 'lucide-react';
import ProductCatalog from '@/components/ProductCatalog';

const testimonials = [
  { quote: 'Sayurnya datang segar dan rasanya beda. Senang tahu belanja saya langsung mendukung petani.', name: 'Nadia P.', detail: 'Pelanggan di Bandung' },
  { quote: 'Pilihannya lengkap, dari sayur sampai beras. Belanja mingguan jadi jauh lebih praktis.', name: 'Arif R.', detail: 'Pelanggan di Jakarta' },
  { quote: 'Kualitasnya bagus dan harga terasa adil. Saya pasti pesan lagi untuk keluarga.', name: 'Maya S.', detail: 'Pelanggan di Yogyakarta' },
];

export default function Home() {
  return (
    <main>
      <section className="hero" id="beranda">
        <div className="hero-copy">
          <div className="eyebrow"><span /> DARI KEBUN, UNTUK MEJA MAKAN</div>
          <h1>Segar dari tanah,<br /><em>baik untuk semua.</em></h1>
          <p>Temukan hasil panen pilihan langsung dari petani lokal. Lebih segar untuk keluarga, lebih adil untuk mereka.</p>
          <Link className="primary-button hero-button" href="/katalog">Belanja sekarang <ArrowRight size={17} /></Link>
          <div className="hero-proof"><span className="proof-icon"><MapPin size={16} /></span><span>Dikirim dari kebun petani terdekat</span></div>
        </div>
        <div className="hero-visual" aria-label="Sayuran segar hasil panen"><Image src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1100&h=900&fit=crop" alt="Sayuran segar berwarna-warni hasil panen" fill priority sizes="(max-width: 760px) 100vw, 52vw" /><div className="harvest-note"><span className="harvest-dot" /><span><strong>Panen pagi ini</strong><small>Boyolali, Jawa Tengah</small></span></div></div>
      </section>

      <section className="category-section content-width" aria-labelledby="category-heading">
        <div className="section-heading"><div><div className="eyebrow"><span /> PILIH SESUAI KEBUTUHAN</div><h2 id="category-heading">Dari ladang hari ini</h2></div><Link className="text-link" href="/katalog">Lihat semua produk <ArrowRight size={16} /></Link></div>
        <div className="home-category-grid">
          {[
            { id: 'sayur', title: 'Sayur segar', image: 'photo-1540420773420-3366772f4999' },
            { id: 'buah', title: 'Buah pilihan', image: 'photo-1610832958506-aa56368176cf' },
            { id: 'beras', title: 'Beras lokal', image: 'photo-1586201375761-83865001e31c' },
            { id: 'rempah', title: 'Rempah dapur', image: 'photo-1596040033229-a9821ebd058d' },
          ].map((category) => <Link className="home-category" href={`/katalog?kategori=${category.id}`} key={category.id}><span className="home-category-image"><Image src={`https://images.unsplash.com/${category.image}?w=480&h=360&fit=crop`} alt="" fill sizes="(max-width: 650px) 50vw, 25vw" /></span><span>{category.title}<ArrowRight size={15} /></span></Link>)}
        </div>
      </section>

      <section className="featured-section" id="produk"><div className="content-width"><div className="section-heading"><div><div className="eyebrow"><span /> PILIHAN DARI LADANG</div><h2>Produk unggulan</h2><p>Dipetik dengan cermat, dikirim dengan hati.</p></div><Link className="text-link" href="/katalog">Jelajahi katalog <ArrowRight size={16} /></Link></div><ProductCatalog featuredOnly /></div></section>

      <section className="promise-section content-width" aria-labelledby="promise-heading">
        <div className="promise-intro"><div className="eyebrow"><span /> BELANJA YANG LEBIH BERARTI</div><h2 id="promise-heading">Baik untuk dapurmu.<br /><em>Adil untuk petaninya.</em></h2><p>Kami percaya hasil tani terbaik datang dari hubungan yang saling menghargai.</p></div>
        <div className="promise-list">
          <div><span><Sprout size={19} /></span><div><strong>Segar setiap hari</strong><p>Produk dipilih dari panen terbaru sesuai musim.</p></div></div>
          <div><span><MapPin size={19} /></span><div><strong>Langsung dari petani</strong><p>Kenali orang dan daerah di balik hasil panenmu.</p></div></div>
          <div><span><ShieldCheck size={19} /></span><div><strong>Harga yang adil</strong><p>Nilai yang baik untuk petani dan pembeli.</p></div></div>
          <div><span><Truck size={19} /></span><div><strong>Antar dengan cermat</strong><p>Pesanan dikemas rapi agar tiba dalam kondisi baik.</p></div></div>
        </div>
      </section>

      <section className="testimonial-section"><div className="content-width"><div className="section-heading"><div><div className="eyebrow"><span /> CERITA DARI DAPUR</div><h2>Dipercaya untuk belanja harian</h2></div></div><div className="testimonial-grid">{testimonials.map((item) => <figure className="testimonial" key={item.name}><div className="testimonial-stars" aria-label="5 dari 5 bintang">★★★★★</div><blockquote>“{item.quote}”</blockquote><figcaption><strong>{item.name}</strong><span>{item.detail}</span></figcaption></figure>)}</div></div></section>

      <section className="closing-band"><div><div className="eyebrow"><span /> PANEN TERBAIK MENUNGGU</div><h2>Isi dapur dengan yang segar.</h2><Link className="primary-button" href="/katalog">Belanja sekarang <ArrowRight size={17} /></Link></div></section>
    </main>
  );
}