import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Tentang Kami',
  description: 'Kenali Ladang Kita, marketplace yang mendekatkan petani lokal dan pembeli.',
};

const values = [
  { title: 'Segar dan jujur', text: 'Kami memilih hasil panen dengan cermat dan menyampaikan asalnya dengan jelas.' },
  { title: 'Hubungan langsung', text: 'Kami ingin petani dan pembeli saling mengenal, bukan hanya bertemu lewat harga.' },
  { title: 'Nilai yang adil', text: 'Belanja yang baik memberi manfaat untuk dapur keluarga dan kehidupan petani.' },
];

export default function AboutPage() {
  return (
    <main className="content-width">
      <section className="about-hero"><div><div className="eyebrow"><span /> CERITA LADANG KITA</div><h1>Hasil bumi, hubungan yang lebih dekat.</h1><p>Ladang Kita lahir dari gagasan sederhana: hasil tani yang baik seharusnya mudah ditemukan, dan petani yang menanamnya layak mendapat nilai yang adil.</p><p>Kami mempertemukan petani lokal dengan keluarga yang ingin berbelanja lebih segar dan lebih sadar asal bahan makanannya.</p><Link className="primary-button" href="/katalog">Temukan hasil panen <ArrowRight size={16} /></Link></div><div className="about-photo"><Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&h=760&fit=crop" alt="Lahan pertanian hijau di bawah cahaya pagi" fill priority sizes="(max-width: 650px) 100vw, 45vw" /></div></section>
      <section className="about-values" aria-label="Nilai Ladang Kita">{values.map((value, index) => <article className="about-value" key={value.title}><span>0{index + 1}</span><h2>{value.title}</h2><p>{value.text}</p></article>)}</section>
    </main>
  );
}