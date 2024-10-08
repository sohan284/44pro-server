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

const updateNote = async (req, res) => {
  const statusId = req.params.id;
  const { title, txColor, bgColor, description } = req.body;

  // Check if the ID is valid
  if (!ObjectId.isValid(statusId)) {
    console.error("Invalid status ID:", statusId);
    return res.status(400).json({
      success: false,
      message: "Invalid status ID",
    });
  }

  // Validate that only title and color fields are allowed
  const allowedFields = ["title", "txColor", "bgColor", "description"];
  const invalidFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key)
  );
  if (invalidFields.length > 0) {
    console.error("Invalid fields in request body:", invalidFields);
    return res.status(400).json({
      success: false,
      message: "Invalid fields in request body: " + invalidFields.join(", "),
    });
  }

  try {
    const statusesCollection = getDB("taskify").collection("notes");
    const updateFields = {};

    // Update fields only if they are provided in the request body
    if (title !== undefined) updateFields.title = title;
    if (txColor !== undefined) updateFields.txColor = txColor;
    if (bgColor !== undefined) updateFields.bgColor = bgColor;
    if (description !== undefined) updateFields.description = description;

    const result = await statusesCollection.updateOne(
      { _id: new ObjectId(statusId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      console.error("Status not found:", statusId);
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};
const deleteNote = async (req, res) => {
  const statusId = req.params.id;

  try {
    const notesCollection = getDB("taskify").collection("notes");
    const result = await notesCollection.deleteOne({
      _id: new ObjectId(statusId),
    });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "notes deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "notes not found",
      });
    }
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};

module.exports = {
  getOrders,
  createOrder,
};
