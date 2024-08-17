const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const PaymentMethodModel = sequelize.define(
  "PaymentMethodModel",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    selectedBank: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expiry_date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: "PaymentMethodModel",
    tableName: "payment_method",
    timestamps: true,
  }
);

// Menambahkan pemanggilan sync
async function createTableIfNotExists() {
  try {
    // Sinkronkan model dengan database
    await PaymentMethodModel.sync({ force: false });

    console.log("Table created successfully");
  } catch (err) {
    console.error("Error creating table:", err.message);
  }
}

createTableIfNotExists();

module.exports = PaymentMethodModel;
