import { products } from '@/data/products/index';

/**
 * Memvalidasi dan menghitung ulang harga keranjang secara otoritatif dari katalog server.
 * Menolak ID tidak dikenal, jumlah selain integer 1-99, atau melebihi stok katalog.
 *
 * @param {Array<{id: string|number, quantity: number}>} items
 * @returns {{ valid: boolean, error?: string, items?: Array<{id: string, name: string, price: number, quantity: number}>, subtotal?: number }}
 */
export function priceCart(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return { valid: false, error: 'Keranjang belanja kosong atau tidak valid.' };
  }

  const merged = new Map();
  for (const item of items) {
    if (!item || item.id === undefined || item.id === null) {
      return { valid: false, error: 'Data item keranjang tidak lengkap.' };
    }
    const id = String(item.id);
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return { valid: false, error: 'Jumlah produk harus berupa bilangan bulat antara 1 dan 99.' };
    }
    merged.set(id, (merged.get(id) || 0) + qty);
  }

  const authoritativeItems = [];
  let subtotal = 0;

  for (const [id, quantity] of merged) {
    if (quantity > 99) {
      return { valid: false, error: 'Jumlah pemesanan untuk satu produk maksimal 99.' };
    }

    const product = products.find((p) => String(p.id) === id);
    if (!product) {
      return { valid: false, error: `Produk dengan ID "${id}" tidak ditemukan dalam katalog.` };
    }

    const stock = Number.isFinite(Number(product.stock)) ? Number(product.stock) : 99;
    const minOrder = Number.isFinite(Number(product.minOrder)) ? Number(product.minOrder) : 1;

    if (quantity < minOrder) {
      return { valid: false, error: `Jumlah pesanan untuk ${product.name} minimal ${minOrder}.` };
    }
    if (quantity > stock) {
      return { valid: false, error: `Jumlah pesanan untuk ${product.name} melebihi stok yang tersedia (${stock}).` };
    }

    const price = Math.round(Number(product.price));
    if (!Number.isInteger(price) || price < 0) {
      return { valid: false, error: `Harga untuk ${product.name} tidak valid.` };
    }

    subtotal += price * quantity;
    authoritativeItems.push({
      id: String(product.id),
      name: String(product.name).slice(0, 50),
      price,
      quantity,
    });
  }

  if (subtotal <= 0 || subtotal > 100_000_000) {
    return { valid: false, error: 'Total nilai pesanan tidak valid.' };
  }

  return {
    valid: true,
    items: authoritativeItems,
    subtotal,
  };
}
