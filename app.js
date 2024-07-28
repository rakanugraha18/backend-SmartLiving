require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const sequelize = require("./config/database");

// Middleware untuk parsing body request
app.use(express.json());

// Middleware untuk menangani CORS (jika diperlukan)
app.use(cors());

// Gunakan rute customer dan admin
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);

// Middleware untuk penanganan kesalahan secara global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Sinkronisasi model dengan database
sequelize
  .sync({ alter: true })
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
