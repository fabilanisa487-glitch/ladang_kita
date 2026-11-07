// Harga merupakan perkiraan contoh/dummy, dibulatkan dan bukan harga pasar terkini.
const photo = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&q=80`;
const unsplash = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;

export const buahProducts = [
  {
    id: 13, slug: 'pisang-ambon', name: 'Pisang Ambon', category: 'buah', subcategory: 'Buah tropis',
    price: 16000, unit: 'kg', farmer: 'Pak Rudi Hartono', location: 'Senduro, Lumajang, Jawa Timur', region: 'Senduro, Lumajang, Jawa Timur',
    description: 'Pisang Ambon beraroma harum dengan daging lembut dan manis. Nikmat dimakan langsung atau untuk campuran smoothie.', stock: 36,
    image: unsplash('photo-1571771894821-ce9b6c11b08e'), imageAlt: 'Sisir pisang Ambon matang berwarna kuning dengan bintik alami', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 14, slug: 'pisang-raja', name: 'Pisang Raja', category: 'buah', subcategory: 'Buah tropis',
    price: 18000, unit: 'sisir', farmer: 'Bu Sulastri', location: 'Dau, Malang, Jawa Timur', region: 'Dau, Malang, Jawa Timur',
    description: 'Pisang Raja berdaging padat dengan rasa manis legit dan aroma khas. Cocok sebagai buah meja maupun pisang goreng.', stock: 28,
    image: unsplash('photo-1571771894821-ce9b6c11b08e'), imageAlt: 'Sisir pisang raja matang dengan kulit kuning segar', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 15, slug: 'mangga-harum-manis', name: 'Mangga Harum Manis', category: 'buah', subcategory: 'Buah tropis',
    price: 28000, unit: 'kg', farmer: 'Pak Kasmuri', location: 'Probolinggo, Jawa Timur', region: 'Probolinggo, Jawa Timur',
    description: 'Mangga Harum Manis berdaging lembut, beraroma wangi dan rasa manis dengan serat halus. Enak disantap segar saat matang.', stock: 32,
    image: photo(39706569), imageAlt: 'Mangga matang kuning kehijauan bergelantungan pada dahan pohon', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 16, slug: 'mangga-gedong-gincu', name: 'Mangga Gedong Gincu', category: 'buah', subcategory: 'Buah tropis',
    price: 32000, unit: 'kg', farmer: 'Bu Nani Rukmini', location: 'Indramayu, Jawa Barat', region: 'Indramayu, Jawa Barat',
    description: 'Mangga Gedong Gincu berkulit merah jingga dengan daging lembut dan wangi. Nikmati sebagai buah segar atau rujak.', stock: 24,
    image: photo(39706569), imageAlt: 'Mangga merah jingga matang tumbuh pada dahan dengan daun hijau', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 17, slug: 'pepaya-california', name: 'Pepaya California', category: 'buah', subcategory: 'Buah tropis',
    price: 12000, unit: 'pcs', farmer: 'Pak Wahyu', location: 'Sleman, DI Yogyakarta', region: 'Sleman, DI Yogyakarta',
    description: 'Pepaya California berdaging jingga, lembut dan manis ringan. Siap disantap sebagai buah potong atau campuran salad.', stock: 30,
    image: photo(10869540), imageAlt: 'Pepaya matang terbelah dengan daging jingga dan biji hitam', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 18, slug: 'nanas-madu', name: 'Nanas Madu', category: 'buah', subcategory: 'Buah tropis',
    price: 14000, unit: 'pcs', farmer: 'Bu Rukayah', location: 'Belik, Pemalang, Jawa Tengah', region: 'Belik, Pemalang, Jawa Tengah',
    description: 'Nanas Madu memiliki daging kuning cerah dengan rasa manis segar dan sedikit asam. Enak dimakan langsung atau dibuat jus.', stock: 26,
    image: unsplash('photo-1550258987-190a2d41a8ba'), imageAlt: 'Buah nanas matang berkulit keemasan dengan mahkota daun hijau', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 19, slug: 'jambu-kristal', name: 'Jambu Kristal', category: 'buah', subcategory: 'Buah tropis',
    price: 18000, unit: 'kg', farmer: 'Pak Subandi', location: 'Demak, Jawa Tengah', region: 'Demak, Jawa Tengah',
    description: 'Jambu Kristal bertekstur renyah dengan biji sedikit dan rasa manis segar. Cocok dimakan langsung bersama sambal rujak.', stock: 28,
    image: photo(28536571), imageAlt: 'Jambu kristal hijau segar tersusun dengan daun pada latar alami', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 20, slug: 'belimbing-manis', name: 'Belimbing Manis', category: 'buah', subcategory: 'Buah tropis',
    price: 15000, unit: 'kg', farmer: 'Bu Yuliani', location: 'Blitar, Jawa Timur', region: 'Blitar, Jawa Timur',
    description: 'Belimbing manis berdaging renyah dengan rasa segar sedikit asam. Nikmat dimakan langsung atau dijadikan jus.', stock: 22,
    image: photo(36506734), imageAlt: 'Buah belimbing kuning berbentuk bintang dengan kulit mengilap', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 21, slug: 'rambutan-binjas', name: 'Rambutan Binjas', category: 'buah', subcategory: 'Buah tropis',
    price: 22000, unit: 'kg', farmer: 'Pak Mulyono', location: 'Leuwidamar, Lebak, Banten', region: 'Leuwidamar, Lebak, Banten',
    description: 'Rambutan Binjas berdaging tebal, manis dan mudah dilepas dari bijinya. Cocok sebagai camilan buah saat musim panen.', stock: 34,
    image: photo(7906303), imageAlt: 'Rambutan merah segar dengan rambut kulit yang khas', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 22, slug: 'nangka-madu', name: 'Nangka Madu', category: 'buah', subcategory: 'Buah tropis',
    price: 25000, unit: 'kg', farmer: 'Bu Sri Wahyuni', location: 'Jepara, Jawa Tengah', region: 'Jepara, Jawa Tengah',
    description: 'Nangka Madu memiliki daging tebal berwarna kuning dan aroma harum. Nikmat dimakan langsung atau untuk kolak.', stock: 20,
    image: photo(19229289), imageAlt: 'Potongan nangka matang dengan daging kuning dan biji cokelat', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 23, slug: 'sirsak-segar', name: 'Sirsak Segar', category: 'buah', subcategory: 'Buah tropis',
    price: 20000, unit: 'pcs', farmer: 'Pak Suwardi', location: 'Kulon Progo, DI Yogyakarta', region: 'Kulon Progo, DI Yogyakarta',
    description: 'Sirsak matang berdaging putih lembut dengan rasa manis-asam yang menyegarkan. Cocok untuk jus atau dimakan dingin.', stock: 18,
    image: photo(13658187), imageAlt: 'Buah sirsak hijau berduri lembut dengan daging putih segar', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 24, slug: 'jeruk-pontianak', name: 'Jeruk Pontianak', category: 'buah', subcategory: 'Buah segar populer',
    price: 20000, unit: 'kg', farmer: 'Pak Bujang Karim', location: 'Sambas, Kalimantan Barat', region: 'Sambas, Kalimantan Barat',
    description: 'Jeruk Pontianak terkenal dengan rasa manis segar dan kulit tipis. Cocok untuk bekal atau jus tanpa tambahan gula.', stock: 38,
    image: 'https://images.pexels.com/photos/51958/oranges-fruit-vitamins-healthy-eating-51958.jpeg?auto=compress&cs=tinysrgb&w=800&q=80', imageAlt: 'Jeruk matang berwarna jingga dengan permukaan kulit segar', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 25, slug: 'semangka-merah', name: 'Semangka Merah', category: 'buah', subcategory: 'Buah segar populer',
    price: 9000, unit: 'kg', farmer: 'Bu Sumarni', location: 'Klirong, Kebumen, Jawa Tengah', region: 'Klirong, Kebumen, Jawa Tengah',
    description: 'Semangka merah berdaging renyah, berair dan manis. Sajikan dingin sebagai pencuci mulut atau jus.', stock: 46,
    image: unsplash('photo-1563114773-84221bd62daa'), imageAlt: 'Irisan semangka merah berair dengan kulit hijau segar', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 26, slug: 'semangka-kuning', name: 'Semangka Kuning', category: 'buah', subcategory: 'Buah segar populer',
    price: 12000, unit: 'kg', farmer: 'Pak Tarman', location: 'Wonosari, Klaten, Jawa Tengah', region: 'Wonosari, Klaten, Jawa Tengah',
    description: 'Semangka kuning berdaging cerah, renyah dan manis dengan kadar air tinggi. Nikmati dalam keadaan dingin.', stock: 24,
    image: photo(5620869), imageAlt: 'Irisan semangka kuning dengan daging kuning cerah dan biji kecil', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 27, slug: 'melon-hijau', name: 'Melon Hijau', category: 'buah', subcategory: 'Buah segar populer',
    price: 18000, unit: 'kg', farmer: 'Bu Lilis', location: 'Ngawi, Jawa Timur', region: 'Ngawi, Jawa Timur',
    description: 'Melon hijau berdaging lembut, harum dan manis. Cocok sebagai buah potong, campuran es buah, atau jus.', stock: 30,
    image: photo(4772953), imageAlt: 'Potongan melon hijau dengan daging segar dan biji di bagian tengah', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 28, slug: 'alpukat-mentega', name: 'Alpukat Mentega', category: 'buah', subcategory: 'Buah segar populer',
    price: 24000, unit: 'kg', farmer: 'Pak Ujang', location: 'Cikajang, Garut, Jawa Barat', region: 'Cikajang, Garut, Jawa Barat',
    description: 'Alpukat Mentega berdaging tebal, lembut dan gurih dengan sedikit serat. Nikmat untuk jus, roti, atau salad.', stock: 25,
    image: photo(37816784), imageAlt: 'Alpukat matang berkulit hijau dengan daging lembut kekuningan', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 29, slug: 'alpukat-hass', name: 'Alpukat Hass', category: 'buah', subcategory: 'Buah segar populer',
    price: 45000, unit: 'kg', farmer: 'Bu Melati', location: 'Karo, Sumatera Utara', region: 'Karo, Sumatera Utara',
    description: 'Alpukat Hass berdaging creamy dengan rasa gurih dan kulit bertekstur. Cocok untuk roti panggang atau salad.', stock: 16,
    image: photo(37816784), imageAlt: 'Buah alpukat matang dibelah, menampilkan daging hijau dan biji bulat', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 30, slug: 'anggur-merah-lokal', name: 'Anggur Merah Lokal', category: 'buah', subcategory: 'Buah segar populer',
    price: 55000, unit: '500 gr', farmer: 'Pak Yusuf', location: 'Buleleng, Bali', region: 'Buleleng, Bali',
    description: 'Anggur merah lokal berkulit tipis dengan rasa manis segar. Cuci bersih dan sajikan dingin sebagai camilan.', stock: 20,
    image: unsplash('photo-1767416901111-0296234e0f77'), imageAlt: 'Rangkaian buah anggur merah matang yang masih menempel di sulurnya', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 31, slug: 'stroberi-lembang', name: 'Stroberi Lembang', category: 'buah', subcategory: 'Buah segar populer',
    price: 32000, unit: '500 gr', farmer: 'Bu Reni', location: 'Lembang, Bandung Barat, Jawa Barat', region: 'Lembang, Bandung Barat, Jawa Barat',
    description: 'Stroberi Lembang berwarna merah cerah dengan rasa manis-asam dan aroma segar. Enak untuk camilan, topping, atau selai.', stock: 18,
    image: photo(18018686), imageAlt: 'Stroberi merah matang dengan daun hijau segar di sekelilingnya', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 32, slug: 'durian-montong', name: 'Durian Montong', category: 'buah', subcategory: 'Buah khas daerah',
    price: 75000, unit: 'kg', farmer: 'Pak Slamet Riyadi', location: 'Songgon, Banyuwangi, Jawa Timur', region: 'Songgon, Banyuwangi, Jawa Timur',
    description: 'Durian Montong berdaging tebal, lembut dan manis dengan aroma khas. Nikmati langsung setelah dibuka.', stock: 12,
    image: photo(34927312), imageAlt: 'Buah durian berduri dengan kulit hijau dan bentuk lonjong', featured: true, rating: 4.5, reviewCount: 2,
  },
  {
    id: 33, slug: 'manggis-segar', name: 'Manggis Segar', category: 'buah', subcategory: 'Buah khas daerah',
    price: 35000, unit: 'kg', farmer: 'Bu Euis', location: 'Puspahiang, Tasikmalaya, Jawa Barat', region: 'Puspahiang, Tasikmalaya, Jawa Barat',
    description: 'Manggis matang memiliki kulit ungu tebal dan daging putih lembut dengan rasa manis sedikit asam. Sajikan sebagai buah meja.', stock: 23,
    image: photo(2568453), imageAlt: 'Buah manggis ungu dibelah dengan daging putih bersegmen', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 34, slug: 'salak-pondoh', name: 'Salak Pondoh', category: 'buah', subcategory: 'Buah khas daerah',
    price: 18000, unit: 'kg', farmer: 'Pak Kardi', location: 'Turi, Sleman, DI Yogyakarta', region: 'Turi, Sleman, DI Yogyakarta',
    description: 'Salak Pondoh bercita rasa manis dan renyah dengan kulit bersisik cokelat. Nikmat dimakan langsung setelah dikupas.', stock: 28,
    image: photo(4025632), imageAlt: 'Buah salak Pondoh berkulit cokelat bersisik tersusun di atas tampah', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 35, slug: 'langsat-kalimantan', name: 'Langsat Kalimantan', category: 'buah', subcategory: 'Buah khas daerah',
    price: 22000, unit: 'kg', farmer: 'Pak Hendra', location: 'Martapura, Banjar, Kalimantan Selatan', region: 'Martapura, Banjar, Kalimantan Selatan',
    description: 'Langsat berkulit kuning pucat dengan daging bening, rasa manis-asam dan sedikit getah. Cocok sebagai buah segar.', stock: 21,
    image: photo(20234941), imageAlt: 'Buah langsat berwarna kuning pucat tersusun segar untuk dijual', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 36, slug: 'markisa-manis', name: 'Markisa Manis', category: 'buah', subcategory: 'Buah khas daerah',
    price: 40000, unit: 'kg', farmer: 'Bu Nurlia', location: 'Tinggimoncong, Gowa, Sulawesi Selatan', region: 'Tinggimoncong, Gowa, Sulawesi Selatan',
    description: 'Markisa matang beraroma kuat dengan sari buah segar dan rasa manis-asam. Nikmat untuk jus atau sirup rumahan.', stock: 18,
    image: photo(9681172), imageAlt: 'Markisa ungu dan kuning dibelah dengan biji berlapis sari buah', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 37, slug: 'buah-naga-merah', name: 'Buah Naga Merah', category: 'buah', subcategory: 'Buah khas daerah',
    price: 32000, unit: 'kg', farmer: 'Pak Dimas Prasetyo', location: 'Banyuwangi, Jawa Timur', region: 'Banyuwangi, Jawa Timur',
    description: 'Buah naga merah berdaging magenta dengan biji kecil dan rasa manis ringan. Cocok dimakan langsung atau dicampur smoothie.', stock: 27,
    image: photo(2562547), imageAlt: 'Buah naga merah muda dibelah dengan daging merah berbintik biji', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 38, slug: 'kelengkeng-temanggung', name: 'Kelengkeng Temanggung', category: 'buah', subcategory: 'Buah khas daerah',
    price: 45000, unit: 'kg', farmer: 'Bu Sari Lestari', location: 'Pringsurat, Temanggung, Jawa Tengah', region: 'Pringsurat, Temanggung, Jawa Tengah',
    description: 'Kelengkeng berkulit cokelat muda dengan daging bening, manis dan berair. Enak disajikan dingin sebagai camilan.', stock: 17,
    image: photo(32914314), imageAlt: 'Buah kelengkeng segar dengan daun hijau dan beberapa buah terbuka', featured: false, rating: 4.5, reviewCount: 2,
  },
  {
    id: 39, slug: 'jeruk-nipis', name: 'Jeruk Nipis', category: 'buah', subcategory: 'Buah khas daerah',
    price: 15000, unit: 'kg', farmer: 'Pak Suyatno', location: 'Wlingi, Blitar, Jawa Timur', region: 'Wlingi, Blitar, Jawa Timur',
    description: 'Jeruk nipis beraroma tajam dengan rasa asam segar dan sari melimpah. Gunakan untuk minuman, sambal, atau bumbu masakan.', stock: 40,
    image: photo(18688797), imageAlt: 'Jeruk nipis hijau segar dengan kulit bertekstur dan daun', featured: false, rating: 4.5, reviewCount: 2,
  },
];