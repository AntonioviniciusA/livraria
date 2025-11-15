const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Public
router.post("/login", authController.login);
router.post("/register", authController.register);
router.get("/profile", authController.getUserProfile);
module.exports = router;
