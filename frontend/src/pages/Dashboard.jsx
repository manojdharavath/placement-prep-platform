import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

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

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const rawReadiness = dashboard?.readiness?.score || 0;
  const animatedReadiness = useAnimatedScore(rawReadiness);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await API.get("/ai-dashboard");
      setDashboard(data);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(
        err.response?.data?.message || "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "70vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                border: "3px solid #252540",
                borderTopColor: "#6366f1",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
            <p
              style={{
                color: "#64748b",
                marginTop: "16px",
                fontSize: "14px",
              }}
            >
              Loading your dashboard...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  const user = dashboard?.user || {};
  const stats = dashboard?.stats || {};

  const dsa = stats?.dsa || { solved: 0, total: 0, progress: 0 };
  const mockTests = stats?.mockTests || { completed: 0, averageScore: 0 };
  const interviews = stats?.interviews || { completed: 0, averageScore: 0 };

  const isBrandNewUser =
    dsa.solved === 0 && mockTests.completed === 0 && interviews.completed === 0;

  const aiInsight =
    dashboard?.aiInsight ||
    "Complete some preparation activities to receive personalized insights.";

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "Student";

  const getDynamicSubtitle = (score) => {
    if (isBrandNewUser) return "Welcome to PlacementPrep! Let's build your placement readiness.";
    if (score >= 75) return "You're making outstanding progress toward your dream company!";
    if (score >= 40) return "You're making steady progress. Keep up the momentum!";
    return "Keep solving problems and practicing interviews to boost your score.";
  };

  const cardStyle = {
    background: "#0f0f1e",
    border: "1px solid #1e1e35",
    borderRadius: "16px",
  };

  const statCards = [
    {
      title: "DSA Sheet",
      value: `${dsa.solved} Solved`,
      detail: `${dsa.progress}% Progress`,
      progress: dsa.progress,
      subtitle: dsa.total > 0 ? `${dsa.total} problems available` : "Start solving problems",
      path: "/dsa",
    },
    {
      title: "Mock Tests",
      value: `${mockTests.completed} Completed`,
      detail: `${mockTests.averageScore}% Avg Score`,
      progress: mockTests.averageScore,
      subtitle: mockTests.completed > 0 ? "Based on completed tests" : "No tests completed yet",
      path: "/mock-tests",
    },
    {
      title: "AI Interviews",
      value: `${interviews.completed} Completed`,
      detail: `${interviews.averageScore}% Avg Score`,
      progress: interviews.averageScore,
      subtitle: interviews.completed > 0 ? "Based on completed interviews" : "No interviews completed yet",
      path: "/interview",
    },
  ];

  const quickActions = [
    {
      title: "Solve DSA",
      desc: "Practice company-specific problems",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      color: "#6366f1",
      path: "/dsa",
    },
    {
      title: "Take Mock Test",
      desc: "Fresh AI-generated MCQ sets",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      ),
      color: "#10b981",
      path: "/mock-tests",
    },
    {
      title: "AI Interview",
      desc: "Practice role-specific questions",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
        </svg>
      ),
      color: "#f59e0b",
      path: "/interview",
    },
    {
      title: "Analyze Resume",
      desc: "Check ATS compatibility score",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      color: "#8b5cf6",
      path: "/resume-analyzer",
    },
  ];

  return (
    <Layout title="Dashboard">
      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 12px 32px" : "28px 32px 40px",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1450px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "16px" : "22px",
          }}
        >
          {/* WELCOME HEADER */}
          <div>
            <h1
              style={{
                margin: 0,
                color: "#f8fafc",
                fontSize: isMobile ? "24px" : "40px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              Welcome back, {firstName}
            </h1>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              {getDynamicSubtitle(rawReadiness)}
            </p>
          </div>

          {/* EMPTY STATE BANNER */}
          {isBrandNewUser && (
            <div
              style={{
                padding: isMobile ? "16px" : "20px 24px",
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.06), #0f0f1e)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginBottom: "2px" }}>
                  👋 You're just getting started!
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Complete your first DSA problem or mock test to start building your placement readiness score.
                </div>
              </div>
              <button
                onClick={() => navigate("/dsa")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                Start Practice →
              </button>
            </div>
          )}

          {/* ERROR ALERT */}
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                color: "#f87171",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* PLACEMENT READINESS */}
          <section
            style={{
              ...cardStyle,
              padding: isMobile ? "18px 16px" : "26px 30px",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.11), rgba(139,92,246,0.04), #0f0f1e)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                gap: isMobile ? "16px" : "24px",
              }}
            >
              <div style={{ flex: "1 1 320px" }}>
                <div
                  style={{
                    color: "#818cf8",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  Placement Readiness
                </div>

                <h2
                  style={{
                    margin: 0,
                    color: "#f8fafc",
                    fontSize: isMobile ? "18px" : "22px",
                    fontWeight: 750,
                  }}
                >
                  Your overall preparation score
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    maxWidth: "560px",
                    margin: "6px 0 0",
                  }}
                >
                  Calculated from your DSA progress, mock test performance, and AI interview performance.
                </p>
              </div>

              <div style={{ minWidth: isMobile ? "100%" : "280px", flex: isMobile ? "1 1 auto" : "0 1 400px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
                    Overall readiness
                  </span>

                  <div>
                    <span
                      style={{
                        color: "#f8fafc",
                        fontSize: isMobile ? "28px" : "34px",
                        fontWeight: 850,
                        lineHeight: 1,
                      }}
                    >
                      {animatedReadiness}
                    </span>
                    <span style={{ color: "#818cf8", fontSize: "16px", fontWeight: 700 }}>
                      %
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#1b1b31",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(Math.max(animatedReadiness, 0), 100)}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                      transition: "width 0.35s ease",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    color: "#475569",
                    fontSize: "10.5px",
                  }}
                >
                  <span>Beginner</span>
                  <span>Learning</span>
                  <span>Progressing</span>
                  <span>Placement Ready</span>
                </div>
              </div>
            </div>
          </section>

          {/* STAT CARDS */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: isMobile ? "12px" : "18px",
            }}
          >
            {statCards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}
                style={{
                  ...cardStyle,
                  padding: isMobile ? "16px" : "20px",
                  minHeight: isMobile ? "auto" : "160px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1e1e35";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        color: "#818cf8",
                        fontSize: "11px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                      }}
                    >
                      {card.title}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>→</span>
                  </div>

                  <div style={{ color: "#f1f5f9", fontSize: "22px", fontWeight: 800, marginBottom: "2px" }}>
                    {card.value}
                  </div>

                  <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
                    {card.detail}
                  </div>
                </div>

                <div style={{ marginTop: isMobile ? "12px" : "0" }}>
                  <div
                    style={{
                      height: "5px",
                      borderRadius: "999px",
                      background: "#1b1b31",
                      overflow: "hidden",
                      marginBottom: "6px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(Math.max(card.progress, 0), 100)}%`,
                        borderRadius: "999px",
                        background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                        transition: "width 0.35s ease",
                      }}
                    />
                  </div>

                  <div style={{ color: "#475569", fontSize: "10.5px" }}>
                    {card.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* QUICK ACTIONS */}
          <section style={{ ...cardStyle, padding: isMobile ? "16px" : "20px" }}>
            <div style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 700, marginBottom: "12px" }}>
              Quick Actions
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
                gap: isMobile ? "10px" : "14px",
              }}
            >
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#111120",
                    border: "1px solid #1f2937",
                    cursor: "pointer",
                    transition: "border-color 0.15s ease, transform 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = action.color;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1f2937";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: `${action.color}15`,
                      color: action.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "10px",
                    }}
                  >
                    {action.icon}
                  </div>

                  <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 700, marginBottom: "2px" }}>
                    {action.title}
                  </div>

                  <div style={{ color: "#64748b", fontSize: "11.5px" }}>
                    {action.desc}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI INSIGHT */}
          <section style={{ ...cardStyle, padding: isMobile ? "16px" : "22px 24px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "12px" : "16px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  flexShrink: 0,
                  borderRadius: "10px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#818cf8",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" />
                  <path d="m19 3 1.5 3L22 7.5 19 9l-1.5 3L16 9l-3-1.5L16 6z" />
                </svg>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ color: "#818cf8", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>
                  AI Insight
                </div>

                <p style={{ margin: 0, color: "#cbd5e1", fontSize: "13.5px", lineHeight: 1.65, maxWidth: "950px" }}>
                  {aiInsight}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}