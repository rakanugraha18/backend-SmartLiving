const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

// Register Admin
exports.register = async (req, res) => {
  const { first_name, last_name, email, phone_number, password } = req.body;

  console.log("Payload diterima:", req.body); // Logging payload

  if (!first_name || !last_name || !email || !phone_number || !password) {
    return res.status(400).json({ error: "Semua bidang harus diisi" });
  }

  try {
    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }
    const existingPhoneNumber = await UserModel.findOne({
      where: { phone_number },
    });
    if (existingPhoneNumber) {
      return res.status(400).json({ error: "Nomor telepon sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      first_name,
      last_name,
      email,
      phone_number,
      password: hashedPassword,
      role: "admin", // Pastikan role selalu diatur sebagai "admin"
    });

    res.status(201).json({
      message: "Admin berhasil didaftarkan",
      id: newUser.id,
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat pendaftaran admin:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat pendaftaran" });
  }
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari User berdasarkan email
    const user = await UserModel.findOne({ where: { email } });
    if (!user || user.role !== "admin") {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Periksa password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Buat token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const Users = await UserModel.findAll({
      where: {
        role: "customer",
      },
    });
    res.status(200).json(Users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const User = req.User; // Informasi User sudah ada di req dari middleware
    res.status(200).json({
      id: User.id,
      first_name: User.first_name,
      last_name: User.last_name,
      email: User.email,
      phone_number: User.phone_number,
      created_at: User.created_at,
      updated_at: User.updated_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
