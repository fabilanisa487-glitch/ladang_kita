import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function AuthCard({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/" aria-label="Ladang Kita, beranda">
          <span className="brand-mark"><Leaf size={19} /></span>
          <span>Ladang<span className="brand-light">Kita</span></span>
        </Link>
        <div className="auth-card-heading"><div className="eyebrow"><span /> {eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
        {children}
        {footer && <div className="auth-card-footer">{footer}</div>}
      </section>
    </main>
  );
}