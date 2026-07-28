const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    totalQuestions: Number,
    correctAnswers: Number,
    score: Number, // percentage
    timeTaken: Number, // seconds
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: Number,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;