const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Public
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get("/check", authController.checkAuth);
router.get("/profile", authController.getUserProfile);
module.exports = router;
