const express = require("express");
const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  getTopics,
  getQuestions,
  generateAITest,
  submitTest,
  getResults,
} = require("../controllers/testController");

// Existing database mock tests
router.get("/topics", protect, getTopics);
router.get("/questions", protect, getQuestions);

// AI-generated mock test
router.post(
  "/ai-generate",
  protect,
  generateAITest
);

// Submit test
router.post("/submit", protect, submitTest);

// Test history
router.get("/results", protect, getResults);

module.exports = router;