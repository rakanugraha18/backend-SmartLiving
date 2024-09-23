const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const ProductModel = require("./ProductModel"); // Ensure correct import

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "products",
        key: "id",
      },
    },
  },
  {
    tableName: "product_images",
    timestamps: false,
  }
);

ProductImage.associate = function (models) {
  ProductImage.belongsTo(ProductModel, {
    foreignKey: "product_id",
    as: "product",
  });
};

// Menambahkan pemanggilan sync
async function createTableIfNotExists() {
  try {
    // Sinkronkan model dengan database
    await ProductModel.sync({ force: false });

    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table:", err.message);
  }
}

createTableIfNotExists();

module.exports = ProductImage;
