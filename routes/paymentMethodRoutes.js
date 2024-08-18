const express = require("express");
const router = express.Router();
const paymentMethodController = require("../controllers/paymentMethodController");
const { isAdmin } = require("../middlewares/auth");

router.get("/", paymentMethodController.getAllPaymentMethods);
router.get("/:id", paymentMethodController.getPaymentMethodById);
router.post("/", isAdmin, paymentMethodController.createPaymentMethod);
router.put("/:id", isAdmin, paymentMethodController.updatePaymentMethod);
router.delete("/:id", isAdmin, paymentMethodController.deletePaymentMethod);

module.exports = router;
