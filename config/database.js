const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("smartliving", "root", "12345678", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
