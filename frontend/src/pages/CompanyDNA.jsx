import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const companyOptions = {
  Product: [
    "Google",
    "Microsoft",
    "Amazon",
    "Adobe",
    "Atlassian",
    "Flipkart",
  ],
  Service: [
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Cognizant",
    "Capgemini",
  ],
  Core: [
    "Qualcomm",
    "NVIDIA",
    "Intel",
    "AMD",
    "Texas Instruments",
    "Samsung Semiconductor",
  ],
};

const roleOptions = {
  Product: [
    "Software Development Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
  ],
  Service: [
    "Software Engineer",
    "Systems Engineer",
    "Associate Software Engineer",
    "Full Stack Developer",
    "Data Analyst",
  ],
  Core: [
    "Embedded Software Engineer",
    "Firmware Engineer",
    "Hardware Engineer",
    "VLSI Engineer",
    "Software Engineer",
  ],
};

const difficultyConfig = {
  Easy: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  Medium: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  Hard: {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.1)",
  },
  "Very Hard": {
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.12)",
  },
};

export default function CompanyDNA() {
  const [companyType, setCompanyType] = useState("Product");
  const [company, setCompany] = useState("Google");
  const [customCompany, setCustomCompany] = useState("");

  const [role, setRole] = useState("Software Development Engineer");
  const [customRole, setCustomRole] = useState("");

  const [preparationDays, setPreparationDays] = useState(30);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCompanyTypeChange = (type) => {
    setCompanyType(type);
    setPlan(null);
    setError("");
    setActiveTab("overview");

    if (type === "Custom") {
      setCompany("");
      setRole("");
      return;
    }

    setCompany(companyOptions[type]?.[0] || "");
    setRole(roleOptions[type]?.[0] || "");
  };

  const generatePlan = async () => {
    try {
      setError("");

      const finalCompany =
        companyType === "Custom" ? customCompany.trim() : company;

      const finalRole =
        companyType === "Custom" ? customRole.trim() : role;

      if (!finalCompany) {
        setError("Please enter a company name.");
        return;
      }

      if (!finalRole) {
        setError("Please enter a target role.");
        return;
      }

      setLoading(true);
      setPlan(null);

      const { data } = await API.post("/company-prep/generate", {
        company: finalCompany,
        companyType,
        role: finalRole,
        preparationDays: Number(preparationDays),
      });

      if (!data?.success || !data?.plan) {
        throw new Error(
          data?.message || "Invalid preparation plan received."
        );
      }

      setPlan(data.plan);
      setActiveTab("overview");
    } catch (err) {
      console.error("Company Prep Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate preparation plan. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "#0f0f1e",
    border: "1px solid #1e1e35",
    borderRadius: "18px",
    padding: isMobile ? "16px" : "24px",
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "10px",
    border: "1px solid #252540",
    background: "#111122",
    color: "#e2e8f0",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    marginBottom: "8px",
  };

  const difficulty =
    difficultyConfig[plan?.difficulty] || difficultyConfig.Medium;

  return (
    <Layout title="Company Prep">
      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        .two-col-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .tab-container {
          display: flex;
          gap: 5px;
          padding: 5px;
          width: fit-content;
          border-radius: 12px;
          background: #0f0f1e;
          border: 1px solid #1e1e35;
          flex-wrap: wrap;
        }

        @media (max-width: 1024px) {
          .form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          .two-col-grid {
            grid-template-columns: 1fr;
          }
          .tab-container {
            width: 100%;
          }
          .tab-container button {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>

      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 16px 40px" : "30px 34px 60px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        {/* HEADER */}
        <div>
          <h2
            style={{
              fontSize: isMobile ? "22px" : "28px",
              fontWeight: 800,
              color: "#f1f5f9",
              margin: "0 0 7px",
            }}
          >
            AI Company Preparation
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              margin: 0,
            }}
          >
            Generate a role-specific preparation strategy, interview focus
            and roadmap for your target company.
          </p>
        </div>

        {/* SETUP CARD */}
        <div style={cardStyle}>
          <h3
            style={{
              color: "#e2e8f0",
              fontSize: isMobile ? "13px" : "14px",
              margin: "0 0 20px",
            }}
          >
            Build Your Preparation Plan
          </h3>

          {/* COMPANY TYPES */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "22px",
            }}
          >
            {["Product", "Service", "Core", "Custom"].map((type) => (
              <button
                key={type}
                onClick={() => handleCompanyTypeChange(type)}
                style={{
                  flex: isMobile ? "1 1 40%" : "none",
                  padding: isMobile ? "10px" : "10px 20px",
                  borderRadius: "10px",
                  border:
                    companyType === type
                      ? "1px solid #6366f1"
                      : "1px solid #252540",
                  background:
                    companyType === type
                      ? "rgba(99,102,241,0.14)"
                      : "#111122",
                  color: companyType === type ? "#818cf8" : "#64748b",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "13px",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* FORM */}
          <div className="form-grid">
            {/* COMPANY */}
            <div>
              <label style={labelStyle}>Target Company</label>
              {companyType === "Custom" ? (
                <input
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. Micron"
                  style={inputStyle}
                />
              ) : (
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  style={inputStyle}
                >
                  {companyOptions[companyType]?.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ROLE */}
            <div>
              <label style={labelStyle}>Target Role</label>
              {companyType === "Custom" ? (
                <input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Embedded Engineer"
                  style={inputStyle}
                />
              ) : (
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={inputStyle}
                >
                  {roleOptions[companyType]?.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* DAYS */}
            <div>
              <label style={labelStyle}>Preparation Duration</label>
              <select
                value={preparationDays}
                onChange={(e) => setPreparationDays(Number(e.target.value))}
                style={inputStyle}
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
                <option value={45}>45 Days</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "11px 14px",
                borderRadius: "9px",
                color: "#f87171",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* GENERATE */}
          <button
            onClick={generatePlan}
            disabled={loading}
            style={{
              marginTop: "20px",
              padding: "13px 22px",
              borderRadius: "11px",
              border: "none",
              width: isMobile ? "100%" : "auto",
              background: loading
                ? "#37375b"
                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? "Generating AI Plan..."
              : "Generate AI Preparation Plan"}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "45px 20px",
            }}
          >
            <div
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#c7d2fe",
              }}
            >
              Building your preparation plan...
            </div>

            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              AI is analyzing your company, role and preparation duration.
            </p>
          </div>
        )}

        {/* RESULT */}
        {plan && !loading && (
          <>
            {/* HERO */}
            <div
              style={{
                ...cardStyle,
                background:
                  "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.05),#0f0f1e)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "16px",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#818cf8",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "7px",
                    }}
                  >
                    {plan.companyType} Company
                  </div>

                  <h2
                    style={{
                      color: "#f1f5f9",
                      margin: "0 0 5px",
                      fontSize: isMobile ? "20px" : "25px",
                    }}
                  >
                    {plan.company}
                  </h2>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                    }}
                  >
                    {plan.role}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  <div
                    style={{
                      flex: isMobile ? 1 : "none",
                      textAlign: "center",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: difficulty.bg,
                      color: difficulty.color,
                      fontWeight: 800,
                    }}
                  >
                    {plan.difficulty}
                  </div>

                  <div
                    style={{
                      flex: isMobile ? 1 : "none",
                      textAlign: "center",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      background: "rgba(99,102,241,0.1)",
                      color: "#818cf8",
                      fontWeight: 800,
                    }}
                  >
                    {plan.preparationDays} Days
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  fontSize: "14px",
                  margin: "20px 0 0",
                }}
              >
                {plan.overview}
              </p>
            </div>

            {/* FOCUS AREAS */}
            {plan.focusAreas?.length > 0 && (
              <div style={cardStyle}>
                <h3
                  style={{
                    color: "#e2e8f0",
                    margin: "0 0 15px",
                    fontSize: "16px",
                  }}
                >
                  Key Focus Areas
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "9px",
                  }}
                >
                  {plan.focusAreas.map((area, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "8px 13px",
                        borderRadius: "9px",
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.22)",
                        color: "#a5b4fc",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="tab-container">
              {[
                ["overview", "Overview"],
                ["roadmap", "Roadmap"],
                ["strategy", "Strategy"],
                ["tips", "Interview Tips"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: "9px 17px",
                    borderRadius: "9px",
                    border: "none",
                    background:
                      activeTab === key ? "#6366f1" : "transparent",
                    color: activeTab === key ? "#fff" : "#64748b",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="two-col-grid">
                {/* ROUNDS */}
                <div style={cardStyle}>
                  <h3
                    style={{
                      color: "#e2e8f0",
                      fontSize: "16px",
                      margin: "0 0 20px",
                    }}
                  >
                    Likely Interview Rounds
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {plan.likelyRounds?.map((round, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "15px",
                          borderRadius: "12px",
                          background: "#111122",
                          border: "1px solid #1e1e35",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <strong
                            style={{
                              color: "#e2e8f0",
                              fontSize: "13px",
                            }}
                          >
                            {index + 1}. {round.round}
                          </strong>

                          <span
                            style={{
                              color:
                                round.priority === "High"
                                  ? "#f43f5e"
                                  : round.priority === "Medium"
                                  ? "#f59e0b"
                                  : "#10b981",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {round.priority}
                          </span>
                        </div>

                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            margin: "7px 0 0",
                          }}
                        >
                          {round.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TOPICS */}
                <div style={cardStyle}>
                  <h3
                    style={{
                      color: "#e2e8f0",
                      fontSize: "16px",
                      margin: "0 0 20px",
                    }}
                  >
                    Important Topics
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {plan.importantTopics?.map((topic, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "15px",
                          borderRadius: "12px",
                          background: "#111122",
                          border: "1px solid #1e1e35",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <strong
                            style={{
                              color: "#cbd5e1",
                              fontSize: "13px",
                            }}
                          >
                            {topic.topic}
                          </strong>

                          <span
                            style={{
                              color:
                                topic.priority === "High"
                                  ? "#f43f5e"
                                  : topic.priority === "Medium"
                                  ? "#f59e0b"
                                  : "#10b981",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {topic.priority}
                          </span>
                        </div>

                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                            lineHeight: 1.6,
                            margin: "7px 0 0",
                          }}
                        >
                          {topic.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROADMAP TAB */}
            {activeTab === "roadmap" && (
              <div style={cardStyle}>
                <h3
                  style={{
                    color: "#e2e8f0",
                    margin: "0 0 20px",
                  }}
                >
                  {plan.preparationDays}-Day Preparation Roadmap
                </h3>

                <div className="two-col-grid">
                  {plan.roadmap?.map((phase, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "20px",
                        borderRadius: "14px",
                        background: "#111122",
                        border: "1px solid #1e1e35",
                      }}
                    >
                      <div
                        style={{
                          color: "#818cf8",
                          fontSize: "12px",
                          fontWeight: 800,
                        }}
                      >
                        {phase.period}
                      </div>

                      <h4
                        style={{
                          color: "#e2e8f0",
                          margin: "7px 0 13px",
                        }}
                      >
                        {phase.title}
                      </h4>

                      {phase.tasks?.map((task, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: "8px",
                            color: "#94a3b8",
                            fontSize: "12px",
                            marginBottom: "8px",
                            lineHeight: 1.5,
                          }}
                        >
                          <span style={{ color: "#6366f1" }}>•</span>
                          {task}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STRATEGY TAB */}
            {activeTab === "strategy" && (
              <div style={cardStyle}>
                <h3
                  style={{
                    color: "#e2e8f0",
                    margin: "0 0 20px",
                  }}
                >
                  Practice Strategy
                </h3>

                <div className="two-col-grid">
                  {Object.entries(plan.practiceStrategy || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        style={{
                          padding: "18px",
                          borderRadius: "12px",
                          background: "#111122",
                          border: "1px solid #1e1e35",
                        }}
                      >
                        <div
                          style={{
                            color: "#818cf8",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            marginBottom: "8px",
                            fontSize: "13px",
                          }}
                        >
                          {key.replace(/([A-Z])/g, " $1")}
                        </div>

                        <div
                          style={{
                            color: "#94a3b8",
                            fontSize: "13px",
                            lineHeight: 1.6,
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* TIPS TAB */}
            {activeTab === "tips" && (
              <div style={cardStyle}>
                <h3
                  style={{
                    color: "#e2e8f0",
                    margin: "0 0 20px",
                  }}
                >
                  Interview Tips
                </h3>

                {plan.interviewTips?.map((tip, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "13px",
                      padding: "14px 0",
                      borderBottom: "1px solid #1a1a2e",
                    }}
                  >
                    <div
                      style={{
                        width: "27px",
                        height: "27px",
                        flexShrink: 0,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(99,102,241,0.12)",
                        color: "#818cf8",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      style={{
                        color: "#94a3b8",
                        lineHeight: 1.6,
                        fontSize: "13px",
                      }}
                    >
                      {tip}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FINAL CHECKLIST */}
            <div style={cardStyle}>
              <h3
                style={{
                  color: "#e2e8f0",
                  margin: "0 0 17px",
                  fontSize: "16px",
                }}
              >
                Final Preparation Checklist
              </h3>

              <div className="two-col-grid">
                {plan.finalChecklist?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#111122",
                      border: "1px solid #1e1e35",
                      color: "#94a3b8",
                      fontSize: "12px",
                    }}
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
}