const express = require("express");
const router = express.Router();
const { authenticate, isAdmin } = require("../middlewares/auth");
const authorize = require("../middlewares/role");
const adminController = require("../controllers/adminController");

// Get all Users (accessible by admin only)
router.get(
  "/all-customers",
  authenticate,
  authorize(["admin"]),
  adminController.getAllUsers
);

// Endpoint Register
router.post("/register", adminController.register);

// Endpoint Login Admin
router.post("/login-admin", adminController.loginAdmin);

// Endpoint untuk mendapatkan profil admin (misalnya)
router.get(
  "/admin-profile",
  authenticate && isAdmin,
  adminController.getMyProfile
);

module.exports = router;
