// const product = require("../controllers/productsController");
// const router = require("express").Router();

// router.get("/", product.findAllProducts);
// router.get("/:id", product.getProductWithImages);
// router.get("/category/:category", product.getProductsByCategory);
// router.get("/category/:category/:id", product.getProductByIdInCategory);
// router.delete("/:id", product.deleteProduct);
// router.put("/:id", product.updateProductWithImages);
// router.post("/new-product", product.addProductWithImages);

// module.exports = router;

const express = require("express");
const router = express.Router();

const product = require("../controllers/productsController");
const { authenticate, isAdmin } = require("../middlewares/auth");

// Apply authentication middleware to all routes

// Public routes
router.get("/", product.findAllProducts);
router.get("/:id", product.getProductWithImages);
router.get("/category/:category", product.getProductsByCategory);
router.get("/category/:category/:id", product.getProductByIdInCategory);
router.get("/color/:color", product.getProductsByColor);
router.get("/color/:color/:id", product.getProductByIdInColor);

// Admin-only routes
router.post("", isAdmin, product.addProductWithImages);
router.put("/:id", isAdmin, product.updateProductWithImages);
router.delete("/:id", isAdmin, product.deleteProduct);

module.exports = router;
