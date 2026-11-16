'use client';

import { useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/data/data/context/context/CartContext';

export default function ProductDetailActions({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  function handleAdd() {
    const ok = addToCart(product, quantity);
    if (!ok) {
      setCartError('Jumlah tidak valid atau melebihi stok yang tersedia.');
      setAdded(false);
      return;
    }
    setCartError('');
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  }

  return (
    <>
      <div className="detail-add-row">
        <div className="detail-quantity" aria-label="Pilih jumlah produk">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Kurangi jumlah"><Minus size={15} /></button>
          <span>{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => Math.min(Number(product.stock) || 999, value + 1))} aria-label="Tambah jumlah"><Plus size={15} /></button>
        </div>
        <button className="primary-button" type="button" onClick={handleAdd}>{added ? <Check size={17} /> : <ShoppingBag size={17} />}{added ? 'Ditambahkan' : 'Tambah ke keranjang'}</button>
      </div>
      {added && <p className="detail-added" role="status">{quantity} {product.unit} {product.name} masuk ke keranjang.</p>}
      {cartError && <p className="auth-message auth-error" role="alert">{cartError}</p>}
    </>
  );
}