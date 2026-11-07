'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Leaf, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '@/data/data/context/context/CartContext';
import { useAuth } from '@/data/data/context/AuthContext';

const links = [
  { href: '/', label: 'Beranda' },
  { href: '/katalog', label: 'Belanja' },
  { href: '/tentang', label: 'Tentang kami' },
  { href: '/kontak', label: 'Kontak' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push('/');
    }
  };

  return (
    <>
      <div className="announcement">
        <Leaf size={14} aria-hidden="true" /> Panen terbaik musim ini, langsung dari petani lokal
      </div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ladang Kita, beranda" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">
            <Leaf size={20} />
          </span>
          <span>
            Ladang<span className="brand-light">Kita</span>
          </span>
        </Link>
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Navigasi utama">
          {links.map((link) => (
            <Link
              className={pathname === link.href ? 'nav-active' : ''}
              href={link.href}
              key={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {user ? (
            <button className="login-nav-link" type="button" onClick={handleLogout}>
              Keluar
            </button>
          ) : (
            <Link className="login-nav-link" href="/login">
              Masuk
            </Link>
          )}
          <Link className="cart-trigger" href="/keranjang" aria-label={`Keranjang, ${totalItems} item`}>
            <ShoppingBag size={18} />
            <span className="cart-label">Keranjang</span>
            <span className="cart-count">{totalItems}</span>
          </Link>
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>
    </>
  );
}