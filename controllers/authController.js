const jwt = require("jsonwebtoken");
const { UserModel } = require("../models"); // Sesuaikan dengan path model Anda

const JWT_SECRET = process.env.JWT_SECRET; // Ambil secret key dari variabel lingkungan

const loginWithGoogle = async (req, res) => {
  const { email, first_name, last_name } = req.body;

  try {
    // Periksa apakah email sudah ada
    const user = await UserModel.findOne({ where: { email } });
    if (user) {
      // User sudah ada, buat token dan balas ke frontend
      const token = generateToken(user.id); // Ganti dengan metode token Anda
      return res.json({ token, userId: user.id });
    } else {
      // Jika user tidak ada, daftarkan user baru
      const newUser = await UserModel.create({
        email,
        first_name: first_name || "DefaultFirstName", // Ganti dengan nilai default jika diperlukan
        last_name: last_name || "DefaultLastName", // Ganti dengan nilai default jika diperlukan
      });
      const token = generateToken(newUser.id);
      return res.json({ token, userId: newUser.id });
    }
  } catch (error) {
    console.error("Error during login with Google:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const generateToken = (userId) => {
  if (!JWT_SECRET) {
    throw new Error("JWT secret key is not defined");
  }
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "1h", // Sesuaikan masa berlaku token jika perlu
  });
};

module.exports = {
  loginWithGoogle,
};
