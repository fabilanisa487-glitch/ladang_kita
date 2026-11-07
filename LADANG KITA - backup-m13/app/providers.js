'use client';

import { AuthProvider } from '@/data/data/context/AuthContext';
import { CartProvider } from '@/data/data/context/context/CartContext';
import { WishlistProvider } from '@/data/data/context/context/context/WishlistContext';
import { ReviewsProvider } from '@/data/data/context/context/context/context/ReviewsContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ReviewsProvider>{children}</ReviewsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}