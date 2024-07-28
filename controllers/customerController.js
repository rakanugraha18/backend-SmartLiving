const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Secret key untuk JWT, simpan di variabel lingkungan sebenarnya
const JWT_SECRET = process.env.JWT_SECRET;

// Registrasi
exports.register = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {
    // Cek apakah email sudah ada
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default role to 'user' if not provided
    const userRole = role || "customer";

    // Buat User baru
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      id: newUser.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari User berdasarkan email
    const user = await User.findOne({ where: { email } });
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
    const { first_name, last_name, email, password } = req.body;
    const user = req.user; // Menggunakan user dari middleware otentikasi

    // Update data pengguna
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;

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
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
