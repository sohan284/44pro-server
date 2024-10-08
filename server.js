const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const port = 5000;

// Import routes
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); // Import payment routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use routes
app.use("/", userRoutes, orderRoutes);
app.use("/api/payments", paymentRoutes); // Use payment routes with the /api/payments prefix

// Base route
app.get("/", (req, res) => {
  res.send("Hello From 44pro!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Export the Express app
module.exports = app;
