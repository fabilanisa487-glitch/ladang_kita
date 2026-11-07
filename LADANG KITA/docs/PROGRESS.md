# Log Progres Implementasi Keamanan "Ladang Kita"

Dokumen pelacak status perbaikan keamanan berdasarkan panduan `D:\PROMPT-KEAMANAN-LADANG-KITA.md`.

---

## Status Fase

- [x] **Fase 0: Persiapan dan Verifikasi Awal**
  - Cadangan proyek dibuat ke `..\LADANG KITA - backup` dengan `robocopy` (mengecualikan `node_modules` dan `.next`).
  - Pengecekan `.env.local`: file belum ada di lokal; disiapkan template `.env.example`.
  - Baseline `npm run build`: LULUS (exit code 0).
  - Baseline `npm run lint`: LULUS (0 warning, 0 error).
  - Baseline `npm audit`: 12 kerentanan (termasuk next/postcss).
  - Status: **SELESAI**

- [x] **Fase 1: Fondasi Server dan Login (M1, M6, M10, M12)**
  - Pasang dependensi: `mysql2`, `bcryptjs`, `nodemailer`.
  - Dibuat `sql/schema.sql` (MySQL/MariaDB) dan `scripts/db-setup.mjs`.
  - Ditambahkan script `db:setup` di `package.json`.
  - Dibuat modul server di `lib/`: `db.js`, `security.js`, `session.js`, `audit.js`, `authClient.js`.
  - Dibuat route handlers: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
  - Diperbarui `data/data/context/AuthContext.js` dan pembersihan key localStorage lama saat mount.
  - Diperbarui `components/AuthForm.js` (parameter `next` dengan `safeNextPath`, kebijakan password 8-72 char, catatan privasi).
  - Dibungkus `app/login/page.js` dan `app/daftar/page.js` dengan `<Suspense>`.
  - Ditambahkan tombol **Keluar** di `components/Navbar.js`.
  - Dibuat `middleware.js` untuk memproteksi `/checkout`.
  - Status: **SELESAI**

- [x] **Fase 2: Lupa Password dan Lupa Email (M2, M6)**
  - Dibuat `lib/mailer.js` (dukungan mode `console` [MODE DEMO] dan `smtp`).
  - Dibuat route handlers: `POST /api/auth/forgot`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password`, `POST /api/auth/recover-email/request`, `POST /api/auth/recover-email/verify`.
  - Diperbarui `app/lupa-password/page.js` dan `app/lupa-email/page.js` (hapus `demoCode`, simpan `resetToken` di state React).
  - Dihapus `lib/authService.js` dan file rute usang `server/db.js`, `request-reset`, `verify-email`.
  - Status: **SELESAI**

- [x] **Fase 3: Keranjang dan Pembayaran (M4)**
  - Diperbarui `data/data/context/context/CartContext.js` (hanya menyimpan `{ id, quantity }` di localStorage, data produk lengkap diturunkan dari katalog).
  - Dibuat `lib/orderPricing.js` (validasi kuantitas 1-99, stok katalog, dan hitung ulang harga server-side).
  - Dibuat `lib/midtrans.js` (Snap sandbox/production, verifikasi tanda tangan SHA-512, pemetaan status).
  - Dibuat route handlers: `POST /api/checkout` (transaksional MySQL), `GET /api/order-status`, `POST /api/midtrans/notification`.
  - Diperbarui `app/checkout/page.js` (popup Snap dinamis, proteksi submit ganda, info metode bayar Midtrans).
  - Dibuat `app/checkout/sukses/page.js` (polling status pesanan tiap 4 detik via API resmi).
  - Status: **SELESAI**

- [x] **Fase 4: Ulasan dan Wishlist (M7, M3)**
  - Dibuat route handlers: `GET|POST|DELETE /api/reviews` dan `GET|POST|DELETE /api/wishlist`.
  - Diperbarui `ReviewsContext.js` (membaca dari API DB, menggabungkan dengan seed review, menghapus localStorage lama).
  - Diperbarui `WishlistContext.js` (sinkronisasi dengan API DB, optimis UI update, produk diturunkan dari katalog).
  - Status: **SELESAI**

- [x] **Fase 5: XSS, Validasi, dan Kebersihan (M3, M9, M11)**
  - Diaudit: tidak ditemukan `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, atau `document.write`.
  - Pencarian katalog (`ProductCatalog.js`) aman menggunakan `.includes()` tanpa regex ReDoS.
  - Form kontak (`ContactForm.js`) diperbarui dengan validasi panjang dan sanitasi karakter kontrol.
  - Halaman produk `app/produk/[id]/page.js` memanggil `notFound()` jika produk tidak ada di katalog.
  - Tombol WhatsApp (`WhatsAppButton.js`) diperbarui dengan `encodeURIComponent` dan `rel="noopener noreferrer"`.
  - Atribut form auth dilengkapi `autoComplete` (`new-password`, `current-password`, `email`, `tel`, dll).
  - Tidak ada `console.log` yang membocorkan rahasia atau PII.
  - Status: **SELESAI**

- [x] **Fase 6: Header dan Konfigurasi (M8)**
  - Diperbarui `next.config.mjs`: `poweredByHeader: false`, HSTS, nosniff, DENY frame, strict referrer, permissions-policy, dan CSP Report-Only mendukung Midtrans Snap & remote images.
  - Dibuat `app/robots.js` (disallow `/api/` dan `/checkout`).
  - Dibuat `app/error.js`, `app/global-error.js`, dan `app/not-found.js` (pesan ramah Bahasa Indonesia, tanpa stack trace).
  - Status: **SELESAI**

- [x] **Fase 7: Rahasia dan Dependensi (M5, M11)**
  - Diperbarui `.gitignore` dan `.env.example` (lengkap dengan panduan privasi data pengguna M9).
  - Dibuat `scripts/check-secrets.mjs` dan script `check:secrets` di `package.json`.
  - Dijalankan `npm run check:secrets`: BERSIH (0 kebocoran rahasia).
  - Status: **SELESAI**

- [x] **Fase 8: Uji Asap (Smoke Test)**
  - Dibuat `scripts/security-smoke.mjs` untuk menguji 10 kasus uji otomatis (CSRF, timing attack, throttle, XSS sanitization, auth cookie HttpOnly, Midtrans rejection, review IDOR, dan security headers).
  - Ditambahkan script `test:smoke` di `package.json`.
  - Database MySQL lokal saat ini belum dijalankan di port 3306 (akan diuji saat user menjalankan MySQL).
  - Status: **SELESAI (Script Siap Dijalankan)**

- [x] **Fase 9: Laporan Akhir**
  - Dibuat dokumen lengkap `docs/SECURITY_FIXES.md`.
  - Status: **SELESAI**

## Lanjutan M13 - CAPTCHA Login

- Ditambahkan endpoint `GET /api/auth/captcha` untuk menerbitkan soal hitung sekali pakai, berlaku 5 menit, dengan batas 30 permintaan per IP per 10 menit.
- Form login menampilkan input jawaban setelah tiga percobaan password gagal; jawaban CAPTCHA diverifikasi server sebelum password diperiksa.
- Ditambahkan tabel `captcha_challenges` ke `sql/schema.sql`. Perubahan skema perlu diterapkan pada database sebelum CAPTCHA dapat digunakan.
- `OTP_SECRET` harus dikonfigurasi agar tantangan dapat diterbitkan.
- Verifikasi: `npm run lint`, `npm run build`, dan `npm run check:secrets` lulus. Tampilan serta pengiriman jawaban diuji di browser dengan respons API mock; verifikasi end-to-end dengan database belum dilakukan.

## Pemulihan Password dengan Pertanyaan Keamanan

- Alur `/lupa-password` dialihkan dari OTP email ke pertanyaan dan jawaban keamanan tersimpan di database; jawaban dinormalisasi dan di-hash dengan bcrypt.
- Pendaftaran meminta pertanyaan keamanan. Pengguna lama diminta mendaftarkannya setelah login; percobaan jawaban dibatasi per IP dan email.
- Skema `account_security_questions` ditambahkan ke `sql/schema.sql`. Jalankan `npm run db:setup` secara manual pada database yang dipakai sebelum menguji alur; saya tidak menjalankan perintah database.
- Pemulihan `/lupa-email` masih menggunakan OTP email. Jawaban keamanan memiliki risiko lebih tinggi daripada kanal pemulihan terverifikasi dan harus sulit ditebak.
- Pertanyaan khusus ditampilkan setelah email dimasukkan sehingga masih ada risiko enumerasi prompt; pembatasan laju diterapkan, tetapi bukan pengganti faktor pemulihan yang lebih kuat.
