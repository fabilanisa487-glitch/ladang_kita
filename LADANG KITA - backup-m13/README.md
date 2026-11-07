# Ladang Kita

Marketplace demo hasil tani lokal berbasis Next.js App Router, React, Tailwind CSS, dan Lucide React.

## Menjalankan project

1. Gunakan Node.js 18.17 atau lebih baru.
2. Pasang dependency: `npm install`
3. Jalankan server lokal: `npm run dev`
4. Buka `http://localhost:3000`.

Perintah lain: `npm run build` untuk memeriksa build produksi dan `npm run start` untuk menjalankan hasil build.

## Halaman

- `/` beranda, kategori, produk unggulan, keunggulan, dan testimoni.
- `/katalog` pencarian, filter kategori, dan pengurutan produk.
- `/produk/[id]` detail produk dan kontrol jumlah.
- `/keranjang` daftar item, ubah jumlah, hapus item, dan ringkasan.
- `/checkout` formulir pengiriman dan pilihan pembayaran demo.
- `/tentang` cerita dan nilai Ladang Kita.
- `/kontak` informasi kontak dan formulir demo.
- `/login` masuk dengan opsi ingat sesi.
- `/daftar` membuat akun dengan nomor HP opsional.
- `/lupa-password` memverifikasi OTP dan mengatur password baru.
- `/lupa-email` menemukan petunjuk email dengan nomor HP dan nama.

Ekspor katalog kanonis ada di `data/products/index.js`; data per kategori disimpan di `data/products/`. Dua belas produk awal tetap di `data/products.js` dan dilengkapi field katalog saat digabung. Jalankan `npm run validate:products` untuk memeriksa data/ulasan dan `npm run check:images` untuk memeriksa URL gambar. Keranjang disimpan di localStorage. Checkout dan formulir kontak belum terhubung ke backend atau payment gateway. Ganti nomor contoh `6281234567890` pada komponen WhatsApp dengan nomor bisnis sebelum digunakan.

## Menguji autentikasi demo

1. Buka `/daftar`, buat akun dengan nama, email, password, dan nomor HP. Nomor HP menerima format `08xx` atau `+62xx`.
2. Keluar dengan menghapus sesi browser atau gunakan jendela privat, lalu uji `/login`. Password salah selalu memberi pesan yang sama.
3. Di `/lupa-password`, minta kode, masukkan OTP enam digit yang tampil pada panel **MODE DEMO**, lalu verifikasi dan simpan password baru. Kode berlaku 5 menit, maksimal 5 percobaan, dan kirim ulang tersedia setelah 60 detik.
4. Di `/lupa-email`, masukkan nomor HP dan nama yang sama persis dengan data akun. Setelah OTP demo diverifikasi, aplikasi hanya menampilkan email tersamarkan.

Akun demo tersimpan pada `ladang_users`; password baru disimpan sebagai hash SHA-256 bersalt, bukan teks biasa. Kode OTP demo tersimpan sementara pada `ladang_auth_otp` di localStorage dan terlihat di layar. Ini hanya simulasi browser, bukan pengiriman email atau SMS.

## Sebelum produksi

Ganti `lib/authService.js` dengan panggilan API server dan database. Hash password di server menggunakan bcrypt atau Argon2; jangan mengandalkan hash sisi klien atau menyimpan kredensial di localStorage. OTP harus dikirim lewat provider email/SMS, disimpan dengan aman di server, dibatasi lajunya, dan diverifikasi melalui koneksi HTTPS. Ganti nomor WhatsApp contoh dengan nomor resmi.