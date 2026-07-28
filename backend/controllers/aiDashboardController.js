const User = require("../models/User");
const Problem = require("../models/Problem");
const UserProgress = require("../models/UserProgress");
const Result = require("../models/Result");
const InterviewResult = require("../models/InterviewResult");

// ==========================================
// AI DASHBOARD
// ==========================================

// @desc    Get dashboard statistics
// @route   GET /api/ai-dashboard
// @access  Private

const getAIDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // ==========================================
    // FETCH DATA
    // ==========================================

    const [
      user,
      totalProblems,
      dsaProgressRecords,
      mockResults,
      interviewResults,
    ] = await Promise.all([
      User.findById(userId).select("name"),

      Problem.countDocuments(),

      UserProgress.find({
        userId,
        solved: true,
      }),

      Result.find({ userId }).select("score"),

      InterviewResult.find({ userId }).select(
        "overallScore"
      ),
    ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // ==========================================
    // DSA STATISTICS
    // ==========================================

    const solvedProblems = dsaProgressRecords.length;

    const dsaProgress =
      totalProblems === 0
        ? 0
        : Math.round(
            (solvedProblems / totalProblems) * 100
          );

    // ==========================================
    // MOCK TEST STATISTICS
    // ==========================================

    const mockTestsCompleted = mockResults.length;

    const mockAverageScore =
      mockTestsCompleted === 0
        ? 0
        : Math.round(
            mockResults.reduce(
              (total, result) =>
                total + (Number(result.score) || 0),
              0
            ) / mockTestsCompleted
          );

    // ==========================================
    // INTERVIEW STATISTICS
    // ==========================================

    const interviewsCompleted =
      interviewResults.length;

    const interviewAverageScore =
      interviewsCompleted === 0
        ? 0
        : Math.round(
            interviewResults.reduce(
              (total, result) =>
                total +
                (Number(result.overallScore) || 0),
              0
            ) / interviewsCompleted
          );

    // ==========================================
    // PLACEMENT READINESS
    // ==========================================
    //
    // DSA          -> 40%
    // Mock Tests   -> 30%
    // Interviews   -> 30%
    //
    // If the student hasn't attempted mock tests
    // or interviews yet, those areas contribute 0.
    // ==========================================

    const placementReadiness = Math.round(
      dsaProgress * 0.4 +
        mockAverageScore * 0.3 +
        interviewAverageScore * 0.3
    );

    // ==========================================
    // SIMPLE SMART INSIGHT
    // ==========================================

    let aiInsight = "";

    if (
      solvedProblems === 0 &&
      mockTestsCompleted === 0 &&
      interviewsCompleted === 0
    ) {
      aiInsight =
        "Start by solving DSA problems, then use mock tests and AI interviews to measure your placement readiness.";
    } else {
      const areas = [
        {
          name: "DSA",
          score: dsaProgress,
        },
        {
          name: "Mock Tests",
          score: mockAverageScore,
        },
        {
          name: "Interviews",
          score: interviewAverageScore,
        },
      ];

      const strongest = [...areas].sort(
        (a, b) => b.score - a.score
      )[0];

      const weakest = [...areas].sort(
        (a, b) => a.score - b.score
      )[0];

      if (placementReadiness >= 80) {
        aiInsight = `Your overall preparation is strong. ${strongest.name} is currently your strongest area. Continue practicing ${weakest.name} to maintain balanced placement readiness.`;
      } else if (placementReadiness >= 60) {
        aiInsight = `You are making good progress. ${strongest.name} is currently your strongest area, while ${weakest.name} needs more attention. Focus on improving ${weakest.name} next.`;
      } else if (placementReadiness >= 30) {
        aiInsight = `Your preparation is developing. You are currently strongest in ${strongest.name}. Spend more time on ${weakest.name} to improve your overall placement readiness.`;
      } else {
        aiInsight = `You are still building your placement preparation. Focus on consistent DSA practice and complete more mock tests and AI interviews to improve your readiness score.`;
      }
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,

      user: {
        name: user.name,
      },

      readiness: {
        score: placementReadiness,
      },

      stats: {
        dsa: {
          solved: solvedProblems,
          total: totalProblems,
          progress: dsaProgress,
        },

        mockTests: {
          completed: mockTestsCompleted,
          averageScore: mockAverageScore,
        },

        interviews: {
          completed: interviewsCompleted,
          averageScore: interviewAverageScore,
        },
      },

      aiInsight,
    });
  } catch (error) {
    console.error(
      "AI Dashboard Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
};

module.exports = {
  getAIDashboard,
};