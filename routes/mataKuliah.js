const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOrDosen } = require('../config/middleware');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM mata_kuliah ORDER BY kode_mk');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, adminOrDosen, async (req, res) => {
  const { kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu } = req.body;
  if (!kode_mk || !nama_mk) return res.status(400).json({ error: 'Kode dan nama MK wajib diisi' });
  try {
    const [result] = await db.query(
      'INSERT INTO mata_kuliah (kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu) VALUES (?,?,?,?,?,?)',
      [kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu]
    );
    res.status(201).json({ id: result.insertId, message: 'Mata kuliah berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Kode MK sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, adminOrDosen, async (req, res) => {
  const { kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu } = req.body;
  try {
    await db.query(
      'UPDATE mata_kuliah SET kode_mk=?, nama_mk=?, sks=?, semester=?, jurusan=?, dosen_pengampu=? WHERE id=?',
      [kode_mk, nama_mk, sks, semester, jurusan, dosen_pengampu, req.params.id]
    );
    res.json({ message: 'Mata kuliah berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, adminOrDosen, async (req, res) => {
  try {
    await db.query('DELETE FROM mata_kuliah WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mata kuliah berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
