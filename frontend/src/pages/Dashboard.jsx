import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        err.response?.data?.message ||
          "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
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
      </div>
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  const user = dashboard?.user || {};

  const readiness = dashboard?.readiness?.score || 0;

  const stats = dashboard?.stats || {};

  const dsa = stats?.dsa || {
    solved: 0,
    total: 0,
    progress: 0,
  };

  const mockTests = stats?.mockTests || {
    completed: 0,
    averageScore: 0,
  };

  const interviews = stats?.interviews || {
    completed: 0,
    averageScore: 0,
  };

  const aiInsight =
    dashboard?.aiInsight ||
    "Complete some preparation activities to receive personalized insights.";

  // Use first name in greeting
  const firstName =
    user?.name?.trim()?.split(/\s+/)?.[0] || "Student";

  // ==========================================
  // STYLES
  // ==========================================

  const cardStyle = {
    background: "#0f0f1e",
    border: "1px solid #1e1e35",
    borderRadius: "18px",
  };

  const statCards = [
    {
      title: "DSA",
      value: `${dsa.solved} Solved`,
      detail: `${dsa.progress}% Progress`,
      progress: dsa.progress,
      subtitle:
        dsa.total > 0
          ? `${dsa.total} problems available`
          : "Start solving problems",
    },

    {
      title: "Mock Tests",
      value: `${mockTests.completed} Completed`,
      detail: `${mockTests.averageScore}% Avg Score`,
      progress: mockTests.averageScore,
      subtitle:
        mockTests.completed > 0
          ? "Based on completed tests"
          : "No tests completed yet",
    },

    {
      title: "Interviews",
      value: `${interviews.completed} Completed`,
      detail: `${interviews.averageScore}% Avg Score`,
      progress: interviews.averageScore,
      subtitle:
        interviews.completed > 0
          ? "Based on completed interviews"
          : "No interviews completed yet",
    },
  ];

  // ==========================================
  // UI
  // ==========================================

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
        <Navbar title="Dashboard" />

        <main
          style={{
            flex: 1,
            padding: "32px 36px 50px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1450px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            {/* ======================================
                WELCOME
            ====================================== */}

            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: "28px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                Welcome back, {firstName}
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Your placement preparation at a glance.
              </p>
            </div>

            {/* ======================================
                ERROR
            ====================================== */}

            {error && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  color: "#f87171",
                  background: "rgba(244,63,94,0.08)",
                  border:
                    "1px solid rgba(244,63,94,0.2)",
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            )}

            {/* ======================================
                PLACEMENT READINESS
            ====================================== */}

            <section
              style={{
                ...cardStyle,
                padding: "30px 34px",

                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.11), rgba(139,92,246,0.04), #0f0f1e)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "35px",
                  flexWrap: "wrap",
                }}
              >
                {/* LEFT */}

                <div
                  style={{
                    flex: "1 1 320px",
                  }}
                >
                  <div
                    style={{
                      color: "#818cf8",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                    }}
                  >
                    Placement Readiness
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#f8fafc",
                      fontSize: "22px",
                      fontWeight: 750,
                    }}
                  >
                    Your overall preparation score
                  </h2>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      maxWidth: "560px",
                      margin: "9px 0 0",
                    }}
                  >
                    Calculated from your DSA progress,
                    mock test performance and AI interview
                    performance.
                  </p>
                </div>

                {/* SCORE */}

                <div
                  style={{
                    minWidth: "300px",
                    flex: "0 1 420px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      Overall readiness
                    </span>

                    <div>
                      <span
                        style={{
                          color: "#f8fafc",
                          fontSize: "36px",
                          fontWeight: 850,
                          lineHeight: 1,
                        }}
                      >
                        {readiness}
                      </span>

                      <span
                        style={{
                          color: "#818cf8",
                          fontSize: "17px",
                          fontWeight: 700,
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      background: "#1b1b31",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          Math.max(readiness, 0),
                          100
                        )}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background:
                          "linear-gradient(90deg,#6366f1,#8b5cf6)",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "8px",
                      color: "#475569",
                      fontSize: "11px",
                    }}
                  >
                    <span>Getting started</span>
                    <span>Placement ready</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ======================================
                STAT CARDS
            ====================================== */}

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              {statCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    ...cardStyle,
                    padding: "23px",
                    minHeight: "175px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#818cf8",
                        fontSize: "12px",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.7px",
                        marginBottom: "14px",
                      }}
                    >
                      {card.title}
                    </div>

                    <div
                      style={{
                        color: "#f1f5f9",
                        fontSize: "24px",
                        fontWeight: 800,
                        marginBottom: "5px",
                      }}
                    >
                      {card.value}
                    </div>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {card.detail}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "999px",
                        background: "#1b1b31",
                        overflow: "hidden",
                        marginBottom: "9px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(
                            Math.max(card.progress, 0),
                            100
                          )}%`,
                          borderRadius: "999px",
                          background:
                            "linear-gradient(90deg,#6366f1,#8b5cf6)",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        color: "#475569",
                        fontSize: "11px",
                      }}
                    >
                      {card.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* ======================================
                AI INSIGHT
            ====================================== */}

            <section
              style={{
                ...cardStyle,
                padding: "25px 28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "17px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    flexShrink: 0,
                    borderRadius: "12px",
                    background: "rgba(99,102,241,0.12)",
                    border:
                      "1px solid rgba(99,102,241,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#818cf8",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                >
                  AI
                </div>

                <div>
                  <div
                    style={{
                      color: "#818cf8",
                      fontSize: "12px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: "7px",
                    }}
                  >
                    AI Insight
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: 1.75,
                      maxWidth: "950px",
                    }}
                  >
                    {aiInsight}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}