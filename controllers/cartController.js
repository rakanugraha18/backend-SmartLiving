const { Op } = require("sequelize");
const sequelize = require("../config/database");

const {
  OrderModel,
  OrderItemModel,
  CartModel,
  CartItemModel,
  ProductModel,
} = require("../models");

exports.getCartByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const statuses = ["active"];
    const carts = await Promise.all(
      statuses.map(async (status) => {
        return await CartModel.findOne({
          where: {
            user_id,
            status,
          },
          include: [
            {
              model: CartItemModel,
              as: "cartItems",
              include: [
                {
                  model: ProductModel,
                  as: "productCart",
                },
              ],
            },
          ],
        });
      })
    );

    const response = statuses.reduce((acc, status, index) => {
      if (carts[index]) {
        acc[status] = carts[index];
      } else {
        acc[status] = `No ${status} cart found`;
      }
      return acc;
    }, {});

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCartById = async (req, res) => {
  try {
    const { cart_id } = req.params;

    const cart = await CartModel.findOne({
      where: {
        id: cart_id,
      },
      include: [
        {
          model: CartItemModel,
          as: "cartItems",
          include: [
            {
              model: ProductModel,
              as: "productCart",
            },
          ],
        },
      ],
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCartItemsByCartId = async (req, res) => {
  try {
    const { cart_id } = req.params;

    const cartItems = await CartItemModel.findAll({
      where: {
        cart_id,
      },
      include: [
        {
          model: ProductModel,
          as: "productCart",
        },
      ],
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ error: "No items found in this cart" });
    }

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Check if there's an existing active cart for the user
    const existingCart = await CartModel.findOne({
      where: { user_id, status: "active" },
    });

    // If an active cart already exists, return it and don't create a new one
    if (existingCart) {
      return res
        .status(200)
        .json({ message: "Active cart already exists", cart: existingCart });
    }

    // If no active cart exists, create a new one
    const newCart = await CartModel.create({ user_id, status: "active" });

    res
      .status(201)
      .json({ message: "Cart created successfully", cart: newCart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addItemToCart = async (req, res) => {
  try {
    const { cart_id } = req.params;
    const { product_id, quantity } = req.body;

    if (!cart_id || !product_id || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await ProductModel.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find the cart by cart_id
    const cart = await CartModel.findOne({
      where: {
        id: cart_id,
        status: {
          [Op.or]: ["active", "pending", "completed"],
        },
      },
    });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // If the cart's status is "completed", change it to "active"
    if (cart.status === "completed") {
      cart.status = "active";
      await cart.save();
    }

    // Check if the product already exists in the cart
    const existingCartItem = await CartItemModel.findOne({
      where: {
        cart_id,
        product_id,
      },
    });

    let newTotalAmount = 0;

    if (existingCartItem) {
      // If the product already exists, update its quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
    } else {
      // If the product does not exist, create a new cart item
      await CartItemModel.create({
        cart_id,
        product_id,
        quantity,
      });
    }

    // Calculate the new total amount for the cart
    const cartItems = await CartItemModel.findAll({
      where: { cart_id },
      include: [{ model: ProductModel, as: "productCart" }],
    });

    newTotalAmount = cartItems.reduce((total, item) => {
      return total + item.quantity * item.productCart.price;
    }, 0);

    // Update the total amount in the cart
    await cart.update({
      total_amount: newTotalAmount,
    });

    res.status(200).json({ message: "Item added successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { item_id } = req.params;
    const { quantity } = req.body;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0" });
    }

    // Find the cart item and include the associated cart
    const cartItem = await CartItemModel.findByPk(item_id, {
      include: [
        {
          model: CartModel,
          as: "cart",
          include: [
            {
              model: CartItemModel,
              as: "cartItems",
              include: [
                {
                  model: ProductModel,
                  as: "productCart",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    // Update the item quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    // Recalculate the total amount for the cart
    const cart = cartItem.cart;
    if (!cart || !cart.cartItems) {
      return res.status(500).json({ error: "Cart items not found" });
    }

    const totalAmount = cart.cartItems.reduce((total, item) => {
      if (item.productCart && item.productCart.price) {
        return total + item.quantity * item.productCart.price;
      }
      return total;
    }, 0);

    // Update the cart total amount
    await cart.update({ total_amount: totalAmount });

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const { item_id } = req.params;
    const cartItem = await CartItemModel.findByPk(item_id);

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Cart item removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteItemsCart = async (req, res) => {
  try {
    const { item_ids } = req.body; // Menggunakan req.body untuk menerima array item_ids

    const deletedItems = await CartItemModel.destroy({
      where: {
        id: item_ids,
      },
    });

    if (!deletedItems) {
      return res.status(404).json({ error: "No cart items found" });
    }

    res
      .status(200)
      .json({ message: "Selected cart items removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk checkout
exports.checkoutCart = async (req, res) => {
  const { userId } = req.params;
  const { itemsToCheckout } = req.body; // Array ID item yang akan di-checkout

  try {
    // Temukan keranjang aktif berdasarkan ID pengguna
    const cart = await CartModel.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
      include: [
        {
          model: CartItemModel,
          as: "cartItems",
          include: [{ model: ProductModel, as: "productCart" }],
        },
      ],
    });

    // Jika keranjang tidak ditemukan atau kosong
    if (!cart || cart.cartItems.length === 0) {
      return res.status(404).json({
        message: "Keranjang kosong atau sudah di-checkout.",
      });
    }

    // Filter item keranjang untuk hanya menyertakan yang perlu di-checkout
    const itemsForCheckout = cart.cartItems.filter((item) =>
      itemsToCheckout.includes(item.id)
    );

    if (itemsForCheckout.length === 0) {
      return res.status(400).json({
        message: "Tidak ada item yang dipilih untuk checkout.",
      });
    }

    // Mulai transaksi untuk memastikan atomisitas
    const transaction = await sequelize.transaction();

    try {
      // Buat pesanan baru berdasarkan item yang dipilih di keranjang
      const order = await OrderModel.create(
        {
          user_id: cart.user_id,
          status: "pending",
          total_amount: itemsForCheckout.reduce((total, item) => {
            return total + item.quantity * item.productCart.price;
          }, 0),
        },
        { transaction }
      );

      // Buat item pesanan berdasarkan item yang dipilih di keranjang
      const orderItems = itemsForCheckout.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.productCart.price,
      }));
      await OrderItemModel.bulkCreate(orderItems, { transaction });

      // Hapus item yang dipilih dari keranjang setelah dipindahkan ke pesanan
      await CartItemModel.destroy(
        {
          where: {
            id: itemsForCheckout.map((item) => item.id),
            cart_id: cart.id,
          },
        },
        { transaction }
      );

      // Periksa apakah masih ada item yang tersisa di keranjang
      const remainingItems = await CartItemModel.count({
        where: { cart_id: cart.id },
        transaction,
      });

      if (remainingItems > 0) {
        // Jika masih ada item yang tersisa, status keranjang tetap 'active'
        await cart.update({ status: "active" }, { transaction });
      } else {
        // Jika tidak ada item yang tersisa, ubah status keranjang menjadi 'completed'
        await cart.update({ status: "completed" }, { transaction });
      }

      // Commit transaksi
      await transaction.commit();

      res.status(200).json({
        message: "Checkout berhasil dimulai. Menunggu pembayaran.",
        order,
      });
    } catch (error) {
      // Rollback transaksi jika terjadi kesalahan
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        message: "Checkout gagal.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Terjadi kesalahan saat checkout.",
      error: error.message,
    });
  }
};
