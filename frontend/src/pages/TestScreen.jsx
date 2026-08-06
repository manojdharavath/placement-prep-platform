import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";

import API from "../services/api";

export default function TestScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams] = useSearchParams();

  const topic = searchParams.get("topic");
  const difficulty = searchParams.get("difficulty");

  // AI questions passed from MockTests.jsx
  const aiQuestions = location.state?.questions || [];
  const source = location.state?.source || "Database";

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0: Idle, 1: Submitting, 2: Calculating
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  const [result, setResult] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [started, setStarted] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState({});

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // ==========================================
  // LOAD QUESTIONS
  // ==========================================

  useEffect(() => {
    if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
      setQuestions(aiQuestions);
      setLoading(false);
      return;
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await API.get(
        `/tests/questions?topic=${encodeURIComponent(
          topic
        )}&difficulty=${encodeURIComponent(difficulty)}`
      );

      setQuestions(data);
    } catch (err) {
      console.error("Fetch Questions Error:", err);
      alert("Failed to load questions");
      navigate("/mock-tests");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT TEST WITH STEPPED INDICATORS
  // ==========================================

  const handleSubmit = useCallback(async () => {
    if (submitting) return;

    setShowConfirmModal(false);
    setSubmitting(true);
    setSubmitStep(1);

    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] ?? -1,
      }));

      // Small Delay for UX feel ("Calculating Score...")
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitStep(2);

      const { data } = await API.post("/tests/submit", {
        topic,
        difficulty,
        answers: formattedAnswers,
        timeTaken: 600 - timeLeft,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setResult(data.result);
      setReviewData(data.questions || []);
    } catch (err) {
      console.error("Submit Test Error:", err);
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
      setSubmitStep(0);
    }
  }, [submitting, questions, answers, topic, difficulty, timeLeft]);

  // ==========================================
  // TIMER
  // ==========================================

  useEffect(() => {
    if (!started || result) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, started, result, handleSubmit]);

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================

  useEffect(() => {
    if (!started || result || showConfirmModal || submitting) return;

    const handleKeyDown = (e) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const optionIndex = parseInt(e.key, 10) - 1;
        const currentQ = questions[current];
        if (currentQ && currentQ.options[optionIndex] !== undefined) {
          handleSelectOption(currentQ._id, optionIndex);
        }
      } else if (e.key === "ArrowRight") {
        if (current < questions.length - 1) {
          setCurrent((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (current > 0) {
          setCurrent((prev) => prev - 1);
        }
      } else if (e.key === "Enter") {
        if (current === questions.length - 1) {
          setShowConfirmModal(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [started, result, showConfirmModal, submitting, current, questions]);

  // ==========================================
  // OPTION SELECTION WITH AUTO-SAVE TOAST
  // ==========================================

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));

    setSaveIndicator(true);
    setTimeout(() => {
      setSaveIndicator(false);
    }, 1000);
  };

  const toggleExplanation = (id) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const dcfg = diffConfig[difficulty] || diffConfig.Medium;

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b15",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "2px solid #6366f1",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#94a3b8", fontSize: "15px" }}>
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // START SCREEN
  // ==========================================

  if (!started) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b15",
          padding: isMobile ? "20px 16px" : "40px 20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: isMobile ? "24px 18px" : "40px",
            borderRadius: "24px",
            background: "#0f0f1e",
            border: "1px solid #1e1e35",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              margin: "0 auto 24px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            📝
          </div>

          <h2
            style={{
              fontSize: isMobile ? "22px" : "26px",
              fontWeight: 800,
              color: "#f1f5f9",
              margin: "0 0 8px",
            }}
          >
            {topic}
          </h2>

          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "99px",
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: "12px",
              background: dcfg.bg,
              color: dcfg.color,
              border: `1px solid ${dcfg.border}`,
            }}
          >
            {difficulty}
          </span>

          {source === "AI" && (
            <div style={{ marginBottom: "28px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 12px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#a5b4fc",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                AI Generated Test
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            {[
              { label: "Questions", value: `${questions.length} MCQs` },
              { label: "Time Limit", value: "10 Minutes" },
              { label: "Scoring", value: "+1 for each correct answer" },
              { label: "Difficulty", value: difficulty },
            ].map((info, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #1a1a30",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  {info.label}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e2e8f0",
                  }}
                >
                  {info.value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
              setStarted(true);
            }}
            className="btn-primary"
            style={{
              width: "100%",
              fontSize: "15px",
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Start Test
          </button>

          <button
            onClick={() => navigate("/mock-tests")}
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              background: "transparent",
              border: "1px solid #1e1e35",
              borderRadius: "10px",
              color: "#64748b",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RESULT SCREEN WITH AI PERFORMANCE REPORT
  // ==========================================

  if (result) {
    const pct = result.score;
    const total = result.totalQuestions || questions.length;
    const correct = result.correctAnswers;
    const wrong = total - correct;

    const rankTier =
      pct >= 80
        ? "Top 10% Performance"
        : pct >= 60
        ? "Top 30% Performance"
        : pct >= 40
        ? "Average Readiness"
        : "Keep Practicing";

    const grade =
      pct >= 80
        ? { label: "Excellent!", color: "#10b981" }
        : pct >= 60
        ? { label: "Good Job!", color: "#f59e0b" }
        : pct >= 40
        ? { label: "Keep Going", color: "#f59e0b" }
        : { label: "Need Practice", color: "#f43f5e" };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0b15",
          padding: isMobile ? "20px 14px" : "40px 20px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* SCORE CARD */}
          <div
            style={{
              borderRadius: "24px",
              padding: isMobile ? "28px 16px" : "40px",
              textAlign: "center",
              background: "#0f0f1e",
              border: "1px solid #1e1e35",
            }}
          >
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>
              {topic} — {difficulty}
            </div>

            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#818cf8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "12px",
              }}
            >
              {rankTier}
            </div>

            <div
              style={{
                fontSize: isMobile ? "54px" : "72px",
                fontWeight: 900,
                color: grade.color,
                lineHeight: 1,
              }}
            >
              {pct}%
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: grade.color,
                margin: "8px 0 24px",
              }}
            >
              {grade.label}
            </div>

            {/* VISUAL SCORE BAR */}
            <div
              style={{
                display: "flex",
                height: "10px",
                borderRadius: "99px",
                overflow: "hidden",
                background: "#1e1e35",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: `${(correct / total) * 100}%`,
                  background: "#10b981",
                }}
              />
              <div
                style={{
                  width: `${(wrong / total) * 100}%`,
                  background: "#f43f5e",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2, 1fr)"
                  : "repeat(4, 1fr)",
                gap: "16px",
              }}
            >
              {[
                { label: "Correct", value: correct, color: "#10b981" },
                { label: "Wrong", value: wrong, color: "#f43f5e" },
                { label: "Total", value: total, color: "#6366f1" },
                {
                  label: "Time",
                  value: `${Math.floor(result.timeTaken / 60)}m ${
                    result.timeTaken % 60
                  }s`,
                  color: "#f59e0b",
                },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI PERFORMANCE REPORT */}
          <div
            style={{
              borderRadius: "20px",
              padding: "24px",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04), #0f0f1e)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#c7d2fe",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🤖 AI Performance Insights
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                lineHeight: 1.6,
                margin: "0 0 16px",
              }}
            >
              {pct >= 70
                ? `You demonstrated strong mastery in ${topic}. Your accuracy indicates high readiness for technical screening interviews in this category.`
                : `Focus your preparation on foundational ${topic} concepts. Reviewing wrong answers below will quickly boost your score.`}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)",
                  fontWeight: 600,
                }}
              >
                Estimated Placement Readiness: {pct >= 70 ? "High (85%)" : "Moderate (55%)"}
              </span>
            </div>
          </div>

          {/* REVIEW */}
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
            Answer Review
          </h3>

          {reviewData.map((q, i) => {
            const userAnswer = result.answers.find(
              (a) => a.questionId?.toString() === q._id?.toString()
            );

            const selectedOpt = userAnswer?.selectedAnswer ?? -1;
            const isCorrect = userAnswer?.isCorrect;
            const isExpanded = !!expandedExplanations[q._id || i];

            return (
              <div
                key={q._id || i}
                style={{
                  borderRadius: "16px",
                  padding: isMobile ? "18px 14px" : "24px",
                  background: "#0f0f1e",
                  border: `1px solid ${
                    isCorrect ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"
                  }`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isCorrect
                        ? "rgba(16,185,129,0.15)"
                        : "rgba(244,63,94,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: isCorrect ? "#10b981" : "#f43f5e",
                    }}
                  >
                    {i + 1}
                  </div>

                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#e2e8f0",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {q.question}
                  </p>
                </div>

                {/* OPTIONS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {q.options.map((opt, j) => {
                    const isCorrectOpt = j === q.correctAnswer;
                    const isUserPick = j === selectedOpt;

                    let bg = "rgba(255,255,255,0.02)";
                    let border = "#1a1a30";
                    let color = "#94a3b8";

                    if (isCorrectOpt) {
                      bg = "rgba(16,185,129,0.1)";
                      border = "rgba(16,185,129,0.3)";
                      color = "#10b981";
                    } else if (isUserPick && !isCorrect) {
                      bg = "rgba(244,63,94,0.1)";
                      border = "rgba(244,63,94,0.3)";
                      color = "#f43f5e";
                    }

                    return (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: bg,
                          border: `1px solid ${border}`,
                        }}
                      >
                        <span
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: isCorrectOpt
                              ? "rgba(16,185,129,0.2)"
                              : isUserPick && !isCorrect
                              ? "rgba(244,63,94,0.2)"
                              : "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            color,
                            flexShrink: 0,
                          }}
                        >
                          {String.fromCharCode(65 + j)}
                        </span>

                        <span style={{ fontSize: "13px", color, flex: 1 }}>
                          {opt}
                        </span>

                        {isCorrectOpt && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "12px",
                              color: "#10b981",
                              fontWeight: 600,
                            }}
                          >
                            Correct
                          </span>
                        )}

                        {isUserPick && !isCorrect && (
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "12px",
                              color: "#f43f5e",
                              fontWeight: 600,
                            }}
                          >
                            Your Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* COLLAPSIBLE EXPLANATION */}
                {q.explanation && (
                  <div>
                    <button
                      onClick={() => toggleExplanation(q._id || i)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#818cf8",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "4px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {isExpanded ? "▲ Hide Explanation" : "💡 Show Explanation"}
                    </button>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          background: "rgba(99,102,241,0.06)",
                          border: "1px solid rgba(99,102,241,0.15)",
                          fontSize: "13px",
                          color: "#94a3b8",
                          lineHeight: 1.6,
                        }}
                      >
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "12px",
              paddingBottom: "40px",
            }}
          >
            <button
              onClick={() => navigate("/mock-tests")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back to Tests
            </button>

            <button
              onClick={() => navigate("/mock-tests")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                background: "transparent",
                border: "1px solid #1e1e35",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0b15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
        }}
      >
        No questions available.
      </div>
    );
  }

  // ==========================================
  // ACTIVE TEST SCREEN
  // ==========================================

  const q = questions[current];
  const isFinalQuestion = current === questions.length - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b15",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0% { border-color: rgba(244,63,94,0.3); box-shadow: 0 0 0px rgba(244,63,94,0); }
          50% { border-color: rgba(244,63,94,0.8); box-shadow: 0 0 12px rgba(244,63,94,0.3); }
          100% { border-color: rgba(244,63,94,0.3); box-shadow: 0 0 0px rgba(244,63,94,0); }
        }
        .pulse-timer {
          animation: pulseGlow 1.2s infinite ease-in-out;
        }
        .nav-item-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .nav-item-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
      `}</style>

      {/* AUTO-SAVE TOAST INDICATOR */}
      {saveIndicator && (
        <div
          style={{
            position: "fixed",
            top: "76px",
            right: "24px",
            zIndex: 100,
            padding: "8px 16px",
            borderRadius: "99px",
            background: "rgba(16,185,129,0.9)",
            color: "white",
            fontSize: "12px",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ✓ Saved
        </div>
      )}

      {/* TOP BAR */}
      <div
        style={{
          minHeight: "64px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          padding: isMobile ? "12px 16px" : "0 32px",
          gap: isMobile ? "12px" : "0",
          background: "rgba(13,13,28,0.95)",
          borderBottom: "1px solid #1e1e35",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: isMobile ? "100%" : "auto",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>
              {topic}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "99px",
                background: dcfg.bg,
                color: dcfg.color,
                border: `1px solid ${dcfg.border}`,
              }}
            >
              {difficulty}
            </span>

            {source === "AI" && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: "99px",
                  color: "#a5b4fc",
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                AI
              </span>
            )}
          </div>

          {/* TIMER (MOBILE) */}
          {isMobile && (
            <div
              className={timeLeft < 60 ? "pulse-timer" : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "10px",
                background:
                  timeLeft < 60
                    ? "rgba(244,63,94,0.1)"
                    : "rgba(99,102,241,0.08)",
                border: `1px solid ${
                  timeLeft < 60
                    ? "rgba(244,63,94,0.3)"
                    : "rgba(99,102,241,0.2)"
                }`,
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: timeLeft < 60 ? "#f43f5e" : "#a5b4fc",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ⏱ {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {/* TIMER (DESKTOP) */}
        {!isMobile && (
          <div
            className={timeLeft < 60 ? "pulse-timer" : ""}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "12px",
              background:
                timeLeft < 60
                  ? "rgba(244,63,94,0.1)"
                  : "rgba(99,102,241,0.08)",
              border: `1px solid ${
                timeLeft < 60
                  ? "rgba(244,63,94,0.3)"
                  : "rgba(99,102,241,0.2)"
              }`,
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: timeLeft < 60 ? "#f43f5e" : "#a5b4fc",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            width: isMobile ? "100%" : "auto",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            {answeredCount}/{questions.length} answered
          </span>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              border: "none",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: isMobile ? "16px" : "32px 24px",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        {/* QUESTION PANEL */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
              Question {current + 1} / {questions.length}
            </span>

            <span style={{ fontSize: "13px", color: "#64748b" }}>
              {Math.round(((current + 1) / questions.length) * 100)}%
            </span>
          </div>

          {/* PROGRESS */}
          <div
            style={{
              height: "4px",
              borderRadius: "99px",
              background: "#1e1e35",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "99px",
                width: `${((current + 1) / questions.length) * 100}%`,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* QUESTION */}
          <div
            style={{
              borderRadius: "16px",
              padding: isMobile ? "20px 16px" : "28px",
              background: "#0f0f1e",
              border: "1px solid #1e1e35",
            }}
          >
            <p
              style={{
                fontSize: isMobile ? "15px" : "16px",
                fontWeight: 600,
                color: "#f1f5f9",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {q.question}
            </p>
          </div>

          {/* OPTIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {q.options.map((opt, i) => {
              const isSelected = answers[q._id] === i;

              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(q._id, i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: isMobile ? "12px 14px" : "16px 20px",
                    borderRadius: "14px",
                    textAlign: "left",
                    background: isSelected
                      ? "rgba(99,102,241,0.12)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${
                      isSelected ? "rgba(99,102,241,0.5)" : "#1e1e35"
                    }`,
                    color: isSelected ? "#c7d2fe" : "#94a3b8",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isSelected
                        ? "rgba(99,102,241,0.25)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${
                        isSelected ? "rgba(99,102,241,0.5)" : "#2a2a4a"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isSelected ? "#818cf8" : "#475569",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>

                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: isSelected ? 600 : 400,
                      wordBreak: "break-word",
                      flex: 1,
                    }}
                  >
                    {opt}
                  </span>

                  {isSelected && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#818cf8",
                        marginLeft: "auto",
                      }}
                    >
                      ✔ Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* PREVIOUS / NEXT / SUBMIT */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <button
              onClick={() => setCurrent(Math.max(0, current - 1))}
              disabled={current === 0}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid #1e1e35",
                color: current === 0 ? "#2a2a4a" : "#94a3b8",
                fontSize: "14px",
                fontWeight: 600,
                cursor: current === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Previous
            </button>

            {isFinalQuestion ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Submit Test →
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrent(Math.min(questions.length - 1, current + 1))
                }
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#a5b4fc",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* NAVIGATOR PANEL */}
        <div
          style={{
            width: isMobile ? "100%" : "200px",
            flexShrink: 0,
            borderRadius: "16px",
            padding: "20px",
            background: "#0f0f1e",
            border: "1px solid #1e1e35",
            height: "fit-content",
            position: isMobile ? "static" : "sticky",
            top: "88px",
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 14px",
            }}
          >
            Navigator
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "repeat(5, 1fr)"
                : "repeat(4, 1fr)",
              gap: "6px",
              marginBottom: "16px",
            }}
          >
            {questions.map((qn, i) => {
              const isAnswered = answers[qn._id] !== undefined;
              const isCurrent = i === current;

              return (
                <button
                  key={qn._id || i}
                  onClick={() => setCurrent(i)}
                  className="nav-item-btn"
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "none",
                    background: isCurrent
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : isAnswered
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(255,255,255,0.04)",
                    color: isCurrent
                      ? "white"
                      : isAnswered
                      ? "#10b981"
                      : "#475569",
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* NAVIGATOR LEGEND WITH COLORED CIRCLES */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#8b5cf6",
                }}
              />
              <span>Current</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span style={{ color: "#10b981" }}>Answered</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#475569",
                }}
              />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#0f0f1e",
              border: "1px solid #1e1e35",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#f1f5f9", margin: "0 0 10px", fontSize: "18px" }}>
              Are you sure?
            </h3>

            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "0 0 20px" }}>
              Answered:{" "}
              <strong style={{ color: "#10b981" }}>
                {answeredCount} / {questions.length}
              </strong>
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Yes, Submit
              </button>

              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1px solid #1e1e35",
                  color: "#64748b",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEPPED SUBMIT LOADING MODAL */}
      {submitting && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11,11,21,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 250,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "3px solid #6366f1",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <p style={{ color: "#c7d2fe", fontSize: "16px", fontWeight: 700 }}>
              {submitStep === 1
                ? "Submitting answers..."
                : "Calculating score & AI breakdown..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}