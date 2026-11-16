# PROMPT LANJUTAN: Standar Login (Modul VI) untuk "Ladang Kita"

Dokumen ini adalah instruksi untuk asisten AI. Baca SELURUHNYA sebelum menulis kode.
Ini adalah **lanjutan** dari pekerjaan keamanan Fase 0-9 yang SUDAH selesai (tercatat di
`docs/PROGRESS.md`). Dokumen ini berdiri sendiri; jika `PROMPT-KEAMANAN-LADANG-KITA.md`
versi lama berbeda dengan dokumen ini, **dokumen ini yang berlaku**.

Tugas: menerapkan standar form login dari Modul VI Praktikum (Konfigurasi Password Policy &
Authentication) pada website, **tanpa merusak apa pun yang sudah jalan**.

---

## 0. ATURAN KERAS

1. **Progres lama tidak boleh berubah.** Jangan ubah, rapikan, atau tulis ulang apa pun di luar
   daftar "BOLEH DIUBAH" di bawah. Jika ada file di luar daftar yang menurutmu perlu diubah,
   BERHENTI, jangan ubah, dan tulis alasannya di laporan.
2. **Dokumen log hanya boleh DITAMBAH.** `docs/PROGRESS.md` dan `docs/SECURITY_FIXES.md`:
   tambahkan bagian baru di paling bawah. Jangan mengubah satu karakter pun dari isi lamanya.
3. **Cadangan dulu.** Sebelum mengubah apa pun, salin project (tanpa `node_modules` dan `.next`)
   ke `..\LADANG KITA - backup-m13` dengan `robocopy`. Catatan: `robocopy` mengembalikan kode
   0-7 untuk SUKSES; hanya kode 8 ke atas yang berarti gagal.
4. **Rahasia.** Jangan membaca atau menampilkan nilai di `.env*`. Jangan membuat atau menimpa
   `.env.local`. Hanya boleh mengecek apakah NAMA variabel ada.
5. **Jangan eksekusi perintah administrasi database.** `INSTALL`, `SET GLOBAL`, `CREATE USER`,
   `ALTER USER`, `GRANT` hanya DITULIS ke file `.sql`, tidak dijalankan. Praktikum dijalankan
   manual oleh saya untuk tangkapan layar.
6. **Lingkungan Windows.** Pakai PowerShell atau script Node. Path project berspasi, selalu
   beri tanda kutip. Dilarang perintah bash (`rm`, `cp`, `grep`, `&&`).
7. **Dilarang:** `npm audit fix --force`, upgrade versi mayor Next/React, migrasi ke TypeScript,
   layanan CAPTCHA/otentikasi pihak ketiga, mengubah tampilan (class CSS, markup, teks UI selain
   yang disebut di sini), dan `console.log` yang memuat password, token, atau kode.
8. **Gerbang verifikasi.** Setelah tiap fase jalankan `npm run build` dan `npm run lint`.
   Jika gagal: baca error, perbaiki, ulangi (maksimal 3 kali per masalah). Jika tetap gagal,
   kembalikan file fase itu dari cadangan, catat di `docs/PROGRESS.md`, lalu berhenti dan lapor.
9. **JavaScript saja**, Next.js 14.2.x App Router (`cookies()` sinkron). Alias `@/*` ke root.

### BOLEH DIUBAH (daftar tertutup; sesuaikan nama dengan yang benar-benar ada)
- `lib/security.js` (fungsi validasi password, kunci login, CAPTCHA)
- `lib/authClient.js` (tambah parameter CAPTCHA dan teruskan field `captchaRequired`)
- `data/data/context/AuthContext.js` (hanya fungsi `login`: terima parameter CAPTCHA opsional)
- `app/api/auth/register/route.js`, `app/api/auth/login/route.js`,
  `app/api/auth/reset-password/route.js` (hanya bagian validasi password dan kunci login)
- `components/AuthForm.js`, `components/PasswordStrength.js`, `app/lupa-password/page.js`
  (hanya bagian aturan password dan field CAPTCHA)
- `sql/schema.sql` (hanya MENAMBAH tabel baru di bawah; jangan ubah pernyataan lama)
- `scripts/security-smoke.mjs` (perbarui kata sandi uji dan kasus uji terkait login/password)
- `package.json` (hanya menambah script `test:password`)
- `.env.example` (hanya menambah baris jika belum ada)
- `docs/PROGRESS.md` dan `docs/SECURITY_FIXES.md` (hanya menambah di bawah)

### BOLEH DIBUAT (file baru)
`lib/passwordPolicy.mjs`, `data/common-passwords.mjs`, `app/api/auth/captcha/route.js`,
`scripts/test-password-policy.mjs`, `docs/KEBIJAKAN-PASSWORD.md`, `docs/PRAKTIKUM-MODUL-VI.md`,
`sql/praktikum-modul6.sql`, `sql/akun-aplikasi.sql`.

### DILARANG DISENTUH (contoh, bukan daftar lengkap)
Seluruh keranjang, checkout, Midtrans, ulasan, wishlist, katalog dan data produk, `middleware.js`,
`next.config.mjs`, halaman error, `robots.js`, `lib/session.js`, `lib/db.js`, `lib/audit.js`,
`lib/mailer.js`, semua route selain tiga yang disebut di atas, serta folder cadangan.

---

## 1. KEPUTUSAN KEBIJAKAN (hasil diskusi tim)

| # | Keputusan | Penerapan |
|---|---|---|
| 1 | Dua lapis: database (praktikum) dan website | Perintah modul ditulis ke file `.sql` dan `docs`; aturan sama diterapkan di website |
| 2 | Password modern | Minimal 12 karakter, tanpa aturan komposisi, tolak password umum |
| 3 | Kunci bertahap + CAPTCHA | 3x gagal: 1 menit; 6x: 5 menit; 9x: 15 menit; CAPTCHA wajib mulai gagal ke-3 |
| 4 | Tanpa kedaluwarsa paksa | Dijelaskan di `docs/KEBIJAKAN-PASSWORD.md` |
| 5 | Akun dipisah | `secure_user` untuk praktikum, `ladang_app` untuk website (tanpa kunci login) |

---

## 2. LANGKAH AWAL: BACA DAN COCOKKAN (jangan ubah apa pun dulu)

Baca file yang ada (nama bisa sedikit berbeda dari tulisan di sini) dan catat di
`docs/PROGRESS.md` bagian baru "Lanjutan M13 - Temuan awal":
- Fungsi yang sudah ada di `lib/security.js` (misalnya `validatePassword`, `isThrottled`,
  `recordAttempt`, `clearAttempts`, `hmac`, `sha256`, `getIp`, `json`, `sameOrigin`, `readJson`).
  **Pakai ulang** fungsi ini dengan nama aslinya. Jangan membuat duplikat.
- Cara `login`, `register`, dan `reset-password` memanggil validasi dan pembatas saat ini.
- Bentuk respons error dari `lib/authClient.js` dan apa yang dipakai `AuthForm`.
- Cara `PasswordStrength` bekerja (props dan class CSS) dan di mana ia dipakai.
- Apakah `package.json` memiliki `"type": "module"`. (Rencana di bawah memakai ekstensi `.mjs`
  agar aman di kedua kondisi.)
- Apakah `sql/schema.sql` memakai `CREATE TABLE IF NOT EXISTS` di semua pernyataan.
- Apakah port 3306 terbuka: `Test-NetConnection -ComputerName 127.0.0.1 -Port 3306`.
  Jika tidak, langkah yang butuh database dilewati dan dicatat.
- Jika sebagian M13 ternyata sudah ada, periksa dan LENGKAPI, jangan duplikat.

Akun lama yang password-nya kurang dari 12 karakter **tidak boleh rusak**: aturan baru hanya
berlaku saat **daftar** dan **ganti password**. Login tidak boleh menolak password karena
panjangnya (batas login tetap 1 sampai 200 karakter).

---

## 3. SPESIFIKASI

### A. Kebijakan password (satu sumber kebenaran, dipakai server dan browser)

Buat `lib/passwordPolicy.mjs` dan `data/common-passwords.mjs`. Keduanya **murni** (tanpa import
server seperti mysql2, bcryptjs, next/headers) agar aman diimpor oleh komponen klien dan oleh
script Node. Impor antar file memakai ekstensi lengkap
(`import { COMMON_PASSWORDS } from '../data/common-passwords.mjs'`).

`lib/passwordPolicy.mjs` mengekspor `checkPassword(pw, { email = '', name = '' } = {})` yang
mengembalikan `{ ok: boolean, message: string, strength: 'lemah' | 'sedang' | 'kuat' }`.

Aturan (periksa berurutan, pesan pertama yang gagal dikembalikan):
1. Harus string. Panjang < 12 karakter: "Password minimal 12 karakter."
2. Lebih dari 72 byte (`new TextEncoder().encode(pw).length`): "Password terlalu panjang (maksimal 72
   karakter). Persingkat frasa sandimu." (batas bcrypt; jangan dipotong diam-diam)
3. Hanya satu karakter berulang (`aaaaaaaaaaaa`), atau urutan sederhana: (a) setiap karakter naik
   atau turun satu langkah dari karakter sebelumnya; DIGIT BOLEH BERPUTAR (9 lalu 0, 0 lalu 9),
   sehingga `123456789012` dan `098765432109` tertolak, sedangkan huruf `a..z` tidak berputar
   (`abcdefghijkl` tertolak); atau (b) seluruh teks (huruf kecil, tanpa spasi) adalah potongan dari
   baris keyboard `qwertyuiopasdfghjklzxcvbnm` atau kebalikannya (`qwertyuiopas` tertolak):
   "Password terlalu mudah ditebak."
4. Ada di daftar password umum setelah normalisasi: huruf kecil, hapus spasi, `0→o 1→l 3→e 4→a
   5→s @→a $→s`, juga versi tanpa angka/simbol di ujung: "Password ini terlalu umum. Pilih frasa
   yang lebih unik."
5. Mengandung bagian email sebelum `@` (jika 4 karakter atau lebih), atau salah satu kata dari
   nama (kata berisi 4 karakter atau lebih), atau teks `ladangkita` / `ladang kita`:
   "Password tidak boleh memuat nama, email, atau nama website."
6. Tanpa aturan komposisi: tidak wajib huruf besar, angka, atau simbol. Spasi dan Unicode boleh.

Kekuatan: `lemah` jika gagal aturan; `sedang` untuk 12-15 karakter; `kuat` untuk 16 karakter ke atas.

`data/common-passwords.mjs` mengekspor `COMMON_PASSWORDS` (sebuah `Set` huruf kecil, tanpa duplikat,
**minimal 500 entri**). Isi dari pengetahuanmu: kombinasi angka dan keyboard (`123456789`,
`qwertyuiop`, `1q2w3e4r`), kata umum (`password`, `admin123`, `welcome1`, `letmein`, `iloveyou`),
kata Indonesia populer (`sayang`, `cintaku`, `bismillah`, `rahasia`, `indonesia`, `jakarta`,
`garuda`, `bandung`, `kucing`, `anakkost`), nama dan tahun populer, serta variasi umumnya
(`password123`, `password1234`, `p@ssw0rd`). Hanya entri berukuran 8 karakter ke atas yang berguna,
tetapi boleh memuat yang lebih pendek.

**Integrasi server:** `validatePassword` di `lib/security.js` dipertahankan (nama dan cara
pemanggilan tidak berubah agar tidak merusak pemanggil lama) tetapi isinya memanggil
`checkPassword` dan mengembalikan `message` jika tidak ok, atau string kosong jika ok. Tambahkan
parameter ketiga opsional `name`. Di `register`, kirim `name` dan `email`. Di `reset-password`,
ambil `name` dan `email` pengguna dari database dan teruskan. Perilaku lama yang harus tetap:
password baru tidak boleh sama dengan password lama, dan semua sesi dicabut setelah reset.

**Uji tanpa database:** `scripts/test-password-policy.mjs` (Node murni, mengimpor
`../lib/passwordPolicy.mjs`) dengan kasus berikut dan menampilkan LULUS/GAGAL per kasus, keluar
dengan kode 1 jika ada yang gagal. Tambahkan script `"test:password": "node scripts/test-password-policy.mjs"`.

| Input | Hasil yang diharapkan |
|---|---|
| `Short1!` | ditolak (kurang dari 12) |
| `password12345` | ditolak (umum) |
| `Password123!` | ditolak (umum setelah normalisasi) |
| `123456789012` | ditolak (urutan) |
| `aaaaaaaaaaaa` | ditolak (berulang) |
| `abcdefghijkl` | ditolak (urutan) |
| `qwertyuiopas` | ditolak (baris keyboard) |
| `098765432109` | ditolak (urutan digit berputar) |
| `ladangkita2024x` | ditolak (memuat nama website) |
| `budi.santoso99` dengan email `budi.santoso@mail.com` | ditolak (memuat email) |
| `budisantoso123` dengan nama `Budi Santoso` | ditolak (memuat nama) |
| `kopi susu gula aren` | DITERIMA (tanpa simbol) |
| `LangitBiruDiAtasSawah` | DITERIMA |
| string 72 byte valid | DITERIMA |
| string 73 byte | ditolak (terlalu panjang) |
| 25 emoji (lebih dari 72 byte) | ditolak (terlalu panjang) |
| bukan string (`null`, angka) | ditolak, tidak melempar error |

### B. Penguncian login bertahap per email

Pakai tabel `auth_attempts` yang sudah ada (kolom `bucket`, `created_at`). Bucket per email sudah
ada (`login:email:<hash>`) dan **berlaku sama untuk email yang tidak terdaftar** (agar tidak
membocorkan akun). Bucket per IP (20 gagal / 15 menit) tetap seperti semula.

Tambahkan di `lib/security.js` fungsi `loginLockState(bucket)`:
```sql
SELECT COUNT(*) AS n,
       TIMESTAMPDIFF(SECOND, MAX(created_at), UTC_TIMESTAMP()) AS since
  FROM auth_attempts
 WHERE bucket = ? AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1800 SECOND)
```
(`INTERVAL 1800 SECOND` ditulis sebagai angka literal dari kode, bukan parameter `?`.)
Hitung di JavaScript: `lockSec = n >= 9 ? 900 : n >= 6 ? 300 : n >= 3 ? 60 : 0`;
`remaining = lockSec - since` (jika `since` null berarti `n = 0`). Kembalikan
`{ n, locked: remaining > 0, retryAfterSec: remaining, captchaRequired: n >= 3 }`.

Urutan di route login (ganti hanya bagian pembatas lama):
1. `sameOrigin`, `readJson`, normalisasi email (seperti semula).
2. Cek pembatas IP (seperti semula). Cek `loginLockState`: jika `locked`, balas 429
   `{ error: 'Terlalu banyak percobaan. Coba lagi dalam X menit.' }` dengan X = `Math.ceil(retryAfterSec/60)`
   (minimal 1) dan `captchaRequired: true`. Catat `login_throttled` ke audit jika fungsi audit ada.
3. Jika `captchaRequired` (n >= 3): wajib ada `captchaId` dan `captchaAnswer` valid
   (`verifyCaptcha`). Jika tidak ada atau salah: balas 400
   `{ error: 'Jawab pertanyaan keamanan terlebih dahulu.', captchaRequired: true }`.
   **Percobaan tanpa CAPTCHA valid tidak dicatat sebagai gagal untuk bucket email** (password
   tidak diperiksa), tetapi dicatat di bucket IP.
4. Bandingkan password dengan bcrypt (hash palsu bila email tidak ada, seperti semula).
5. Jika gagal: catat ke bucket IP dan email, hitung ulang `loginLockState`, lalu balas 401
   `{ error: 'Email atau password salah', captchaRequired: <n >= 3> }`. Pesan tetap sama untuk
   semua jenis kegagalan.
6. Jika berhasil: hapus bucket email, buat sesi seperti semula.

### C. CAPTCHA internal (tanpa pihak ketiga)

Tambahkan di akhir `sql/schema.sql` (hanya MENAMBAH):
```sql
CREATE TABLE IF NOT EXISTS captcha_challenges (
  id CHAR(32) PRIMARY KEY,
  answer_hash CHAR(64) NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_captcha_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
Jika ada pernyataan lama di file itu tanpa `IF NOT EXISTS`, JANGAN diubah; sebagai gantinya
buat file `sql/migrasi-captcha.sql` berisi pernyataan di atas, dan catat di laporan bahwa saya
harus menjalankannya manual.

Di `lib/security.js` tambahkan:
- `issueCaptcha()`: `a = crypto.randomInt(1, 10)`, `b = crypto.randomInt(1, 10)`;
  `id = crypto.randomBytes(16).toString('hex')`; simpan `answer_hash = HMAC-SHA256(secret, id + ':' + (a+b))`
  dengan `OTP_SECRET` sebagai kunci; `expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 300 SECOND)`;
  hapus baris kedaluwarsa secara acak (sekitar 2%). Kembalikan `{ id, question: 'Berapa ' + a + ' + ' + b + '?' }`.
- `verifyCaptcha(id, answer)`: validasi `id` (regex `^[a-f0-9]{32}$`), `answer` (hanya digit,
  maksimal 3 karakter). Ambil baris yang `used = 0` dan `expires_at > UTC_TIMESTAMP()`. Tandai pakai
  dengan `UPDATE captcha_challenges SET used = 1 WHERE id = ? AND used = 0` dan pastikan
  `affectedRows === 1` (sekali pakai dan aman dari balapan). Bandingkan HMAC dengan
  `crypto.timingSafeEqual`. Kembalikan `true` atau `false`; tidak boleh melempar error.
- Jika `OTP_SECRET` tidak diisi: `issueCaptcha` melempar error yang ditangkap route dan dibalas 503
  `{ error: 'Layanan keamanan belum dikonfigurasi.' }`. Jangan melempar di top-level modul.

`app/api/auth/captcha/route.js`: `GET`, `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
Pembatas 30 permintaan / 10 menit per IP (bucket `captcha:ip:<ip>` di `auth_attempts`, pakai
`isThrottled` dan `recordAttempt` yang ada). Balas `{ id, question }` dengan
`Cache-Control: no-store`. Jangan pernah mengembalikan jawaban atau hash.

### D. Sisi browser

- `lib/authClient.js`: `apiLogin(email, password, remember, captcha)` dengan parameter keempat
  opsional `{ id, answer }` yang dikirim sebagai `captchaId` dan `captchaAnswer`. Tambahkan
  `apiCaptcha()` (GET `/api/auth/captcha`). Pada respons error, **teruskan** `captchaRequired`
  jika ada (bentuk lama `{ success:false, error }` tetap berlaku bila field itu tidak ada).
- `AuthContext.login(email, password, remember = true, captcha)`: teruskan parameter keempat.
  Hasilnya tetap objek respons apa adanya. Tanda tangan lama tetap valid.
- `AuthForm.js`:
  - Mode **daftar**: panjang minimal di sisi klien menjadi 12, dan gunakan `checkPassword` dari
    `@/lib/passwordPolicy.mjs` (kirim `name` dan `email` dari form) untuk menampilkan pesan.
    Server tetap penentu akhir. Mode **login** TIDAK memakai aturan panjang ini.
  - Mode login: jika respons memuat `captchaRequired`, panggil `apiCaptcha()` dan tampilkan SATU
    field tambahan (class `field`, label berisi soal, `inputMode="numeric"`, `autoComplete="off"`).
    Kirim `{ id, answer }` pada percobaan berikutnya dan muat soal baru setelah tiap kegagalan.
    Pesan 429 ditampilkan apa adanya, dan tombol kirim tetap bisa dipakai setelah waktu berlalu.
    Atribut `autoComplete` yang sudah ada tidak berubah.
- `PasswordStrength.js`: ganti penilaiannya menjadi `checkPassword(...).strength` dan tampilkan
  `message` bila tidak ok. Pertahankan props, struktur markup, dan class CSS yang sudah ada. Tambahkan
  teks bantuan satu baris: "Gunakan frasa panjang yang mudah kamu ingat."
- `app/lupa-password/page.js`: pada langkah password baru, ubah aturan klien menjadi 12 karakter
  dengan `checkPassword` (email dari state halaman itu). Alur, state, dan `resetToken` tidak berubah.

### E. Lapis database (hanya file, tidak dieksekusi)

`sql/praktikum-modul6.sql` (versi MySQL 8.0.19 ke atas; tulis komentar penjelasan di tiap langkah):
```sql
-- PERINGATAN: MariaDB (bawaan XAMPP) TIDAK mendukung validate_password
-- maupun FAILED_LOGIN_ATTEMPTS. Cek versi: SELECT VERSION();
-- 5.1 Login: mysql -u root -p
-- 5.2 Cek plugin/komponen
SHOW PLUGINS;
SELECT * FROM mysql.component;
-- 5.3 Aktifkan (MySQL 8.0+ berbentuk komponen)
INSTALL COMPONENT 'file://component_validate_password';
-- Versi lama (5.7): INSTALL PLUGIN validate_password SONAME 'validate_password.so';
-- (di Windows: validate_password.dll; variabelnya validate_password_length dst.)
-- 5.4 Konfigurasi
SET GLOBAL validate_password.length = 8;
SET GLOBAL validate_password.policy = STRONG;
SHOW VARIABLES LIKE 'validate_password%';
-- 5.5 Uji password lemah (HARUS GAGAL)
CREATE USER 'test_user'@'localhost' IDENTIFIED BY '123';
-- 5.6 Uji password kuat (HARUS BERHASIL)
CREATE USER 'secure_user'@'localhost' IDENTIFIED BY 'Secure#123';
-- 5.7 Masa berlaku password
ALTER USER 'secure_user'@'localhost' PASSWORD EXPIRE INTERVAL 30 DAY;
-- 5.8 Batas gagal login
ALTER USER 'secure_user'@'localhost' FAILED_LOGIN_ATTEMPTS 3 PASSWORD_LOCK_TIME 1;
-- Verifikasi (untuk tangkapan layar)
SHOW CREATE USER 'secure_user'@'localhost';
-- Pengujian: mysql -u secure_user -p  (benar = masuk; salah 3x = akun terkunci)
-- Pembersihan (opsional)
DROP USER IF EXISTS 'test_user'@'localhost';
```
`sql/akun-aplikasi.sql`:
```sql
-- Akun yang dipakai WEBSITE (DATABASE_URL). JANGAN beri FAILED_LOGIN_ATTEMPTS,
-- PASSWORD_LOCK_TIME, atau PASSWORD EXPIRE: jika akun ini terkunci, seluruh website mati.
-- Ganti password dengan frasa acak panjang. Jika validate_password aktif, password harus lolos policy-nya.
CREATE USER IF NOT EXISTS 'ladang_app'@'localhost' IDENTIFIED BY 'GANTI_DENGAN_PASSWORD_KUAT';
GRANT SELECT, INSERT, UPDATE, DELETE ON ladang_kita.* TO 'ladang_app'@'localhost';
FLUSH PRIVILEGES;
-- Hak membuat tabel (DDL) sengaja tidak diberikan. Jalankan sql/schema.sql dengan akun admin
-- (atau lewat DATABASE_ADMIN_URL pada npm run db:setup).
```
`.env.example`: pastikan ada `DATABASE_ADMIN_URL=` (opsional, komentar: hanya untuk `db:setup`) dan
`OTP_SECRET=` (komentar: juga dipakai CAPTCHA). Tambahkan hanya jika belum ada.

### F. Dokumen

`docs/KEBIJAKAN-PASSWORD.md` (Bahasa Indonesia, ringkas dan rapi) memuat: aturan password,
alasan panjang lebih penting daripada komposisi karakter, daftar password umum, penguncian
bertahap dan CAPTCHA, alasan **tanpa kedaluwarsa paksa** (NIST SP 800-63B dan OWASP tidak
menyarankan penggantian berkala karena mendorong password lemah; ganti saat ada indikasi bocor
atau atas permintaan pengguna, dan semua sesi dicabut saat password diganti), keterbatasan
(CAPTCHA hitung sederhana bisa dilewati bot; penyerang bisa mengunci akun orang lain sementara,
dibatasi durasi pendek), dan catatan bahwa akun lama dengan password pendek tetap bisa masuk
tetapi dianjurkan menggantinya.

`docs/PRAKTIKUM-MODUL-VI.md` memuat: (1) tabel 7 indikator keberhasilan dengan kolom "Bukti
(tangkapan layar)" kosong untuk saya isi; (2) langkah uji berurutan sesuai `sql/praktikum-modul6.sql`;
(3) jawaban rapi untuk 4 pertanyaan Analisis Keamanan (mengapa password harus kompleks, risiko
password sederhana, fungsi account lock, bagaimana password policy meningkatkan keamanan database),
masing-masing dikaitkan dengan penerapan di website; (4) pemetaan lapis database vs website
(misalnya: policy STRONG pada MySQL vs aturan 12 karakter + daftar umum di website; FAILED_LOGIN_ATTEMPTS 3
vs penguncian bertahap + CAPTCHA; PASSWORD EXPIRE 30 hari vs keputusan tanpa kedaluwarsa paksa
beserta alasannya); (5) peringatan MariaDB vs MySQL.

### G. Pembaruan uji asap

Di `scripts/security-smoke.mjs`: (a) semua kata sandi uji untuk akun yang didaftarkan harus
lolos aturan baru, pakai frasa unik acak berpanjang 16 karakter ke atas (misalnya
`'kopi-susu-' + angkaAcak`); (b) ganti kasus "salah 6 kali" dengan: setelah 3 gagal respons
memuat `captchaRequired:true`; percobaan tanpa CAPTCHA ditolak 400; CAPTCHA benar + password
salah (gagal ke-3) membuat percobaan berikutnya 429; CAPTCHA yang sama tidak bisa dipakai dua
kali; perilaku sama untuk email tidak terdaftar; (c) tambah kasus pendaftaran dengan
`password12345` (ditolak), 11 karakter (ditolak), dan frasa 12+ karakter tanpa simbol (diterima);
(d) respons `GET /api/auth/captcha` tidak memuat jawaban atau hash. Jangan menghapus kasus lama
selain yang disebut. Skrip tetap bisa dilewati dengan pesan jelas jika database tidak tersedia.

---

## 4. FASE KERJA (berurutan, gerbang build di tiap akhir fase)

**L0 Persiapan:** cadangan, baca dan cocokkan (bagian 2), catat temuan di `docs/PROGRESS.md`
(bagian baru di bawah). Baseline `npm run build` dan `npm run lint`.
**L1 Kebijakan password:** bagian A dan integrasi server. Jalankan `npm run test:password`
(harus semua LULUS), lalu build dan lint.
**L2 Kunci bertahap dan CAPTCHA:** bagian B dan C (server). Build dan lint.
**L3 Browser:** bagian D. Build dan lint.
**L4 Dokumen dan SQL:** bagian E dan F. Tidak ada eksekusi database.
**L5 Uji asap dan log:** bagian G; tambahkan bagian "Lanjutan M13" di bawah `docs/PROGRESS.md` dan
`docs/SECURITY_FIXES.md`. Jika port 3306 terbuka, `.env.local` lengkap, dan tabel sudah dibuat:
`npm run build`, jalankan `npm run start` di proses latar (`Start-Process`), jalankan
`npm run test:smoke`, hentikan prosesnya, dan bersihkan akun uji. Jika tidak, lewati dan catat alasan.
**L6 Verifikasi akhir:** `npm run build`, `npm run lint`, `npm run test:password`,
`npm run check:secrets`. Cari sisa aturan lama: `Select-String -Path` pada `components`, `app`, `lib`
untuk `minLength={8}`, `"8 karakter"`, `length < 8`, `>= 8` terkait password, dan perbaiki yang
mengacu ke aturan daftar/ganti password (jangan menyentuh batas login).

---

## 5. CATATAN ANTI-ERROR

1. File murni (`passwordPolicy.mjs`, `common-passwords.mjs`) tidak boleh mengimpor modul server.
   Ekstensi `.mjs` wajib dicantumkan pada setiap import ke file tersebut.
2. `mysql2` + `execute`: nilai untuk `INTERVAL`, `LIMIT`, `OFFSET` ditulis sebagai angka literal
   yang divalidasi dari konstanta kode, bukan `?`. Nilai lain tetap memakai `?`. Dilarang menyambung
   string input pengguna ke query.
3. Semua waktu UTC: pakai `UTC_TIMESTAMP()`.
4. Jangan membaca `process.env` atau melempar error di top-level modul (build harus lulus walau
   `.env.local` belum lengkap).
5. Komponen yang memakai `useSearchParams` tetap dalam `<Suspense>` (jangan diubah).
6. Pesan untuk pengguna selalu Bahasa Indonesia. Jangan kembalikan pesan error mentah (SQL,
   library) ke browser.
7. `AuthForm` adalah komponen klien: hanya impor `@/lib/authClient` dan `@/lib/passwordPolicy.mjs`.
8. Perubahan pada file lama harus **sekecil mungkin** (ubah hanya bagian yang disebut). Jika
   file memakai CRLF dan penggantian sebagian gagal, tulis ulang seluruh file dengan isi sama
   ditambah perubahan, lalu bandingkan dengan cadangan untuk memastikan hanya bagian yang
   dimaksud yang berbeda.
9. Setelah selesai, bandingkan seluruh project dengan `..\LADANG KITA - backup-m13`
   (`robocopy ... /L /NJH /NJS /NDL /XD node_modules .next`) dan pastikan daftar file yang
   berbeda hanya terdiri dari file di daftar BOLEH DIUBAH dan BOLEH DIBUAT.

---

## 6. KRITERIA SELESAI
- [ ] `npm run build` dan `npm run lint` lulus.
- [ ] `npm run test:password` semua kasus LULUS.
- [ ] `npm run check:secrets` bersih.
- [ ] Akun lama berpassword pendek tetap bisa login (route login tidak menolak karena panjang).
- [ ] Daftar dan ganti password memakai aturan baru di server dan di browser.
- [ ] Login: kunci bertahap 1/5/15 menit dan CAPTCHA mulai gagal ke-3; pesan tetap netral.
- [ ] File Modul VI ada (`sql/praktikum-modul6.sql`, `sql/akun-aplikasi.sql`,
      `docs/PRAKTIKUM-MODUL-VI.md`, `docs/KEBIJAKAN-PASSWORD.md`) dan tidak ada yang dieksekusi.
- [ ] Perbandingan dengan cadangan hanya menunjukkan file yang diizinkan.
- [ ] `docs/PROGRESS.md` dan `docs/SECURITY_FIXES.md`: isi lama utuh, bagian baru di bawah.

## 7. LAPORAN AKHIR (tulis di bagian baru `docs/SECURITY_FIXES.md` dan ringkas di chat)
1. Daftar file yang diubah dan dibuat (cocokkan dengan perbandingan cadangan).
2. Hasil build, lint, `test:password`, `check:secrets`, dan uji asap (LULUS/GAGAL/dilewati + alasan).
3. **Tindakan yang harus saya lakukan sendiri:** jalankan `npm run db:setup` (atau
   `sql/migrasi-captcha.sql`) agar tabel CAPTCHA ada; pastikan `OTP_SECRET` terisi; jalankan praktikum
   `sql/praktikum-modul6.sql` di MySQL asli (bukan MariaDB) untuk tangkapan layar; buat user
   `ladang_app` dari `sql/akun-aplikasi.sql` dan ganti `DATABASE_URL`.
4. Risiko tersisa: CAPTCHA hitung bisa dilewati bot; penguncian bisa dipakai untuk mengunci akun orang
   lain sementara; akun lama berpassword pendek tidak dipaksa ganti; pembatas bergantung akurasi IP
   dari proxy.
5. Hal yang tidak dikerjakan dan alasannya.

Mulai dari L0 sekarang. Berhenti hanya bila ada blocker nyata atau gerbang verifikasi gagal
setelah 3 kali perbaikan; jika berhenti, tulis status di `docs/PROGRESS.md` agar bisa dilanjutkan.
