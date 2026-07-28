const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    solved: {
      type: Boolean,
      default: false,
    },

    solvedAt: {
      type: Date,
      default: null,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    bookmarked: {
      type: Boolean,
      default: false,
    },

    revisionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userProgressSchema.index(
  {
    userId: 1,
    problemId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);