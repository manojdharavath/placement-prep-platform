import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

/* =========================================================
   CONFIG & CONSTANTS
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

const typeColors = {
  Technical: { color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)" },
  HR: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  Behavioral: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
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

const loadingMessages = [
  "Analyzing company profile...",
  "Gathering domain questions...",
  "Preparing AI interviewer...",
  "Almost ready...",
];

/* =========================================================
   ANIMATED SCORE HOOK
========================================================= */

function useAnimatedScore(targetScore, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.max(0, Math.min(100, Number(targetScore) || 0));
    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const currentVal = Math.floor(easeOutQuad * (end - start) + start);

      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [targetScore, duration]);

  return count;
}

/* =========================================================
   SMALL REUSABLE COMPONENTS
========================================================= */

function StepNumber({ number }) {
  return (
    <div
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "99px",
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
    <div style={{ marginBottom: "14px" }}>
      <div style={{ color: "#475569", fontSize: "11px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: "13px", fontWeight: 600, lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function InterviewSimulator() {
  const navigate = useNavigate();

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
  const [errorMessage, setErrorMessage] = useState("");

  const [history, setHistory] = useState([]);
  const [qNumber, setQNumber] = useState(0);
  const [scores, setScores] = useState([]);

  const [finalReport, setFinalReport] = useState(null);
  const [typing, setTyping] = useState(false);

  // Timer & Load Message State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Exit Confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (stage === "interview") {
        e.preventDefault();
        e.returnValue = "Leave Interview? Progress will be lost.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [stage]);

  // Elapsed Time Timer
  useEffect(() => {
    let timer;
    if (stage === "interview") {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // Rotating Loader Text
  useEffect(() => {
    let msgTimer;
    if (loading) {
      msgTimer = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingMsgIndex(0);
    }
    return () => clearInterval(msgTimer);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* =========================================================
     START INTERVIEW
  ========================================================= */

  const startInterview = async (interviewConfig = config) => {
    setLoading(true);
    setErrorMessage("");
    setMessages([]);
    setHistory([]);
    setScores([]);
    setQNumber(0);
    setFinalReport(null);

    try {
      const { data } = await API.post("/interview/start", interviewConfig);

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
      setErrorMessage(
        error.response?.data?.message || "Failed to start interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    const company = useCustomCompany ? customCompany.trim() : config.company;

    if (!company) {
      setErrorMessage("Please enter a target company name.");
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
    setErrorMessage("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: answer },
    ]);

    setTyping(true);
    setLoading(true);

    const newHistory = [
      ...history,
      { question: currentQ?.question, answer },
    ];
    setHistory(newHistory);

    try {
      const { data } = await API.post("/interview/respond", {
        ...config,
        history: newHistory, // Synchronized updated history
        userAnswer: answer,
        questionNumber: qNumber,
        totalQuestions: TOTAL_QUESTIONS,
      });

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
          content: "I had trouble processing that answer. Please try again.",
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
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10)
    : 0;

  const animatedScoreVal = useAnimatedScore(finalReport?.overallScore || 0);

  /* =========================================================
     SETUP SCREEN
  ========================================================= */

  if (stage === "setup") {
    const selectedCompanies = companyGroups[companyType];
    const displayCompany = useCustomCompany
      ? customCompany.trim() || "Enter company"
      : config.company;

    return (
      <Layout title="AI Interview">
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .interview-setup-grid {
            display: grid;
            grid-template-columns: minmax(0,1.65fr) minmax(280px,0.75fr);
            gap: 36px;
          }
          .three-col-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          @media (max-width: 1024px) {
            .interview-setup-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .three-col-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px 16px 40px" : "38px 42px 60px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            className="animate-fadeInUp"
            style={{ width: "100%", maxWidth: "1180px", margin: "0 auto" }}
          >
            {/* ERROR CARD */}
            {errorMessage && (
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  color: "#f87171",
                  fontSize: "14px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ⚠️ {errorMessage}
              </div>
            )}

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
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 30px rgba(99,102,241,0.30)",
                }}
              >
                <svg
                  width="29"
                  height="29"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>

              <div>
                <h1
                  style={{
                    color: "#f1f5f9",
                    fontSize: isMobile ? "22px" : "30px",
                    fontWeight: 800,
                    margin: "0 0 7px",
                  }}
                >
                  AI Interview Simulator
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
                  Practice a personalized AI interview based on your target role, company and difficulty.
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
                className="interview-setup-grid"
                style={{ padding: isMobile ? "20px 16px" : "32px" }}
              >
                {/* LEFT SETUP PANEL */}
                <div>
                  {/* ROLE */}
                  <section style={{ marginBottom: "34px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "15px" }}>
                      <StepNumber number="1" />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0" }}>
                          Choose Job Role
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          Select the position you want to practice for.
                        </div>
                      </div>
                    </div>

                    <select
                      value={config.role}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, role: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "13px 14px",
                        borderRadius: "11px",
                        background: "#111120",
                        color: "#e2e8f0",
                        border: "1px solid #25253f",
                        outline: "none",
                        fontSize: "13px",
                      }}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </section>

                  {/* COMPANY */}
                  <section style={{ marginBottom: "34px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "15px" }}>
                      <StepNumber number="2" />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0" }}>
                          Choose Target Company
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          Select product, service, core or enter any custom company.
                        </div>
                      </div>
                    </div>

                    <div className="three-col-grid" style={{ marginBottom: "18px" }}>
                      {Object.keys(companyGroups).map((type) => {
                        const active = companyType === type && !useCustomCompany;
                        return (
                          <button
                            type="button"
                            key={type}
                            onClick={() => {
                              setCompanyType(type);
                              setUseCustomCompany(false);
                              setConfig((prev) => ({
                                ...prev,
                                company: companyGroups[type][0],
                              }));
                            }}
                            style={{
                              padding: "13px",
                              borderRadius: "11px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 700,
                              background: active ? "rgba(99,102,241,0.14)" : "rgba(255,255,255,0.025)",
                              border: active ? "1px solid rgba(99,102,241,0.45)" : "1px solid #1e1e35",
                              color: active ? "#a5b4fc" : "#64748b",
                              transition: "all 0.15s",
                            }}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>

                    {!useCustomCompany && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: "9px" }}>
                        {selectedCompanies.map((company) => {
                          const active = config.company === company;
                          return (
                            <button
                              type="button"
                              key={company}
                              onClick={() => setConfig((prev) => ({ ...prev, company }))}
                              style={{
                                padding: "11px 10px",
                                minHeight: "42px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                background: active ? "rgba(99,102,241,0.13)" : "rgba(255,255,255,0.02)",
                                border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid #1e1e35",
                                color: active ? "#c7d2fe" : "#64748b",
                              }}
                            >
                              {company}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ marginTop: "14px" }}>
                      <button
                        type="button"
                        onClick={() => setUseCustomCompany((prev) => !prev)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          cursor: "pointer",
                          background: useCustomCompany ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.02)",
                          border: useCustomCompany ? "1px solid rgba(139,92,246,0.4)" : "1px dashed #2a2a4a",
                          color: useCustomCompany ? "#c4b5fd" : "#64748b",
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
                          onChange={(e) => setCustomCompany(e.target.value)}
                          placeholder="Enter company name, e.g. Siemens"
                          style={{
                            width: "100%",
                            padding: "13px 14px",
                            borderRadius: "11px",
                            background: "#111120",
                            color: "#e2e8f0",
                            border: "1px solid #25253f",
                            outline: "none",
                            fontSize: "13px",
                            marginTop: "10px",
                          }}
                        />
                      )}
                    </div>
                  </section>

                  {/* DIFFICULTY */}
                  <section>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "15px" }}>
                      <StepNumber number="3" />
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0" }}>
                          Select Difficulty
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                          Choose the intensity of your interview.
                        </div>
                      </div>
                    </div>

                    <div className="three-col-grid">
                      {difficulties.map((difficulty) => {
                        const active = config.difficulty === difficulty;
                        const color = difficultyColors[difficulty];
                        return (
                          <button
                            type="button"
                            key={difficulty}
                            onClick={() => setConfig((prev) => ({ ...prev, difficulty }))}
                            style={{
                              padding: "14px",
                              borderRadius: "11px",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: "13px",
                              background: active ? `${color}18` : "rgba(255,255,255,0.02)",
                              border: active ? `1px solid ${color}55` : "1px solid #1e1e35",
                              color: active ? color : "#64748b",
                            }}
                          >
                            {difficulty}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* RIGHT SUMMARY PANEL */}
                <div>
                  <div
                    style={{
                      position: isMobile ? "static" : "sticky",
                      top: "90px",
                      background: "rgba(99,102,241,0.045)",
                      border: "1px solid rgba(99,102,241,0.14)",
                      borderRadius: "18px",
                      padding: "24px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#818cf8", fontWeight: 800, textTransform: "uppercase", marginBottom: "20px" }}>
                      Interview Setup
                    </div>

                    <SummaryItem label="Role" value={config.role} />
                    <SummaryItem label="Company" value={displayCompany} />
                    <SummaryItem label="Company Type" value={useCustomCompany ? "Custom" : companyType} />
                    <SummaryItem label="Difficulty" value={config.difficulty} />
                    <SummaryItem label="Questions" value={`${TOTAL_QUESTIONS} Questions`} />

                    <div style={{ height: "1px", background: "#1e1e35", margin: "20px 0" }} />

                    <button
                      type="button"
                      disabled={loading || (useCustomCompany && !customCompany.trim())}
                      onClick={handleStartInterview}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        padding: "14px",
                        opacity: loading || (useCustomCompany && !customCompany.trim()) ? 0.55 : 1,
                        cursor: loading || (useCustomCompany && !customCompany.trim()) ? "not-allowed" : "pointer",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        fontWeight: 700,
                      }}
                    >
                      {loading ? loadingMessages[loadingMsgIndex] : "Start AI Interview →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  /* =========================================================
     RESULT SCREEN
  ========================================================= */

  if (stage === "result" && finalReport) {
    const gc = gradeColors[finalReport.grade] || "#6366f1";

    return (
      <Layout title="AI Interview">
        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px 16px 40px" : "32px",
            overflowY: "auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "850px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* SCORE CARD */}
            <div
              className="animate-fadeInUp"
              style={{
                borderRadius: "24px",
                padding: isMobile ? "24px 16px" : "40px",
                textAlign: "center",
                background: "#0f0f1e",
                border: `1px solid ${gc}30`,
              }}
            >
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                {config.company} — {config.role} — {config.difficulty}
              </div>

              <div style={{ fontSize: isMobile ? "60px" : "80px", fontWeight: 900, color: gc, lineHeight: 1 }}>
                {finalReport.grade}
              </div>

              <div style={{ fontSize: isMobile ? "24px" : "32px", fontWeight: 800, color: "#f1f5f9", margin: "8px 0" }}>
                {animatedScoreVal}/100
              </div>

              <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "99px", background: `${gc}15`, color: gc, border: `1px solid ${gc}30`, fontSize: "13px", fontWeight: 700, marginBottom: "20px" }}>
                {finalReport.recommendation}
              </div>

              <p style={{ fontSize: "15px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
                {finalReport.summary}
              </p>
            </div>

            {/* METRICS SUMMARY CARD */}
            <div style={{ borderRadius: "18px", padding: "20px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
                📊 Interview Summary
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px", textAlign: "center" }}>
                <div style={{ background: "#111120", padding: "12px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Questions</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", marginTop: "4px" }}>{TOTAL_QUESTIONS}</div>
                </div>
                <div style={{ background: "#111120", padding: "12px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Average Score</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: gc, marginTop: "4px" }}>{finalReport.overallScore}%</div>
                </div>
                <div style={{ background: "#111120", padding: "12px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Duration</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", marginTop: "4px" }}>{formatTime(elapsedTime)}</div>
                </div>
                <div style={{ background: "#111120", padding: "12px", borderRadius: "10px", border: "1px solid #1f2937" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Difficulty</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#818cf8", marginTop: "4px" }}>{config.difficulty}</div>
                </div>
              </div>
            </div>

            {/* STRENGTHS + IMPROVEMENTS */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
              <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#10b981", margin: "0 0 14px" }}>✓ Strengths</h4>
                {finalReport.strengths?.map((strength, index) => (
                  <div key={index} style={{ padding: "10px 12px", borderRadius: "10px", marginBottom: "8px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                    {strength}
                  </div>
                ))}
              </div>

              <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#f43f5e", margin: "0 0 14px" }}>Areas to Improve</h4>
                {finalReport.improvements?.map((item, index) => (
                  <div key={index} style={{ padding: "10px 12px", borderRadius: "10px", marginBottom: "8px", background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.15)", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* FULL INTERVIEW HISTORY REVIEW */}
            <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
              <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
                📝 Full Interview Transcript & AI Evaluation
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {history.map((item, idx) => (
                  <div key={idx} style={{ padding: "16px", borderRadius: "12px", background: "#111120", border: "1px solid #1f2937" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8", marginBottom: "6px" }}>
                      Q{idx + 1}: {item.question}
                    </div>
                    <div style={{ fontSize: "13px", color: "#cbd5e1", background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "8px", border: "1px solid #25253f", marginBottom: "8px" }}>
                      <strong>Your Answer:</strong> {item.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "12px" }}>
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
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Start New Interview
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
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
                Update Placement Readiness →
              </button>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  /* =========================================================
     INTERVIEW CHAT SCREEN
  ========================================================= */

  const progressPercent = Math.round((qNumber / TOTAL_QUESTIONS) * 100);

  return (
    <Layout title="AI Interview">
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", width: "100%", boxSizing: "border-box" }}>
        {/* TOP BAR WITH TIMER & PROGRESS BAR */}
        <div
          style={{
            minHeight: "64px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            padding: isMobile ? "12px 16px" : "0 32px",
            gap: isMobile ? "8px" : "0",
            background: "rgba(13,13,28,0.95)",
            borderBottom: "1px solid #1e1e35",
            position: "sticky",
            top: 0,
            zIndex: 40,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
                {config.company} Interview
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>
                {config.role} • {config.difficulty}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {/* TIMER */}
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8", background: "rgba(99,102,241,0.08)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(99,102,241,0.2)" }}>
              ⏱ {formatTime(elapsedTime)}
            </span>

            {/* PROGRESS PERCENTAGE */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "80px", height: "6px", background: "#1e1e35", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${progressPercent}%`, height: "100%", background: "#6366f1", borderRadius: "99px", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                {qNumber}/{TOTAL_QUESTIONS} ({progressPercent}%)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Avg Score:</span>
              <span style={{ fontSize: "14px", fontWeight: 800, color: avgScore >= 70 ? "#10b981" : avgScore >= 40 ? "#f59e0b" : "#94a3b8" }}>
                {avgScore > 0 ? `${avgScore}/100` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* CHAT MESSAGES */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "30px 42px", display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
          <div style={{ width: "100%", maxWidth: "1050px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "12px", alignItems: "flex-start" }}>
                {msg.role !== "user" && (
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0, background: msg.role === "ai-feedback" ? "rgba(245,158,11,0.15)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: msg.role === "ai-feedback" ? "#f59e0b" : "white" }}>
                    {msg.role === "ai-feedback" ? "★" : "AI"}
                  </div>
                )}

                <div style={{ maxWidth: isMobile ? "88%" : "72%", display: "flex", flexDirection: "column", gap: "7px" }}>
                  {msg.role === "ai" && msg.type && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: typeColors[msg.type]?.bg || "rgba(99,102,241,0.1)", color: typeColors[msg.type]?.color || "#818cf8", border: `1px solid ${typeColors[msg.type]?.border || "rgba(99,102,241,0.2)"}`, textTransform: "uppercase" }}>
                        {msg.type}
                      </span>
                      <span style={{ fontSize: "11px", color: "#475569" }}>Question {msg.qNum}</span>
                    </div>
                  )}

                  <div style={{ padding: "15px 18px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? "linear-gradient(135deg,#4f46e5,#6366f1)" : msg.role === "ai-feedback" ? "rgba(245,158,11,0.055)" : "#111120", border: msg.role === "ai-feedback" ? "1px solid rgba(245,158,11,0.15)" : msg.role === "user" ? "none" : "1px solid #1e1e35", color: msg.role === "user" ? "#ffffff" : "#cbd5e1", fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </div>

                  {msg.role === "ai-feedback" && typeof msg.score === "number" && (
                    <div style={{ fontSize: "11px", color: msg.score >= 7 ? "#10b981" : msg.score >= 4 ? "#f59e0b" : "#f43f5e", fontWeight: 700 }}>
                      Answer Score: {msg.score}/10
                    </div>
                  )}

                  {msg.role === "ai" && msg.hint && (
                    <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5 }}>Hint: {msg.hint}</div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700 }}>
                  AI
                </div>
                <div style={{ display: "flex", gap: "5px", padding: "16px 18px", borderRadius: "18px 18px 18px 4px", background: "#111120", border: "1px solid #1e1e35" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT BOX */}
        <div style={{ padding: isMobile ? "12px 16px" : "18px 32px", borderTop: "1px solid #1e1e35", background: "rgba(13,13,28,0.97)", boxSizing: "border-box" }}>
          <div style={{ maxWidth: "1050px", width: "100%", margin: "0 auto", display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendAnswer();
                }
              }}
              placeholder="Type your answer here... Press Enter to send"
              rows={isMobile ? 2 : 3}
              disabled={loading}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid #1e1e35",
                color: "#f1f5f9",
                fontSize: "14px",
                outline: "none",
                resize: "none",
                lineHeight: 1.6,
                fontFamily: "inherit",
              }}
            />

            <button
              type="button"
              onClick={sendAnswer}
              disabled={!userInput.trim() || loading}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                flexShrink: 0,
                background: userInput.trim() && !loading ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e1e35",
                border: "none",
                cursor: userInput.trim() && !loading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {loading ? (
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid #475569", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}