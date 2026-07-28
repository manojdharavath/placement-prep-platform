const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getAIDashboard,
} = require("../controllers/aiDashboardController");

router.get("/", protect, getAIDashboard);

module.exports = router;