const { OrderModel, OrderItemModel, ProductModel } = require("../models");

exports.getOrderByIdForUser = async (req, res) => {
  try {
    const { user_id, order_id } = req.params;

    // Mencari Order yang sesuai dengan user_id dan order_id
    const order = await OrderModel.findOne({
      where: { id: order_id, user_id },
      include: [
        {
          model: OrderItemModel,
          as: "order_Items",
          include: [{ model: ProductModel, as: "productOrder" }],
        },
      ],
    });

    // Jika Order tidak ditemukan
    if (!order) {
      return res
        .status(404)
        .json({ error: "Order not found or does not belong to this user" });
    }

    // Mengembalikan Order yang ditemukan
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mendapatkan semua Order untuk User
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const orders = await OrderModel.findAll({
      where: { user_id },
      include: [
        {
          model: OrderItemModel,
          as: "order_Items",
          include: [{ model: ProductModel, as: "productOrder" }],
        },
      ],
    });

    if (!orders) {
      return res.status(404).json({ error: "Orders not found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mengubah Status Order
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "completed", "shipped", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await OrderModel.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Menghapus Order
exports.deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    const order = await OrderModel.findByPk(order_id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    await order.destroy();
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
