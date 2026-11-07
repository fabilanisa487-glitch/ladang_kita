import { Clock3, Mail, MapPin, MessageCircle } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = {
  title: 'Kontak',
  description: 'Hubungi tim Ladang Kita untuk pertanyaan seputar hasil panen dan pesanan.',
};

export default function ContactPage() {
  return (
    <main className="page-main content-width">
      <div className="page-intro"><div className="eyebrow"><span /> KAMI SIAP MEMBANTU</div><h1>Hubungi Ladang Kita</h1><p>Ada pertanyaan tentang produk atau pesanan? Sapa kami, ya.</p></div>
      <div className="contact-grid">
        <ContactForm />
        <aside className="contact-info"><h2>Kontak kami</h2><p>Tim kecil kami siap membantu kamu menemukan hasil panen yang tepat.</p><div className="contact-info-line"><Mail size={17} /><div><strong>Email</strong><span>sapa@ladangkita.id</span></div></div><a className="contact-info-line" href="https://wa.me/6281234567890" target="_blank" rel="noreferrer"><MessageCircle size={17} /><div><strong>WhatsApp</strong><span>Chat dengan tim Ladang Kita</span></div></a><div className="contact-info-line"><Clock3 size={17} /><div><strong>Jam layanan</strong><span>Senin–Sabtu, 08.00–17.00 WIB</span></div></div><div className="contact-info-line"><MapPin size={17} /><div><strong>Jangkauan</strong><span>Petani dan pembeli di seluruh Indonesia</span></div></div></aside>
      </div>
    </main>
  );
}