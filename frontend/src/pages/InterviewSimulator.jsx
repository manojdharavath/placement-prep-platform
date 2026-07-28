import { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";
/* =========================================================
   INTERVIEW CONFIGURATION
========================================================= */

const roles = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Embedded Systems Engineer",
  "VLSI Engineer",
  "Electronics Engineer",
  "Network Engineer",
  "Graduate Engineer Trainee",
];

const companyGroups = {
  Product: [
    "Google",
    "Amazon",
    "Microsoft",
    "Adobe",
    "Cisco",
    "Oracle",
    "Flipkart",
    "NVIDIA",
  ],

  Service: [
    "TCS",
    "Infosys",
    "Wipro",
    "Cognizant",
    "Accenture",
    "Capgemini",
    "Deloitte",
  ],

  Core: [
    "Qualcomm",
    "Texas Instruments",
    "Intel",
    "NVIDIA",
    "Samsung Semiconductor",
    "Micron",
    "NXP",
    "Analog Devices",
  ],
};

const difficulties = ["Easy", "Medium", "Hard"];

const TOTAL_QUESTIONS = 6;

/* =========================================================
   COLORS
========================================================= */

const typeColors = {
  Technical: {
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.2)",
  },

  HR: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
  },

  Behavioral: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
};

const gradeColors = {
  "A+": "#10b981",
  A: "#10b981",
  "B+": "#f59e0b",
  B: "#f59e0b",
  C: "#f43f5e",
  D: "#f43f5e",
};

const difficultyColors = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#f43f5e",
};

/* =========================================================
   SHARED STYLES
========================================================= */

const sectionTitle = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#e2e8f0",
};

const sectionSubtitle = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "3px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: "11px",
  background: "#111120",
  color: "#e2e8f0",
  border: "1px solid #25253f",
  outline: "none",
  fontSize: "13px",
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StepNumber({ number }) {
  return (
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "9px",
        background: "rgba(99,102,241,0.12)",
        border: "1px solid rgba(99,102,241,0.25)",
        color: "#818cf8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {number}
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          color: "#475569",
          fontSize: "11px",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#cbd5e1",
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function InterviewSimulator() {
  const [stage, setStage] = useState("setup");

  const [config, setConfig] = useState({
    role: roles[0],
    company: companyGroups.Product[0],
    difficulty: "Medium",
  });

  const [companyType, setCompanyType] = useState("Product");
  const [useCustomCompany, setUseCustomCompany] = useState(false);
  const [customCompany, setCustomCompany] = useState("");

  const [messages, setMessages] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [qNumber, setQNumber] = useState(0);
  const [scores, setScores] = useState([]);

  const [finalReport, setFinalReport] = useState(null);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, typing]);

  /* =========================================================
     START INTERVIEW
  ========================================================= */

  const startInterview = async (interviewConfig = config) => {
    setLoading(true);

    setMessages([]);
    setHistory([]);
    setScores([]);
    setQNumber(0);
    setFinalReport(null);

    try {
      const { data } = await API.post(
        "/interview/start",
        interviewConfig
      );

      setConfig(interviewConfig);

      setCurrentQ(data);
      setQNumber(1);

      setMessages([
        {
          role: "ai",
          content: data.question,
          type: data.type,
          hint: data.hint,
          qNum: 1,
        },
      ]);

      setStage("interview");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to start interview."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     START FROM SETUP
  ========================================================= */

  const handleStartInterview = () => {
    const company = useCustomCompany
      ? customCompany.trim()
      : config.company;

    if (!company) {
      alert("Please enter a company name.");
      return;
    }

   const interviewConfig = {
  ...config,
  company,
  companyType: useCustomCompany ? "Custom" : companyType,
};

    startInterview(interviewConfig);
  };

  /* =========================================================
     SEND ANSWER
  ========================================================= */

  const sendAnswer = async () => {
    if (!userInput.trim() || loading) return;

    const answer = userInput.trim();

    setUserInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: answer,
      },
    ]);

    setTyping(true);
    setLoading(true);

    const newHistory = [
      ...history,
      {
        question: currentQ.question,
        answer,
      },
    ];

    setHistory(newHistory);

    try {
      const { data } = await API.post(
        "/interview/respond",
        {
          ...config,

          // Previous questions only.
          // Current answer is already sent separately below.
          history,

          userAnswer: answer,
          questionNumber: qNumber,
          totalQuestions: TOTAL_QUESTIONS,
        }
      );

      setScores((prev) => [...prev, data.score]);

      setTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai-feedback",
          content: data.feedback,
          score: data.score,
        },
      ]);

      if (data.isComplete && data.finalReport) {
        setTimeout(() => {
          setFinalReport(data.finalReport);
          setStage("result");
        }, 1200);

        return;
      }

      if (data.nextQuestion) {
        const nextQNum = qNumber + 1;

        setQNumber(nextQNum);
        setCurrentQ(data.nextQuestion);

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              content: data.nextQuestion.question,
              type: data.nextQuestion.type,
              hint: data.nextQuestion.hint,
              qNum: nextQNum,
            },
          ]);
        }, 600);
      }
    } catch (error) {
      console.error(error);

      setTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai-feedback",
          content:
            "I had trouble processing that answer. Please try again.",
          score: 0,
        },
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const avgScore = scores.length
    ? Math.round(
        (scores.reduce((a, b) => a + b, 0) /
          scores.length) *
          10
      )
    : 0;

  /* =========================================================
     SETUP SCREEN
  ========================================================= */

  if (stage === "setup") {
    const selectedCompanies =
      companyGroups[companyType];

    const displayCompany = useCustomCompany
      ? customCompany.trim() || "Enter company"
      : config.company;

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
            minWidth: 0,
          }}
        >
          <Navbar title="AI Interview" />

          <main
            style={{
              flex: 1,
              padding: "38px 42px 60px",
            }}
          >
            <div
              className="animate-fadeInUp"
              style={{
                width: "100%",
                maxWidth: "1180px",
                margin: "0 auto",
              }}
            >
              {/* HEADER */}

              <div
                style={{
                  marginBottom: "30px",
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                    flexShrink: 0,

                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6)",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    boxShadow:
                      "0 8px 30px rgba(99,102,241,0.30)",
                  }}
                >
                  <svg
                    width="29"
                    height="29"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>

                <div>
                  <h1
                    style={{
                      color: "#f1f5f9",
                      fontSize: "30px",
                      fontWeight: 800,
                      margin: "0 0 7px",
                    }}
                  >
                    AI Interview Simulator
                  </h1>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "14px",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    Practice a personalized AI interview
                    based on your target role, company and
                    difficulty.
                  </p>
                </div>
              </div>

              {/* MAIN CARD */}

              <div
                style={{
                  background: "#0f0f1e",
                  border: "1px solid #1e1e35",
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "32px",

                    display: "grid",

                    gridTemplateColumns:
                      "minmax(0,1.65fr) minmax(280px,0.75fr)",

                    gap: "36px",
                  }}
                >
                  {/* ================= LEFT ================= */}

                  <div>
                    {/* ROLE */}

                    <section
                      style={{
                        marginBottom: "34px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                          marginBottom: "15px",
                        }}
                      >
                        <StepNumber number="1" />

                        <div>
                          <div style={sectionTitle}>
                            Choose Job Role
                          </div>

                          <div style={sectionSubtitle}>
                            Select the position you want to
                            practice for.
                          </div>
                        </div>
                      </div>

                      <select
                        value={config.role}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                        style={inputStyle}
                      >
                        {roles.map((role) => (
                          <option
                            key={role}
                            value={role}
                          >
                            {role}
                          </option>
                        ))}
                      </select>
                    </section>

                    {/* COMPANY */}

                    <section
                      style={{
                        marginBottom: "34px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                          marginBottom: "15px",
                        }}
                      >
                        <StepNumber number="2" />

                        <div>
                          <div style={sectionTitle}>
                            Choose Target Company
                          </div>

                          <div style={sectionSubtitle}>
                            Select product, service, core or
                            enter any custom company.
                          </div>
                        </div>
                      </div>

                      {/* CATEGORY BUTTONS */}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(3,1fr)",
                          gap: "10px",
                          marginBottom: "18px",
                        }}
                      >
                        {Object.keys(companyGroups).map(
                          (type) => {
                            const active =
                              companyType === type &&
                              !useCustomCompany;

                            return (
                              <button
                                type="button"
                                key={type}
                                onClick={() => {
                                  setCompanyType(type);
                                  setUseCustomCompany(
                                    false
                                  );

                                  setConfig((prev) => ({
                                    ...prev,
                                    company:
                                      companyGroups[
                                        type
                                      ][0],
                                  }));
                                }}
                                style={{
                                  padding: "13px",

                                  borderRadius: "11px",

                                  cursor: "pointer",

                                  fontSize: "13px",
                                  fontWeight: 700,

                                  background: active
                                    ? "rgba(99,102,241,0.14)"
                                    : "rgba(255,255,255,0.025)",

                                  border: active
                                    ? "1px solid rgba(99,102,241,0.45)"
                                    : "1px solid #1e1e35",

                                  color: active
                                    ? "#a5b4fc"
                                    : "#64748b",

                                  transition:
                                    "all 0.15s",
                                }}
                              >
                                {type}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* COMPANY BUTTONS */}

                      {!useCustomCompany && (
                        <div
                          style={{
                            display: "grid",

                            gridTemplateColumns:
                              "repeat(auto-fit,minmax(135px,1fr))",

                            gap: "9px",
                          }}
                        >
                          {selectedCompanies.map(
                            (company) => {
                              const active =
                                config.company ===
                                company;

                              return (
                                <button
                                  type="button"
                                  key={company}
                                  onClick={() =>
                                    setConfig(
                                      (prev) => ({
                                        ...prev,
                                        company,
                                      })
                                    )
                                  }
                                  style={{
                                    padding:
                                      "11px 10px",

                                    minHeight: "42px",

                                    borderRadius:
                                      "10px",

                                    cursor: "pointer",

                                    fontSize: "12px",
                                    fontWeight: 600,

                                    background: active
                                      ? "rgba(99,102,241,0.13)"
                                      : "rgba(255,255,255,0.02)",

                                    border: active
                                      ? "1px solid rgba(99,102,241,0.4)"
                                      : "1px solid #1e1e35",

                                    color: active
                                      ? "#c7d2fe"
                                      : "#64748b",

                                    transition:
                                      "all 0.15s",
                                  }}
                                >
                                  {company}
                                </button>
                              );
                            }
                          )}
                        </div>
                      )}

                      {/* CUSTOM COMPANY */}

                      <div
                        style={{
                          marginTop: "14px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setUseCustomCompany(
                              (prev) => !prev
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "12px",

                            borderRadius: "10px",

                            cursor: "pointer",

                            background:
                              useCustomCompany
                                ? "rgba(139,92,246,0.12)"
                                : "rgba(255,255,255,0.02)",

                            border:
                              useCustomCompany
                                ? "1px solid rgba(139,92,246,0.4)"
                                : "1px dashed #2a2a4a",

                            color: useCustomCompany
                              ? "#c4b5fd"
                              : "#64748b",

                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          + Other / Custom Company
                        </button>

                        {useCustomCompany && (
                          <input
                            autoFocus
                            type="text"
                            value={customCompany}
                            onChange={(e) =>
                              setCustomCompany(
                                e.target.value
                              )
                            }
                            placeholder="Enter company name, e.g. Siemens"
                            style={{
                              ...inputStyle,
                              marginTop: "10px",
                            }}
                          />
                        )}
                      </div>
                    </section>

                    {/* DIFFICULTY */}

                    <section>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "11px",
                          marginBottom: "15px",
                        }}
                      >
                        <StepNumber number="3" />

                        <div>
                          <div style={sectionTitle}>
                            Select Difficulty
                          </div>

                          <div style={sectionSubtitle}>
                            Choose the intensity of your
                            interview.
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",

                          gridTemplateColumns:
                            "repeat(3,1fr)",

                          gap: "10px",
                        }}
                      >
                        {difficulties.map(
                          (difficulty) => {
                            const active =
                              config.difficulty ===
                              difficulty;

                            const color =
                              difficultyColors[
                                difficulty
                              ];

                            return (
                              <button
                                type="button"
                                key={difficulty}
                                onClick={() =>
                                  setConfig(
                                    (prev) => ({
                                      ...prev,
                                      difficulty,
                                    })
                                  )
                                }
                                style={{
                                  padding: "14px",

                                  borderRadius:
                                    "11px",

                                  cursor: "pointer",

                                  fontWeight: 700,
                                  fontSize: "13px",

                                  background: active
                                    ? `${color}18`
                                    : "rgba(255,255,255,0.02)",

                                  border: active
                                    ? `1px solid ${color}55`
                                    : "1px solid #1e1e35",

                                  color: active
                                    ? color
                                    : "#64748b",

                                  transition:
                                    "all 0.15s",
                                }}
                              >
                                {difficulty}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </section>
                  </div>

                  {/* ================= RIGHT ================= */}

                  <div>
                    <div
                      style={{
                        position: "sticky",
                        top: "90px",

                        background:
                          "rgba(99,102,241,0.045)",

                        border:
                          "1px solid rgba(99,102,241,0.14)",

                        borderRadius: "18px",

                        padding: "24px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",

                          color: "#818cf8",

                          fontWeight: 800,

                          letterSpacing: "0.08em",

                          textTransform:
                            "uppercase",

                          marginBottom: "20px",
                        }}
                      >
                        Interview Setup
                      </div>

                      <SummaryItem
                        label="Role"
                        value={config.role}
                      />

                      <SummaryItem
                        label="Company"
                        value={displayCompany}
                      />

                      <SummaryItem
                        label="Company Type"
                        value={
                          useCustomCompany
                            ? "Custom"
                            : companyType
                        }
                      />

                      <SummaryItem
                        label="Difficulty"
                        value={config.difficulty}
                      />

                      <SummaryItem
                        label="Questions"
                        value={`${TOTAL_QUESTIONS} Questions`}
                      />

                      <div
                        style={{
                          height: "1px",
                          background: "#1e1e35",
                          margin: "20px 0",
                        }}
                      />

                      <div
                        style={{
                          padding: "14px",

                          borderRadius: "11px",

                          background:
                            "rgba(16,185,129,0.055)",

                          border:
                            "1px solid rgba(16,185,129,0.14)",

                          marginBottom: "18px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#10b981",
                            marginBottom: "5px",
                          }}
                        >
                          Personalized AI Interview
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            lineHeight: 1.6,
                          }}
                        >
                          AI questions and feedback
                          will be generated according
                          to your selected role,
                          company and difficulty.
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          loading ||
                          (useCustomCompany &&
                            !customCompany.trim())
                        }
                        onClick={
                          handleStartInterview
                        }
                        className="btn-primary"
                        style={{
                          width: "100%",
                          padding: "14px",

                          opacity:
                            loading ||
                            (useCustomCompany &&
                              !customCompany.trim())
                              ? 0.55
                              : 1,

                          cursor:
                            loading ||
                            (useCustomCompany &&
                              !customCompany.trim())
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {loading
                          ? "Preparing Interview..."
                          : "Start AI Interview →"}
                      </button>

                      <p
                        style={{
                          color: "#475569",
                          fontSize: "11px",
                          textAlign: "center",
                          margin: "12px 0 0",
                          lineHeight: 1.5,
                        }}
                      >
                        You will receive feedback
                        after every answer and a
                        detailed report at the end.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     RESULT SCREEN
  ========================================================= */

  if (stage === "result" && finalReport) {
    const gc =
      gradeColors[finalReport.grade] || "#6366f1";

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
          <Navbar title="AI Interview" />

          <main
            style={{
              flex: 1,
              padding: "32px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                maxWidth: "850px",
                margin: "0 auto",

                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              {/* SCORE */}

              <div
                className="animate-fadeInUp"
                style={{
                  borderRadius: "24px",

                  padding: "40px",

                  textAlign: "center",

                  background: "#0f0f1e",

                  border: `1px solid ${gc}30`,
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  {config.company} — {config.role} —{" "}
                  {config.difficulty}
                </div>

                <div
                  style={{
                    fontSize: "80px",
                    fontWeight: 900,
                    color: gc,
                    lineHeight: 1,
                  }}
                >
                  {finalReport.grade}
                </div>

                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 800,
                    color: "#f1f5f9",
                    margin: "8px 0",
                  }}
                >
                  {finalReport.overallScore}/100
                </div>

                <div
                  style={{
                    display: "inline-block",

                    padding: "6px 16px",

                    borderRadius: "99px",

                    background: `${gc}15`,

                    color: gc,

                    border: `1px solid ${gc}30`,

                    fontSize: "13px",
                    fontWeight: 700,

                    marginBottom: "20px",
                  }}
                >
                  {finalReport.recommendation}
                </div>

                <p
                  style={{
                    fontSize: "15px",

                    color: "#94a3b8",

                    maxWidth: "600px",

                    margin: "0 auto",

                    lineHeight: 1.7,
                  }}
                >
                  {finalReport.summary}
                </p>
              </div>

              {/* STRENGTHS + IMPROVEMENTS */}

              <div
                style={{
                  display: "grid",

                  gridTemplateColumns: "1fr 1fr",

                  gap: "16px",
                }}
              >
                <div
                  style={{
                    borderRadius: "18px",

                    padding: "24px",

                    background: "#0f0f1e",

                    border: "1px solid #1e1e35",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#10b981",
                      margin: "0 0 14px",
                    }}
                  >
                    ✓ Strengths
                  </h4>

                  {finalReport.strengths?.map(
                    (strength, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "10px 12px",

                          borderRadius: "10px",

                          marginBottom: "8px",

                          background:
                            "rgba(16,185,129,0.06)",

                          border:
                            "1px solid rgba(16,185,129,0.15)",

                          fontSize: "13px",

                          color: "#94a3b8",

                          lineHeight: 1.5,
                        }}
                      >
                        {strength}
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    borderRadius: "18px",

                    padding: "24px",

                    background: "#0f0f1e",

                    border: "1px solid #1e1e35",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#f43f5e",
                      margin: "0 0 14px",
                    }}
                  >
                    Areas to Improve
                  </h4>

                  {finalReport.improvements?.map(
                    (item, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "10px 12px",

                          borderRadius: "10px",

                          marginBottom: "8px",

                          background:
                            "rgba(244,63,94,0.06)",

                          border:
                            "1px solid rgba(244,63,94,0.15)",

                          fontSize: "13px",

                          color: "#94a3b8",

                          lineHeight: 1.5,
                        }}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* NEXT STEPS */}

              <div
                style={{
                  borderRadius: "18px",

                  padding: "24px",

                  background: "#0f0f1e",

                  border: "1px solid #1e1e35",
                }}
              >
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#818cf8",
                    margin: "0 0 14px",
                  }}
                >
                  Recommended Next Steps
                </h4>

                {finalReport.nextSteps?.map(
                  (step, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",

                        alignItems: "flex-start",

                        gap: "12px",

                        marginBottom: "12px",

                        color: "#94a3b8",

                        fontSize: "13px",

                        lineHeight: 1.6,
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",

                          borderRadius: "7px",

                          flexShrink: 0,

                          background:
                            "rgba(99,102,241,0.1)",

                          color: "#818cf8",

                          display: "flex",

                          alignItems: "center",

                          justifyContent:
                            "center",

                          fontSize: "11px",

                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>{step}</div>
                    </div>
                  )
                )}
              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setStage("setup");
                    setMessages([]);
                    setHistory([]);
                    setScores([]);
                    setFinalReport(null);
                    setQNumber(0);
                    setCurrentQ(null);
                  }}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: "13px",
                  }}
                >
                  Start New Interview
                </button>

                <button
                  type="button"
                  onClick={() =>
                    (window.location.href =
                      "/dashboard")
                  }
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
                  Go to Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     INTERVIEW CHAT SCREEN
  ========================================================= */

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

          height: "100vh",
        }}
      >
        {/* TOP BAR */}

        <div
          style={{
            minHeight: "64px",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            padding: "0 32px",

            background: "rgba(13,13,28,0.95)",

            borderBottom: "1px solid #1e1e35",

            position: "sticky",

            top: 0,

            zIndex: 40,
          }}
        >
          {/* COMPANY */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",

                borderRadius: "10px",

                background:
                  "linear-gradient(135deg,#6366f1,#8b5cf6)",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#f1f5f9",
                }}
              >
                {config.company} Interview
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
              >
                {config.role} • {config.difficulty}
              </div>
            </div>
          </div>

          {/* PROGRESS */}

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
              }}
            >
              {Array.from({
                length: TOTAL_QUESTIONS,
              }).map((_, index) => {
                let background = "#1e1e35";

                if (index < scores.length) {
                  background =
                    scores[index] >= 7
                      ? "#10b981"
                      : scores[index] >= 4
                      ? "#f59e0b"
                      : "#f43f5e";
                } else if (
                  index === qNumber - 1
                ) {
                  background = "#6366f1";
                }

                return (
                  <div
                    key={index}
                    style={{
                      width: "28px",

                      height: "6px",

                      borderRadius: "99px",

                      background,

                      transition:
                        "background 0.3s",
                    }}
                  />
                );
              })}
            </div>

            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {qNumber}/{TOTAL_QUESTIONS}
            </span>
          </div>

          {/* AVG */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              Avg Score:
            </span>

            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,

                color:
                  avgScore >= 70
                    ? "#10b981"
                    : avgScore >= 40
                    ? "#f59e0b"
                    : "#94a3b8",
              }}
            >
              {avgScore > 0
                ? `${avgScore}/100`
                : "—"}
            </span>
          </div>
        </div>

        {/* CHAT */}

        <div
          style={{
            flex: 1,

            overflowY: "auto",

            padding: "30px 42px",

            display: "flex",

            flexDirection: "column",

            gap: "18px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1050px",
              margin: "0 auto",

              display: "flex",
              flexDirection: "column",

              gap: "18px",
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",

                  justifyContent:
                    msg.role === "user"
                      ? "flex-end"
                      : "flex-start",

                  gap: "12px",

                  alignItems: "flex-start",
                }}
              >
                {/* AI AVATAR */}

                {msg.role !== "user" && (
                  <div
                    style={{
                      width: "38px",
                      height: "38px",

                      borderRadius: "10px",

                      flexShrink: 0,

                      background:
                        msg.role ===
                        "ai-feedback"
                          ? "rgba(245,158,11,0.15)"
                          : "linear-gradient(135deg,#6366f1,#8b5cf6)",

                      display: "flex",

                      alignItems: "center",

                      justifyContent:
                        "center",

                      fontSize: "13px",

                      fontWeight: 700,

                      color:
                        msg.role ===
                        "ai-feedback"
                          ? "#f59e0b"
                          : "white",
                    }}
                  >
                    {msg.role ===
                    "ai-feedback"
                      ? "★"
                      : "AI"}
                  </div>
                )}

                <div
                  style={{
                    maxWidth: "72%",

                    display: "flex",

                    flexDirection: "column",

                    gap: "7px",
                  }}
                >
                  {/* QUESTION TYPE */}

                  {msg.role === "ai" &&
                    msg.type && (
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",

                            fontWeight: 700,

                            padding:
                              "3px 8px",

                            borderRadius: "6px",

                            background:
                              typeColors[
                                msg.type
                              ]?.bg ||
                              "rgba(99,102,241,0.1)",

                            color:
                              typeColors[
                                msg.type
                              ]?.color ||
                              "#818cf8",

                            border: `1px solid ${
                              typeColors[
                                msg.type
                              ]?.border ||
                              "rgba(99,102,241,0.2)"
                            }`,

                            textTransform:
                              "uppercase",

                            letterSpacing:
                              "0.05em",
                          }}
                        >
                          {msg.type}
                        </span>

                        <span
                          style={{
                            fontSize: "11px",
                            color: "#475569",
                          }}
                        >
                          Question {msg.qNum}
                        </span>
                      </div>
                    )}

                  {/* MESSAGE */}

                  <div
                    style={{
                      padding: "15px 18px",

                      borderRadius:
                        msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",

                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg,#4f46e5,#6366f1)"
                          : msg.role ===
                            "ai-feedback"
                          ? "rgba(245,158,11,0.055)"
                          : "#111120",

                      border:
                        msg.role ===
                        "ai-feedback"
                          ? "1px solid rgba(245,158,11,0.15)"
                          : msg.role === "user"
                          ? "none"
                          : "1px solid #1e1e35",

                      color:
                        msg.role === "user"
                          ? "#ffffff"
                          : "#cbd5e1",

                      fontSize: "14px",

                      lineHeight: 1.7,

                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* SCORE */}

                  {msg.role ===
                    "ai-feedback" &&
                    typeof msg.score ===
                      "number" && (
                      <div
                        style={{
                          fontSize: "11px",

                          color:
                            msg.score >= 7
                              ? "#10b981"
                              : msg.score >= 4
                              ? "#f59e0b"
                              : "#f43f5e",

                          fontWeight: 700,
                        }}
                      >
                        Answer Score:{" "}
                        {msg.score}/10
                      </div>
                    )}

                  {/* HINT */}

                  {msg.role === "ai" &&
                    msg.hint && (
                      <div
                        style={{
                          fontSize: "11px",

                          color: "#475569",

                          lineHeight: 1.5,
                        }}
                      >
                        Hint: {msg.hint}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* TYPING */}

            {typing && (
              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",

                    borderRadius: "10px",

                    background:
                      "linear-gradient(135deg,#6366f1,#8b5cf6)",

                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                      "center",

                    color: "white",

                    fontSize: "12px",

                    fontWeight: 700,
                  }}
                >
                  AI
                </div>

                <div
                  style={{
                    display: "flex",

                    gap: "5px",

                    padding: "16px 18px",

                    borderRadius:
                      "18px 18px 18px 4px",

                    background: "#111120",

                    border:
                      "1px solid #1e1e35",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "6px",

                        height: "6px",

                        borderRadius: "50%",

                        background: "#6366f1",

                        animation:
                          "pulse 1.2s ease-in-out infinite",

                        animationDelay: `${
                          i * 0.2
                        }s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT */}

        <div
          style={{
            padding: "18px 32px",

            borderTop: "1px solid #1e1e35",

            background:
              "rgba(13,13,28,0.97)",
          }}
        >
          <div
            style={{
              maxWidth: "1050px",

              width: "100%",

              margin: "0 auto",

              display: "flex",

              gap: "12px",

              alignItems: "flex-end",
            }}
          >
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) =>
                setUserInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendAnswer();
                }
              }}
              placeholder="Type your answer here... Press Enter to send"
              rows={3}
              disabled={loading}
              style={{
                flex: 1,

                padding: "14px 18px",

                borderRadius: "14px",

                background:
                  "rgba(255,255,255,0.04)",

                border:
                  "1px solid #1e1e35",

                color: "#f1f5f9",

                fontSize: "14px",

                outline: "none",

                resize: "none",

                lineHeight: 1.6,

                fontFamily:
                  "Inter, sans-serif",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor =
                  "#6366f1")
              }
              onBlur={(e) =>
                (e.target.style.borderColor =
                  "#1e1e35")
              }
            />

            <button
              type="button"
              onClick={sendAnswer}
              disabled={
                !userInput.trim() || loading
              }
              style={{
                width: "50px",

                height: "50px",

                borderRadius: "12px",

                flexShrink: 0,

                background:
                  userInput.trim() &&
                  !loading
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "#1e1e35",

                border: "none",

                cursor:
                  userInput.trim() &&
                  !loading
                    ? "pointer"
                    : "not-allowed",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              {loading ? (
                <div
                  style={{
                    width: "18px",

                    height: "18px",

                    borderRadius: "50%",

                    border:
                      "2px solid #475569",

                    borderTopColor:
                      "transparent",

                    animation:
                      "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line
                    x1="22"
                    y1="2"
                    x2="11"
                    y2="13"
                  />

                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          <p
            style={{
              fontSize: "11px",

              color: "#334155",

              margin: "8px 0 0",

              textAlign: "center",
            }}
          >
            Enter to send • Shift+Enter for new
            line • Question {qNumber} of{" "}
            {TOTAL_QUESTIONS}
          </p>
        </div>
      </div>
    </div>
  );
}