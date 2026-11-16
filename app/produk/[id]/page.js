import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { notFound } from 'next/navigation';
import { categories, formatPrice, getProductById, products } from '@/data/products/index';
import { initialReviews } from '@/data/data/reviews';
import ProductDetailActions from '@/components/ProductDetailActions';

export function generateStaticParams() {
  return products.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({ params }) {
  const product = getProductById(params.id);
  if (!product) return { title: 'Produk tidak ditemukan' };
  return { title: product.name, description: product.description };
}

export default function ProductDetailPage({ params }) {
  const product = getProductById(params.id);
  if (!product) notFound();
  const category = categories.find((item) => item.id === product.category)?.name;
  const reviews = initialReviews[product.id] || [];
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 'Produk baru';

  return (
    <main className="page-main content-width">
      <div className="breadcrumbs"><Link href="/">Beranda</Link><span>/</span><Link href="/katalog">Katalog</Link><span>/</span><span>{product.name}</span></div>
      <section className="detail-layout">
        <div className="detail-image"><Image src={product.image} alt={product.imageAlt || product.name} fill priority sizes="(max-width: 760px) 100vw, 50vw" /></div>
        <div className="detail-copy">
          <div className="eyebrow"><span /> {category?.toLocaleUpperCase('id')}</div>
          <h1>{product.name}</h1>
          <div className="detail-rating"><Star size={15} fill="currentColor" /><strong>{average}</strong><span>({reviews.length} ulasan)</span></div>
          <div className="detail-price">{formatPrice(product.price)} <span>/ {product.unit}</span></div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-farmer"><MapPin size={18} /><div><strong>{product.farmer}</strong><span>{product.region} · Petani mitra Ladang Kita</span></div></div>
          <ProductDetailActions product={product} />
        </div>
      </section>
      <section className="detail-reviews"><div className="section-heading"><div><div className="eyebrow"><span /> CERITA PEMBELI</div><h2>Ulasan produk</h2></div></div>{reviews.length ? <div className="review-list">{reviews.slice(0, 3).map((review) => <article className="review-item" key={review.id}><div className="detail-rating">{'★'.repeat(review.rating)}<span>{review.date}</span></div><p>“{review.comment}”</p><strong>{review.userName}</strong></article>)}</div> : <p className="detail-description">Belum ada ulasan untuk produk ini.</p>}</section>
    </main>
  );
}