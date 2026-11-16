import { products } from '../data/products/index.js';
import { initialReviews, getAverageRating } from '../data/data/reviews.js';

const requiredFields = [
  'id', 'slug', 'name', 'category', 'subcategory', 'price', 'unit', 'farmer',
  'location', 'description', 'stock', 'image', 'imageAlt', 'featured', 'rating', 'reviewCount',
];
const allowedCategories = new Set(['sayur', 'buah', 'beras', 'rempah', 'bumbu']);
const allowedUnits = new Set(['kg', 'ikat', 'pcs', 'butir', 'sisir', '500 gr', 'liter', '2 kg', '5 kg']);
const errors = [];
const ids = new Set();
const slugs = new Set();
const names = new Set();
const categoryCounts = {};
let featuredCount = 0;

for (const product of products) {
  for (const field of requiredFields) {
    if (product[field] === undefined || product[field] === null || product[field] === '') {
      errors.push(`${product.name || `ID ${product.id}`}: field ${field} kosong.`);
    }
  }
  if (!Number.isInteger(product.id) || ids.has(product.id)) errors.push(`${product.name}: ID tidak valid atau duplikat (${product.id}).`);
  if (typeof product.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug) || slugs.has(product.slug)) errors.push(`${product.name}: slug tidak valid atau duplikat (${product.slug}).`);
  if (typeof product.name === 'string' && names.has(product.name.toLocaleLowerCase('id'))) errors.push(`${product.name}: nama produk duplikat.`);
  if (!allowedCategories.has(product.category)) errors.push(`${product.name}: kategori tidak dikenal (${product.category}).`);
  if (!allowedUnits.has(product.unit)) errors.push(`${product.name}: satuan tidak diizinkan (${product.unit}).`);
  if (!Number.isFinite(product.price) || product.price <= 0 || product.price % 500 !== 0) errors.push(`${product.name}: harga harus positif dan kelipatan Rp 500.`);
  if (!Number.isInteger(product.stock) || product.stock <= 0) errors.push(`${product.name}: stok harus bilangan bulat di atas nol.`);
  if (!Number.isFinite(product.rating) || product.rating < 1 || product.rating > 5) errors.push(`${product.name}: rating harus di antara 1 dan 5.`);
  if (typeof product.reviewCount !== 'number' || product.reviewCount < 0) errors.push(`${product.name}: reviewCount tidak valid.`);
  if (typeof product.featured !== 'boolean') errors.push(`${product.name}: featured harus boolean.`);
  if (typeof product.image !== 'string' || !(/^(https:\/\/|\/images\/)/.test(product.image))) errors.push(`${product.name}: URL gambar harus HTTPS atau path lokal /images/.`);
  if (typeof product.imageAlt !== 'string' || product.imageAlt.trim().length < 8) errors.push(`${product.name}: imageAlt harus deskriptif.`);

  const reviews = initialReviews[product.id] || [];
  if (reviews.length !== product.reviewCount) errors.push(`${product.name}: reviewCount ${product.reviewCount} tidak sama dengan jumlah ulasan ${reviews.length}.`);
  if (reviews.length && getAverageRating(reviews) !== product.rating) errors.push(`${product.name}: rating ${product.rating} berbeda dari rata-rata ulasan ${getAverageRating(reviews)}.`);
  for (const review of reviews) {
    if (!review.userName || !review.comment || !/^\d{4}-\d{2}-\d{2}$/.test(review.date) || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
      errors.push(`${product.name}: format ulasan ${review.id} tidak valid.`);
    }
  }

  ids.add(product.id);
  slugs.add(product.slug);
  names.add(product.name.toLocaleLowerCase('id'));
  categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
  if (product.featured) featuredCount += 1;
}

console.log(`Produk: ${products.length}`);
console.log(`Kategori: ${Object.entries(categoryCounts).map(([category, count]) => `${category}=${count}`).join(', ')}`);
console.log(`Featured: ${featuredCount}`);
if (categoryCounts.buah !== 30) errors.push(`Tahap Buah mengharuskan 30 produk; ditemukan ${categoryCounts.buah || 0}.`);
if (categoryCounts.beras !== 17) errors.push(`Tahap Beras mengharuskan 17 produk termasuk 2 produk awal; ditemukan ${categoryCounts.beras || 0}.`);
if (categoryCounts.rempah !== 17) errors.push(`Tahap Rempah mengharuskan 17 produk termasuk 2 produk awal; ditemukan ${categoryCounts.rempah || 0}.`);

if (errors.length) {
  console.error(`Validasi gagal (${errors.length} masalah):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Validasi produk dan ulasan berhasil.');
}