const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const UserModel = require("./UserModel");
const AddressModel = require("./AddressModel");
const PaymentMethodModel = require("./PaymentMethodModel");
const OrderItemModel = require("./OrderItemModel");

const OrderModel = sequelize.define(
  "OrderModel",
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
      type: DataTypes.ENUM(
        "pending",
        "waiting for payment",
        "completed",
        "shipped",
        "cancelled"
      ),
      defaultValue: "pending",
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0.0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
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
  },
  {
    tableName: "Orders",
    timestamps: false,
  }
);

// OrderModel.belongsTo(UserModel, { foreignKey: "User_id" });
// OrderModel.belongsTo(AddressModel, { as: "address", foreignKey: "address_id" });
// OrderModel.belongsTo(PaymentMethodModel, {
//   as: "paymentMethod",
//   foreignKey: "payment_method_id",
// });
// OrderModel.hasMany(OrderItemModel, {
//   as: "order_Items",
//   foreignKey: "order_id",
// });

module.exports = OrderModel;
