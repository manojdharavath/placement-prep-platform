const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      enum: [
        "JavaScript", "Data Structures", "Algorithms",
        "System Design", "Database", "Operating Systems",
        "Computer Networks", "OOP Concepts",
      ],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [(val) => val.length === 4, "Must have exactly 4 options"],
    },
    correctAnswer: {
      type: Number, // index: 0, 1, 2, or 3
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;