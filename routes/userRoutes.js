const express = require("express");
const { upsertUser, getUserList, getSingleUser, deleteUser, loginUser } = require("../controllers/userController");


const router = express.Router();

router.get("/users", getUserList);
router.get("/users/:id", getSingleUser);
router.post("/users", upsertUser);
router.delete("/users/:id", deleteUser);

router.post("/login", loginUser);

module.exports = router;
