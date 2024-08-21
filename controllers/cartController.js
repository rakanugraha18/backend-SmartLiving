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
    const { product_id, quantity } = req.body; // Tidak ada discount di req.body karena diambil dari product

    // Validasi input
    if (!cart_id || !product_id || !quantity) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const product = await ProductModel.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Ambil nilai diskon dari produk
    const discount = product.discount || 0;

    // Temukan keranjang berdasarkan cart_id
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

    // Jika status keranjang adalah "completed", ubah menjadi "active"
    if (cart.status === "completed") {
      cart.status = "active";
      await cart.save();
    }

    // Periksa apakah produk sudah ada di keranjang
    const existingCartItem = await CartItemModel.findOne({
      where: {
        cart_id,
        product_id,
      },
    });

    if (existingCartItem) {
      // Jika produk sudah ada, perbarui kuantitasnya
      existingCartItem.quantity += quantity;
      existingCartItem.discount = discount; // Perbarui diskon dari produk
      await existingCartItem.save();
    } else {
      // Jika produk tidak ada, buat item keranjang baru
      await CartItemModel.create({
        cart_id,
        product_id,
        quantity,
        discount, // Simpan diskon dari produk
      });
    }

    // Hitung total_amount baru untuk keranjang dengan mempertimbangkan diskon
    const cartItems = await CartItemModel.findAll({
      where: { cart_id },
      include: [{ model: ProductModel, as: "productCart" }],
    });

    const newTotalAmount = cartItems.reduce((total, item) => {
      const itemPrice = item.productCart.price;
      const itemDiscount = item.discount || 0;
      const discountAmount = (itemPrice * itemDiscount) / 100;
      const finalPrice = itemPrice - discountAmount;
      return total + item.quantity * finalPrice;
    }, 0);

    // Perbarui total_amount di keranjang
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

// exports.checkoutCart = async (req, res) => {
//   const { userId } = req.params;
//   const { itemsToCheckout } = req.body; // Array ID item yang akan di-checkout

//   try {
//     // Temukan keranjang aktif berdasarkan ID pengguna
//     const cart = await CartModel.findOne({
//       where: {
//         user_id: userId,
//         status: "active",
//       },
//       include: [
//         {
//           model: CartItemModel,
//           as: "cartItems",
//           include: [{ model: ProductModel, as: "productCart" }],
//         },
//       ],
//     });

//     // Jika keranjang tidak ditemukan atau kosong
//     if (!cart || cart.cartItems.length === 0) {
//       return res.status(404).json({
//         message: "Keranjang kosong atau sudah di-checkout.",
//       });
//     }

//     // Filter item keranjang untuk hanya menyertakan yang perlu di-checkout
//     const itemsForCheckout = cart.cartItems.filter((item) =>
//       itemsToCheckout.includes(item.id)
//     );

//     if (itemsForCheckout.length === 0) {
//       return res.status(400).json({
//         message: "Tidak ada item yang dipilih untuk checkout.",
//       });
//     }

//     // Mulai transaksi untuk memastikan atomisitas
//     const transaction = await sequelize.transaction();

//     try {
//       // Hitung total_amount dan total discount
//       let totalAmount = 0;
//       let totalDiscount = 0;

//       const orderItems = itemsForCheckout.map((item) => {
//         const product = item.productCart;

//         // Hitung diskon dan harga setelah diskon
//         const discountAmount = product.discount
//           ? (product.price * product.discount) / 100
//           : 0;
//         const discountedPrice = product.price - discountAmount;

//         totalAmount += item.quantity * discountedPrice;
//         totalDiscount += item.quantity * discountAmount;

//         // Buat item pesanan
//         return {
//           order_id: null, // Will be set after order creation
//           product_id: product.id,
//           quantity: item.quantity,
//           price: discountedPrice, // Harga setelah diskon
//           discount: product.discount, // Diskon dalam persen
//         };
//       });

//       // Buat pesanan baru berdasarkan item yang dipilih di keranjang
//       const order = await OrderModel.create(
//         {
//           user_id: cart.user_id,
//           status: "pending",
//           total_amount: totalAmount,
//           discount: totalDiscount, // Tambahkan total discount di order
//         },
//         { transaction }
//       );

//       // Set order_id for each order item
//       orderItems.forEach((item) => (item.order_id = order.id));

//       // Masukkan item pesanan ke dalam database
//       await OrderItemModel.bulkCreate(orderItems, { transaction });

//       // Hapus item yang dipilih dari keranjang setelah dipindahkan ke pesanan
//       await CartItemModel.destroy(
//         {
//           where: {
//             id: itemsForCheckout.map((item) => item.id),
//             cart_id: cart.id,
//           },
//         },
//         { transaction }
//       );

//       // Periksa apakah masih ada item yang tersisa di keranjang
//       const remainingItems = await CartItemModel.count({
//         where: { cart_id: cart.id },
//         transaction,
//       });

//       if (remainingItems > 0) {
//         await cart.update({ status: "active" }, { transaction });
//       } else {
//         await cart.update({ status: "completed" }, { transaction });
//       }

//       // Commit transaksi
//       await transaction.commit();

//       res.status(200).json({
//         message: "Checkout berhasil dimulai. Menunggu pembayaran.",
//         order: {
//           ...order.toJSON(), // Mengembalikan semua atribut order
//           discount: totalDiscount, // Tambahkan diskon total ke response
//         },
//       });
//     } catch (error) {
//       await transaction.rollback();
//       console.error(error);
//       res.status(500).json({
//         message: "Checkout gagal.",
//         error: error.message,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Terjadi kesalahan saat checkout.",
//       error: error.message,
//     });
//   }
// };

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
      // Hitung total_amount dan total discount
      let totalAmount = 0;
      let totalDiscount = 0;

      const orderItems = itemsForCheckout.map((item) => {
        const product = item.productCart;

        // Hitung diskon dan harga setelah diskon
        const discountAmount = product.discount
          ? (product.price * product.discount) / 100
          : 0;
        const discountedPrice = product.price - discountAmount;

        totalAmount += item.quantity * discountedPrice;
        totalDiscount += item.quantity * discountAmount;

        // Buat item pesanan
        return {
          order_id: null, // Will be set after order creation
          product_id: product.id,
          quantity: item.quantity,
          price: discountedPrice, // Harga setelah diskon
          discount: product.discount, // Diskon dalam persen
        };
      });

      // Buat pesanan baru berdasarkan item yang dipilih di keranjang
      const order = await OrderModel.create(
        {
          user_id: cart.user_id,
          status: "pending",
          total_amount: totalAmount,
          discount: totalDiscount, // Tambahkan total discount di order
        },
        { transaction }
      );

      // Set order_id for each order item
      orderItems.forEach((item) => (item.order_id = order.id));

      // Masukkan item pesanan ke dalam database
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

      // Pengurangan stok produk
      for (const item of itemsForCheckout) {
        const product = await ProductModel.findByPk(item.product_id);
        if (product) {
          const newStock = product.stock - item.quantity;
          if (newStock < 0) {
            // Stok tidak mencukupi
            await transaction.rollback();
            return res.status(400).json({
              error: `Stok untuk produk ${product.id} tidak mencukupi`,
            });
          }
          // Update stok produk
          await product.update({ stock: newStock }, { transaction });
        }
      }

      // Periksa apakah masih ada item yang tersisa di keranjang
      const remainingItems = await CartItemModel.count({
        where: { cart_id: cart.id },
        transaction,
      });

      if (remainingItems > 0) {
        await cart.update({ status: "active" }, { transaction });
      } else {
        await cart.update({ status: "completed" }, { transaction });
      }

      // Commit transaksi
      await transaction.commit();

      res.status(200).json({
        message: "Checkout berhasil dimulai. Menunggu pembayaran.",
        order: {
          ...order.toJSON(), // Mengembalikan semua atribut order
          discount: totalDiscount, // Tambahkan diskon total ke response
        },
      });
    } catch (error) {
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
