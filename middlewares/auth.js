const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header

  if (!token) {
    return res.status(401).json({ error: "Token tidak disediakan" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cari User berdasarkan ID dari token
    const user = await User.findByPk(decoded.id);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Akses ditolak, hanya untuk admin" });
    }

    // Pass kontrol ke middleware berikutnya
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token tidak valid" });
  }
};

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header

  if (!token) {
    return res
      .status(401)
      .json({ error: "Akses ditolak, token tidak disediakan" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cari User berdasarkan ID dari token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Akses ditolak, token tidak valid" });
    }

    // Tambahkan informasi User ke req
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Akses ditolak, token tidak valid" });
  }
};

module.exports = { authenticate, isAdmin }; // Export middleware
