const {
  OrderModel,
  OrderItemModel,
  ProductModel,
  PaymentMethodModel,
  AddressModel,
  UserModel,
} = require("../models");

exports.getOrderByIdForUser = async (req, res) => {
  try {
    const { user_id, order_id } = req.params;

    // Mencari Order yang sesuai dengan user_id dan order_id
    const order = await OrderModel.findOne({
      where: { id: order_id, user_id },
      include: [
        {
          model: UserModel,
          as: "user_order", // Menggunakan alias yang sesuai
        },
        {
          model: OrderItemModel,
          as: "order_Items",
          include: [{ model: ProductModel, as: "productOrder" }],
        },
        {
          model: PaymentMethodModel,
          as: "paymentMethod", // Menggunakan alias yang sesuai
        },
        {
          model: AddressModel,
          as: "address", // Menggunakan alias yang sesuai
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
    res.status(200).json({
      order: {
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        discount: order.discount,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user_order: {
          id: order.user_order.id,
          first_name: order.user_order.first_name,
          lash_name: order.user_order.last_name,
          phone_number: order.user_order.phone_number,
        },
        order_Items: order.order_Items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          productOrder: {
            id: item.productOrder.id,
            name: item.productOrder.name,
            price: item.productOrder.price,
            image: item.productOrder.image,
          },
        })),
        paymentMethod: order.paymentMethod
          ? {
              id: order.paymentMethod.id,
              type: order.paymentMethod.type,
              selectedBank: order.paymentMethod.selectedBank,
              account_number: order.paymentMethod.account_number,
              expiry_date: order.paymentMethod.expiry_date,
            }
          : null,
        address: order.address
          ? {
              id: order.address.id,
              address_name: order.address.address_name,
              province: order.address.province,
              city: order.address.city,
              subdistrict: order.address.subdistrict,
              villages: order.address.villages,
              postal_code: order.address.postal_code,
              phone_number: order.address.phone_number,
              full_address: order.address.full_address,
            }
          : null,
      },
    });
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

exports.updateOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  const { addressId, addressData, paymentMethodId, status } = req.body;

  try {
    // Temukan pesanan berdasarkan ID
    const order = await OrderModel.findByPk(orderId);

    // Jika pesanan tidak ditemukan
    if (!order) {
      return res.status(404).json({
        message: "Pesanan tidak ditemukan.",
      });
    }

    // Periksa apakah payment method valid
    if (paymentMethodId) {
      const paymentMethod = await PaymentMethodModel.findByPk(paymentMethodId);

      if (!paymentMethod) {
        return res.status(400).json({
          message: "Metode pembayaran tidak valid.",
        });
      }
    }

    // Jika addressData diberikan, perbarui atau buat alamat baru
    if (addressData) {
      let address;
      if (addressId) {
        // Jika addressId disediakan, perbarui alamat yang ada
        address = await AddressModel.findByPk(addressId);

        if (!address) {
          return res.status(404).json({
            message: "Alamat tidak ditemukan.",
          });
        }

        await address.update(addressData);
      } else {
        // Jika addressId tidak disediakan, buat alamat baru
        address = await AddressModel.create({
          ...addressData,
          user_id: order.user_id, // Asumsikan user_id diambil dari pesanan
        });
      }

      // Update alamat pada pesanan
      await order.update({ address_id: address.id });
    }

    // Perbarui metode pembayaran pada pesanan jika diberikan
    if (paymentMethodId) {
      await order.update({ payment_method_id: paymentMethodId });
    }

    // Periksa peran pengguna dan batasi status yang dapat diperbarui
    if (req.user.role === "customer") {
      if (status && ["pending", "waiting for payment"].includes(status)) {
        await order.update({ status: status });
      } else {
        return res.status(403).json({
          message:
            "Customer hanya dapat memperbarui status ke 'pending' atau 'waiting for payment'.",
        });
      }
    } else if (req.user.role === "admin") {
      if (status) {
        await order.update({ status: status });
      }
    } else {
      return res.status(403).json({
        message: "Akses ditolak.",
      });
    }

    res.status(200).json({
      message: "Detail pesanan berhasil diperbarui.",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat memperbarui pesanan.",
      error: error.message,
    });
  }
};
