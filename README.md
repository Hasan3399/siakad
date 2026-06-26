# 🎓 SIAKAD - Sistem Informasi Akademik

Aplikasi web sistem informasi akademik berbasis cloud dengan Node.js, Express, dan MySQL.

## ✅ Fitur
- Login pengguna (Admin, Dosen, Mahasiswa)
- Manajemen data mahasiswa (CRUD)
- Manajemen mata kuliah (CRUD)
- Manajemen nilai dengan konversi otomatis angka → huruf
- Dashboard statistik dengan grafik visual

---

## 🚀 Cara Deploy ke Railway (Step by Step)

### 1. Persiapan — Upload ke GitHub
1. Buat akun GitHub di https://github.com jika belum punya
2. Buat repository baru (misal: `siakad`)
3. Upload semua file proyek ini ke repository tersebut
   - Pastikan file `.gitignore` ada (sudah disertakan)
   - **JANGAN** upload file `.env` ke GitHub!

### 2. Daftar & Login Railway
1. Buka https://railway.app
2. Klik **"Login"** → pilih **"Login with GitHub"**
3. Izinkan Railway mengakses akun GitHub

### 3. Buat Project Baru di Railway
1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository `siakad` yang sudah dibuat
4. Railway akan mulai mendeteksi project

### 4. Tambah Database MySQL
1. Di halaman project Railway, klik **"+ New"**
2. Pilih **"Database"** → pilih **"MySQL"**
3. Tunggu database selesai dibuat (sekitar 1 menit)
4. Klik pada service MySQL → tab **"Variables"**
5. Catat nilai `MYSQL_URL` atau gunakan variabel individual:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

### 5. Set Environment Variables di Service Aplikasi
1. Klik service aplikasi Node.js (bukan MySQL)
2. Buka tab **"Variables"**
3. Tambahkan variabel berikut:

```
JWT_SECRET=isi_dengan_string_acak_panjang_minimal_32_karakter
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

> **Tips**: Railway mendukung referensi antar service dengan `${{NamaService.VARIABEL}}`

### 6. Setup Database (Import Schema)
1. Di service MySQL, buka tab **"Data"** atau gunakan MySQL client
2. Atau gunakan fitur **"Query"** di Railway
3. Copy isi file `schema.sql` dan jalankan di sana
4. Ini akan membuat tabel dan data awal secara otomatis

**Alternatif via terminal lokal:**
```bash
mysql -h HOST -P PORT -u USER -pPASSWORD DATABASE < schema.sql
```

### 7. Generate Domain
1. Di service aplikasi, buka tab **"Settings"**
2. Scroll ke bagian **"Networking"**
3. Klik **"Generate Domain"**
4. Aplikasi akan dapat diakses di URL yang diberikan!

---

## 💻 Cara Jalankan di Komputer Lokal

### Persyaratan
- Node.js versi 18 ke atas (download di https://nodejs.org)
- MySQL terinstall di komputer

### Langkah-langkah
```bash
# 1. Install semua package yang dibutuhkan
npm install

# 2. Salin file konfigurasi
cp .env.example .env

# 3. Edit file .env sesuai konfigurasi MySQL lokal Anda
#    Buka dengan notepad atau text editor

# 4. Buat database di MySQL
mysql -u root -p
CREATE DATABASE siakad;
EXIT;

# 5. Import schema dan data awal
mysql -u root -p siakad < schema.sql

# 6. Jalankan aplikasi
npm start
```

Buka browser ke http://localhost:3000

---

## 🔐 Akun Login Bawaan

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| dosen1 | admin123 | Dosen |
| mhs001 | admin123 | Mahasiswa |

---

## 📁 Struktur Folder

```
siakad/
├── server.js          ← File utama (entry point)
├── package.json       ← Daftar dependensi
├── schema.sql         ← Script database (jalankan sekali)
├── .env.example       ← Template konfigurasi
├── .gitignore
├── config/
│   ├── database.js    ← Koneksi ke MySQL
│   └── middleware.js  ← Cek login JWT
├── routes/
│   ├── auth.js        ← Login / logout
│   ├── mahasiswa.js   ← CRUD mahasiswa
│   ├── mataKuliah.js  ← CRUD mata kuliah
│   └── nilai.js       ← CRUD nilai + statistik
└── public/
    ├── index.html     ← Halaman utama (SPA)
    ├── css/style.css  ← Tampilan
    └── js/app.js      ← Logika frontend
```

---

## 🛡️ Keamanan yang Sudah Diterapkan
- Password di-hash dengan bcrypt (tidak disimpan polos)
- Autentikasi menggunakan JWT Token
- Cookie httpOnly (tidak bisa diakses JavaScript)
- Semua API endpoint dilindungi middleware auth
- Input validation di sisi server

---

## 📹 Poin untuk Video Presentasi
1. Tunjukkan arsitektur: Railway (cloud) + MySQL (cloud DB)
2. Demo login dengan 3 role berbeda
3. Demo tambah/edit/hapus mahasiswa
4. Demo input nilai dan konversi otomatis
5. Tunjukkan dashboard statistik
6. Tunjukkan URL Railway (bukti sudah di cloud)
