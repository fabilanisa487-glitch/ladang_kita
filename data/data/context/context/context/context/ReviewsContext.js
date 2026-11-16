'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initialReviews } from '@/data/data/reviews';
import { useAuth } from '../../../AuthContext';

const ReviewsContext = createContext(null);

export function ReviewsProvider({ children }) {
  const { user } = useAuth();
  // dbReviews: Map of productId -> Array of reviews from database
  const [dbReviews, setDbReviews] = useState({});

  // Hapus key lama dari localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ladang_reviews');
      } catch {
        // Abaikan
      }
    }
  }, []);

  const fetchReviews = useCallback(async (productId) => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.reviews)) {
        setDbReviews((prev) => ({
          ...prev,
          [productId]: data.reviews,
        }));
      }
    } catch {
      // Abaikan kegagalan jaringan, fallback ke seed
    }
  }, []);

  const getReviews = useCallback(
    (productId) => {
      const dbList = dbReviews[productId] || [];
      const seedList = initialReviews[productId] || [];

      // Gabungkan ulasan database dengan seed awal (hindari duplikasi jika ada id sama)
      const combined = [...dbList];
      for (const seed of seedList) {
        if (!combined.some((r) => String(r.id) === String(seed.id))) {
          combined.push(seed);
        }
      }

      return combined.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    },
    [dbReviews]
  );

  const addReview = async (productId, rating, comment) => {
    if (!user) return { success: false, error: 'Silakan masuk terlebih dahulu.' };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ productId: String(productId), rating, comment }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Gagal menyimpan ulasan.' };
      }

      await fetchReviews(productId);
      return { success: true };
    } catch {
      return { success: false, error: 'Terjadi kendala jaringan saat mengirim ulasan.' };
    }
  };

  const updateReview = async (productId, reviewId, rating, comment) => {
    return addReview(productId, rating, comment);
  };

  const deleteReview = async (productId) => {
    if (!user) return { success: false, error: 'Silakan masuk terlebih dahulu.' };

    try {
      const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Gagal menghapus ulasan.' };
      }

      await fetchReviews(productId);
      return { success: true };
    } catch {
      return { success: false, error: 'Terjadi kendala jaringan saat menghapus ulasan.' };
    }
  };

  const getUserReview = useCallback(
    (productId) => {
      if (!user) return null;
      const list = dbReviews[productId] || [];
      return list.find((r) => r.userId === user.id) || null;
    },
    [user, dbReviews]
  );

  return (
    <ReviewsContext.Provider
      value={{
        getReviews,
        addReview,
        updateReview,
        deleteReview,
        getUserReview,
        fetchReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews harus dipakai di dalam ReviewsProvider');
  return ctx;
}