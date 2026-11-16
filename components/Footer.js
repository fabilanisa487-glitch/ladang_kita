import Link from 'next/link';
import { Leaf, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Link className="brand" href="/"><span className="brand-mark"><Leaf size={18} /></span><span>Ladang<span className="brand-light">Kita</span></span></Link>
          <p>Hasil bumi segar, hubungan yang lebih dekat.</p>
        </div>
        <div className="footer-links"><strong>Jelajahi</strong><Link href="/katalog">Semua produk</Link><Link href="/tentang">Tentang kami</Link><Link href="/kontak">Hubungi kami</Link></div>
        <div className="footer-contact"><strong>Temukan kami</strong><span><MapPin size={14} /> Indonesia</span><a href="mailto:sapa@ladangkita.id"><Mail size={14} /> sapa@ladangkita.id</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Ladang Kita</span><span>Dibuat dengan kepedulian untuk petani lokal.</span></div>
    </footer>
  );
}