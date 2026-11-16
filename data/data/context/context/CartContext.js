'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { products } from '@/data/products/index';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Hanya simpan [{ id, quantity }] di state mentah
  const [rawItems, setRawItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ladang_cart');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = [];
          for (const item of parsed) {
            const id = item?.id !== undefined ? String(item.id) : null;
            if (!id) continue;
            const product = products.find((p) => String(p.id) === id);
            if (!product) continue;

            const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 99;
            const minOrder = Number.isFinite(Number(product.minOrder)) ? Number(product.minOrder) : 1;
            let qty = Math.floor(Number(item.quantity) || 1);
            if (qty < minOrder) qty = minOrder;
            if (qty > Math.min(99, stock)) qty = Math.min(99, stock);

            sanitized.push({ id, quantity: qty });
          }
          setRawItems(sanitized);
        }
      }
    } catch {
      setRawItems([]);
    }
    setLoaded(true);
  }, []);

  // Simpan HANYA { id, quantity } ke localStorage
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      try {
        const minimal = rawItems.map((i) => ({ id: i.id, quantity: i.quantity }));
        localStorage.setItem('ladang_cart', JSON.stringify(minimal));
      } catch {
        // Abaikan error kuota/akses storage
      }
    }
  }, [rawItems, loaded]);

  const addToCart = (product, qty = 1) => {
    if (!product || product.id === undefined) return false;
    const id = String(product.id);
    const catalogProduct = products.find((p) => String(p.id) === id);
    if (!catalogProduct) return false;

    const requested = Number(qty);
    const stock = Number.isFinite(Number(catalogProduct.stock)) ? Number(catalogProduct.stock) : 99;
    const minOrder = Number.isFinite(Number(catalogProduct.minOrder)) ? Number(catalogProduct.minOrder) : 1;

    if (!Number.isInteger(requested) || requested < minOrder) return false;

    setRawItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      const nextQuantity = (existing ? existing.quantity : 0) + requested;
      if (nextQuantity > Math.min(99, stock)) return prev;

      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, quantity: nextQuantity } : i));
      }
      return [...prev, { id, quantity: requested }];
    });
    return true;
  };

  const updateQuantity = (id, quantity) => {
    const stringId = String(id);
    const catalogProduct = products.find((p) => String(p.id) === stringId);
    if (!catalogProduct) {
      removeFromCart(stringId);
      return;
    }

    const next = Number(quantity);
    const stock = Number.isFinite(Number(catalogProduct.stock)) ? Number(catalogProduct.stock) : 99;
    const minOrder = Number.isFinite(Number(catalogProduct.minOrder)) ? Number(catalogProduct.minOrder) : 1;

    if (!Number.isInteger(next) || next < minOrder) {
      removeFromCart(stringId);
      return;
    }

    if (next > Math.min(99, stock)) return;

    setRawItems((prev) => prev.map((i) => (i.id === stringId ? { ...i, quantity: next } : i)));
  };

  const removeFromCart = (id) => {
    const stringId = String(id);
    setRawItems((prev) => prev.filter((i) => i.id !== stringId));
  };

  const clearCart = () => setRawItems([]);

  // Nilai items yang diekspor DITURUNKAN dari katalog resmi
  const items = useMemo(() => {
    return rawItems
      .map((entry) => {
        const prod = products.find((p) => String(p.id) === entry.id);
        if (!prod) return null;
        return {
          ...prod,
          quantity: entry.quantity,
        };
      })
      .filter(Boolean);
  }, [rawItems]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart harus dipakai di dalam CartProvider');
  return ctx;
}