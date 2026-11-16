import { initialReviews, getAverageRating } from '../data/reviews.js';
import { products as baseProducts, categories, formatPrice } from '../products.js';
import { buahProducts } from './buah.js';
import { berasProducts } from './beras.js';
import { rempahProducts } from './rempah.js';

const legacySubcategories = {
  sayur: 'Sayur segar',
  buah: 'Buah segar populer',
  beras: 'Beras',
  rempah: 'Rimpang',
  bumbu: 'Bawang-bawangan',
};

const completeLegacyProducts = baseProducts.map((product) => {
  const reviews = initialReviews[product.id] || [];
  const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    ...product,
    slug,
    subcategory: product.category === 'rempah' && product.name.toLowerCase().includes('cabai')
      ? 'Cabai'
      : legacySubcategories[product.category],
    location: product.region,
    imageAlt: `${product.name} segar dari hasil panen petani lokal`,
    stock: 25,
    rating: getAverageRating(reviews),
    reviewCount: reviews.length,
  };
});

export const products = [...completeLegacyProducts, ...buahProducts, ...berasProducts, ...rempahProducts];
export { categories, formatPrice };

export function getProductById(id) {
  return products.find((product) => product.id === Number(id));
}