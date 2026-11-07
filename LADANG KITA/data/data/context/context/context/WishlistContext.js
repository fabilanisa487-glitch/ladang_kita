'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../AuthContext';
import { products } from '@/data/products/index';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Bersihkan key storage lama saat mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('ladang_wishlist_')) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Abaikan
      }
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setProductIds([]);
      setLoaded(true);
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.items)) {
        setProductIds(data.items.map(String));
      } else {
        setProductIds([]);
      }
    } catch {
      setProductIds([]);
    } finally {
      setLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const toggleWishlist = async (product) => {
    if (!user) return { success: false, needLogin: true };
    if (!product || product.id === undefined) return { success: false };

    const stringId = String(product.id);
    const exists = productIds.includes(stringId);

    // Optimistic UI update
    setProductIds((prev) => (exists ? prev.filter((id) => id !== stringId) : [...prev, stringId]));

    try {
      if (exists) {
        await fetch(`/api/wishlist?productId=${encodeURIComponent(stringId)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
        });
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ productId: stringId }),
        });
      }
      return { success: true };
    } catch {
      // Rollback jika request gagal
      setProductIds((prev) => (exists ? [...prev, stringId] : prev.filter((id) => id !== stringId)));
      return { success: false };
    }
  };

  const removeFromWishlist = async (id) => {
    if (!user) return;
    const stringId = String(id);
    setProductIds((prev) => prev.filter((i) => i !== stringId));

    try {
      await fetch(`/api/wishlist?productId=${encodeURIComponent(stringId)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch {
      // Abaikan jika gagal
    }
  };

  const isInWishlist = useCallback(
    (id) => {
      return productIds.includes(String(id));
    },
    [productIds]
  );

  // Turunkan items objek produk dari katalog berdasarkan ID
  const items = useMemo(() => {
    return productIds
      .map((id) => products.find((p) => String(p.id) === id))
      .filter(Boolean);
  }, [productIds]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        count: items.length,
        loaded,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist harus dipakai di dalam WishlistProvider');
  return ctx;
}