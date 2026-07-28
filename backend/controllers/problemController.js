const Problem = require("../models/Problem");

// =============================
// GET All Problems
// =============================
const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ id: 1 });

    res.status(200).json(problems);
  } catch (error) {
    console.error("Get Problems Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =============================
// ADD Problem (Admin Only)
// =============================
const addProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);

    res.status(201).json(problem);
  } catch (error) {
    console.error("Add Problem Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =============================
// UPDATE Problem
// =============================
const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error("Update Problem Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// =============================
// DELETE Problem
// =============================
const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndDelete(
      req.params.id
    );

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.status(200).json({
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.error("Delete Problem Error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getProblems,
  addProblem,
  updateProblem,
  deleteProblem,
};