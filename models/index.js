const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user")(sequelize, Sequelize);

const db = {
  User,
  sequelize,
  Sequelize,
};

module.exports = db;
