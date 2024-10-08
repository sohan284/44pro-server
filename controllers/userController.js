const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { getDB } = require("../config/db");
const nodemailer = require("nodemailer"); // Import nodemailer for sending emails
const crypto = require("crypto"); // To generate random OTP

let otpStore = {}; // In-memory storage for OTPs (consider a better storage solution for production)

const transporter = nodemailer.createTransport({
  service: "gmail", // Or any email service you prefer
  auth: {
    user: "srsohan284@gmail.com", // Your email
    pass: "srsohan01788175088", // Your email password
  },
});

const getUserList = async (req, res) => {
  try {
    const usersCollection = getDB("44pro").collection("users");
    const users = await usersCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const usersCollection = getDB("44pro").collection("users");
    const result = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user",
      message: error.message,
    });
  }
};

const upsertUser = async (req, res) => {
  try {
    const usersCollection = getDB("44pro").collection("users");
    const { name, email, password } = req.body;

    const filter = { email };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        name,
        email,
        password,
      },
    };

    const result = await usersCollection.updateOne(filter, updateDoc, options);
    const userId = result.upsertedId
      ? result.upsertedId._id
      : (await usersCollection.findOne(filter))._id;

    const token = jwt.sign(
      {
        userId: userId,
        email: email,
        name: name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      data: result,
      token,
      message: "User upserted and token generated successfully",
    });
  } catch (error) {
    console.error("Error upserting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upsert user",
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const usersCollection = getDB("44pro").collection("users");
  try {
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to log in user",
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const usersCollection = getDB("44pro").collection("users");
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Generate a random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Store OTP in memory (consider a database for production)
  otpStore[email] = { otp, createdAt: Date.now() };

  const mailOptions = {
    from: "srsohan284@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Failed to send OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Check if OTP exists and is valid
  if (!otpStore[email]) {
    return res
      .status(400)
      .json({ success: false, message: "No OTP sent or expired" });
  }

  const storedOtpData = otpStore[email];
  const otpCreatedAt = storedOtpData.createdAt;

  // Check if OTP is expired (10 minutes)
  if (Date.now() - otpCreatedAt > 10 * 60 * 1000) {
    delete otpStore[email]; // Clean up expired OTP
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (storedOtpData.otp !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  // Clear OTP after verification
  delete otpStore[email];

  res.status(200).json({ success: true, message: "OTP verified successfully" });
};

module.exports = {
  getUserList,
  upsertUser,
  getSingleUser,
  deleteUser,
  loginUser,
  sendOtp,
  verifyOtp,
};
