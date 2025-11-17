const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Public
router.post("/login", authController.login);
router.post("/register", authenticate, authController.register);
router.get("/profile", authenticate, authController.getUserProfile);
module.exports = router;
