// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const UserModel = require("./UserModel");

// const CartModel = sequelize.define(
//   "CartModel",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       references: {
//         model: UserModel,
//         key: "id",
//       },
//       allowNull: false,
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
//     tableName: "Carts",
//     timestamps: false,
//   }
// );

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartModel = sequelize.define(
  "CartModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "pending"),
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
  },
  {
    tableName: "Carts",
    timestamps: false, // Menggunakan kolom created_at dan updated_at secara manual
  }
);

// CartModel.associate = function (models) {
//   CartModel.hasMany(models.CartItemModel, {
//     foreignKey: "cart_id",
//     as: "cartItems",
//   });
// };

// Menambahkan pemanggilan sync
async function createTableIfNotExists() {
  try {
    // Sinkronkan model dengan database
    await CartModel.sync({ force: false });

    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table:", err.message);
  }
}

createTableIfNotExists();

module.exports = CartModel;
