const ProductModel = require("./ProductModel");
const ProductImage = require("./ProductImage");
const UserModel = require("./UserModel");
const CartModel = require("./CartModel");
const CartItemModel = require("./CartItemModel");
const OrderItemModel = require("./OrderItemModel");
const OrderModel = require("./OrderModel");
const AddressModel = require("./AddressModel");
const PaymentMethodModel = require("./PaymentMethodModel");

// Define associations
ProductModel.hasMany(ProductImage, { as: "images", foreignKey: "product_id" });
ProductImage.belongsTo(ProductModel, { foreignKey: "product_id" });

UserModel.hasOne(CartModel, { foreignKey: "user_id" });
CartModel.belongsTo(UserModel, { foreignKey: "user_id" });

CartModel.hasMany(CartItemModel, { as: "cartItems", foreignKey: "cart_id" });
CartItemModel.belongsTo(CartModel, { as: "cart", foreignKey: "cart_id" });

CartItemModel.belongsTo(ProductModel, {
  as: "productCart",
  foreignKey: "product_id",
});
ProductModel.hasMany(CartItemModel, { foreignKey: "product_id" });

// Relasi Order dan User
OrderModel.belongsTo(UserModel, { foreignKey: "user_id" });
UserModel.hasMany(OrderModel, { foreignKey: "user_id" });

// Relasi Order dan OrderItem
OrderModel.hasMany(OrderItemModel, {
  as: "order_Items",
  foreignKey: "order_id",
});
OrderItemModel.belongsTo(OrderModel, { foreignKey: "order_id" });

// Relasi OrderItem dan Product
OrderItemModel.belongsTo(ProductModel, {
  as: "productOrder",
  foreignKey: "product_id",
});
ProductModel.hasMany(OrderItemModel, {
  foreignKey: "product_id",
});

// Relasi antara UserModel dan AddressModel
UserModel.hasMany(AddressModel, { foreignKey: "user_id" });
AddressModel.belongsTo(UserModel, { foreignKey: "user_id" });

// Relasi antara OrderModel dan AddressModel
OrderModel.belongsTo(AddressModel, { foreignKey: "address_id" });
AddressModel.hasMany(OrderModel, { foreignKey: "address_id" });

// Define PaymentMethod associations
UserModel.hasMany(PaymentMethodModel, { foreignKey: "User_id" });
PaymentMethodModel.belongsTo(UserModel, { foreignKey: "User_id" });

OrderModel.belongsTo(PaymentMethodModel, { foreignKey: "payment_method_id" });
PaymentMethodModel.hasMany(OrderModel, { foreignKey: "payment_method_id" });

module.exports = {
  ProductModel,
  ProductImage,
  UserModel,
  CartModel,
  CartItemModel,
  OrderItemModel,
  OrderModel,
  AddressModel,
  PaymentMethodModel,
};
