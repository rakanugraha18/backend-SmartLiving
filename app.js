require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRouter = require("./routes/productRouter");
const sequelize = require("./config/database");
const UserModel = require("./models/UserModel");
const ProductModel = require("./models/ProductModel");
const ProductImage = require("./models/ProductImage");

// Middleware for parsing request body
app.use(express.json());

// Middleware to handle CORS (if needed)
app.use(cors());

// Use customer and admin routes
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/", productRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Sync models with the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database & tables created or updated!");
  })
  .catch((err) => {
    console.error("Unable to create or update tables, shutting down...", err);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
