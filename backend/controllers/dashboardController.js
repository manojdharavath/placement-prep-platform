const Problem = require("../models/Problem");
const Result  = require("../models/Result");

// ── PRI Calculation Engine ──
// Placement Readiness Index (0–100)
// DSA         → 35 points
// Mock Tests  → 30 points
// Consistency → 20 points
// Interview   → 15 points (unlocks when AI Interview built)

const calculatePRI = ({ totalProblems, solvedProblems, avgTestScore, testsTaken, streak }) => {
  // DSA Score (35 pts) — based on problems solved out of 150 target
  const dsaRaw   = Math.min((solvedProblems / 150) * 100, 100);
  const dsaScore = (dsaRaw / 100) * 35;

  // Test Score (30 pts) — based on average test score
  const testRaw   = testsTaken > 0 ? Math.min(avgTestScore, 100) : 0;
  const testScore = (testRaw / 100) * 30;

  // Consistency Score (20 pts) — based on streak and total activity
  const consistencyRaw   = Math.min((streak / 30) * 100, 100);
  const consistencyScore = (consistencyRaw / 100) * 20;

  // Interview Score (15 pts) — placeholder until AI interview built
  const interviewScore = 0;

  const total = Math.round(dsaScore + testScore + consistencyScore + interviewScore);

  return {
    total: Math.min(total, 100),
    breakdown: {
      dsa:         { score: Math.round(dsaRaw),         weighted: Math.round(dsaScore),         max: 35  },
      tests:       { score: Math.round(testRaw),         weighted: Math.round(testScore),         max: 30  },
      consistency: { score: Math.round(consistencyRaw), weighted: Math.round(consistencyScore), max: 20  },
      interview:   { score: 0,                           weighted: 0,                             max: 15  },
    },
  };
};

// Determine which companies user is ready for
const getCompanyReadiness = (pri) => {
  const companies = [
    { name: "TCS",        required: 40,  package: "3.5 LPA",  color: "#6366f1" },
    { name: "Infosys",    required: 45,  package: "3.6 LPA",  color: "#8b5cf6" },
    { name: "Wipro",      required: 45,  package: "3.5 LPA",  color: "#06b6d4" },
    { name: "Cognizant",  required: 55,  package: "4 LPA",    color: "#10b981" },
    { name: "Capgemini",  required: 55,  package: "4.5 LPA",  color: "#f59e0b" },
    { name: "Accenture",  required: 60,  package: "4.5 LPA",  color: "#f43f5e" },
    { name: "HCL",        required: 50,  package: "3.8 LPA",  color: "#a78bfa" },
    { name: "Amazon",     required: 80,  package: "18 LPA",   color: "#f59e0b" },
    { name: "Google",     required: 90,  package: "40 LPA",   color: "#10b981" },
    { name: "Microsoft",  required: 85,  package: "30 LPA",   color: "#06b6d4" },
  ];

  return companies.map((c) => ({
    ...c,
    ready:    pri >= c.required,
    gap:      Math.max(0, c.required - pri),
    progress: Math.min(Math.round((pri / c.required) * 100), 100),
  }));
};

// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all problems and results in parallel
    const [problems, results] = await Promise.all([
      Problem.find({ userId }),
      Result.find({ userId }).sort({ createdAt: -1 }),
    ]);

    // ── DSA Stats ──
    const solvedProblems = problems.filter((p) => p.status === "solved").length;
    const totalProblems  = problems.length;
    const byDifficulty   = {
      easy:   { total: problems.filter(p => p.difficulty === "Easy").length,   solved: problems.filter(p => p.difficulty === "Easy"   && p.status === "solved").length },
      medium: { total: problems.filter(p => p.difficulty === "Medium").length, solved: problems.filter(p => p.difficulty === "Medium" && p.status === "solved").length },
      hard:   { total: problems.filter(p => p.difficulty === "Hard").length,   solved: problems.filter(p => p.difficulty === "Hard"   && p.status === "solved").length },
    };
    const byTopic = problems.reduce((acc, p) => {
      if (!acc[p.topic]) acc[p.topic] = { total: 0, solved: 0 };
      acc[p.topic].total++;
      if (p.status === "solved") acc[p.topic].solved++;
      return acc;
    }, {});

    // ── Test Stats ──
    const testsTaken  = results.length;
    const avgScore    = testsTaken > 0 ? Math.round(results.reduce((a, r) => a + r.score, 0) / testsTaken) : 0;
    const bestScore   = testsTaken > 0 ? Math.max(...results.map(r => r.score)) : 0;
    const recentTests = results.slice(0, 5);

    // ── Consistency (streak calculation) ──
    const solvedDates = problems
      .filter(p => p.status === "solved")
      .map(p => new Date(p.updatedAt).toDateString());

    let streak = 0;
    const today     = new Date();
    const checkDate = new Date(today);
    while (solvedDates.includes(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // ── PRI ──
    const pri = calculatePRI({ totalProblems, solvedProblems, avgTestScore: avgScore, testsTaken, streak });

    // ── Company Readiness ──
    const companyReadiness = getCompanyReadiness(pri.total);

    // ── Heatmap (last 30 days activity) ──
    const heatmap = [];
    for (let i = 29; i >= 0; i--) {
      const d   = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const count   = problems.filter(p => new Date(p.updatedAt).toDateString() === dateStr && p.status === "solved").length
                    + results.filter(r => new Date(r.createdAt).toDateString() === dateStr).length;
      heatmap.push({ date: d.toISOString().split("T")[0], count });
    }

    res.status(200).json({
      pri,
      stats: {
        dsa:   { solved: solvedProblems, total: totalProblems, byDifficulty, byTopic },
        tests: { taken: testsTaken, avgScore, bestScore, recent: recentTests },
        streak,
      },
      companyReadiness,
      heatmap,
    });

  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDashboardStats };