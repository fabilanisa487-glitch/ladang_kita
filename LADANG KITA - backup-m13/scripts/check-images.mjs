import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { products } from '../data/products/index.js';

const images = [...new Set(products.map((product) => product.image))];
const failures = [];
let nextIndex = 0;

async function checkImage(image) {
  if (image.startsWith('/images/')) {
    try {
      await access(resolve('public', image.slice(1)));
      return { image, status: 'LOCAL OK' };
    } catch {
      return { image, status: 'LOCAL MISSING' };
    }
  }

  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(image, {
        method,
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        if (method === 'GET') await response.body?.cancel();
        return { image, status: response.status };
      }
      if (method === 'GET') return { image, status: response.status };
    } catch (error) {
      if (method === 'GET') return { image, status: error.message };
    }
  }
  return { image, status: 'unreachable' };
}

async function worker() {
  while (nextIndex < images.length) {
    const image = images[nextIndex];
    nextIndex += 1;
    const result = await checkImage(image);
    console.log(`${result.status} ${result.image}`);
    if (result.status !== 200 && result.status !== 'LOCAL OK') failures.push(result);
  }
}

await Promise.all(Array.from({ length: Math.min(5, images.length) }, () => worker()));
console.log(`Gambar diperiksa: ${images.length}; gagal: ${failures.length}.`);
if (failures.length) process.exitCode = 1;