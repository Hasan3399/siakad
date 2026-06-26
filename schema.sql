-- ============================================
-- SIAKAD - Sistem Informasi Akademik
-- Schema Database MySQL
-- Jalankan file ini sekali untuk setup awal
-- ============================================

-- Buat tabel users (untuk login)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'dosen', 'mahasiswa') NOT NULL DEFAULT 'mahasiswa',
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  jurusan VARCHAR(100),
  angkatan YEAR,
  jenis_kelamin ENUM('L', 'P'),
  no_hp VARCHAR(20),
  alamat TEXT,
  status ENUM('aktif', 'cuti', 'lulus', 'keluar') DEFAULT 'aktif',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Buat tabel mata kuliah
CREATE TABLE IF NOT EXISTS mata_kuliah (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_mk VARCHAR(20) UNIQUE NOT NULL,
  nama_mk VARCHAR(100) NOT NULL,
  sks INT NOT NULL DEFAULT 2,
  semester INT,
  jurusan VARCHAR(100),
  dosen_pengampu VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buat tabel nilai
CREATE TABLE IF NOT EXISTS nilai (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mahasiswa_id INT NOT NULL,
  mata_kuliah_id INT NOT NULL,
  semester VARCHAR(20),
  tahun_ajaran VARCHAR(20),
  nilai_angka DECIMAL(5,2),
  nilai_huruf VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id) ON DELETE CASCADE,
  FOREIGN KEY (mata_kuliah_id) REFERENCES mata_kuliah(id) ON DELETE CASCADE,
  UNIQUE KEY unique_nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran)
);

-- ============================================
-- DATA AWAL (Seed Data)
-- ============================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (username, password, role, nama, email) VALUES
('admin', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'admin', 'Administrator', 'admin@siakad.ac.id'),
('dosen1', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'dosen', 'Dr. Budi Santoso', 'budi@siakad.ac.id'),
('mhs001', '$2a$10$MES29SSVFcdqfv917IE9deQ90lA3MgREZHtNEvhebgMTZSWcTFco2', 'mahasiswa', 'Andi Pratama', 'andi@mahasiswa.ac.id');

-- Mahasiswa contoh
INSERT IGNORE INTO mahasiswa (nim, nama, email, jurusan, angkatan, jenis_kelamin, status, user_id) VALUES
('2021001', 'Andi Pratama', 'andi@mahasiswa.ac.id', 'Teknik Informatika', 2021, 'L', 'aktif', 3),
('2021002', 'Siti Rahayu', 'siti@mahasiswa.ac.id', 'Teknik Informatika', 2021, 'P', 'aktif', NULL),
('2021003', 'Budi Setiawan', 'budi.s@mahasiswa.ac.id', 'Sistem Informasi', 2021, 'L', 'aktif', NULL),
('2022001', 'Dewi Anggraini', 'dewi@mahasiswa.ac.id', 'Teknik Informatika', 2022, 'P', 'aktif', NULL),
('2022002', 'Rizki Fadhillah', 'rizki@mahasiswa.ac.id', 'Sistem Informasi', 2022, 'L', 'aktif', NULL);

-- Mata kuliah contoh
INSERT IGNORE INTO mata_kuliah (kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu) VALUES
('IF101', 'Pengantar Algoritma', 3, 1, 'Teknik Informatika', 'Dr. Budi Santoso'),
('IF102', 'Matematika Diskrit', 2, 1, 'Teknik Informatika', 'Dr. Sari Dewi'),
('IF201', 'Pemrograman Web', 3, 3, 'Teknik Informatika', 'Dr. Budi Santoso'),
('IF202', 'Basis Data', 3, 3, 'Teknik Informatika', 'Dr. Ahmad Yani'),
('SI101', 'Sistem Informasi Manajemen', 3, 1, 'Sistem Informasi', 'Dr. Rini Susanti'),
('IF301', 'Cloud Computing', 3, 5, 'Teknik Informatika', 'Dr. Budi Santoso');

-- Nilai contoh
INSERT IGNORE INTO nilai (mahasiswa_id, mata_kuliah_id, semester, tahun_ajaran, nilai_angka, nilai_huruf) VALUES
(1, 1, 'Ganjil', '2021/2022', 85.00, 'A'),
(1, 2, 'Ganjil', '2021/2022', 78.00, 'B+'),
(1, 3, 'Ganjil', '2022/2023', 90.00, 'A'),
(2, 1, 'Ganjil', '2021/2022', 75.00, 'B'),
(2, 2, 'Ganjil', '2021/2022', 82.00, 'A-'),
(3, 5, 'Ganjil', '2021/2022', 88.00, 'A');
