const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

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
      role: "customer", // Pastikan role selalu diatur sebagai "customer"
    });

    res.status(201).json({
      message: "Pengguna berhasil didaftarkan",
      id: newUser.id,
    });
  } catch (error) {
    console.error("Terjadi kesalahan saat pendaftaran pengguna:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat pendaftaran" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari User berdasarkan email
    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
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

// Get My Profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user; // Menggunakan req.user dari middleware

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, password } = req.body;
    const user = req.user; // Menggunakan user dari middleware otentikasi

    // Update data pengguna
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;

    // Hash password jika ada password baru
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
