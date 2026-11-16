'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingBasket } from 'lucide-react';
import CartLineItem from '@/components/CartLineItem';
import { formatPrice } from '@/data/products/index';
import { useCart } from '@/data/data/context/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  return (
    <main className="page-main content-width">
      <div className="page-intro"><div className="eyebrow"><span /> PESANANMU</div><h1>Keranjang belanja</h1><p>{totalItems} item pilihan segar dari petani lokal.</p></div>
      {items.length ? (
        <div className="cart-page-grid">
          <section className="cart-panel" aria-label="Daftar produk di keranjang">
            {items.map((item) => <CartLineItem key={item.id} item={item} onQuantityChange={updateQuantity} onRemove={removeFromCart} />)}
          </section>
          <aside className="summary-panel"><h2>Ringkasan pesanan</h2><div className="summary-row"><span>Jumlah produk</span><span>{totalItems} item</span></div><div className="summary-row"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div><div className="summary-row"><span>Ongkos kirim</span><span>Dihitung saat checkout</span></div><div className="summary-row summary-total"><span>Total sementara</span><span>{formatPrice(totalPrice)}</span></div><Link className="primary-button" href="/checkout">Lanjut ke checkout <ArrowRight size={17} /></Link><p className="summary-note">Ongkos kirim dan detail pembayaran dikonfirmasi pada langkah berikutnya.</p></aside>
        </div>
      ) : (
        <section className="empty-state"><ShoppingBasket size={34} /><h2>Keranjangmu masih kosong</h2><p>Yuk, pilih hasil panen segar untuk melengkapi kebutuhan dapurmu.</p><Link className="primary-button" href="/katalog">Mulai belanja <ArrowRight size={16} /></Link></section>
      )}
    </main>
  );
}