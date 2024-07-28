const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { authenticate } = require("../middlewares/auth");

// Endpoint Register
router.post("/register", customerController.register);

// Endpoint Login
router.post("/login", customerController.login);

// Endpoint untuk mendapatkan profil pengguna
router.get("/my-profile", authenticate, customerController.getMyProfile);

// Endpoint untuk mengupdate profil
router.put("/update-profile", authenticate, customerController.updateProfile);

module.exports = router;
