const { sequelize } = require("../config/database");

async function removeConstraints() {
  try {
    await sequelize.query("ALTER TABLE `Users` DROP INDEX `email`;");
    await sequelize.query("ALTER TABLE `Users` DROP INDEX `phone_number`;");
    console.log("Constraints removed.");
  } catch (error) {
    console.error("Error removing constraints:", error);
  }
}

async function addConstraints() {
  try {
    await sequelize.query("ALTER TABLE `Users` ADD UNIQUE (`email`);");
    await sequelize.query("ALTER TABLE `Users` ADD INDEX (`phone_number`);");
    console.log("Constraints added back.");
  } catch (error) {
    console.error("Error adding constraints:", error);
  }
}

async function syncDatabase() {
  try {
    await removeConstraints();
    await sequelize.sync({ alter: true });
    console.log("Database & tables updated!");
    await addConstraints();
  } catch (error) {
    console.error("Error syncing database:", error);
  }
}

syncDatabase();
