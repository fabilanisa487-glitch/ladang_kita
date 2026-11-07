# Ladang Kita — Catatan Implementasi Keamanan (Demo Akademik)

Tanggal perubahan: 13 Oktober 2026

## Mitigasi yang sekarang diterapkan

1. **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, dan CSP `Report-Only`. CSP belum dipaksa sampai diuji di browser. HSTS tidak diaktifkan untuk demo HTTP lokal.
2. **Autentikasi server-side** — daftar/masuk melalui API Next.js; password di-hash dengan Node `scrypt` dan salt acak di server. Database menyimpan hash, bukan password asli. Login membatasi percobaan gagal per email selama jendela 15 menit.
3. **Sesi server-side** — token acak berada dalam cookie `HttpOnly`, `SameSite=Lax`; database hanya menyimpan SHA-256 token sesi. Cookie memakai `Secure` saat `NODE_ENV=production`. Logout menghapus sesi server dan cookie.
4. **Database lokal** — tabel SQLite dibuat otomatis di `data/runtime/ladang-kita.sqlite` saat API digunakan. Memerlukan Node.js 22.5+ (disarankan Node 22 LTS terbaru) karena memakai `node:sqlite`. File database lokal dikecualikan dari Git.
5. **OTP pemulihan** — kode dibuat di server, hash kode disimpan di SQLite, masa berlaku 5 menit, maksimal 5 percobaan, dan pembatasan kirim ulang 60 detik. Tanpa penyedia email/SMS, kode hanya dicatat di terminal server. Untuk demo lokal, `LADANG_DEMO_SHOW_OTP=true` mengizinkan kode muncul di UI; jangan aktifkan di production. Ini belum membuktikan kepemilikan email/nomor HP lewat kanal nyata.
6. **Checkout sisi server** — API menerima hanya ID produk dan jumlah. Harga/nama diambil ulang dari katalog server; jumlah, stok, alamat, dan metode pembayaran divalidasi. Pesanan dan item disimpan ke SQLite dalam transaksi database. Statusnya tetap `DEMO_CREATED`, bukan pembayaran/pengiriman nyata.
7. **Validasi UI & repository** — batas panjang input, penanganan JSON keranjang rusak, batas quantity sisi UI, `noopener noreferrer` untuk tautan eksternal, `.gitignore`, dan `.env.example`.

## Cara menjalankan demo lokal

1. Pastikan Node.js 22 LTS terbaru terpasang.
2. Dari folder proyek, salin `.env.example` menjadi `.env.local`. Variabel `LADANG_DEMO_SHOW_OTP=true` hanya untuk demo lokal agar OTP dapat ditunjukkan saat presentasi.
3. Jalankan `npm install`, lalu `npm run dev`.
4. Buka `http://localhost:3000`, buat akun demo baru, lalu uji login/logout dan checkout. Akun lama yang hanya tersimpan di `localStorage` tidak otomatis dipindahkan ke database; daftar ulang akun uji.
5. OTP reset password/recovery dapat dilihat di UI hanya jika variabel demo diaktifkan. Jika tidak, periksa terminal server untuk kode `[LADANG DEMO OTP]`.

## Pengujian

Jalankan:

```bash
npm run lint
npm run validate:products
npm run build
npm audit
```

Build pada lingkungan penyusunan arsip ini belum dapat diverifikasi karena binary SWC Next.js tidak tersedia dan registry npm tidak dapat dijangkau. Jalankan build di komputer dengan akses registry. Periksa juga header melalui `curl.exe -I http://localhost:3000` dan uji endpoint lewat tab Network browser.

## Temuan yang masih terbuka

- **VULN-009:** ulasan/review masih memakai penyimpanan browser; kepemilikan dan moderasi review belum dipindah ke API/database.
- **Pengiriman OTP nyata:** belum ada integrasi email/SMS; mode demo tidak boleh dianggap sebagai verifikasi identitas.
- **Pembayaran & stok:** pembayaran tidak diproses, dan stok katalog belum dikelola/dikurangi secara transaksional oleh database. Harga diambil dari katalog server saat request, tetapi katalog masih source code.
- **Deployment production:** perlu review CSRF/origin policy, rate limit berbasis IP/perangkat, logging/monitoring, backup database, kebijakan retensi, pengujian CSP enforcement, dan penyimpanan database persisten. SQLite lokal cocok untuk demo/single instance, bukan konfigurasi multi-instance.
- **VULN-014/015:** status advisori dependency belum diverifikasi karena registry tidak terjangkau saat audit. Jalankan `npm audit` pada jaringan yang tersedia.
- **VULN-020:** `.gitignore` ditambahkan pada salinan; riwayat Git asli dan secret yang mungkin pernah dikomit belum diperiksa.

## Batas penggunaan

Ini merupakan **demo akademik**, bukan sistem e-commerce siap produksi. Gunakan data uji, bukan password, email, nomor telepon, alamat, atau pesanan sungguhan. Jangan mengaktifkan tampilan OTP demo di production.

## Pembaruan pemulihan password

Alur `/lupa-password` kini memakai pertanyaan dan jawaban keamanan yang didaftarkan pengguna; alur reset password tidak mengirim OTP email. Jawaban dinormalisasi dan di-hash dengan bcrypt, dengan pembatasan percobaan. Pengguna lama tanpa pertanyaan diminta mendaftarkannya setelah berhasil login. Pemulihan email di `/lupa-email` tetap menggunakan OTP email dan memerlukan konfigurasi pengirim.

Pertanyaan keamanan bukan faktor pemulihan yang kuat untuk layanan produksi: jawaban personal mungkin dapat ditebak atau ditemukan. Gunakan data uji untuk demo akademik dan jangan mengandalkan pertanyaan ini sebagai satu-satunya perlindungan pada layanan bernilai tinggi.
