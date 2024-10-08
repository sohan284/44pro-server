const express = require("express");
const {
  upsertUser,
  getUserList,
  getSingleUser,
  deleteUser,
  loginUser,
  sendOtp,
  verifyOtp,
} = require("../controllers/userController");

const router = express.Router();

// User Routes
router.get("/users", getUserList);
router.get("/users/:id", getSingleUser);
router.post("/users", upsertUser);
router.delete("/users/:id", deleteUser);

// Login Route
router.post("/login", loginUser);

// OTP Routes
router.post("/send-otp", sendOtp); // Route to send OTP
router.post("/verify-otp", verifyOtp); // Route to verify OTP

module.exports = router;
