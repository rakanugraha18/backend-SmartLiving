require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRouter = require("./routes/productRouter");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const addressRouter = require("./routes/addressRoutes");
const paymentMethodRouter = require("./routes/paymentMethodRoutes");
const sequelize = require("./config/database");

// Middleware for parsing request body
app.use(express.json());

// Middleware to handle CORS (if needed)
app.use(cors());

// Use customer and admin routes
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/address", addressRouter);
app.use("/api/payment-method", paymentMethodRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database & tables updated!");
  } catch (error) {
    console.error("Error syncing database:", error);
    process.exit(1); // Exit if there's an error during sync
  }
}

// Call syncDatabase before starting the server
syncDatabase().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

module.exports = app;
