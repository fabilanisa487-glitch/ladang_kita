# Petunjuk Setup Keamanan Website "Ladang Kita"

Dokumen ini menjelaskan langkah-langkah yang diperlukan untuk mengonfigurasi dan menjalankan sistem keamanan Ladang Kita.

---

## 1. Konfigurasi Variabel Lingkungan (`.env.local`)

Salin template dari `.env.example` ke `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

### Cara Menghasilkan `OTP_SECRET`:
Jalankan perintah berikut di terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Salin nilai hex 64-karakter yang dihasilkan ke variabel `OTP_SECRET=` di `.env.local`.

---

## 2. Setup Database MySQL/MariaDB

1. Pastikan server MySQL/MariaDB (misalnya XAMPP atau Laragon) sudah berjalan pada port 3306.
2. Buat database baru bernama `ladang_kita`:
   ```sql
   CREATE DATABASE IF NOT EXISTS ladang_kita CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Disarankan membuat user khusus non-root untuk aplikasi:
   ```sql
   CREATE USER 'ladang_app'@'localhost' IDENTIFIED BY 'password_aman_anda';
   GRANT SELECT, INSERT, UPDATE, DELETE ON ladang_kita.* TO 'ladang_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. Sesuaikan `DATABASE_URL` di `.env.local`:
   ```env
   DATABASE_URL=mysql://ladang_app:<PASSWORD_AMAN_ANDA>@127.0.0.1:3306/ladang_kita
   DATABASE_SSL=false
   ```
5. Eksekusi skema database:
   ```bash
   npm run db:setup
   ```

---

## 3. Konfigurasi Pembayaran Midtrans Snap (Sandbox)

1. Buat akun di [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com/).
2. Buka menu **Settings > Access Keys**.
3. Salin **Server Key** ke `MIDTRANS_SERVER_KEY` di `.env.local`.
4. Salin **Client Key** ke `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` di `.env.local`.
5. Set `MIDTRANS_IS_PRODUCTION=false` dan `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false`.
6. Setelah deploy ke domain publik, tambahkan URL notifikasi webhook di dashboard Midtrans (Settings > Configuration):
   `https://domain-anda.com/api/midtrans/notification`

---

## 4. Konfigurasi Pengiriman Email (OTP)

- Reset password `/lupa-password` menggunakan pertanyaan keamanan dan tidak mengirim email.
- Untuk pengembangan lokal: `MAIL_DRIVER=console` (kode OTP ditampilkan di konsol server dengan label `[MODE DEMO]`).
- Untuk pemulihan email (`/lupa-email`): set `MAIL_DRIVER=smtp` dan lengkapi detail `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, serta `MAIL_FROM`. Layanan SMTP mengirim email melalui infrastruktur pihak ketiga.

---

## 5. Pemeriksaan Kebocoran Kunci Rahasia

Jalankan pemindaian rahasia secara berkala:

```bash
npm run check:secrets
```
