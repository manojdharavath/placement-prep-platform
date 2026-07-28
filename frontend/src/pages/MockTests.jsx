import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

const topicColors = {
  JavaScript: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  "Data Structures": {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
  Algorithms: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
  "System Design": {
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.2)",
  },
  Database: {
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
  },
  "Operating Systems": {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
  },
  "Computer Networks": {
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    border: "rgba(167,139,250,0.2)",
  },
  "OOP Concepts": {
    color: "#34d399",
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
  },
};

const diffConfig = {
  Easy: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  Medium: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  Hard: {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
    border: "rgba(244,63,94,0.25)",
  },
};

// AI can generate questions for all of these topics.
// Therefore we do not depend on existing DB question counts anymore.
const availableTopics = [
  "JavaScript",
  "Data Structures",
  "Algorithms",
  "System Design",
  "Database",
  "Operating Systems",
  "Computer Networks",
  "OOP Concepts",
];

export default function MockTests() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);

  // AI generation states
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  // We only need previous results now.
  // Topics themselves are available through AI generation.
  const fetchResults = async () => {
    try {
      const resultsRes = await API.get("/tests/results");

      setResults(resultsRes.data);
    } catch (err) {
      console.error("Fetch Results Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // START AI TEST
  // ==========================================

  const startTest = async () => {
    if (!selected || generating) return;

    try {
      setGenerating(true);
      setError("");

      // Ask backend/Groq to generate 10 fresh questions
      const response = await API.post(
        "/tests/ai-generate",
        {
          topic: selected.topic,
          difficulty: selected.difficulty,
        }
      );

      const questions = response.data.questions;

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions generated");
      }

      // Pass generated questions directly to TestScreen
      navigate(
        `/test?topic=${encodeURIComponent(
          selected.topic
        )}&difficulty=${encodeURIComponent(
          selected.difficulty
        )}`,
        {
          state: {
            questions,
            source: "AI",
            topic: selected.topic,
            difficulty: selected.difficulty,
          },
        }
      );
    } catch (err) {
      console.error(
        "AI Test Generation Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to generate AI test. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0b0b15",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "256px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar title="Mock Tests" />

        <main
          style={{
            flex: 1,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* ================= HEADER ================= */}

          <div>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#f1f5f9",
                margin: "0 0 6px",
              }}
            >
              AI Mock Tests
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
              }}
            >
              Select a topic and difficulty. AI will
              generate a fresh 10-question mock test.
            </p>
          </div>

          {/* ================= STATS ================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            {[
              {
                label: "Tests Taken",
                value: results.length,
                color: "#6366f1",
                bg: "rgba(99,102,241,0.08)",
                border: "rgba(99,102,241,0.18)",
              },

              {
                label: "Avg Score",
                value: results.length
                  ? `${Math.round(
                      results.reduce(
                        (a, r) => a + r.score,
                        0
                      ) / results.length
                    )}%`
                  : "—",
                color: "#10b981",
                bg: "rgba(16,185,129,0.08)",
                border: "rgba(16,185,129,0.18)",
              },

              {
                label: "Best Score",
                value: results.length
                  ? `${Math.max(
                      ...results.map((r) => r.score)
                    )}%`
                  : "—",
                color: "#f59e0b",
                bg: "rgba(245,158,11,0.08)",
                border: "rgba(245,158,11,0.18)",
              },

              {
                label: "Topics Covered",
                value: [
                  ...new Set(
                    results.map((r) => r.topic)
                  ),
                ].length,
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.08)",
                border: "rgba(139,92,246,0.18)",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  borderRadius: "16px",
                  padding: "20px",
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform =
                    "translateY(-3px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform =
                    "translateY(0)")
                }
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                    marginBottom: "4px",
                  }}
                >
                  {s.value}
                </div>

                <div
                  style={{
                    fontSize: "13px",
                    color: s.color,
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ================= MAIN GRID ================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* ================= TOPICS ================= */}

            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                  margin: "0 0 16px",
                }}
              >
                Choose a Topic
              </h3>

              {loading ? (
                <div
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading...
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  {availableTopics.map((topic) => {
                    const cfg =
                      topicColors[topic] ||
                      topicColors.JavaScript;

                    return (
                      <div
                        key={topic}
                        style={{
                          borderRadius: "16px",
                          padding: "20px",
                          background: "#0f0f1e",
                          border: "1px solid #1e1e35",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            cfg.border;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "#1e1e35";
                        }}
                      >
                        {/* Topic Header */}

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "16px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: cfg.bg,
                              border: `1px solid ${cfg.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              fontWeight: 800,
                              color: cfg.color,
                            }}
                          >
                            {topic.charAt(0)}
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#e2e8f0",
                              }}
                            >
                              {topic}
                            </div>

                            <div
                              style={{
                                fontSize: "12px",
                                color: "#64748b",
                                marginTop: "2px",
                              }}
                            >
                              AI-generated questions
                            </div>
                          </div>
                        </div>

                        {/* Difficulty */}

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          {[
                            "Easy",
                            "Medium",
                            "Hard",
                          ].map((diff) => {
                            const isSelected =
                              selected?.topic === topic &&
                              selected?.difficulty === diff;

                            const dcfg =
                              diffConfig[diff];

                            return (
                              <button
                                key={diff}
                                onClick={() => {
                                  setSelected({
                                    topic,
                                    difficulty: diff,
                                  });

                                  setError("");
                                }}
                                style={{
                                  flex: 1,
                                  padding: "7px 4px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  cursor: "pointer",

                                  background: isSelected
                                    ? dcfg.bg
                                    : "rgba(255,255,255,0.03)",

                                  color: isSelected
                                    ? dcfg.color
                                    : "#64748b",

                                  border: `1px solid ${
                                    isSelected
                                      ? dcfg.border
                                      : "#2a2a4a"
                                  }`,

                                  transition:
                                    "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background =
                                      dcfg.bg;

                                    e.currentTarget.style.color =
                                      dcfg.color;

                                    e.currentTarget.style.borderColor =
                                      dcfg.border;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.background =
                                      "rgba(255,255,255,0.03)";

                                    e.currentTarget.style.color =
                                      "#64748b";

                                    e.currentTarget.style.borderColor =
                                      "#2a2a4a";
                                  }
                                }}
                              >
                                {diff}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= RIGHT PANEL ================= */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {/* START TEST */}

              <div
                style={{
                  borderRadius: "16px",
                  padding: "24px",
                  background: "#0f0f1e",
                  border: "1px solid #1e1e35",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e2e8f0",
                    margin: "0 0 20px",
                  }}
                >
                  Start AI Test
                </h3>

                {selected ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(99,102,241,0.07)",
                        border:
                          "1px solid rgba(99,102,241,0.18)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#94a3b8",
                          marginBottom: "8px",
                        }}
                      >
                        Selected Test
                      </div>

                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#f1f5f9",
                          marginBottom: "6px",
                        }}
                      >
                        {selected.topic}
                      </div>

                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "99px",

                          background:
                            diffConfig[
                              selected.difficulty
                            ].bg,

                          color:
                            diffConfig[
                              selected.difficulty
                            ].color,

                          border: `1px solid ${
                            diffConfig[
                              selected.difficulty
                            ].border
                          }`,
                        }}
                      >
                        {selected.difficulty}
                      </span>
                    </div>

                    {[
                      {
                        label: "Questions",
                        value: "10 MCQs",
                      },
                      {
                        label: "Time Limit",
                        value: "10 minutes",
                      },
                      {
                        label: "Source",
                        value: "AI Generated",
                      },
                    ].map((info, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          fontSize: "13px",
                          padding: "4px 0",
                          borderBottom:
                            i < 2
                              ? "1px solid #1a1a30"
                              : "none",
                        }}
                      >
                        <span
                          style={{
                            color: "#64748b",
                          }}
                        >
                          {info.label}
                        </span>

                        <span
                          style={{
                            color: "#e2e8f0",
                            fontWeight: 600,
                          }}
                        >
                          {info.value}
                        </span>
                      </div>
                    ))}

                    {/* ERROR */}

                    {error && (
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background:
                            "rgba(244,63,94,0.08)",
                          border:
                            "1px solid rgba(244,63,94,0.2)",
                          color: "#f43f5e",
                          fontSize: "12px",
                        }}
                      >
                        {error}
                      </div>
                    )}

                    {/* START BUTTON */}

                    <button
                      onClick={startTest}
                      disabled={generating}
                      className="btn-primary"
                      style={{
                        marginTop: "6px",
                        opacity: generating
                          ? 0.7
                          : 1,
                        cursor: generating
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {generating
                        ? "Generating AI Test..."
                        : "Start AI Test"}
                    </button>

                    {/* CLEAR */}

                    <button
                      disabled={generating}
                      onClick={() => {
                        setSelected(null);
                        setError("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        background: "transparent",
                        border:
                          "1px solid #1e1e35",
                        color: "#64748b",
                        fontSize: "13px",
                        cursor: generating
                          ? "not-allowed"
                          : "pointer",
                        opacity: generating
                          ? 0.5
                          : 1,
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "40px",
                        marginBottom: "12px",
                      }}
                    >
                      🎯
                    </div>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                      }}
                    >
                      Select a topic and difficulty
                      level to begin
                    </p>
                  </div>
                )}
              </div>

              {/* ================= RESULTS ================= */}

              <div
                style={{
                  borderRadius: "16px",
                  padding: "24px",
                  background: "#0f0f1e",
                  border: "1px solid #1e1e35",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#e2e8f0",
                    margin: "0 0 16px",
                  }}
                >
                  Recent Results
                </h3>

                {results.length === 0 ? (
                  <p
                    style={{
                      color: "#475569",
                      fontSize: "13px",
                      textAlign: "center",
                      padding: "16px 0",
                    }}
                  >
                    No tests taken yet
                  </p>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {results
                      .slice(0, 5)
                      .map((r, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            padding: "12px",
                            borderRadius: "10px",
                            background:
                              "rgba(255,255,255,0.02)",
                            border:
                              "1px solid #1a1a30",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#e2e8f0",
                              }}
                            >
                              {r.topic}
                            </div>

                            <div
                              style={{
                                fontSize: "11px",
                                color: "#475569",
                                marginTop: "2px",
                              }}
                            >
                              {r.difficulty}
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: 800,

                              color:
                                r.score >= 70
                                  ? "#10b981"
                                  : r.score >= 40
                                  ? "#f59e0b"
                                  : "#f43f5e",
                            }}
                          >
                            {r.score}%
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}