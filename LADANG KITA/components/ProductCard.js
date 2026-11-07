'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Check, MapPin, Plus, Star } from 'lucide-react';
import { categories, formatPrice } from '@/data/products/index';
import { useCart } from '@/data/data/context/context/CartContext';

export default function ProductCard({ product, rating, reviewCount = 0, priority = false }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const category = categories.find((item) => item.id === product.category)?.name;

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <article className="product-card">
      <Link className="product-photo" href={`/produk/${product.id}`} aria-label={`Lihat detail ${product.name}`}>
        <Image src={product.image} alt={product.imageAlt || product.name} fill priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 25vw" />
        {product.featured && <span className="fresh-tag">Pilihan Ladang</span>}
        <span className="product-category">{category}</span>
      </Link>
      <div className="product-info">
        <div className="product-rating"><Star size={13} fill="currentColor" /><span>{rating || 'Baru'}</span><span className="review-count">({reviewCount})</span></div>
        <Link className="product-title-link" href={`/produk/${product.id}`}><h3>{product.name}</h3></Link>
        <p className="farmer-line"><MapPin size={13} /> {product.farmer} · {product.region}</p>
        <div className="product-bottom">
          <div className="price"><strong>{formatPrice(product.price)}</strong><span> / {product.unit}</span></div>
          <button className={`add-button${added ? ' add-button-added' : ''}`} type="button" onClick={handleAdd} aria-label={`${added ? 'Ditambahkan' : 'Tambah'} ${product.name} ke keranjang`}>{added ? <Check size={17} /> : <Plus size={18} />}</button>
        </div>
      </div>
    </article>
  );
}