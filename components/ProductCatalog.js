'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { categories, products } from '@/data/products/index';
import { useReviews } from '@/data/data/context/context/context/context/ReviewsContext';
import ProductCard from './ProductCard';

export default function ProductCatalog({ featuredOnly = false, initialCategory = 'semua' }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('unggulan');
  const { getReviews } = useReviews();

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id');
    const result = products.filter((product) => {
      const matchesCategory = activeCategory === 'semua' || product.category === activeCategory;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.farmer} ${product.region}`.toLocaleLowerCase('id').includes(normalizedQuery);
      return matchesCategory && matchesQuery && (!featuredOnly || product.featured);
    });
    if (sortOrder === 'harga-naik') result.sort((a, b) => a.price - b.price);
    if (sortOrder === 'harga-turun') result.sort((a, b) => b.price - a.price);
    if (sortOrder === 'nama') result.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    if (sortOrder === 'unggulan') result.sort((a, b) => Number(b.featured) - Number(a.featured));
    return result;
  }, [activeCategory, featuredOnly, query, sortOrder]);

  return (
    <div className="catalog">
      <div className="catalog-controls">
        <label className="search-box"><Search size={18} aria-hidden="true" /><input type="search" placeholder="Cari produk atau petani..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari produk atau petani" /></label>
        <label className="sort-control"><SlidersHorizontal size={16} /><span>Urutkan</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Urutkan produk"><option value="unggulan">Pilihan Ladang</option><option value="harga-naik">Harga terendah</option><option value="harga-turun">Harga tertinggi</option><option value="nama">Nama produk</option></select></label>
      </div>
      <div className="catalog-toolbar">
        <div className="category-list" role="group" aria-label="Filter kategori">
          {categories.map((category) => <button className={`category-button${activeCategory === category.id ? ' category-selected' : ''}`} key={category.id} type="button" onClick={() => setActiveCategory(category.id)} aria-pressed={activeCategory === category.id}><span>{category.icon}</span>{category.name}</button>)}
        </div>
        <span className="result-count">{visibleProducts.length} produk</span>
      </div>
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product, index) => {
        const reviews = getReviews(product.id);
        const rating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null;
        return <ProductCard key={product.id} product={product} rating={rating} reviewCount={reviews.length} priority={index === 0} />;
      })}</div> : <div className="empty-results"><Search size={26} /><strong>Belum ada hasil yang cocok</strong><span>Coba kata kunci atau kategori yang berbeda.</span></div>}
    </div>
  );
}