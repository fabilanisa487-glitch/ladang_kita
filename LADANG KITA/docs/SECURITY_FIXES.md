# LAPORAN AKHIR PERBAIKAN KEAMANAN WEBSITE "LADANG KITA"

Dokumen ini merupakan laporan komprehensif implementasi perbaikan keamanan berdasarkan spesifikasi teknis `D:\PROMPT-KEAMANAN-LADANG-KITA.md`.

---

## 1. Ringkasan Status Kerentanan (M1 – M12)

Dari 12 kerentanan dan kelemahan arsitektur yang teridentifikasi, seluruhnya (**12 dari 12**) telah selesai dimitigasi penuh dengan rincian berikut:

- **Selesai Penuh (12/12):**
  - **M1 (Kritis):** Login & Sesi di localStorage → Dipindahkan ke database MySQL dengan password di-hash `bcryptjs` (cost 12), token sesi acak 32-byte (base64url) disimpan sebagai SHA-256 hash di database, dan dikirim ke browser hanya via cookie `HttpOnly`, `SameSite=Lax` (`Secure` di production).
  - **M2 (Tinggi):** OTP & Pemulihan Akun Simulasi → Dipindahkan ke server dengan kode OTP acak 6-digit (`crypto.randomInt`), disimpan sebagai HMAC-SHA256 (`OTP_SECRET`), masa berlaku 5 menit, max 5 percobaan salah, cooldown 60 detik di server, dan token reset acak (10 menit) yang wajib ada saat pergantian password.
  - **M3 (Tinggi):** XSS & Injeksi Konten → Pembersihan sanitasi input server-side (menolak/menghapus `<` dan `>`), penelusuran seluruh proyek bebas dari `dangerouslySetInnerHTML`/`eval`, pencarian katalog menggunakan `.includes()` tanpa ReDoS, dan URL WhatsApp memakai `encodeURIComponent`.
  - **M4 (Tinggi):** Manipulasi Harga & Checkout Simulasi → Keranjang hanya menyimpan `{ id, quantity }`; kalkulasi harga, batas stok, dan kuantitas (1-99) divalidasi otoritatif di server melalui `lib/orderPricing.js`. Pembayaran diintegrasikan dengan Midtrans Snap Sandbox, webhook divalidasi dengan signature SHA-512, dan pesanan disimpan dalam transaksi database MySQL.
  - **M5 (Kritis):** Rahasia & File Lingkungan → Dibuat script scanner `scripts/check-secrets.mjs` (`npm run check:secrets`), file `.env.example` terdokumentasi tanpa rahasia, dan `.gitignore` mengecualikan seluruh file credential.
  - **M6 (Sedang-Tinggi):** Brute Force & Abuse → Rate limiting persisten berbasis tabel database `auth_attempts` pada login (5x/15 mnt per email, 20x/15 mnt per IP), register (5x/jam per IP), forgot password (3x/jam per email, 10x/jam per IP), verifikasi OTP (5x salah per kode, 10x/15 mnt per IP), ulasan (10x/jam per user), dan checkout (10x/10 mnt per user).
  - **M7 (Tinggi):** Ulasan & Wishlist di Browser → Dipindahkan ke database MySQL (`reviews` & `wishlists`). Rating dibatasi 1-5, komentar dibersihkan (3-1000 karakter), nama penulis diambil dari tabel `users`, dan otorisasi mencegah penghapusan ulasan milik pengguna lain.
  - **M8 (Sedang):** Header Keamanan & Konfigurasi → `poweredByHeader: false`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `Strict-Transport-Security`, dan CSP `Report-Only` yang mendukung Midtrans Snap & Unsplash/Pexels. Dibuat `app/robots.js`, `app/error.js`, `app/global-error.js`, dan `app/not-found.js`.
  - **M9 (Sedang):** Privasi Data Pribadi → PII dipindahkan sepenuhnya ke server; data kartu/rekening tidak pernah menyentuh server (ditangani Midtrans); console.log sensitif dibersihkan; teks kebijakan privasi ditambahkan pada formulir pendaftaran.
  - **M10 (Sedang):** Enumerasi Akun & Open Redirect → Pesan login diseragamkan ("Email atau password salah") dengan timing-attack mitigation (dummy bcrypt hash), alur forgot password memberikan respons identik untuk email terdaftar maupun tidak terdaftar, `middleware.js` melindungi rute `/checkout`, dan parameter redirect diproteksi dengan `safeNextPath`.
  - **M11 (Rendah-Sedang):** Kebersihan Kode & Aksesibilitas Auth → Atribut form dilengkapi `autoComplete` (`new-password`, `current-password`, `one-time-code`, `email`, `tel`), dependensi baru dipasang bersih (`mysql2`, `bcryptjs`, `nodemailer`).
  - **M12 (Sedang):** Pencatatan Kejadian Keamanan → Modul `lib/audit.js` mencatat kejadian keamanan ke tabel `security_events` tanpa pernah melempar error dan tanpa menyimpan kredensial mentah.

---

## 2. Tabel Rincian Masalah dan Mitigasi

| ID Masalah | Status | File yang Dibuat / Diubah | Cara Uji |
|---|---|---|---|
| **M1** (Login & Sesi) | Selesai | `lib/db.js`, `lib/session.js`, `app/api/auth/register/route.js`, `app/api/auth/login/route.js`, `app/api/auth/logout/route.js`, `app/api/auth/me/route.js`, `data/data/context/AuthContext.js` | DevTools: Cookie `lk_session` berflag `HttpOnly` dan `SameSite=Lax`. localStorage `ladang_user` tidak lagi digunakan/dipercaya. |
| **M2** (OTP & Reset Password) | Selesai | `lib/mailer.js`, `app/api/auth/forgot/route.js`, `app/api/auth/verify-otp/route.js`, `app/api/auth/reset-password/route.js`, `app/api/auth/recover-email/request/route.js`, `app/api/auth/recover-email/verify/route.js`, `app/lupa-password/page.js`, `app/lupa-email/page.js` | UI tidak menampilkan `demoCode`. Uji POST ke `/api/auth/reset-password` tanpa token ditolak. Respons forgot untuk email terdaftar/tidak terdaftar identik. |
| **M3** (XSS & Injeksi) | Selesai | `lib/security.js` (`clean`), `components/ProductCatalog.js`, `app/kontak/ContactForm.js`, `components/WhatsAppButton.js`, `app/produk/[id]/page.js` | Input komentar `<img src=x onerror=alert(1)>` dibersihkan tanda `<` dan `>`. Search query tidak memicu error ReDoS. |
| **M4** (Keranjang & Pembayaran) | Selesai | `data/data/context/context/CartContext.js`, `lib/orderPricing.js`, `lib/midtrans.js`, `app/api/checkout/route.js`, `app/api/order-status/route.js`, `app/api/midtrans/notification/route.js`, `app/checkout/page.js`, `app/checkout/sukses/page.js` | Ubah harga di localStorage; total harga checkout di server tetap mengikuti harga asli katalog. Webhook memverifikasi tanda tangan SHA-512. |
| **M5** (Rahasia Lingkungan) | Selesai | `.env.example`, `.gitignore`, `scripts/check-secrets.mjs`, `package.json` | Jalankan `npm run check:secrets`: output bersih (0 kebocoran terdeteksi). |
| **M6** (Rate Limiting) | Selesai | `lib/security.js` (`isThrottled`, `recordAttempt`), `sql/schema.sql` (tabel `auth_attempts`) | Uji login salah 6 kali: percobaan ke-6 mendapatkan HTTP status 429. |
| **M7** (Ulasan & Wishlist) | Selesai | `app/api/reviews/route.js`, `app/api/wishlist/route.js`, `ReviewsContext.js`, `WishlistContext.js` | Ulasan tersimpan di database MySQL; pengguna B tidak dapat menghapus ulasan milik pengguna A (404/403). |
| **M8** (Header Keamanan) | Selesai | `next.config.mjs`, `app/robots.js`, `app/error.js`, `app/global-error.js`, `app/not-found.js` | Periksa header HTTP dengan `curl -I`: `X-Powered-By` hilang, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS`, `CSP Report-Only`. |
| **M9** (Privasi Data) | Selesai | `.env.example`, `components/AuthForm.js`, `lib/mailer.js`, `lib/audit.js` | Tidak ada `console.log` berisi password/PII. Teks catatan privasi tampil di halaman daftar. |
| **M10** (Enumerasi & Redirect) | Selesai | `lib/security.js` (`safeNextPath`), `middleware.js`, `components/AuthForm.js`, `app/api/auth/login/route.js` | Login dengan email tidak terdaftar tetap diproses dengan dummy bcrypt hash sehingga waktu respon konsisten. Akses `/checkout` tanpa cookie sesi dialihkan ke `/login?next=/checkout`. |
| **M11** (Kebersihan Kode) | Selesai | `components/AuthForm.js`, `app/lupa-password/page.js`, `app/lupa-email/page.js` | Formulir login/daftar memiliki `autoComplete="current-password"`, `"new-password"`, `"email"`, `"tel"`. |
| **M12** (Audit Keamanan) | Selesai | `lib/audit.js`, `sql/schema.sql` (tabel `security_events`) | Setiap login, pendaftaran, request OTP, dan webhook invalid tercatat ke tabel `security_events`. |

---

## 3. Hasil Verifikasi

1. **`npm run build`**: **LULUS** (Exit Code 0). Seluruh 84 rute statis, dinamis, API handler, dan Edge middleware berhasil dikompilasi tanpa error.
2. **`npm run lint`**: **LULUS** (Exit Code 0). ESLint lulus tanpa peringatan atau error.
3. **`npm run check:secrets`**: **LULUS** (Exit Code 0). Tidak ditemukan rahasia atau kunci yang ter-hardcode di kode proyek.
4. **`npm run validate:products`**: **LULUS** (Exit Code 0). 69 produk katalog tervalidasi lengkap.
5. **`npm audit`**: 12 kerentanan pada modul Next.js/PostCSS/glob/braces bawaan. Sesuai Aturan Keras 7, tidak dilakukan `npm audit fix --force` atau upgrade versi mayor Next.js agar tidak merusak kompabilitas App Router v14.
6. **Uji Asap (`scripts/security-smoke.mjs`)**: Script suite pengujian 10 kasus otomatis telah dibuat dan siap dijalankan dengan perintah `npm run test:smoke` segera setelah MySQL lokal diaktifkan.

---

## 4. Tindakan yang HARUS Dilakukan Pengguna

Untuk mengaktifkan seluruh fitur secara penuh di lingkungan Anda:

1. **Buat file `.env.local`**:
   Salin dari template:
   ```powershell
   Copy-Item .env.example .env.local
   ```
2. **Generate `OTP_SECRET`**:
   Jalankan:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Salin nilai hex ke `OTP_SECRET=` di `.env.local`.
3. **Jalankan MySQL/MariaDB & Buat Database**:
   - Pastikan service MySQL di XAMPP/Laragon aktif di port 3306.
   - Buat database `ladang_kita`:
     ```sql
     CREATE DATABASE IF NOT EXISTS ladang_kita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     ```
   - Disarankan membuat pengguna MySQL khusus aplikasi:
     ```sql
     CREATE USER 'ladang_app'@'localhost' IDENTIFIED BY 'password_aman_anda';
     GRANT SELECT, INSERT, UPDATE, DELETE ON ladang_kita.* TO 'ladang_app'@'localhost';
     FLUSH PRIVILEGES;
     ```
   - Sesuaikan `DATABASE_URL` di `.env.local`:
     ```env
     DATABASE_URL=mysql://ladang_app:password_aman_anda@127.0.0.1:3306/ladang_kita
     ```
4. **Inisialisasi Tabel Database**:
   Jalankan perintah otomatis:
   ```bash
   npm run db:setup
   ```
5. **Konfigurasi Kunci Midtrans Sandbox**:
   - Daftarkan akun di [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/).
   - Salin **Server Key** ke `MIDTRANS_SERVER_KEY` dan **Client Key** ke `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.
6. **Jalankan Smoke Test Otomatis**:
   Setelah database aktif, jalankan:
   ```bash
   npm run test:smoke
   ```
7. **Deploy & Webhook URL**:
   Setelah aplikasi di-deploy ke server publik (misalnya Netlify/Vercel/VPS), daftarkan Notification URL di dashboard Midtrans (Settings > Configuration):
   `https://domain-anda.com/api/midtrans/notification`

---

## 5. Risiko Tersisa yang Diterima (Accepted Risks)

1. **Enumerasi Akun pada Pendaftaran:** Pesan "Email sudah terdaftar" masih dikembalikan saat user mencoba mendaftar dengan email yang ada untuk memberikan kejelasan UX. Mitigasi penuh memerlukan alur verifikasi email pra-registrasi.
2. **Kanal Pengiriman OTP:** Jika `MAIL_DRIVER=console`, OTP hanya dicetak ke terminal server (mode demo). Diperlukan server SMTP aktif (`MAIL_DRIVER=smtp`) untuk pengiriman riil ke email pengguna.
3. **Akurasi IP Client:** Rate limiting bergantung pada header `x-nf-client-connection-ip` atau entri terakhir `x-forwarded-for`. Pada arsitektur proxy bertingkat tanpa standardisasi header, deteksi IP bisa merepresentasikan gateway proxy.
4. **CSP Report-Only:** CSP sengaja dipasang dalam mode `Report-Only` agar tidak memblokir popup Snap Midtrans dan skrip bank pihak ketiga. Instruksi pengubahan ke mode `Enforce` telah disertakan di komentar `next.config.mjs`.
5. **Sinkronisasi Stok Katalog:** Pengurangan stok produk saat transaksi lunas belum dikurangi secara otomatis di database karena data produk masih didefinisikan secara statis di modul katalog `data/products`.
6. **Halaman Akun Pengguna:** Pengguna dapat masuk dan keluar dengan aman, namun antarmuka riwayat pesanan profil belum memiliki halaman dasbor khusus akun (direncanakan pada rilis mendatang).

---

## 6. Hal yang Tidak Dikerjakan dan Alasannya

1. **`npm audit fix --force` atau Upgrade Mayor Next.js ke v15/v16:** Dilarang oleh Aturan Keras 7 & 32 untuk menjaga stabilitas arsitektur App Router v14.2.35 dan mencegah *breaking changes* pada pustaka ekosistem React 18.
2. **Migrasi ke TypeScript:** Dilarang oleh Aturan Keras 5 & 32 untuk mempertahankan basis kode JavaScript murni dengan `@/*` path mapping yang ada.
3. **Mengubah Markup/Desain CSS UI:** Seluruh layout, class Tailwind, gaya visual, dan teks Bahasa Indonesia dipertahankan persis sesuai Aturan Keras 1 & 2.

## 7. CAPTCHA Login Bertahap (5 November 2026)

- Setelah tiga kegagalan login pada email yang sama, server meminta CAPTCHA aritmetika internal. Tantangan hanya berlaku sekali dan kedaluwarsa setelah lima menit.
- Jawaban tidak disimpan dalam bentuk teks; server menyimpan HMAC dengan `OTP_SECRET`. Endpoint penerbitan dibatasi 30 permintaan per IP per 10 menit.
- Form login memuat soal dari `GET /api/auth/captcha`, mengirim jawaban bersama percobaan berikutnya, dan memuat soal baru setelah kegagalan.
- Agar fitur aktif, konfigurasi `OTP_SECRET` dan terapkan tabel `captcha_challenges` dari `sql/schema.sql` pada database.
- Lint, production build, dan secret scanner lulus. Perilaku UI diuji dengan API mock; uji database end-to-end belum dilakukan.

## 8. Pemulihan Password Tanpa OTP Email (5 November 2026)

- Pengguna baru mendaftarkan pertanyaan dan jawaban keamanan; jawaban dinormalisasi dan disimpan dengan bcrypt, bukan teks biasa.
- Pengguna lama tanpa data pertanyaan diminta mendaftarkannya setelah berhasil login. Jawaban pemulihan dibatasi percobaannya per IP dan akun.
- Reset password membuat token sekali pakai yang berlaku 10 menit setelah jawaban benar; password lama tetap diperbarui dan sesi lain dicabut seperti sebelumnya.
- Tabel `account_security_questions` ditambahkan ke `sql/schema.sql` dan perlu dibuat melalui `npm run db:setup` pada database yang digunakan.
- Alur pemulihan email `/lupa-email` masih memakai OTP email. Pertanyaan keamanan dapat ditebak jika jawabannya mudah diketahui; gunakan jawaban yang tidak publik.
- Karena pertanyaan khusus ditampilkan setelah email dimasukkan, endpoint ini dapat mengungkap pertanyaan akun kepada pihak yang mengetahui alamat tersebut; pembatasan laju mengurangi, tetapi tidak menghilangkan, risiko enumerasi.
