const express = require("express");
const orderController = require("../controllers/orderController");
const { isCustomer, isAdmin, authenticate } = require("../middlewares/auth");

const router = express.Router();

// Mendapatkan semua Order untuk User tertentu
router.get("/:user_id", authenticate, orderController.getOrdersByUserId);

router.get(
  "/:user_id/:order_id",
  authenticate,
  orderController.getOrderByIdForUser
);

// Mengubah Status Order
router.put("/:order_id/status", isCustomer, orderController.updateOrderStatus);

// Menghapus Order
router.delete("/:order_id", isCustomer, orderController.deleteOrder);

router.put("/:orderId", authenticate, orderController.updateOrderDetails);

//admin
router.get("/", isAdmin, orderController.getAllOrders);

module.exports = router;
