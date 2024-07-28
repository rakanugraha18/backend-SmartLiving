const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari User berdasarkan email
    const user = await User.findOne({ where: { email } });
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
    const Users = await User.findAll({
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
      created_at: User.created_at,
      updated_at: User.updated_at,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
