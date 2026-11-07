// Harga merupakan perkiraan contoh/dummy, dibulatkan dan bukan harga pasar terkini.
const photo = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`;

export const berasProducts = [
  {
    id: 40, slug: 'beras-putih-premium', name: 'Beras Putih Premium', category: 'beras', subcategory: 'Beras',
    price: 18000, unit: 'kg', farmer: 'Kelompok Tani Mekar Jaya', location: 'Cugenang, Cianjur, Jawa Barat', region: 'Cugenang, Cianjur, Jawa Barat',
    description: 'Beras putih premium dengan bulir utuh dan tekstur pulen setelah dimasak. Cocok untuk nasi harian keluarga.', stock: 85,
    image: photo(31555433), imageAlt: 'Beras putih mentah berbutir bersih dalam mangkuk keramik', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 41, slug: 'beras-rojolele', name: 'Beras Rojolele', category: 'beras', subcategory: 'Beras',
    price: 17000, unit: 'kg', farmer: 'Pak Sumarno', location: 'Delanggu, Klaten, Jawa Tengah', region: 'Delanggu, Klaten, Jawa Tengah',
    description: 'Beras Rojolele beraroma lembut dengan nasi pulen dan rasa gurih alami. Enak untuk lauk rumahan sehari-hari.', stock: 72,
    image: photo(13362296), imageAlt: 'Butiran beras putih mentah tersaji di atas sendok kayu', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 42, slug: 'beras-hitam-organik', name: 'Beras Hitam Organik', category: 'beras', subcategory: 'Beras',
    price: 38000, unit: 'kg', farmer: 'Bu Nani', location: 'Salawu, Tasikmalaya, Jawa Barat', region: 'Salawu, Tasikmalaya, Jawa Barat',
    description: 'Beras hitam organik dengan bulir berpigmen gelap dan tekstur lebih padat. Nikmat sebagai nasi campur atau bubur.', stock: 35,
    image: photo(30756211), imageAlt: 'Beras hitam organik Indonesia dengan butiran gelap bertekstur', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 43, slug: 'beras-organik-putih', name: 'Beras Organik Putih', category: 'beras', subcategory: 'Beras',
    price: 26000, unit: 'kg', farmer: 'Kelompok Tani Lestari', location: 'Cianjur, Jawa Barat', region: 'Cianjur, Jawa Barat',
    description: 'Beras putih organik diproses dengan penanganan terpilih dan bulir yang bersih. Cocok untuk nasi pulen setiap hari.', stock: 42,
    image: photo(36346844), imageAlt: 'Butiran beras putih mentah terlihat jelas dari jarak dekat', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 44, slug: 'beras-ir64-medium', name: 'Beras IR64 Medium', category: 'beras', subcategory: 'Beras',
    price: 14000, unit: 'kg', farmer: 'Pak Darto', location: 'Karawang, Jawa Barat', region: 'Karawang, Jawa Barat',
    description: 'Beras IR64 medium memiliki bulir ramping dan tekstur nasi cenderung pera. Pas untuk nasi goreng dan menu prasmanan.', stock: 90,
    image: photo(36346844), imageAlt: 'Bulir beras putih IR64 medium sebelum dimasak', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 45, slug: 'ketan-putih', name: 'Ketan Putih', category: 'beras', subcategory: 'Ketan',
    price: 19000, unit: 'kg', farmer: 'Bu Nunung', location: 'Ciawigebang, Kuningan, Jawa Barat', region: 'Ciawigebang, Kuningan, Jawa Barat',
    description: 'Beras ketan putih berbulir pendek yang menjadi lengket setelah dimasak. Cocok untuk lemper, uli, dan jajanan tradisional.', stock: 48,
    image: photo(31555433), imageAlt: 'Beras ketan putih mentah dengan butiran pendek dan bersih', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 46, slug: 'ketan-hitam', name: 'Ketan Hitam', category: 'beras', subcategory: 'Ketan',
    price: 28000, unit: 'kg', farmer: 'Pak Suyono', location: 'Bantul, DI Yogyakarta', region: 'Bantul, DI Yogyakarta',
    description: 'Ketan hitam memiliki butiran gelap dan tekstur lengket setelah dimasak. Pilihan untuk bubur ketan hitam atau tape.', stock: 32,
    image: photo(30756211), imageAlt: 'Butiran beras hitam untuk ketan dengan warna gelap alami', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 47, slug: 'jagung-pipil-kering', name: 'Jagung Pipil Kering', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 12000, unit: 'kg', farmer: 'Pak Junaidi', location: 'Tuban, Jawa Timur', region: 'Tuban, Jawa Timur',
    description: 'Jagung pipil kering berwarna kuning dengan biji padat. Gunakan untuk bubur jagung, campuran sup, atau pakan olahan.', stock: 65,
    image: photo(10111854), imageAlt: 'Biji jagung pipil kering berwarna kuning keemasan', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 48, slug: 'kacang-hijau', name: 'Kacang Hijau', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 26000, unit: 'kg', farmer: 'Bu Marni', location: 'Purwodadi, Grobogan, Jawa Tengah', region: 'Purwodadi, Grobogan, Jawa Tengah',
    description: 'Kacang hijau kering dengan biji utuh dan warna hijau alami. Cocok untuk bubur, sari kacang, atau isian kue.', stock: 50,
    image: photo(7420814), imageAlt: 'Kacang hijau kering berwarna hijau tersaji dalam mangkuk', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 49, slug: 'kacang-tanah-tuban', name: 'Kacang Tanah Tuban', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 32000, unit: 'kg', farmer: 'Pak Karman', location: 'Tuban, Jawa Timur', region: 'Tuban, Jawa Timur',
    description: 'Kacang tanah kering dari sentra Tuban dengan biji padat dan rasa gurih. Sangrai atau rebus sebagai camilan.', stock: 40,
    image: photo(17975577), imageAlt: 'Kacang tanah mentah berkulit tersusun di atas permukaan kayu', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 50, slug: 'kedelai-lokal-grobogan', name: 'Kedelai Lokal Grobogan', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 15000, unit: 'kg', farmer: 'Kelompok Tani Tani Makmur', location: 'Wirosari, Grobogan, Jawa Tengah', region: 'Wirosari, Grobogan, Jawa Tengah',
    description: 'Kedelai lokal kering dengan biji kuning dan ukuran cukup seragam. Cocok untuk tempe, tahu, atau susu kedelai.', stock: 55,
    image: photo(4518579), imageAlt: 'Biji kedelai lokal kuning kering pada permukaan putih', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 51, slug: 'kacang-merah', name: 'Kacang Merah', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 36000, unit: 'kg', farmer: 'Bu Yatmi', location: 'Kejajar, Wonosobo, Jawa Tengah', region: 'Kejajar, Wonosobo, Jawa Tengah',
    description: 'Kacang merah kering dengan warna merah pekat dan biji utuh. Rendam sebelum dimasak untuk sup, semur, atau bubur.', stock: 28,
    image: photo(17052144), imageAlt: 'Kacang merah kering dengan warna merah tua dan tekstur alami', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 52, slug: 'sorgum-lokal', name: 'Sorgum Lokal', category: 'beras', subcategory: 'Kacang-kacangan & biji-bijian',
    price: 22000, unit: 'kg', farmer: 'Pak Abdul Rahman', location: 'Bolo, Bima, Nusa Tenggara Barat', region: 'Bolo, Bima, Nusa Tenggara Barat',
    description: 'Sorgum lokal berupa biji kecil hasil panen kering dengan rasa ringan. Dapat dimasak sebagai sumber karbohidrat atau campuran bubur.', stock: 26,
    image: photo(13867829), imageAlt: 'Malai sorgum matang tumbuh di lahan pertanian saat musim panen', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 53, slug: 'beras-setra-ramos', name: 'Beras Setra Ramos', category: 'beras', subcategory: 'Beras',
    price: 16000, unit: 'kg', farmer: 'Pak Asep Mulyana', location: 'Cianjur, Jawa Barat', region: 'Cianjur, Jawa Barat',
    description: 'Beras Setra Ramos berbulir panjang dengan tekstur nasi pulen dan ringan. Cocok untuk menu nasi harian.', stock: 70,
    image: photo(13362296), imageAlt: 'Bulir beras putih panjang Setra Ramos sebelum dimasak', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 54, slug: 'beras-mentik-wangi', name: 'Beras Mentik Wangi', category: 'beras', subcategory: 'Beras',
    price: 20000, unit: 'kg', farmer: 'Bu Sulasmi', location: 'Muntilan, Magelang, Jawa Tengah', region: 'Muntilan, Magelang, Jawa Tengah',
    description: 'Beras Mentik Wangi memiliki bulir agak pendek, aroma lembut, dan nasi pulen. Nikmat disajikan hangat dengan lauk rumahan.', stock: 38,
    image: photo(8251401), imageAlt: 'Beras putih mentah dengan sekop kayu dalam komposisi hasil panen', featured: false, rating: 4.5, reviewCount: 2,
  },
];