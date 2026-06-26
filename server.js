require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/mahasiswa', require('./routes/mahasiswa'));
app.use('/api/mata-kuliah', require('./routes/mataKuliah'));
app.use('/api/nilai', require('./routes/nilai'));

// SPA fallback — semua route ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ SIAKAD berjalan di http://localhost:${PORT}`);
  console.log(`📦 Mode: ${process.env.NODE_ENV || 'development'}`);
});
