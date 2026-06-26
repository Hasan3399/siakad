const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Username atau password salah' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: 'Username atau password salah' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, nama: user.nama },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '8h' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.json({ success: true, role: user.role, nama: user.nama });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Tidak terautentikasi' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    res.json(decoded);
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

module.exports = router;
