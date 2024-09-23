const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
require("dotenv").config();

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

const isCustomer = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from the header

  if (!token) {
    return res.status(401).json({ error: "Token is not provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find User based on ID from the token
    const user = await UserModel.findByPk(decoded.id);
    if (!user || user.role !== "customer") {
      return res
        .status(403)
        .json({ error: "Access denied, only for customers" });
    }

    // Pass control to the next middleware
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Ambil token dari header

  if (!token) {
    return res.status(401).json({ error: "Token tidak disediakan" });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Cari User berdasarkan ID dari token
    const user = await UserModel.findByPk(decoded.id);
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
    const user = await UserModel.findByPk(decoded.id);
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

module.exports = { authenticate, isAdmin, isCustomer }; // Export middleware
