const express = require("express");
const orderController = require("../controllers/orderController");
const { isCustomer } = require("../middlewares/auth");

const router = express.Router();

// Mendapatkan semua Order untuk User tertentu
router.get("/:user_id", isCustomer, orderController.getOrdersByUserId);

router.get(
  "/:user_id/:order_id",
  isCustomer,
  orderController.getOrderByIdForUser
);

// Mengubah Status Order
router.put("/:order_id/status", isCustomer, orderController.updateOrderStatus);

// Menghapus Order
router.delete("/:order_id", isCustomer, orderController.deleteOrder);

router.put("/:orderId", isCustomer, orderController.updateOrderDetails);

module.exports = router;
