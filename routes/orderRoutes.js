const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");

const router = express.Router();

// Route for creating payment intent
router.get("/orders", getOrders);
router.post("/orders", createOrder);

module.exports = router;
