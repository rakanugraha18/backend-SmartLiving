const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate, isCustomer } = require("../middlewares/auth");

router.get("/get-cart/:cart_id", cartController.getCartById);
router.get("/:cart_id/items", cartController.getCartItemsByCartId);
router.get("/:user_id", cartController.getCartByUserId);
// router.get("/active-cart/:user_id", cartController.getActiveCart);

router.post("/create-cart", isCustomer, cartController.createCart);

// Route untuk menambahkan item ke cart
router.post("/:cart_id/items", isCustomer, cartController.addItemToCart);

// Route untuk memperbarui jumlah item di cart
router.put("/items/:item_id", cartController.updateCartItemQuantity);

// Route untuk menghapus item dari cart
router.delete("/items/:item_id", cartController.removeItemFromCart);
router.post("/items/delete", cartController.deleteItemsCart);

// Route untuk checkout
router.post("/checkout/:userId", cartController.checkoutCart);

module.exports = router;
