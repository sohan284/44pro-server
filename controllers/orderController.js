const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const getOrders = async (req, res) => {
  try {
    const ordersCollection = getDB("44pro").collection("orders");
    const result = await ordersCollection.find().toArray();
    res.status(200).json({
      success: true,
      data: result,
      message: "Order retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching Order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch Order",
      message: error.message,
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const data = req.body;
    const ordersCollection = getDB("44pro").collection("orders");
    const result = await ordersCollection.insertOne(data);
    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...data },
      message: "Note created successfully",
    });
  } catch (error) {
    console.error("Error creating Note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};

module.exports = {
  getOrders,
  createOrder,
};
