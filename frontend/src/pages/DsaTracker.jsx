import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import companies from "../data/companies";
import API from "../services/api";

const TOPICS = [
  "Arrays",
  "Strings",
  "Linked List",
  "Trees",
  "Graphs",
  "Binary Search",
  "Stack",
  "Queue",
  "Heap",
  "Dynamic Programming",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const diffStyle = {
  Easy: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  Medium: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
  },
  Hard: {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
    border: "rgba(244,63,94,0.25)",
  },
};

export default function DsaTracker() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterTopic, setFilterTopic] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterCompany, setFilterCompany] = useState("All");
  const [customCompany, setCustomCompany] = useState("");
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const { data } = await API.get("/dsa");
      setProblems(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load DSA problems."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (problemId) => {
    try {
      await API.put(`/dsa/${problemId}`);
      fetchProblems();
    } catch {
      setError("Failed to update problem.");
    }
  };

  const selectedCompany =
    filterCompany === "Other"
      ? customCompany.trim()
      : filterCompany;

  // Company-specific problems
  const companyFiltered =
    selectedCompany === "All" || selectedCompany === ""
      ? problems
      : problems.filter(
          (p) =>
            p.companies &&
            p.companies.some(
              (company) =>
                company.toLowerCase() === selectedCompany.toLowerCase()
            )
        );

  // If no company questions exist, show all problems
  const sourceProblems =
    selectedCompany !== "All" &&
    selectedCompany !== "" &&
    companyFiltered.length === 0
      ? problems
      : companyFiltered;

  const filtered = sourceProblems.filter((p) => {
    const topicMatch =
      filterTopic === "All" || p.topic === filterTopic;

    const diffMatch =
      filterDiff === "All" || p.difficulty === filterDiff;

    const searchMatch = p.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return topicMatch && diffMatch && searchMatch;
  });

  const solved = problems.filter((p) => p.solved).length;

  const easySolved = problems.filter(
    (p) => p.difficulty === "Easy" && p.solved
  ).length;

  const mediumSolved = problems.filter(
    (p) => p.difficulty === "Medium" && p.solved
  ).length;

  const hardSolved = problems.filter(
    (p) => p.difficulty === "Hard" && p.solved
  ).length;

  const easyTotal = problems.filter(
    (p) => p.difficulty === "Easy"
  ).length;

  const mediumTotal = problems.filter(
    (p) => p.difficulty === "Medium"
  ).length;

  const hardTotal = problems.filter(
    (p) => p.difficulty === "Hard"
  ).length;

  const solvedPercent = problems.length
    ? Math.round((solved / problems.length) * 100)
    : 0;

  return (
    <Layout title="DSA Tracker">
      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .filter-container {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-input, .filter-select {
          background: #111120;
          color: white;
          border: 1px solid #2a2a4a;
          border-radius: 10px;
          padding: 10px 14px;
          outline: none;
        }

        .dsa-table-row {
          display: grid;
          grid-template-columns: 60px minmax(220px, 1.5fr) 160px 130px 100px;
          padding: 18px 22px;
          border-bottom: 1px solid #1f2937;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-container {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-input, .filter-select {
            width: 100% !important;
            box-sizing: border-box;
          }

          .problem-count-badge {
            margin-left: 0 !important;
            text-align: right;
          }

          .dsa-table-row {
            min-width: 720px;
          }
        }
      `}</style>

      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 16px 40px" : "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Error */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.3)",
              color: "#f87171",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? "12px" : "0",
          }}
        >
          <div>
            <h2
              style={{
                color: "#fff",
                fontSize: isMobile ? "22px" : "28px",
                margin: 0,
                fontWeight: 800,
              }}
            >
              DSA Problem Tracker
            </h2>

            <p
              style={{
                color: "#94a3b8",
                marginTop: "6px",
                fontSize: "14px",
                margin: "6px 0 0",
              }}
            >
              Solve problems and track your placement preparation.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            {
              title: "Solved",
              value: `${solved}/${problems.length}`,
              progress: solvedPercent,
              color: "#6366f1",
            },
            {
              title: "Easy",
              value: `${easySolved}/${easyTotal}`,
              progress: easyTotal
                ? Math.round((easySolved / easyTotal) * 100)
                : 0,
              color: "#10b981",
            },
            {
              title: "Medium",
              value: `${mediumSolved}/${mediumTotal}`,
              progress: mediumTotal
                ? Math.round((mediumSolved / mediumTotal) * 100)
                : 0,
              color: "#f59e0b",
            },
            {
              title: "Hard",
              value: `${hardSolved}/${hardTotal}`,
              progress: hardTotal
                ? Math.round((hardSolved / hardTotal) * 100)
                : 0,
              color: "#ef4444",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: "#111120",
                border: "1px solid #1f2937",
                borderRadius: "14px",
                padding: "18px",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                {card.title}
              </div>

              <h2
                style={{
                  color: "#fff",
                  margin: 0,
                  marginBottom: "15px",
                  fontSize: "22px",
                }}
              >
                {card.value}
              </h2>

              <div
                style={{
                  width: "100%",
                  height: "6px",
                  background: "#1e293b",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: `${card.progress}%`,
                    height: "100%",
                    background: card.color,
                    borderRadius: "20px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-container">
          <input
            placeholder="Search Problem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
            style={{
              width: isMobile ? "100%" : "240px",
            }}
          />

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Topics</option>
            {TOPICS.map((topic) => (
              <option key={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={filterDiff}
            onChange={(e) => setFilterDiff(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Difficulty</option>
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
            <option value="Other">Other Company...</option>
          </select>

          {filterCompany === "Other" && (
            <input
              type="text"
              placeholder="Enter Company Name"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              className="filter-input"
              style={{
                width: isMobile ? "100%" : "200px",
              }}
            />
          )}

          <span
            className="problem-count-badge"
            style={{
              marginLeft: "auto",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            {filtered.length} Problems
          </span>
        </div>

        {filterCompany === "Other" &&
          customCompany.trim() !== "" &&
          companyFiltered.length === 0 && (
            <div
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#c7d2fe",
                padding: "14px 18px",
                borderRadius: "12px",
                fontSize: "14px",
              }}
            >
              <strong>{selectedCompany}</strong> doesn't have a dedicated DSA
              question set yet.
              <br />
              Showing the complete 250-problem DSA sheet instead.
            </div>
          )}

        {/* Table Container */}
        <div
          style={{
            background: "#111120",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #1f2937",
            width: "100%",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <div
              className="dsa-table-row"
              style={{
                borderBottom: "1px solid #1f2937",
                color: "#64748b",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              <div>Status</div>
              <div>Problem</div>
              <div>Topic</div>
              <div>Difficulty</div>
              <div>Link</div>
            </div>

            {loading ? (
              <div
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                Loading DSA Problems...
              </div>
            ) : filtered.length === 0 ? (
              <div
                style={{
                  padding: "60px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                No problems found.
              </div>
            ) : (
              filtered.map((problem) => (
                <div
                  key={problem._id}
                  className="dsa-table-row"
                  style={{
                    background: problem.solved
                      ? "rgba(16,185,129,0.05)"
                      : "transparent",
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleStatus(problem._id)}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: `2px solid ${
                        problem.solved ? "#10b981" : "#475569"
                      }`,
                      background: problem.solved
                        ? "#10b981"
                        : "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                    }}
                  >
                    {problem.solved ? "✓" : ""}
                  </button>

                  {/* Problem */}
                  <div>
                    <div
                      style={{
                        color: problem.solved ? "#64748b" : "#fff",
                        textDecoration: problem.solved
                          ? "line-through"
                          : "none",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      {problem.title}
                    </div>

                    {/* Companies */}
                    {problem.companies &&
                      problem.companies.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          {problem.companies.map((company) => (
                            <span
                              key={company}
                              style={{
                                background: "rgba(99,102,241,0.12)",
                                color: "#818cf8",
                                fontSize: "11px",
                                padding: "3px 8px",
                                borderRadius: "999px",
                              }}
                            >
                              {company}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Topic */}
                  <span style={{ color: "#cbd5e1", fontSize: "13px" }}>
                    {problem.topic}
                  </span>

                  {/* Difficulty */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 12px",
                        borderRadius: "999px",
                        background:
                          diffStyle[problem.difficulty]?.bg ||
                          diffStyle.Medium.bg,
                        color:
                          diffStyle[problem.difficulty]?.color ||
                          diffStyle.Medium.color,
                        border: `1px solid ${
                          diffStyle[problem.difficulty]?.border ||
                          diffStyle.Medium.border
                        }`,
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  {/* Link */}
                  {problem.url ? (
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#818cf8",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      Solve →
                    </a>
                  ) : (
                    <span style={{ color: "#475569" }}>—</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}