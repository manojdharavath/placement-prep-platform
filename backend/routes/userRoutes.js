const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  completeProfile,
  getProfile,
} = require("../controllers/userController");

router.put("/setup", protect, completeProfile);

router.get("/profile", protect, getProfile);

module.exports = router;