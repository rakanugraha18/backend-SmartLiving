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

OrderModel.belongsTo(UserModel, { as: "user_order", foreignKey: "user_id" });
UserModel.hasMany(OrderModel, { foreignKey: "user_id" });

OrderModel.hasMany(OrderItemModel, {
  as: "order_Items",
  foreignKey: "order_id",
});
OrderItemModel.belongsTo(OrderModel, { foreignKey: "order_id" });

OrderItemModel.belongsTo(ProductModel, {
  as: "productOrder",
  foreignKey: "product_id",
});
ProductModel.hasMany(OrderItemModel, { foreignKey: "product_id" });

UserModel.hasMany(AddressModel, { foreignKey: "user_id" });
AddressModel.belongsTo(UserModel, { foreignKey: "user_id" });

OrderModel.belongsTo(AddressModel, { as: "address", foreignKey: "address_id" });
AddressModel.hasMany(OrderModel, { foreignKey: "address_id" });

UserModel.hasMany(PaymentMethodModel, { foreignKey: "User_id" });
PaymentMethodModel.belongsTo(UserModel, { foreignKey: "User_id" });

OrderModel.belongsTo(PaymentMethodModel, {
  as: "paymentMethod",
  foreignKey: "payment_method_id",
});
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

// const ProductModel = require("./ProductModel");
// const ProductImage = require("./ProductImage");
// const UserModel = require("./UserModel");
// const CartModel = require("./CartModel");
// const CartItemModel = require("./CartItemModel");
// const OrderItemModel = require("./OrderItemModel");
// const OrderModel = require("./OrderModel");
// const AddressModel = require("./AddressModel");
// const PaymentMethodModel = require("./PaymentMethodModel");

// ProductModel.hasMany(ProductImage, { as: "images", foreignKey: "product_id" });
// ProductImage.belongsTo(ProductModel, { foreignKey: "product_id" });

// UserModel.hasOne(CartModel, { foreignKey: "user_id" });
// CartModel.belongsTo(UserModel, { foreignKey: "user_id" });

// CartModel.hasMany(CartItemModel, { as: "cartItems", foreignKey: "cart_id" });
// CartItemModel.belongsTo(CartModel, { as: "cart", foreignKey: "cart_id" });

// CartItemModel.belongsTo(ProductModel, {
//   as: "productCart",
//   foreignKey: "product_id",
// });
// ProductModel.hasMany(CartItemModel, { foreignKey: "product_id" });

// OrderModel.belongsTo(UserModel, { as: "user_order", foreignKey: "user_id" });
// UserModel.hasMany(OrderModel, { foreignKey: "user_id" });

// OrderModel.hasMany(OrderItemModel, {
//   as: "order_Items",
//   foreignKey: "order_id",
// }); // alias "order_Items"
// OrderItemModel.belongsTo(OrderModel, { foreignKey: "order_id" });

// OrderItemModel.belongsTo(ProductModel, {
//   as: "productOrder",
//   foreignKey: "product_id",
// });
// ProductModel.hasMany(OrderItemModel, { foreignKey: "product_id" });

// UserModel.hasMany(AddressModel, { foreignKey: "user_id" });
// AddressModel.belongsTo(UserModel, { foreignKey: "user_id" });

// OrderModel.belongsTo(AddressModel, { as: "address", foreignKey: "address_id" });
// AddressModel.hasMany(OrderModel, { foreignKey: "address_id" });

// UserModel.hasMany(PaymentMethodModel, { foreignKey: "User_id" });
// PaymentMethodModel.belongsTo(UserModel, { foreignKey: "User_id" });

// OrderModel.belongsTo(PaymentMethodModel, {
//   as: "paymentMethod",
//   foreignKey: "payment_method_id",
// });
// PaymentMethodModel.hasMany(OrderModel, { foreignKey: "payment_method_id" });

// module.exports = {
//   ProductModel,
//   ProductImage,
//   UserModel,
//   CartModel,
//   CartItemModel,
//   OrderItemModel,
//   OrderModel,
//   AddressModel,
//   PaymentMethodModel,
// };
