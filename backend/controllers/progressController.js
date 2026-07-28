const UserProgress = require("../models/UserProgress");
const Problem = require("../models/Problem");

// GET all problems with user progress
const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().sort({ topic: 1 });

    const progress = await UserProgress.find({
      userId: req.user._id,
    });

    const progressMap = {};

    progress.forEach((item) => {
      progressMap[item.problemId.toString()] = item;
    });

    const result = problems.map((problem) => ({
      ...problem.toObject(),
      solved: progressMap[problem._id]?.solved || false,
      bookmarked: progressMap[problem._id]?.bookmarked || false,
      attempts: progressMap[problem._id]?.attempts || 0,
    }));

    res.json(result);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Toggle solved status
const toggleSolved = async (req, res) => {
  try {
    const { problemId } = req.params;

    let progress = await UserProgress.findOne({
      userId: req.user._id,
      problemId,
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId: req.user._id,
        problemId,
        solved: true,
        solvedAt: new Date(),
        attempts: 1,
      });
    } else {
      progress.solved = !progress.solved;

      if (progress.solved) {
        progress.solvedAt = new Date();
      }

      progress.attempts += 1;

      await progress.save();
    }

    res.json(progress);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// GET topic-wise progress
const getTopicProgress = async (req, res) => {
  try {
    const problems = await Problem.find();

    const progress = await UserProgress.find({
      userId: req.user._id,
      solved: true,
    });

    const solvedSet = new Set(
      progress.map((item) => item.problemId.toString())
    );

    const topicMap = {};

    problems.forEach((problem) => {
      if (!topicMap[problem.topic]) {
        topicMap[problem.topic] = {
          topic: problem.topic,
          solved: 0,
          total: 0,
        };
      }

      topicMap[problem.topic].total++;

      if (solvedSet.has(problem._id.toString())) {
        topicMap[problem.topic].solved++;
      }
    });

    const result = Object.values(topicMap);

    res.status(200).json(result);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getProblems,
  toggleSolved,
  getTopicProgress,
};