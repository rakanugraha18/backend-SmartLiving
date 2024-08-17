// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const CartModel = require("./CartModel");
// const ProductModel = require("./ProductModel");

// const CartItemModel = sequelize.define(
//   "CartItemModel",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     cart_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: CartModel,
//         key: "id",
//       },
//       allowNull: false,
//     },
//     product_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: ProductModel,
//         key: "id",
//       },
//       allowNull: false,
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//       validate: {
//         min: 1,
//         isInt: true,
//       },
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//     updated_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     tableName: "CartItems",
//     timestamps: false,
//   }
// );

// // Relasi dengan CartModel dan ProductModel
// CartItemModel.associate = function (models) {
//   CartItemModel.belongsTo(CartModel, {
//     foreignKey: "cart_id",
//     as: "cart",
//   });
//   CartItemModel.belongsTo(ProductModel, {
//     foreignKey: "product_id",
//     as: "productCart",
//   });
// };

// // Hook untuk memperbarui updated_at
// CartItemModel.beforeUpdate((cartItem, options) => {
//   cartItem.updated_at = new Date();
// });

// // Menambahkan pemanggilan sync
// async function createTableIfNotExists() {
//   try {
//     // Sinkronkan model dengan database
//     await CartItemModel.sync({ force: false });

//     console.log("Table created successfully");
//   } catch (err) {
//     console.error("Error creating table:", err.message);
//   }
// }

// createTableIfNotExists();

// module.exports = CartItemModel;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const CartModel = require("./CartModel");
const ProductModel = require("./ProductModel");

const CartItemModel = sequelize.define(
  "CartItemModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CartModel,
        key: "id",
      },
      onDelete: "CASCADE", // Jika Cart dihapus, CartItem juga dihapus
      onUpdate: "CASCADE", // Update ID di Cart akan mengupdate cart_id di CartItem
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ProductModel,
        key: "id",
      },
      onDelete: "CASCADE", // Jika Product dihapus, CartItem juga dihapus
      onUpdate: "CASCADE", // Update ID di Product akan mengupdate product_id di CartItem
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "CartItems",
    timestamps: false,
  }
);

// Relasi dengan CartModel dan ProductModel
// CartItemModel.associate = function (models) {
//   CartItemModel.belongsTo(models.CartModel, {
//     foreignKey: "cart_id",
//     as: "cart",
//   });
//   CartItemModel.belongsTo(models.ProductModel, {
//     foreignKey: "product_id",
//     as: "productCart",
//   });
// };

// Hook untuk memperbarui updated_at
CartItemModel.beforeUpdate((cartItem, options) => {
  cartItem.updated_at = new Date();
});

// Menambahkan pemanggilan sync
async function createTableIfNotExists() {
  try {
    // Sinkronkan model dengan database
    await CartItemModel.sync({ force: false });

    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table:", err.message);
  }
}

createTableIfNotExists();

module.exports = CartItemModel;
