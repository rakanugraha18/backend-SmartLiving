const PaymentMethodModel = require("../models/PaymentMethodModel");

exports.getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethodModel.findAll();
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment methods", error });
  }
};

exports.getPaymentMethodById = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethodModel.findByPk(req.params.id);
    if (paymentMethod) {
      res.json(paymentMethod);
    } else {
      res.status(404).json({ message: "Payment method not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment method", error });
  }
};

exports.createPaymentMethod = async (req, res) => {
  try {
    const { type, selectedBank, expiry_date } = req.body;
    const newPaymentMethod = await PaymentMethodModel.create({
      type,
      selectedBank,
      expiry_date,
    });
    res.status(201).json(newPaymentMethod);
  } catch (error) {
    res.status(400).json({ message: "Error creating payment method", error });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { type, selectedBank, expiry_date } = req.body;
    const [updated] = await PaymentMethodModel.update(
      { type, selectedBank, expiry_date },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const updatedPaymentMethod = await PaymentMethodModel.findByPk(
        req.params.id
      );
      res.json(updatedPaymentMethod);
    } else {
      res.status(404).json({ message: "Payment method not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Error updating payment method", error });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const deleted = await PaymentMethodModel.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.json({ message: "Payment method deleted" });
    } else {
      res.status(404).json({ message: "Payment method not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting payment method", error });
  }
};
