import companies from "../data/companies";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
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

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
  try {
    const { data } = await API.get("/dsa");

    console.log("TOTAL:", data.length);
    console.log(data);

    setProblems(data);
  } catch (err) {
    console.log(err);

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
              company.toLowerCase() ===
              selectedCompany.toLowerCase()
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
    filterTopic === "All" ||
    p.topic === filterTopic;

  const diffMatch =
    filterDiff === "All" ||
    p.difficulty === filterDiff;

  const searchMatch = p.title
    .toLowerCase()
    .includes(search.toLowerCase());

  return (
    topicMatch &&
    diffMatch &&
    searchMatch
  );
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
        <Navbar title="DSA Tracker" />

        <main
          style={{
            flex: 1,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
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
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "28px",
                  margin: 0,
                }}
              >
                DSA Problem Tracker
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  marginTop: "6px",
                }}
              >
                Solve problems and track your placement preparation.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "16px",
            }}
          >
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

          <div
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              placeholder="Search Problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "#111120",
                color: "white",
                border: "1px solid #2a2a4a",
                borderRadius: "10px",
                padding: "10px 14px",
                width: "260px",
              }}
            />

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              style={{
                background: "#111120",
                color: "white",
                border: "1px solid #2a2a4a",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <option value="All">All Topics</option>

              {TOPICS.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>

            <select
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value)}
              style={{
                background: "#111120",
                color: "white",
                border: "1px solid #2a2a4a",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <option value="All">All Difficulty</option>

              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <span
              style={{
                marginLeft: "auto",
                color: "#94a3b8",
              }}
            >
              {filtered.length} Problems
            </span>
           <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              style={{
                background: "#111120",
                color: "white",
                border: "1px solid #2a2a4a",
                borderRadius: "10px",
                padding: "10px 14px",
              }}
            >
              <option value="All">All Companies</option>

              {companies.map((company) => (
                <option
                  key={company}
                  value={company}
                >
                  {company}
                </option>
              ))}

              <option value="Other">
                Other Company...
              </option>
            </select>
            {filterCompany === "Other" && (
            <input
              type="text"
              placeholder="Enter Company Name"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              style={{
                background: "#111120",
                color: "white",
                border: "1px solid #2a2a4a",
                borderRadius: "10px",
                padding: "10px 14px",
                width: "220px",
              }}
            />
          )}
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
                <strong>{selectedCompany}</strong> doesn't have a dedicated DSA question set yet.

                <br />

                Showing the complete 250-problem DSA sheet instead.
           </div>
            )}
          {/* Table */}

          <div
            style={{
              background: "#111120",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid #1f2937",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "60px 1.5fr 180px 140px 120px",
                padding: "16px 22px",
                borderBottom: "1px solid #1f2937",
                color: "#64748b",
                fontWeight: "600",
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
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "60px 1.5fr 180px 140px 120px",
                    padding: "18px 22px",
                    borderBottom: "1px solid #1f2937",
                    alignItems: "center",
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
                        problem.solved
                          ? "#10b981"
                          : "#475569"
                      }`,
                      background: problem.solved
                        ? "#10b981"
                        : "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {problem.solved ? "✓" : ""}
                  </button>

                  {/* Problem */}

                  <div>
                    <div
                      style={{
                        color: problem.solved
                          ? "#64748b"
                          : "#fff",
                        textDecoration: problem.solved
                          ? "line-through"
                          : "none",
                        fontWeight: "600",
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
                                background:
                                  "rgba(99,102,241,0.12)",
                                color: "#818cf8",
                                fontSize: "11px",
                                padding:
                                  "3px 8px",
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

                  <span
                    style={{
                      color: "#cbd5e1",
                    }}
                  >
                    {problem.topic}
                  </span>

                  {/* Difficulty */}

                  <span
                    style={{
                      display: "inline-block",
                      width: "fit-content",
                      padding: "5px 12px",
                      borderRadius: "999px",
                      background:
                        diffStyle[problem.difficulty].bg,
                      color:
                        diffStyle[problem.difficulty].color,
                      border: `1px solid ${
                        diffStyle[problem.difficulty].border
                      }`,
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {problem.difficulty}
                  </span>

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
                      }}
                    >
                      Solve →
                    </a>
                  ) : (
                    <span
                      style={{
                        color: "#475569",
                      }}
                    >
                      —
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}