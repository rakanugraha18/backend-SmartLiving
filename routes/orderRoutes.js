const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

// Mendapatkan semua Order untuk User tertentu
router.get("/:user_id", orderController.getOrdersByUserId);

router.get("/:user_id/:order_id", orderController.getOrderByIdForUser);

// Mengubah Status Order
router.put("/:order_id/status", orderController.updateOrderStatus);

// Menghapus Order
router.delete("/:order_id", orderController.deleteOrder);

module.exports = router;
