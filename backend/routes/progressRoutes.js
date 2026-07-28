const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getProblems,
  toggleSolved,
  getTopicProgress,
} = require("../controllers/progressController");

// Get all DSA problems
router.get("/", protect, getProblems);

// Get topic-wise progress
router.get("/progress", protect, getTopicProgress);

// Toggle solved status
router.put("/:problemId", protect, toggleSolved);

module.exports = router;