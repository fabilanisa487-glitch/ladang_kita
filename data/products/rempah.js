// Harga merupakan perkiraan contoh/dummy, dibulatkan dan bukan harga pasar terkini.
const photo = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`;

export const rempahProducts = [
  {
    id: 55, slug: 'jahe-gajah', name: 'Jahe Gajah', category: 'rempah', subcategory: 'Rimpang',
    price: 22000, unit: 'kg', farmer: 'Pak Dadan Suherman', location: 'Cisaat, Sukabumi, Jawa Barat', region: 'Cisaat, Sukabumi, Jawa Barat',
    description: 'Jahe gajah berukuran besar dengan rasa hangat dan pedas ringan. Cocok untuk wedang, tumisan, dan bumbu masak.', stock: 35,
    image: photo(1337585), imageAlt: 'Rimpang jahe gajah segar dengan kulit cokelat muda', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 56, slug: 'jahe-emprit', name: 'Jahe Emprit', category: 'rempah', subcategory: 'Rimpang',
    price: 28000, unit: 'kg', farmer: 'Bu Sri Mulyani', location: 'Kledung, Temanggung, Jawa Tengah', region: 'Kledung, Temanggung, Jawa Tengah',
    description: 'Jahe emprit berukuran kecil dengan aroma tajam dan rasa lebih pedas. Pas untuk jamu, teh jahe, dan minuman hangat.', stock: 24,
    image: photo(20234958), imageAlt: 'Tumpukan rimpang jahe emprit segar dengan tekstur khas', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 57, slug: 'kunyit-kuning', name: 'Kunyit Kuning', category: 'rempah', subcategory: 'Rimpang',
    price: 16000, unit: 'kg', farmer: 'Pak Wawan', location: 'Wlingi, Blitar, Jawa Timur', region: 'Wlingi, Blitar, Jawa Timur',
    description: 'Kunyit segar dengan daging jingga cerah dan aroma khas. Gunakan untuk bumbu gulai, nasi kuning, atau jamu.', stock: 40,
    image: photo(31346461), imageAlt: 'Rimpang kunyit kuning segar dengan warna jingga alami', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 58, slug: 'lengkuas-segar', name: 'Lengkuas Segar', category: 'rempah', subcategory: 'Rimpang',
    price: 14000, unit: 'kg', farmer: 'Bu Tati', location: 'Pacet, Cianjur, Jawa Barat', region: 'Pacet, Cianjur, Jawa Barat',
    description: 'Lengkuas segar beraroma sitrus dan berserat padat. Memarkan untuk rendang, sayur asem, atau olahan santan.', stock: 32,
    image: photo(37420330), imageAlt: 'Rimpang lengkuas segar berwarna krem kecokelatan', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 59, slug: 'kencur-segar', name: 'Kencur Segar', category: 'rempah', subcategory: 'Rimpang',
    price: 26000, unit: 'kg', farmer: 'Pak Maman', location: 'Ajibarang, Banyumas, Jawa Tengah', region: 'Ajibarang, Banyumas, Jawa Tengah',
    description: 'Kencur segar dengan aroma khas dan rasa hangat. Gunakan untuk bumbu pecel, seblak, atau beras kencur.', stock: 18,
    image: '/images/placeholder.jpg', imageAlt: 'Placeholder: foto kencur belum tersedia', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 60, slug: 'temulawak-segar', name: 'Temulawak Segar', category: 'rempah', subcategory: 'Rimpang',
    price: 18000, unit: 'kg', farmer: 'Bu Khotimah', location: 'Batuan, Sumenep, Jawa Timur', region: 'Batuan, Sumenep, Jawa Timur',
    description: 'Temulawak segar beraroma tanah dan rasa sedikit pahit. Umum direbus sebagai bahan jamu atau minuman tradisional.', stock: 21,
    image: '/images/placeholder.jpg', imageAlt: 'Placeholder: foto temulawak belum tersedia', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 61, slug: 'serai-dapur', name: 'Serai Dapur', category: 'rempah', subcategory: 'Daun & batang aromatik',
    price: 8000, unit: 'ikat', farmer: 'Pak Usep', location: 'Cikajang, Garut, Jawa Barat', region: 'Cikajang, Garut, Jawa Barat',
    description: 'Serai segar dengan batang padat dan aroma lemon yang wangi. Memarkan untuk soto, sup, atau bumbu ungkep.', stock: 55,
    image: photo(39500316), imageAlt: 'Ikat batang serai segar berwarna hijau pucat dan putih', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 62, slug: 'daun-salam', name: 'Daun Salam', category: 'rempah', subcategory: 'Daun & batang aromatik',
    price: 7000, unit: 'ikat', farmer: 'Bu Eti Suryani', location: 'Bener, Purworejo, Jawa Tengah', region: 'Bener, Purworejo, Jawa Tengah',
    description: 'Daun salam kering dengan aroma lembut khas masakan Nusantara. Tambahkan saat memasak semur, sayur lodeh, atau nasi.', stock: 48,
    image: photo(4871128), imageAlt: 'Daun salam kering tersusun di atas talenan kayu untuk bumbu masakan', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 63, slug: 'daun-jeruk-purut', name: 'Daun Jeruk Purut', category: 'rempah', subcategory: 'Daun & batang aromatik',
    price: 9000, unit: 'ikat', farmer: 'Pak Dedi Sulaiman', location: 'Leles, Garut, Jawa Barat', region: 'Leles, Garut, Jawa Barat',
    description: 'Daun jeruk purut segar dengan aroma sitrus yang kuat. Sobek atau iris halus untuk sambal, soto, dan bumbu tumis.', stock: 42,
    image: photo(6722240), imageAlt: 'Daun jeruk purut bersama cabai dan serai sebagai bahan aromatik', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 64, slug: 'cabai-rawit-merah', name: 'Cabai Rawit Merah', category: 'rempah', subcategory: 'Cabai',
    price: 48000, unit: 'kg', farmer: 'Bu Rukmini', location: 'Pare, Kediri, Jawa Timur', region: 'Pare, Kediri, Jawa Timur',
    description: 'Cabai rawit merah kecil dengan tingkat pedas kuat dan warna cerah. Cocok untuk sambal, oseng, dan bumbu dasar.', stock: 30,
    image: photo(11318047), imageAlt: 'Cabai rawit merah segar berwarna cerah dengan bentuk kecil', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 65, slug: 'cabai-hijau-besar', name: 'Cabai Hijau Besar', category: 'rempah', subcategory: 'Cabai',
    price: 30000, unit: 'kg', farmer: 'Pak Teguh', location: 'Bandongan, Magelang, Jawa Tengah', region: 'Bandongan, Magelang, Jawa Tengah',
    description: 'Cabai hijau berkulit tebal dengan rasa pedas ringan. Enak untuk cabai hijau, tumisan, atau pelengkap nasi goreng.', stock: 28,
    image: photo(2893882), imageAlt: 'Cabai hijau segar berdampingan dengan cabai merah', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 66, slug: 'kayu-manis-kerinci', name: 'Kayu Manis Kerinci', category: 'rempah', subcategory: 'Rempah kering',
    price: 95000, unit: 'kg', farmer: 'Pak Marzuki', location: 'Gunung Raya, Kerinci, Jambi', region: 'Gunung Raya, Kerinci, Jambi',
    description: 'Kayu manis kering beraroma hangat dan manis alami. Gunakan untuk wedang, kue, atau hidangan berkuah.', stock: 16,
    image: photo(13526307), imageAlt: 'Batang kayu manis kering berwarna cokelat dengan tekstur berlapis', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 67, slug: 'cengkeh-kering', name: 'Cengkeh Kering', category: 'rempah', subcategory: 'Rempah kering',
    price: 155000, unit: 'kg', farmer: 'Bu Maria Wenas', location: 'Kakas, Minahasa, Sulawesi Utara', region: 'Kakas, Minahasa, Sulawesi Utara',
    description: 'Cengkeh kering beraroma kuat dan hangat dengan kuntum utuh. Pakai secukupnya untuk semur, wedang, atau campuran rempah.', stock: 12,
    image: photo(6087276), imageAlt: 'Cengkeh kering berwarna cokelat terserak di permukaan gelap', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 68, slug: 'kunyit-putih', name: 'Kunyit Putih', category: 'rempah', subcategory: 'Rimpang',
    price: 32000, unit: 'kg', farmer: 'Pak Jamhari', location: 'Sumbang, Banyumas, Jawa Tengah', region: 'Sumbang, Banyumas, Jawa Tengah',
    description: 'Kunyit putih beraroma rimpang khas dengan rasa getir ringan. Gunakan sebagai bumbu atau bahan minuman tradisional.', stock: 14,
    image: photo(31346461), imageAlt: 'Rimpang kunyit putih segar berwarna krem pucat', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 69, slug: 'cabai-rawit-hijau', name: 'Cabai Rawit Hijau', category: 'rempah', subcategory: 'Cabai',
    price: 38000, unit: 'kg', farmer: 'Bu Marlia', location: 'Bulu, Temanggung, Jawa Tengah', region: 'Bulu, Temanggung, Jawa Tengah',
    description: 'Cabai rawit hijau segar dengan rasa pedas tajam dan aroma sayuran muda. Cocok untuk sambal ijo dan lalapan.', stock: 25,
    image: photo(2893882), imageAlt: 'Cabai rawit hijau dan merah segar dengan tangkai hijau', featured: false, rating: 4.5, reviewCount: 2,
  },
];