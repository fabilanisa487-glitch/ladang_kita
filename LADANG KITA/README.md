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
- `/lupa-password` memverifikasi pertanyaan keamanan dan mengatur password baru.
- `/lupa-email` menemukan petunjuk email dengan nomor HP dan nama.

Ekspor katalog kanonis ada di `data/products/index.js`; data per kategori disimpan di `data/products/`. Dua belas produk awal tetap di `data/products.js` dan dilengkapi field katalog saat digabung. Jalankan `npm run validate:products` untuk memeriksa data/ulasan dan `npm run check:images` untuk memeriksa URL gambar. Keranjang disimpan di localStorage. Checkout dan formulir kontak belum terhubung ke backend atau payment gateway. Ganti nomor contoh `6281234567890` pada komponen WhatsApp dengan nomor bisnis sebelum digunakan.

## Menguji autentikasi demo

1. Buka `/daftar`, buat akun dengan nama, email, password, nomor HP opsional, serta pertanyaan dan jawaban keamanan. Jawaban dinormalisasi dan disimpan sebagai hash bcrypt; pilih jawaban yang sulit ditebak orang lain.
2. Keluar dengan menghapus sesi browser atau gunakan jendela privat, lalu uji `/login`. Password salah selalu memberi pesan yang sama. Pengguna lama tanpa pertanyaan keamanan diminta membuatnya setelah login.
3. Di `/lupa-password`, masukkan email akun dan jawab pertanyaan keamanan untuk membuat password baru. Tidak ada OTP email pada alur reset password.
4. Di `/lupa-email`, masukkan nomor HP dan nama yang sama persis dengan data akun. Setelah OTP demo diverifikasi, aplikasi hanya menampilkan email tersamarkan.

Pengguna dan data pemulihan akun tersimpan di database server. Pemulihan password melalui pertanyaan keamanan tidak mengirim email. Alur `/lupa-email` masih memakai verifikasi OTP email dan memerlukan konfigurasi pengiriman email.

## Sebelum produksi

Hash password dan jawaban keamanan di server menggunakan bcrypt; jangan menyimpan kredensial mentah. Pertanyaan keamanan lebih lemah daripada verifikasi melalui kanal tepercaya, jadi batasi percobaan dan jangan gunakan jawaban yang mudah diketahui orang lain. Verifikasi pemulihan email tetap memerlukan layanan email yang dikonfigurasi. Ganti nomor WhatsApp contoh dengan nomor resmi.