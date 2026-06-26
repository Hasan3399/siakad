const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Tidak terautentikasi' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kadaluarsa' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Hanya admin yang diizinkan' });
  next();
}

function adminOrDosen(req, res, next) {
  if (req.user?.role !== 'admin' && req.user?.role !== 'dosen') {
    return res.status(403).json({ error: 'Hanya admin dan dosen yang diizinkan' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, adminOrDosen };
