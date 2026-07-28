import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

/* =========================================================
   SCORE RING
========================================================= */

function ScoreRing({ score = 0, size = 120, color }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (safeScore / 100) * circumference;

  const c =
    color ||
    (safeScore >= 70
      ? "#10b981"
      : safeScore >= 40
      ? "#f59e0b"
      : "#f43f5e");

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e1e35"
          strokeWidth="8"
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={c}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.5s ease",
          }}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: size > 100 ? "26px" : "18px",
            fontWeight: 900,
            color: "#f1f5f9",
          }}
        >
          {safeScore}
        </div>

        <div
          style={{
            fontSize: "10px",
            color: "#475569",
          }}
        >
          / 100
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION ICONS
========================================================= */

const sectionIcons = {
  summary: "◎",
  skills: "</>",
  experience: "◈",
  education: "✦",
  projects: "⬡",
};

/* =========================================================
   REUSABLE CARD
========================================================= */

function ResultListCard({
  title,
  items = [],
  accent = "#6366f1",
  prefix = "",
}) {
  if (!items?.length) return null;

  return (
    <div
      style={{
        borderRadius: "18px",
        padding: "22px",
        background: "#0f0f1e",
        border: "1px solid #1e1e35",
      }}
    >
      <h4
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: accent,
          margin: "0 0 14px",
        }}
      >
        {title}
      </h4>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              padding: "10px 12px",
              borderRadius: "10px",
              background: `${accent}0D`,
              border: `1px solid ${accent}26`,
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: accent,
                flexShrink: 0,
                marginTop: "6px",
              }}
            />

            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                lineHeight: 1.55,
              }}
            >
              {prefix}
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [analysisType, setAnalysisType] =
    useState("general");

  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] =
    useState("");

  const inputRef = useRef();

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName =
      selectedFile.name.toLowerCase();

    const validExtension =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!validExtension) {
      setError(
        "Only PDF, DOC, and DOCX files are supported."
      );
      return;
    }

    // Match backend: 10 MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(
        "File size must be under 10 MB."
      );
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);
  };

  /* =========================================================
     DRAG AND DROP
  ========================================================= */

  const handleDrop = (e) => {
    e.preventDefault();

    setDragging(false);

    const selectedFile =
      e.dataTransfer.files[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  /* =========================================================
     ANALYZE
  ========================================================= */

  const handleAnalyze = async () => {
    if (!file || loading) return;

    if (
      analysisType === "targeted" &&
      !targetRole.trim()
    ) {
      setError(
        "Please enter the target job role."
      );
      return;
    }

    if (
      analysisType === "targeted" &&
      !jobDescription.trim()
    ) {
      setError(
        "Please paste the job description."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const form = new FormData();

      form.append("resume", file);
      form.append(
        "analysisType",
        analysisType
      );

      if (analysisType === "targeted") {
        form.append(
          "targetRole",
          targetRole.trim()
        );

        form.append(
          "jobDescription",
          jobDescription.trim()
        );
      }

      const { data } = await API.post(
        "/resume/analyze",
        form,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setResult(data);
    } catch (err) {
      console.error(
        "Resume Analysis Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetAnalyzer = () => {
    setResult(null);
    setFile(null);
    setError("");
    setTargetRole("");
    setJobDescription("");
    setAnalysisType("general");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  /* =========================================================
     COLORS / LABELS
  ========================================================= */

  const atsScore =
    Number(result?.atsScore) || 0;

  const atsColor =
    atsScore >= 70
      ? "#10b981"
      : atsScore >= 40
      ? "#f59e0b"
      : "#f43f5e";

  const atsLabel =
    atsScore >= 80
      ? "Strong Resume"
      : atsScore >= 70
      ? "Good Resume"
      : atsScore >= 40
      ? "Needs Improvement"
      : "Needs Major Improvement";

  const jobMatchScore =
    Number(result?.jobMatchScore) || 0;

  const jobMatchColor =
    jobMatchScore >= 70
      ? "#10b981"
      : jobMatchScore >= 40
      ? "#f59e0b"
      : "#f43f5e";

  const isTargeted =
    result?.analysisType === "targeted";

  /* =========================================================
     PAGE
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
          minWidth: 0,
        }}
      >
        <Navbar title="Resume Analyzer" />

        <main
          style={{
            flex: 1,
            padding: "32px 38px 60px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  margin: "0 0 7px",
                }}
              >
                AI Resume Analyzer
              </h2>

              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Analyze your resume for ATS
                compatibility or compare it directly
                with a target job.
              </p>
            </div>

            {!result ? (
              <>
                {/* =============================================
                    ANALYSIS TYPE
                ============================================= */}

                <div
                  style={{
                    borderRadius: "18px",
                    padding: "22px",
                    marginBottom: "22px",

                    background: "#0f0f1e",

                    border:
                      "1px solid #1e1e35",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        marginBottom: "5px",
                      }}
                    >
                      Choose Analysis Type
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Run a general ATS check or
                      compare your resume with a
                      specific job.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {/* GENERAL */}

                    <button
                      type="button"
                      onClick={() => {
                        setAnalysisType(
                          "general"
                        );
                        setError("");
                      }}
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        textAlign: "left",
                        cursor: "pointer",

                        background:
                          analysisType ===
                          "general"
                            ? "rgba(99,102,241,0.10)"
                            : "rgba(255,255,255,0.02)",

                        border:
                          analysisType ===
                          "general"
                            ? "1px solid rgba(99,102,241,0.45)"
                            : "1px solid #1e1e35",

                        transition:
                          "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "7px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "9px",

                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",

                            background:
                              "rgba(99,102,241,0.12)",

                            color: "#818cf8",

                            fontWeight: 800,
                          }}
                        >
                          ◎
                        </div>

                        <div
                          style={{
                            color:
                              analysisType ===
                              "general"
                                ? "#c7d2fe"
                                : "#e2e8f0",

                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          General ATS Analysis
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        Check resume structure,
                        sections, keywords, projects,
                        skills and overall ATS
                        readiness.
                      </div>
                    </button>

                    {/* TARGETED */}

                    <button
                      type="button"
                      onClick={() => {
                        setAnalysisType(
                          "targeted"
                        );
                        setError("");
                      }}
                      style={{
                        padding: "18px",
                        borderRadius: "14px",
                        textAlign: "left",
                        cursor: "pointer",

                        background:
                          analysisType ===
                          "targeted"
                            ? "rgba(139,92,246,0.10)"
                            : "rgba(255,255,255,0.02)",

                        border:
                          analysisType ===
                          "targeted"
                            ? "1px solid rgba(139,92,246,0.45)"
                            : "1px solid #1e1e35",

                        transition:
                          "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "7px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "9px",

                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "center",

                            background:
                              "rgba(139,92,246,0.12)",

                            color: "#a78bfa",

                            fontWeight: 800,
                          }}
                        >
                          ◈
                        </div>

                        <div
                          style={{
                            color:
                              analysisType ===
                              "targeted"
                                ? "#ddd6fe"
                                : "#e2e8f0",

                            fontSize: "14px",
                            fontWeight: 700,
                          }}
                        >
                          Target Job Analysis
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          lineHeight: 1.6,
                        }}
                      >
                        Compare your resume against a
                        specific role and job
                        description to calculate job
                        match.
                      </div>
                    </button>
                  </div>
                </div>

                {/* =============================================
                    TARGET JOB DETAILS
                ============================================= */}

                {analysisType === "targeted" && (
                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "24px",
                      marginBottom: "22px",

                      background: "#0f0f1e",

                      border:
                        "1px solid rgba(139,92,246,0.20)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        marginBottom: "5px",
                      }}
                    >
                      Target Job Details
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "20px",
                      }}
                    >
                      Enter the role and paste the job
                      description from the company.
                    </div>

                    {/* ROLE */}

                    <div
                      style={{
                        marginBottom: "16px",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          color: "#94a3b8",
                          fontSize: "12px",
                          fontWeight: 600,
                          marginBottom: "7px",
                        }}
                      >
                        Target Role
                      </label>

                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) =>
                          setTargetRole(
                            e.target.value
                          )
                        }
                        placeholder="Example: Software Development Engineer"
                        style={{
                          width: "100%",
                          boxSizing: "border-box",

                          padding: "13px 14px",

                          borderRadius: "11px",

                          background: "#111120",
                          color: "#e2e8f0",

                          border:
                            "1px solid #25253f",

                          outline: "none",

                          fontSize: "13px",
                        }}
                      />
                    </div>

                    {/* JD */}

                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#94a3b8",
                          fontSize: "12px",
                          fontWeight: 600,
                          marginBottom: "7px",
                        }}
                      >
                        Job Description
                      </label>

                      <textarea
                        value={jobDescription}
                        onChange={(e) =>
                          setJobDescription(
                            e.target.value
                          )
                        }
                        placeholder="Paste the job description here..."
                        rows={8}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",

                          padding: "14px",

                          borderRadius: "11px",

                          background: "#111120",
                          color: "#e2e8f0",

                          border:
                            "1px solid #25253f",

                          outline: "none",

                          fontSize: "13px",
                          lineHeight: 1.6,

                          resize: "vertical",

                          fontFamily:
                            "inherit",
                        }}
                      />

                      <div
                        style={{
                          marginTop: "6px",
                          textAlign: "right",
                          fontSize: "10px",
                          color: "#475569",
                        }}
                      >
                        {jobDescription.length} characters
                      </div>
                    </div>
                  </div>
                )}

                {/* =============================================
                    UPLOAD + INFO
                ============================================= */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0,1fr) 340px",
                    gap: "24px",
                    alignItems: "start",
                  }}
                >
                  {/* LEFT */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {/* UPLOAD */}

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() =>
                        setDragging(false)
                      }
                      onDrop={handleDrop}
                      onClick={() =>
                        inputRef.current?.click()
                      }
                      style={{
                        borderRadius: "20px",

                        padding: "58px 40px",

                        textAlign: "center",

                        border: `2px dashed ${
                          dragging
                            ? "#6366f1"
                            : file
                            ? "#10b981"
                            : "#1e1e35"
                        }`,

                        background: dragging
                          ? "rgba(99,102,241,0.06)"
                          : file
                          ? "rgba(16,185,129,0.04)"
                          : "rgba(255,255,255,0.02)",

                        cursor: "pointer",

                        transition:
                          "all 0.2s",
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf, .docx"
                        style={{
                          display: "none",
                        }}
                        onChange={(e) => {
                          const selectedFile =
                            e.target.files?.[0];

                          if (selectedFile) {
                            handleFile(
                              selectedFile
                            );
                          }
                        }}
                      />

                      {file ? (
                        <>
                          <div
                            style={{
                              width: "58px",
                              height: "58px",

                              borderRadius: "16px",

                              margin:
                                "0 auto 16px",

                              display: "flex",
                              alignItems: "center",
                              justifyContent:
                                "center",

                              background:
                                "rgba(16,185,129,0.10)",

                              border:
                                "1px solid rgba(16,185,129,0.22)",

                              color: "#10b981",

                              fontSize: "25px",
                            }}
                          >
                            ✓
                          </div>

                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#10b981",
                              marginBottom: "6px",
                            }}
                          >
                            {file.name}
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#475569",
                            }}
                          >
                            {(
                              file.size /
                              (1024 * 1024)
                            ).toFixed(2)}{" "}
                            MB — Click to change
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              marginBottom:
                                "16px",
                            }}
                          >
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#334155"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                margin:
                                  "0 auto",
                              }}
                            >
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" />
                              <line
                                x1="12"
                                y1="3"
                                x2="12"
                                y2="15"
                              />
                            </svg>
                          </div>

                          <div
                            style={{
                              fontSize: "17px",
                              fontWeight: 700,
                              color: "#94a3b8",
                              marginBottom: "8px",
                            }}
                          >
                            Drag & drop your resume
                            here
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#475569",
                              marginBottom:
                                "16px",
                            }}
                          >
                            or click to browse files
                          </div>

                          <div
                            style={{
                              display:
                                "inline-flex",
                              gap: "8px",
                            }}
                          >
                            {[
                              "PDF",
                              "DOC",
                              "DOCX",
                            ].map((type) => (
                              <span
                                key={type}
                                style={{
                                  padding:
                                    "4px 10px",

                                  borderRadius:
                                    "6px",

                                  fontSize:
                                    "11px",

                                  fontWeight:
                                    700,

                                  background:
                                    "rgba(99,102,241,0.1)",

                                  color:
                                    "#818cf8",

                                  border:
                                    "1px solid rgba(99,102,241,0.2)",
                                }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "12px",

                              color:
                                "#334155",

                              fontSize:
                                "11px",
                            }}
                          >
                            Maximum file size: 10 MB
                          </div>
                        </>
                      )}
                    </div>

                    {/* ERROR */}

                    {error && (
                      <div
                        style={{
                          padding:
                            "14px 16px",

                          borderRadius:
                            "12px",

                          fontSize: "13px",

                          background:
                            "rgba(244,63,94,0.08)",

                          border:
                            "1px solid rgba(244,63,94,0.25)",

                          color: "#fb7185",

                          display: "flex",

                          alignItems:
                            "center",

                          gap: "8px",
                        }}
                      >
                        <span>!</span>
                        {error}
                      </div>
                    )}

                    {/* BUTTON */}

                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={
                        !file || loading
                      }
                      className="btn-primary"
                      style={{
                        opacity:
                          !file || loading
                            ? 0.55
                            : 1,

                        fontSize: "15px",
                        padding: "14px",

                        cursor:
                          !file || loading
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loading ? (
                        <span
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              width: "18px",
                              height: "18px",

                              borderRadius:
                                "50%",

                              border:
                                "2px solid white",

                              borderTopColor:
                                "transparent",

                              animation:
                                "spin 0.8s linear infinite",
                            }}
                          />

                          {analysisType ===
                          "targeted"
                            ? "Analyzing Job Match with AI..."
                            : "Analyzing Resume with AI..."}
                        </span>
                      ) : analysisType ===
                        "targeted" ? (
                        "Analyze Resume for Target Job"
                      ) : (
                        "Analyze Resume with AI"
                      )}
                    </button>
                  </div>

                  {/* RIGHT INFO */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        borderRadius: "18px",
                        padding: "24px",

                        background: "#0f0f1e",

                        border:
                          "1px solid #1e1e35",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#e2e8f0",
                          margin: "0 0 16px",
                        }}
                      >
                        What You'll Get
                      </h4>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "13px",
                        }}
                      >
                        {[
                          {
                            icon: "◎",
                            label: "ATS Score",
                            desc: "Overall ATS readiness",
                            color: "#6366f1",
                          },

                          ...(analysisType ===
                          "targeted"
                            ? [
                                {
                                  icon: "◈",
                                  label:
                                    "Job Match Score",
                                  desc:
                                    "Match against the target role",
                                  color:
                                    "#8b5cf6",
                                },

                                {
                                  icon: "✓",
                                  label:
                                    "Skill Matching",
                                  desc:
                                    "Matched and missing skills",
                                  color:
                                    "#10b981",
                                },
                              ]
                            : []),

                          {
                            icon: "✦",
                            label:
                              "Section Scores",
                            desc:
                              "Detailed section analysis",
                            color: "#10b981",
                          },

                          {
                            icon: "⚡",
                            label:
                              "Missing Keywords",
                            desc:
                              "Important keywords to consider",
                            color: "#f59e0b",
                          },

                          {
                            icon: "⬡",
                            label:
                              "Improvement Tips",
                            desc:
                              "Specific actionable suggestions",
                            color: "#06b6d4",
                          },
                        ].map(
                          (item, index) => (
                            <div
                              key={index}
                              style={{
                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",

                                  borderRadius:
                                    "10px",

                                  flexShrink: 0,

                                  background: `${item.color}12`,

                                  border: `1px solid ${item.color}25`,

                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  fontSize:
                                    "14px",

                                  color:
                                    item.color,

                                  fontWeight:
                                    700,
                                }}
                              >
                                {item.icon}
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontSize:
                                      "13px",

                                    fontWeight:
                                      600,

                                    color:
                                      "#e2e8f0",
                                  }}
                                >
                                  {item.label}
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "11px",

                                    color:
                                      "#475569",
                                  }}
                                >
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* AI INFO */}

                    <div
                      style={{
                        borderRadius: "18px",
                        padding: "20px",

                        background:
                          "rgba(99,102,241,0.06)",

                        border:
                          "1px solid rgba(99,102,241,0.15)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#818cf8",
                          marginBottom: "8px",
                        }}
                      >
                        AI-Powered Analysis
                      </div>

                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: 0,
                          lineHeight: 1.65,
                        }}
                      >
                        Groq-powered AI reviews your
                        resume for technical
                        placement readiness, ATS
                        compatibility, skills,
                        projects and improvement
                        opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* =================================================
                   RESULTS
              ================================================= */

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* =============================================
                    HERO
                ============================================= */}

                <div
                  style={{
                    borderRadius: "20px",
                    padding: "32px",

                    background: `linear-gradient(135deg, ${atsColor}10, ${atsColor}05, transparent)`,

                    border: `1px solid ${atsColor}25`,

                    display: "flex",
                    alignItems: "center",
                    gap: "30px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* ATS */}

                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <ScoreRing
                      score={atsScore}
                      size={140}
                      color={atsColor}
                    />

                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginTop: "8px",
                      }}
                    >
                      ATS Score
                    </div>
                  </div>

                  {/* JOB MATCH */}

                  {isTargeted && (
                    <div
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <ScoreRing
                        score={jobMatchScore}
                        size={140}
                        color={jobMatchColor}
                      />

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "8px",
                        }}
                      >
                        Job Match Score
                      </div>
                    </div>
                  )}

                  {/* FEEDBACK */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: "280px",
                    }}
                  >
                    {isTargeted && (
                      <div
                        style={{
                          display:
                            "inline-block",

                          padding: "5px 10px",

                          borderRadius: "7px",

                          background:
                            "rgba(139,92,246,0.10)",

                          border:
                            "1px solid rgba(139,92,246,0.20)",

                          color: "#a78bfa",

                          fontSize: "11px",
                          fontWeight: 700,

                          marginBottom:
                            "10px",
                        }}
                      >
                        Target:{" "}
                        {result.targetRole ||
                          targetRole}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#f1f5f9",
                        marginBottom: "8px",
                      }}
                    >
                      {atsLabel}
                    </div>

                    <p
                      style={{
                        fontSize: "14px",
                        color: "#94a3b8",
                        margin: "0 0 16px",
                        lineHeight: 1.7,
                        maxWidth: "620px",
                      }}
                    >
                      {result.overallFeedback}
                    </p>

                    {result.topJobMatches
                      ?.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {result.topJobMatches.map(
                          (job, index) => (
                            <span
                              key={index}
                              style={{
                                padding:
                                  "5px 12px",

                                borderRadius:
                                  "8px",

                                fontSize:
                                  "12px",

                                fontWeight:
                                  600,

                                background:
                                  "rgba(99,102,241,0.1)",

                                color:
                                  "#818cf8",

                                border:
                                  "1px solid rgba(99,102,241,0.2)",
                              }}
                            >
                              {job}
                            </span>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* RESET */}

                  <button
                    type="button"
                    onClick={resetAnalyzer}
                    style={{
                      padding: "10px 20px",

                      borderRadius: "10px",

                      fontSize: "13px",
                      fontWeight: 600,

                      background:
                        "rgba(255,255,255,0.04)",

                      border:
                        "1px solid #1e1e35",

                      color: "#94a3b8",

                      cursor: "pointer",

                      alignSelf: "flex-start",
                    }}
                  >
                    Analyze Another
                  </button>
                </div>

                {/* =============================================
                    TARGETED SKILLS
                ============================================= */}

                {isTargeted && (
                  <div
                    style={{
                      display: "grid",

                      gridTemplateColumns:
                        "repeat(2,minmax(0,1fr))",

                      gap: "20px",
                    }}
                  >
                    <ResultListCard
                      title="Matched Skills"
                      items={
                        result.matchedSkills
                      }
                      accent="#10b981"
                    />

                    <ResultListCard
                      title="Missing Skills"
                      items={
                        result.missingSkills
                      }
                      accent="#f43f5e"
                    />
                  </div>
                )}

                {/* =============================================
                    SECTIONS + STRENGTHS
                ============================================= */}

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(0,1fr) minmax(0,1fr)",

                    gap: "20px",
                  }}
                >
                  {/* SECTION SCORES */}

                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "26px",

                      background: "#0f0f1e",

                      border:
                        "1px solid #1e1e35",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        margin: "0 0 20px",
                      }}
                    >
                      Section Analysis
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                      }}
                    >
                      {Object.entries(
                        result.sections || {}
                      ).map(
                        ([key, value]) => {
                          const score =
                            Number(
                              value?.score
                            ) || 0;

                          const color =
                            score >= 70
                              ? "#10b981"
                              : score >= 40
                              ? "#f59e0b"
                              : "#f43f5e";

                          return (
                            <div key={key}>
                              <div
                                style={{
                                  display:
                                    "flex",

                                  justifyContent:
                                    "space-between",

                                  alignItems:
                                    "center",

                                  marginBottom:
                                    "6px",
                                }}
                              >
                                <div
                                  style={{
                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    gap: "8px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize:
                                        "13px",

                                      color,
                                    }}
                                  >
                                    {sectionIcons[
                                      key
                                    ] || "◎"}
                                  </span>

                                  <span
                                    style={{
                                      fontSize:
                                        "13px",

                                      fontWeight:
                                        600,

                                      color:
                                        "#94a3b8",

                                      textTransform:
                                        "capitalize",
                                    }}
                                  >
                                    {key}
                                  </span>
                                </div>

                                <span
                                  style={{
                                    fontSize:
                                      "13px",

                                    fontWeight:
                                      800,

                                    color,
                                  }}
                                >
                                  {score}/100
                                </span>
                              </div>

                              <div
                                style={{
                                  height: "6px",

                                  borderRadius:
                                    "99px",

                                  background:
                                    "#1a1a2e",

                                  overflow:
                                    "hidden",

                                  marginBottom:
                                    "5px",
                                }}
                              >
                                <div
                                  style={{
                                    height:
                                      "100%",

                                    borderRadius:
                                      "99px",

                                    width: `${score}%`,

                                    background:
                                      color,

                                    transition:
                                      "width 1.2s ease",
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  fontSize:
                                    "11px",

                                  color:
                                    "#475569",

                                  lineHeight:
                                    1.55,
                                }}
                              >
                                {
                                  value?.feedback
                                }
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* STRENGTH / WEAKNESS */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <ResultListCard
                      title="✓ Strengths"
                      items={
                        result.strengths
                      }
                      accent="#10b981"
                    />

                    <ResultListCard
                      title="Areas to Improve"
                      items={
                        result.weaknesses
                      }
                      accent="#f43f5e"
                    />
                  </div>
                </div>

                {/* =============================================
                    KEYWORDS + SUGGESTIONS
                ============================================= */}

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "minmax(0,0.8fr) minmax(0,1.2fr)",

                    gap: "20px",
                  }}
                >
                  {/* KEYWORDS */}

                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "26px",

                      background: "#0f0f1e",

                      border:
                        "1px solid #1e1e35",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        margin: "0 0 7px",
                      }}
                    >
                      Missing Keywords
                    </h4>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "#475569",
                        margin:
                          "0 0 16px",
                        lineHeight: 1.5,
                      }}
                    >
                      Consider these only when they
                      genuinely match your skills or
                      experience.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {result.missingKeywords
                        ?.length > 0 ? (
                        result.missingKeywords.map(
                          (keyword, index) => (
                            <span
                              key={index}
                              style={{
                                padding:
                                  "6px 12px",

                                borderRadius:
                                  "8px",

                                fontSize:
                                  "12px",

                                fontWeight:
                                  600,

                                background:
                                  "rgba(245,158,11,0.1)",

                                color:
                                  "#f59e0b",

                                border:
                                  "1px solid rgba(245,158,11,0.25)",
                              }}
                            >
                              + {keyword}
                            </span>
                          )
                        )
                      ) : (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          No major missing keywords
                          identified.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SUGGESTIONS */}

                  <div
                    style={{
                      borderRadius: "18px",
                      padding: "26px",

                      background: "#0f0f1e",

                      border:
                        "1px solid #1e1e35",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#e2e8f0",
                        margin: "0 0 16px",
                      }}
                    >
                      Improvement Suggestions
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {result.suggestions?.map(
                        (suggestion, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",

                              gap: "12px",

                              alignItems:
                                "flex-start",

                              padding:
                                "12px 14px",

                              borderRadius:
                                "10px",

                              background:
                                "rgba(99,102,241,0.06)",

                              border:
                                "1px solid rgba(99,102,241,0.15)",
                            }}
                          >
                            <div
                              style={{
                                width: "22px",
                                height: "22px",

                                borderRadius:
                                  "6px",

                                flexShrink: 0,

                                background:
                                  "rgba(99,102,241,0.15)",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                fontSize:
                                  "10px",

                                fontWeight:
                                  800,

                                color:
                                  "#818cf8",
                              }}
                            >
                              {index + 1}
                            </div>

                            <span
                              style={{
                                fontSize:
                                  "12px",

                                color:
                                  "#94a3b8",

                                lineHeight:
                                  1.6,
                              }}
                            >
                              {suggestion}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* =============================================
                    FOOTER ACTION
                ============================================= */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={resetAnalyzer}
                    className="btn-primary"
                    style={{
                      minWidth: "220px",
                      padding: "13px 20px",
                    }}
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}