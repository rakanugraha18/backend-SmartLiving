const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const UserModel = require("./UserModel");
const OrderModel = require("./OrderModel");

const AddressModel = sequelize.define(
  "AddressModel",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    address_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subdistrict: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    villages: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        isNumeric: true,
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UserModel,
        key: "id",
      },
    },
  },
  {
    tableName: "Addresses",
    timestamps: false,
  }
);

// Sinkronisasi model dengan database
async function createTableIfNotExists() {
  try {
    await AddressModel.sync({ force: false });
    console.log("Tabel berhasil dibuat");
  } catch (err) {
    console.error("Error membuat tabel:", err.message);
  }
}

createTableIfNotExists();

module.exports = AddressModel;
