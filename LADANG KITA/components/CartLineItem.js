'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/data/products/index';

export default function CartLineItem({ item, onQuantityChange, onRemove }) {
  return (
    <article className="cart-line-item">
      <Link className="cart-line-image" href={`/produk/${item.id}`}><Image src={item.image} alt={item.name} fill sizes="100px" /></Link>
      <div className="cart-line-info"><Link href={`/produk/${item.id}`}><h2>{item.name}</h2></Link><span className="cart-line-farmer">{item.farmer} · {item.region}</span><strong className="cart-line-price">{formatPrice(item.price)} <span>/ {item.unit}</span></strong><div className="quantity-control" aria-label={`Jumlah ${item.name}`}><button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} aria-label={`Kurangi jumlah ${item.name}`}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" onClick={() => onQuantityChange(item.id, item.quantity + 1)} aria-label={`Tambah jumlah ${item.name}`}><Plus size={14} /></button></div></div>
      <div className="cart-line-end"><strong>{formatPrice(item.price * item.quantity)}</strong><button className="remove-button" type="button" onClick={() => onRemove(item.id)} aria-label={`Hapus ${item.name}`}><Trash2 size={17} /></button></div>
    </article>
  );
}