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
  const aiQuestions =
    location.state?.questions || [];

  const source =
    location.state?.source || "Database";

  const [questions, setQuestions] =
    useState([]);

  const [current, setCurrent] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [timeLeft, setTimeLeft] =
    useState(600);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [reviewData, setReviewData] =
    useState([]);

  const [started, setStarted] =
    useState(false);

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
    // AI questions were already generated
    if (
      Array.isArray(aiQuestions) &&
      aiQuestions.length > 0
    ) {
      setQuestions(aiQuestions);
      setLoading(false);
      return;
    }

    // Fallback if page is opened directly
    fetchQuestions();
  }, []);

  // ==========================================
  // DATABASE FALLBACK
  // ==========================================

  const fetchQuestions = async () => {
    try {
      const { data } = await API.get(
        `/tests/questions?topic=${encodeURIComponent(
          topic
        )}&difficulty=${encodeURIComponent(
          difficulty
        )}`
      );

      setQuestions(data);
    } catch (err) {
      console.error(
        "Fetch Questions Error:",
        err
      );

      alert("Failed to load questions");

      navigate("/mock-tests");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT TEST
  // ==========================================

  const handleSubmit = useCallback(
    async () => {
      if (submitting) return;

      setSubmitting(true);

      try {
        const formattedAnswers =
          questions.map((q) => ({
            questionId: q._id,

            selectedAnswer:
              answers[q._id] ?? -1,
          }));

        const { data } = await API.post(
          "/tests/submit",
          {
            topic,
            difficulty,

            answers: formattedAnswers,

            timeTaken:
              600 - timeLeft,
          }
        );

        setResult(data.result);

        setReviewData(
          data.questions || []
        );
      } catch (err) {
        console.error(
          "Submit Test Error:",
          err
        );

        alert(
          err.response?.data?.message ||
            "Submission failed"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      submitting,
      questions,
      answers,
      topic,
      difficulty,
      timeLeft,
    ]
  );

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
      setTimeLeft(
        (previousTime) =>
          previousTime - 1
      );
    }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    timeLeft,
    started,
    result,
    handleSubmit,
  ]);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatTime = (seconds) => {
    const minutes =
      Math.floor(seconds / 60);

    const remainingSeconds =
      seconds % 60;

    return `${String(
      minutes
    ).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const answered =
    Object.keys(answers).length;

  const dcfg =
    diffConfig[difficulty] ||
    diffConfig.Medium;

  // ==========================================
  // LOADING
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
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border:
                "2px solid #6366f1",
              borderTopColor:
                "transparent",
              animation:
                "spin 0.8s linear infinite",
              margin:
                "0 auto 16px",
            }}
          />

          <p
            style={{
              color: "#94a3b8",
              fontSize: "15px",
            }}
          >
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
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "40px",
            borderRadius: "24px",
            background: "#0f0f1e",
            border:
              "1px solid #1e1e35",
            textAlign: "center",
          }}
          className="animate-fadeInUp"
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              margin:
                "0 auto 24px",
              background:
                "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              fontSize: "28px",
              boxShadow:
                "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            📝
          </div>

          <h2
            style={{
              fontSize: "26px",
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

          {/* AI BADGE */}

          {source === "AI" && (
            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  display:
                    "inline-block",
                  padding:
                    "5px 12px",
                  borderRadius:
                    "99px",
                  fontSize:
                    "11px",
                  fontWeight: 700,
                  color: "#a5b4fc",
                  background:
                    "rgba(99,102,241,0.08)",
                  border:
                    "1px solid rgba(99,102,241,0.2)",
                }}
              >
                AI Generated Test
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "12px",
              marginBottom:
                "32px",
            }}
          >
            {[
              {
                label: "Questions",
                value: `${questions.length} MCQs`,
              },

              {
                label: "Time Limit",
                value: "10 Minutes",
              },

              {
                label: "Scoring",
                value:
                  "+1 for each correct answer",
              },

              {
                label: "Difficulty",
                value: difficulty,
              },
            ].map((info, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  padding:
                    "12px 16px",
                  borderRadius:
                    "10px",
                  background:
                    "rgba(255,255,255,0.02)",
                  border:
                    "1px solid #1a1a30",
                }}
              >
                <span
                  style={{
                    fontSize:
                      "13px",
                    color:
                      "#64748b",
                  }}
                >
                  {info.label}
                </span>

                <span
                  style={{
                    fontSize:
                      "13px",
                    fontWeight: 600,
                    color:
                      "#e2e8f0",
                  }}
                >
                  {info.value}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              setStarted(true)
            }
            className="btn-primary"
            style={{
              width: "100%",
              fontSize: "15px",
              padding: "14px",
            }}
          >
            Start Test
          </button>

          <button
            onClick={() =>
              navigate(
                "/mock-tests"
              )
            }
            style={{
              width: "100%",
              marginTop: "12px",
              padding: "12px",
              background:
                "transparent",
              border:
                "1px solid #1e1e35",
              borderRadius:
                "10px",
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
  // RESULT SCREEN
  // ==========================================

  if (result) {
    const pct = result.score;

    const grade =
      pct >= 80
        ? {
            label: "Excellent!",
            color: "#10b981",
          }
        : pct >= 60
        ? {
            label: "Good Job!",
            color: "#f59e0b",
          }
        : pct >= 40
        ? {
            label:
              "Keep Going",
            color: "#f59e0b",
          }
        : {
            label:
              "Need Practice",
            color: "#f43f5e",
          };

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0b0b15",
          padding: "40px 20px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            flexDirection:
              "column",
            gap: "24px",
          }}
        >
          {/* SCORE */}

          <div
            style={{
              borderRadius: "24px",
              padding: "40px",
              textAlign: "center",
              background: "#0f0f1e",
              border:
                "1px solid #1e1e35",
            }}
            className="animate-fadeInUp"
          >
            <div
              style={{
                fontSize: "14px",
                color: "#64748b",
                marginBottom: "8px",
              }}
            >
              {topic} —{" "}
              {difficulty}
            </div>

            <div
              style={{
                fontSize: "72px",
                fontWeight: 900,
                color:
                  grade.color,
                lineHeight: 1,
              }}
            >
              {pct}%
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color:
                  grade.color,
                margin:
                  "8px 0 24px",
              }}
            >
              {grade.label}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "center",
                gap: "32px",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label:
                    "Correct",
                  value:
                    result.correctAnswers,
                  color:
                    "#10b981",
                },

                {
                  label:
                    "Incorrect",
                  value:
                    result.totalQuestions -
                    result.correctAnswers,
                  color:
                    "#f43f5e",
                },

                {
                  label: "Total",
                  value:
                    result.totalQuestions,
                  color:
                    "#6366f1",
                },

                {
                  label: "Time",
                  value: `${Math.floor(
                    result.timeTaken /
                      60
                  )}m ${
                    result.timeTaken %
                    60
                  }s`,
                  color:
                    "#f59e0b",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "28px",
                      fontWeight:
                        800,
                      color:
                        s.color,
                    }}
                  >
                    {s.value}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginTop:
                        "4px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEW */}

          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#f1f5f9",
              margin: 0,
            }}
          >
            Answer Review
          </h3>

          {reviewData.map(
            (q, i) => {
              const userAnswer =
                result.answers.find(
                  (a) =>
                    a.questionId?.toString() ===
                    q._id?.toString()
                );

              const selected =
                userAnswer?.selectedAnswer ??
                -1;

              const isCorrect =
                userAnswer?.isCorrect;

              return (
                <div
                  key={q._id || i}
                  style={{
                    borderRadius:
                      "16px",
                    padding:
                      "24px",
                    background:
                      "#0f0f1e",

                    border: `1px solid ${
                      isCorrect
                        ? "rgba(16,185,129,0.3)"
                        : "rgba(244,63,94,0.3)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "flex-start",
                      gap: "12px",
                      marginBottom:
                        "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height:
                          "28px",
                        borderRadius:
                          "50%",
                        flexShrink: 0,

                        background:
                          isCorrect
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(244,63,94,0.15)",

                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",

                        fontSize:
                          "14px",
                        fontWeight:
                          700,

                        color:
                          isCorrect
                            ? "#10b981"
                            : "#f43f5e",
                      }}
                    >
                      {i + 1}
                    </div>

                    <p
                      style={{
                        fontSize:
                          "14px",
                        fontWeight:
                          600,
                        color:
                          "#e2e8f0",
                        margin: 0,
                        lineHeight:
                          1.6,
                      }}
                    >
                      {q.question}
                    </p>
                  </div>

                  {/* OPTIONS */}

                  <div
                    style={{
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      gap: "8px",
                      marginBottom:
                        "14px",
                    }}
                  >
                    {q.options.map(
                      (opt, j) => {
                        const isCorrectOpt =
                          j ===
                          q.correctAnswer;

                        const isUserPick =
                          j ===
                          selected;

                        let bg =
                          "rgba(255,255,255,0.02)";

                        let border =
                          "#1a1a30";

                        let color =
                          "#94a3b8";

                        if (
                          isCorrectOpt
                        ) {
                          bg =
                            "rgba(16,185,129,0.1)";

                          border =
                            "rgba(16,185,129,0.3)";

                          color =
                            "#10b981";
                        } else if (
                          isUserPick &&
                          !isCorrect
                        ) {
                          bg =
                            "rgba(244,63,94,0.1)";

                          border =
                            "rgba(244,63,94,0.3)";

                          color =
                            "#f43f5e";
                        }

                        return (
                          <div
                            key={j}
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "10px",
                              padding:
                                "10px 14px",
                              borderRadius:
                                "10px",
                              background:
                                bg,
                              border: `1px solid ${border}`,
                            }}
                          >
                            <span
                              style={{
                                width:
                                  "22px",
                                height:
                                  "22px",
                                borderRadius:
                                  "50%",

                                background:
                                  isCorrectOpt
                                    ? "rgba(16,185,129,0.2)"
                                    : isUserPick &&
                                      !isCorrect
                                    ? "rgba(244,63,94,0.2)"
                                    : "rgba(255,255,255,0.05)",

                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",

                                fontSize:
                                  "11px",
                                fontWeight:
                                  700,
                                color,
                                flexShrink: 0,
                              }}
                            >
                              {String.fromCharCode(
                                65 + j
                              )}
                            </span>

                            <span
                              style={{
                                fontSize:
                                  "13px",
                                color,
                              }}
                            >
                              {opt}
                            </span>

                            {isCorrectOpt && (
                              <span
                                style={{
                                  marginLeft:
                                    "auto",
                                  fontSize:
                                    "12px",
                                  color:
                                    "#10b981",
                                  fontWeight:
                                    600,
                                }}
                              >
                                Correct
                              </span>
                            )}

                            {isUserPick &&
                              !isCorrect && (
                                <span
                                  style={{
                                    marginLeft:
                                      "auto",
                                    fontSize:
                                      "12px",
                                    color:
                                      "#f43f5e",
                                    fontWeight:
                                      600,
                                  }}
                                >
                                  Your
                                  Answer
                                </span>
                              )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* EXPLANATION */}

                  {q.explanation && (
                    <div
                      style={{
                        padding:
                          "12px 16px",
                        borderRadius:
                          "10px",

                        background:
                          "rgba(99,102,241,0.06)",

                        border:
                          "1px solid rgba(99,102,241,0.15)",

                        fontSize:
                          "13px",
                        color:
                          "#94a3b8",
                        lineHeight:
                          1.6,
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            700,
                          color:
                            "#818cf8",
                        }}
                      >
                        Explanation:{" "}
                      </span>

                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            }
          )}

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              paddingBottom:
                "40px",
            }}
          >
            <button
              onClick={() =>
                navigate(
                  "/mock-tests"
                )
              }
              className="btn-primary"
              style={{
                flex: 1,
              }}
            >
              Back to Tests
            </button>

            <button
              onClick={() =>
                navigate(
                  "/mock-tests"
                )
              }
              style={{
                flex: 1,
                padding: "12px",
                borderRadius:
                  "10px",
                background:
                  "transparent",
                border:
                  "1px solid #1e1e35",
                color:
                  "#94a3b8",
                fontSize:
                  "14px",
                fontWeight: 600,
                cursor:
                  "pointer",
              }}
            >
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check
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
  // ACTIVE TEST
  // ==========================================

  const q = questions[current];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b15",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR */}

      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding: "0 32px",

          background:
            "rgba(13,13,28,0.95)",

          borderBottom:
            "1px solid #1e1e35",

          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#f1f5f9",
            }}
          >
            {topic}
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius:
                "99px",
              background:
                dcfg.bg,
              color:
                dcfg.color,
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
                borderRadius:
                  "99px",
                color: "#a5b4fc",
                background:
                  "rgba(99,102,241,0.08)",
                border:
                  "1px solid rgba(99,102,241,0.2)",
              }}
            >
              AI
            </span>
          )}
        </div>

        {/* TIMER */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding:
              "8px 18px",
            borderRadius:
              "12px",

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

              color:
                timeLeft < 60
                  ? "#f43f5e"
                  : "#a5b4fc",

              fontVariantNumeric:
                "tabular-nums",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            {answered}/
            {questions.length} answered
          </span>

          <button
            onClick={() =>
              handleSubmit()
            }
            disabled={submitting}
            className="btn-primary"
            style={{
              padding:
                "8px 20px",
              fontSize: "13px",
            }}
          >
            {submitting
              ? "Submitting..."
              : "Submit Test"}
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div
        style={{
          flex: 1,
          display: "flex",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%",
          padding: "32px 24px",
          gap: "24px",
        }}
      >
        {/* QUESTION PANEL */}

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection:
              "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Question{" "}
              {current + 1} of{" "}
              {questions.length}
            </span>

            <span
              style={{
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              {Math.round(
                ((current + 1) /
                  questions.length) *
                  100
              )}
              % complete
            </span>
          </div>

          {/* PROGRESS */}

          <div
            style={{
              height: "4px",
              borderRadius:
                "99px",
              background:
                "#1e1e35",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius:
                  "99px",

                width: `${
                  ((current + 1) /
                    questions.length) *
                  100
                }%`,

                background:
                  "linear-gradient(90deg, #6366f1, #8b5cf6)",

                transition:
                  "width 0.3s ease",
              }}
            />
          </div>

          {/* QUESTION */}

          <div
            style={{
              borderRadius:
                "16px",
              padding: "28px",
              background:
                "#0f0f1e",
              border:
                "1px solid #1e1e35",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color:
                  "#f1f5f9",
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
              flexDirection:
                "column",
              gap: "10px",
            }}
          >
            {q.options.map(
              (opt, i) => {
                const isSelected =
                  answers[q._id] ===
                  i;

                return (
                  <button
                    key={i}
                    onClick={() =>
                      setAnswers(
                        (
                          previousAnswers
                        ) => ({
                          ...previousAnswers,
                          [q._id]: i,
                        })
                      )
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "14px",
                      padding:
                        "16px 20px",
                      borderRadius:
                        "14px",
                      textAlign:
                        "left",

                      background:
                        isSelected
                          ? "rgba(99,102,241,0.12)"
                          : "rgba(255,255,255,0.02)",

                      border: `1px solid ${
                        isSelected
                          ? "rgba(99,102,241,0.4)"
                          : "#1e1e35"
                      }`,

                      color:
                        isSelected
                          ? "#c7d2fe"
                          : "#94a3b8",

                      cursor:
                        "pointer",

                      transition:
                        "all 0.15s",

                      width: "100%",
                    }}
                  >
                    <span
                      style={{
                        width: "30px",
                        height:
                          "30px",
                        borderRadius:
                          "50%",
                        flexShrink: 0,

                        background:
                          isSelected
                            ? "rgba(99,102,241,0.25)"
                            : "rgba(255,255,255,0.05)",

                        border: `1px solid ${
                          isSelected
                            ? "rgba(99,102,241,0.5)"
                            : "#2a2a4a"
                        }`,

                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",

                        fontSize:
                          "12px",
                        fontWeight:
                          700,

                        color:
                          isSelected
                            ? "#818cf8"
                            : "#475569",
                      }}
                    >
                      {String.fromCharCode(
                        65 + i
                      )}
                    </span>

                    <span
                      style={{
                        fontSize:
                          "14px",

                        fontWeight:
                          isSelected
                            ? 600
                            : 400,
                      }}
                    >
                      {opt}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* PREVIOUS / NEXT */}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <button
              onClick={() =>
                setCurrent(
                  Math.max(
                    0,
                    current - 1
                  )
                )
              }
              disabled={
                current === 0
              }
              style={{
                flex: 1,
                padding: "12px",
                borderRadius:
                  "12px",

                background:
                  "rgba(255,255,255,0.03)",

                border:
                  "1px solid #1e1e35",

                color:
                  current === 0
                    ? "#2a2a4a"
                    : "#94a3b8",

                fontSize:
                  "14px",
                fontWeight: 600,

                cursor:
                  current === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Previous
            </button>

            <button
              onClick={() =>
                setCurrent(
                  Math.min(
                    questions.length -
                      1,
                    current + 1
                  )
                )
              }
              disabled={
                current ===
                questions.length - 1
              }
              style={{
                flex: 1,
                padding: "12px",
                borderRadius:
                  "12px",

                background:
                  current ===
                  questions.length -
                    1
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(99,102,241,0.12)",

                border: `1px solid ${
                  current ===
                  questions.length -
                    1
                    ? "#1e1e35"
                    : "rgba(99,102,241,0.25)"
                }`,

                color:
                  current ===
                  questions.length -
                    1
                    ? "#2a2a4a"
                    : "#a5b4fc",

                fontSize:
                  "14px",
                fontWeight: 600,

                cursor:
                  current ===
                  questions.length -
                    1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>

        {/* NAVIGATOR */}

        <div
          style={{
            width: "200px",
            flexShrink: 0,
            borderRadius: "16px",
            padding: "20px",
            background: "#0f0f1e",
            border:
              "1px solid #1e1e35",
            height: "fit-content",
            position: "sticky",
            top: "88px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#475569",
              textTransform:
                "uppercase",
              letterSpacing:
                "0.08em",
              margin:
                "0 0 14px",
            }}
          >
            Navigator
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "6px",
              marginBottom:
                "16px",
            }}
          >
            {questions.map(
              (qn, i) => {
                const isAnswered =
                  answers[
                    qn._id
                  ] !== undefined;

                const isCurrent =
                  i === current;

                return (
                  <button
                    key={qn._id || i}
                    onClick={() =>
                      setCurrent(i)
                    }
                    style={{
                      width: "100%",
                      aspectRatio:
                        "1",
                      borderRadius:
                        "8px",
                      fontSize:
                        "12px",
                      fontWeight:
                        700,
                      cursor:
                        "pointer",
                      border: "none",

                      background:
                        isCurrent
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : isAnswered
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.04)",

                      color:
                        isCurrent
                          ? "white"
                          : isAnswered
                          ? "#10b981"
                          : "#475569",
                    }}
                  >
                    {i + 1}
                  </button>
                );
              }
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "6px",
              fontSize: "11px",
              color: "#64748b",
            }}
          >
            <div>
              Current question
            </div>

            <div
              style={{
                color: "#10b981",
              }}
            >
              Answered
            </div>

            <div>
              Unanswered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}