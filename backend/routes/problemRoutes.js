const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getProblems,
  addProblem,
  updateProblem,
  deleteProblem,
} = require("../controllers/problemController");

// Get all problems
router.get("/", protect, getProblems);

// Add a new problem
router.post("/", protect, addProblem);

// Update a problem
router.put("/:id", protect, updateProblem);

// Delete a problem
router.delete("/:id", protect, deleteProblem);

module.exports = router;