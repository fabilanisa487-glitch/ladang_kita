export const categories = [
  { id: 'semua', name: 'Semua', icon: '🌿' },
  { id: 'sayur', name: 'Sayur', icon: '🥬' },
  { id: 'buah', name: 'Buah', icon: '🍎' },
  { id: 'beras', name: 'Beras', icon: '🍚' },
  { id: 'rempah', name: 'Rempah', icon: '🌶️' },
  { id: 'bumbu', name: 'Bumbu', icon: '🧄' },
];

export const products = [
  {
    id: 1,
    name: 'Tomat Merah Segar',
    price: 12000,
    unit: 'kg',
    category: 'sayur',
    farmer: 'Pak Slamet',
    region: 'Boyolali, Jawa Tengah',
    description:
      'Tomat merah segar langsung dari kebun Pak Slamet. Cocok untuk sayuran, sambal, atau jus. Dipetik pagi hari agar tetap segar.',
    image:
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=600&fit=crop',
    featured: true,
  },
  {
    id: 2,
    name: 'Wortel Organik',
    price: 15000,
    unit: 'kg',
    category: 'sayur',
    farmer: 'Bu Siti',
    region: 'Lembang, Bandung',
    description:
      'Wortel organik manis dan renyah. Tanpa pestisida kimia. Bagus untuk sup, jus, atau camilan sehat.',
    image:
      'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&h=600&fit=crop',
    featured: true,
  },
  {
    id: 3,
    name: 'Bayam Hijau',
    price: 8000,
    unit: 'ikat',
    category: 'sayur',
    farmer: 'Pak Joko',
    region: 'Cianjur, Jawa Barat',
    description:
      'Bayam hijau segar, daun lebar dan tidak layu. Kaya zat besi, cocok untuk tumis atau lalapan.',
    image:
      'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 4,
    name: 'Pisang Cavendish',
    price: 18000,
    unit: 'kg',
    category: 'buah',
    farmer: 'Pak Wayan',
    region: 'Bali',
    description:
      'Pisang cavendish manis dan lembut. Siap makan atau untuk smoothie dan kue.',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop',
    featured: true,
  },
  {
    id: 5,
    name: 'Apel Malang',
    price: 28000,
    unit: 'kg',
    category: 'buah',
    farmer: 'Bu Rina',
    region: 'Malang, Jawa Timur',
    description:
      'Apel Malang khas, renyah dan segar. Langsung dari kebun di lereng gunung.',
    image:
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=600&fit=crop',
    featured: true,
  },
  {
    id: 6,
    name: 'Jeruk Medan',
    price: 22000,
    unit: 'kg',
    category: 'buah',
    farmer: 'Pak Ahmad',
    region: 'Medan, Sumatera Utara',
    description:
      'Jeruk Medan manis sedikit asam, kaya vitamin C. Cocok dimakan langsung atau dijadikan jus.',
    image:
      'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 7,
    name: 'Beras Pandan Wangi',
    price: 75000,
    unit: '5 kg',
    category: 'beras',
    farmer: 'Kelompok Tani Sari',
    region: 'Cianjur, Jawa Barat',
    description:
      'Beras pandan wangi premium, pulen dan harum. Diproses higienis dari petani lokal.',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop',
    featured: true,
  },
  {
    id: 8,
    name: 'Beras Merah Organik',
    price: 45000,
    unit: '2 kg',
    category: 'beras',
    farmer: 'Pak Bambang',
    region: 'Yogyakarta',
    description:
      'Beras merah organik, tinggi serat dan nutrisi. Cocok untuk gaya hidup sehat.',
    image:
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 9,
    name: 'Cabai Merah Keriting',
    price: 35000,
    unit: 'kg',
    category: 'rempah',
    farmer: 'Bu Yanti',
    region: 'Brebes, Jawa Tengah',
    description:
      'Cabai merah keriting pedas dan segar. Langsung dari lahan petani Brebes.',
    image:
      'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 10,
    name: 'Jahe Merah',
    price: 25000,
    unit: 'kg',
    category: 'rempah',
    farmer: 'Pak Dedi',
    region: 'Garut, Jawa Barat',
    description:
      'Jahe merah segar, aromatik dan berkhasiat. Ideal untuk jamu, teh, atau bumbu masakan.',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 11,
    name: 'Bawang Putih',
    price: 32000,
    unit: 'kg',
    category: 'bumbu',
    farmer: 'Pak Heru',
    region: 'Temanggung, Jawa Tengah',
    description:
      'Bawang putih lokal berkualitas, kulit putih bersih. Wajib ada di dapur setiap hari.',
    image:
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop',
    featured: false,
  },
  {
    id: 12,
    name: 'Bawang Merah',
    price: 28000,
    unit: 'kg',
    category: 'bumbu',
    farmer: 'Bu Lina',
    region: 'Nganjuk, Jawa Timur',
    description:
      'Bawang merah Nganjuk, ukuran sedang, aroma kuat. Cocok untuk bumbu dasar masakan Indonesia.',
    image:
      'https://images.unsplash.com/photo-1508747703725-719777637510?w=600&h=600&fit=crop',
    featured: true,
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === Number(id));
}

export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}