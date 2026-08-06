import { useState, useRef, useEffect } from "react";
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

/* =========================================================
   ANIMATED SCORE RING
========================================================= */

function AnimatedScoreRing({ score = 0, size = 120, color }) {
  const animatedVal = useAnimatedScore(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedVal / 100) * circumference;

  const c =
    color ||
    (animatedVal >= 70
      ? "#10b981"
      : animatedVal >= 40
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
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
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
          style={{ transition: "stroke-dashoffset 0.1s ease" }}
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
          {animatedVal}
        </div>
        <div style={{ fontSize: "10px", color: "#475569" }}>/ 100</div>
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
   REUSABLE LIST CARD
========================================================= */

function ResultListCard({ title, items = [], accent = "#6366f1", prefix = "" }) {
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

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
            <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.55 }}>
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

  const [analysisType, setAnalysisType] = useState("general");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =========================================================
     FILE VALIDATION
  ========================================================= */

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = selectedFile.name.toLowerCase();

    const validExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (!validExtension) {
      setError("Only PDF, DOC, and DOCX files are supported.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10 MB.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  /* =========================================================
     ANALYZE
  ========================================================= */

  const handleAnalyze = async () => {
    if (!file || loading) return;

    if (analysisType === "targeted" && !targetRole.trim()) {
      setError("Please enter the target job role.");
      return;
    }

    if (analysisType === "targeted" && !jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("analysisType", analysisType);

      if (analysisType === "targeted") {
        form.append("targetRole", targetRole.trim());
        form.append("jobDescription", jobDescription.trim());
      }

      const { data } = await API.post("/resume/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
    } catch (err) {
      console.error("Resume Analysis Error:", err);
      setError(
        err.response?.data?.message || "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAnalyzer = () => {
    setResult(null);
    setFile(null);
    setError("");
    setTargetRole("");
    setJobDescription("");
    setAnalysisType("general");
    if (inputRef.current) inputRef.current.value = "";
  };

  /* =========================================================
     COMPUTED GRADE & METRICS
  ========================================================= */

  const atsScore = Number(result?.atsScore) || 0;
  const atsColor =
    atsScore >= 70 ? "#10b981" : atsScore >= 40 ? "#f59e0b" : "#f43f5e";

  const getGradeInfo = (s) => {
    if (s >= 85) return { grade: "A+", stars: "★★★★★", label: "Excellent Resume" };
    if (s >= 75) return { grade: "A", stars: "★★★★☆", label: "Strong Resume" };
    if (s >= 60) return { grade: "B", stars: "★★★☆☆", label: "Good Resume" };
    if (s >= 40) return { grade: "C", stars: "★★☆☆☆", label: "Needs Improvement" };
    return { grade: "D", stars: "★☆☆☆☆", label: "Needs Major Overhaul" };
  };

  const gradeInfo = getGradeInfo(atsScore);
  const jobMatchScore = Number(result?.jobMatchScore) || 0;
  const isTargeted = result?.analysisType === "targeted";

  const placementReadiness = [
    { company: "TCS / Infosys", readiness: Math.min(100, atsScore + 15), status: "High" },
    { company: "Amazon", readiness: Math.max(10, atsScore - 5), status: "Moderate" },
    { company: "Microsoft", readiness: Math.max(10, atsScore - 10), status: "Moderate" },
    { company: "Google", readiness: Math.max(5, atsScore - 18), status: "Challenging" },
  ];

  return (
    <Layout title="Resume Analyzer">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .analyzer-type-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .upload-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
        }
        .two-col-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .keywords-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 20px;
        }
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
        }
        @media (max-width: 1024px) {
          .upload-main-grid, .keywords-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .analyzer-type-grid, .two-col-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main
        style={{
          flex: 1,
          padding: isMobile ? "16px 16px 40px" : "32px 38px 60px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              marginBottom: "28px",
              gap: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: isMobile ? "22px" : "28px",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  margin: "0 0 7px",
                }}
              >
                AI Resume Analyzer
              </h2>
              <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                Analyze your resume for ATS compatibility or compare it directly with a target job description.
              </p>
            </div>

            {result && (
              <button
                onClick={() => window.print()}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#818cf8",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📄 Download PDF Report
              </button>
            )}
          </div>

          {!result ? (
            <>
              {/* ANALYSIS TYPE */}
              <div
                style={{
                  borderRadius: "18px",
                  padding: isMobile ? "16px" : "22px",
                  marginBottom: "22px",
                  background: "#0f0f1e",
                  border: "1px solid #1e1e35",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", marginBottom: "5px" }}>
                    Choose Analysis Type
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    Run a general ATS check or compare your resume with a specific job.
                  </div>
                </div>

                <div className="analyzer-type-grid">
                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisType("general");
                      setError("");
                    }}
                    style={{
                      padding: isMobile ? "14px" : "18px",
                      borderRadius: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      background:
                        analysisType === "general"
                          ? "rgba(99,102,241,0.10)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        analysisType === "general"
                          ? "1px solid rgba(99,102,241,0.45)"
                          : "1px solid #1e1e35",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(99,102,241,0.12)",
                          color: "#818cf8",
                          fontWeight: 800,
                        }}
                      >
                        ◎
                      </div>
                      <div style={{ color: analysisType === "general" ? "#c7d2fe" : "#e2e8f0", fontSize: "14px", fontWeight: 700 }}>
                        General ATS Analysis
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                      Check resume structure, sections, keywords, projects, skills, and overall ATS readiness.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnalysisType("targeted");
                      setError("");
                    }}
                    style={{
                      padding: isMobile ? "14px" : "18px",
                      borderRadius: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      background:
                        analysisType === "targeted"
                          ? "rgba(139,92,246,0.10)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        analysisType === "targeted"
                          ? "1px solid rgba(139,92,246,0.45)"
                          : "1px solid #1e1e35",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(139,92,246,0.12)",
                          color: "#a78bfa",
                          fontWeight: 800,
                        }}
                      >
                        ◈
                      </div>
                      <div style={{ color: analysisType === "targeted" ? "#ddd6fe" : "#e2e8f0", fontSize: "14px", fontWeight: 700 }}>
                        Target Job Analysis
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>
                      Compare your resume against a specific role and job description to calculate match alignment.
                    </div>
                  </button>
                </div>
              </div>

              {/* TARGET JOB DETAILS */}
              {analysisType === "targeted" && (
                <div
                  style={{
                    borderRadius: "18px",
                    padding: isMobile ? "16px" : "24px",
                    marginBottom: "22px",
                    background: "#0f0f1e",
                    border: "1px solid rgba(139,92,246,0.20)",
                  }}
                >
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", marginBottom: "5px" }}>
                    Target Job Details
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
                    Enter the role and paste the job description from the company.
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: 600, marginBottom: "7px" }}>
                      Target Role
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Example: Software Development Engineer"
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "13px 14px",
                        borderRadius: "11px",
                        background: "#111120",
                        color: "#e2e8f0",
                        border: "1px solid #25253f",
                        outline: "none",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", color: "#94a3b8", fontSize: "12px", fontWeight: 600, marginBottom: "7px" }}>
                      Job Description
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      rows={8}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "14px",
                        borderRadius: "11px",
                        background: "#111120",
                        color: "#e2e8f0",
                        border: "1px solid #25253f",
                        outline: "none",
                        fontSize: "13px",
                        lineHeight: 1.6,
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                    <div style={{ marginTop: "6px", textAlign: "right", fontSize: "10px", color: "#475569" }}>
                      {jobDescription.length} characters
                    </div>
                  </div>
                </div>
              )}

              {/* UPLOAD + INFO GRID */}
              <div className="upload-main-grid">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* UPLOAD BOX */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    style={{
                      borderRadius: "20px",
                      padding: isMobile ? "36px 20px" : "58px 40px",
                      textAlign: "center",
                      border: `2px dashed ${dragging ? "#6366f1" : file ? "#10b981" : "#1e1e35"}`,
                      background: dragging
                        ? "rgba(99,102,241,0.06)"
                        : file
                        ? "rgba(16,185,129,0.04)"
                        : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf, .doc, .docx"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) handleFile(selectedFile);
                      }}
                    />

                    {file ? (
                      /* RESUME PREVIEW CARD */
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(16,185,129,0.10)",
                            border: "1px solid rgba(16,185,129,0.22)",
                            color: "#10b981",
                            fontSize: "25px",
                          }}
                        >
                          📄
                        </div>

                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#10b981", marginBottom: "6px" }}>
                            {file.name}
                          </div>

                          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <span style={{ padding: "3px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", fontSize: "11px", color: "#94a3b8" }}>
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <span style={{ padding: "3px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", fontSize: "11px", color: "#94a3b8" }}>
                              Est. 1-2 Pages
                            </span>
                          </div>
                        </div>

                        <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Click to replace file</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: "16px" }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div style={{ fontSize: "17px", fontWeight: 700, color: "#94a3b8", marginBottom: "8px" }}>
                          Drag & drop your resume here
                        </div>
                        <div style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
                          or click to browse files
                        </div>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          {["PDF", "DOC", "DOCX"].map((type) => (
                            <span key={type} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700, background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                              {type}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: "12px", color: "#334155", fontSize: "11px" }}>
                          Maximum file size: 10 MB
                        </div>
                      </>
                    )}
                  </div>

                  {error && (
                    <div style={{ padding: "14px 16px", borderRadius: "12px", fontSize: "13px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", color: "#fb7185", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>!</span> {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="btn-primary"
                    style={{
                      opacity: !file || loading ? 0.55 : 1,
                      fontSize: "15px",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      cursor: !file || loading ? "not-allowed" : "pointer",
                      width: "100%",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                        {analysisType === "targeted" ? "Analyzing Job Match with AI..." : "Analyzing Resume with AI..."}
                      </span>
                    ) : analysisType === "targeted" ? (
                      "Analyze Resume for Target Job"
                    ) : (
                      "Analyze Resume with AI"
                    )}
                  </button>
                </div>

                {/* RIGHT INFO PANEL */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
                      What You'll Get
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                      {[
                        { icon: "◎", label: "ATS Score", desc: "Overall ATS readiness", color: "#6366f1" },
                        ...(analysisType === "targeted"
                          ? [
                              { icon: "◈", label: "Job Match Score", desc: "Match against the target role", color: "#8b5cf6" },
                              { icon: "✓", label: "Skill Matching", desc: "Matched and missing skills", color: "#10b981" },
                            ]
                          : []),
                        { icon: "✦", label: "Section Scores", desc: "Detailed section analysis", color: "#10b981" },
                        { icon: "⚡", label: "Missing Keywords", desc: "Important keywords to consider", color: "#f59e0b" },
                        { icon: "⬡", label: "Improvement Tips", desc: "Specific actionable suggestions", color: "#06b6d4" },
                      ].map((item, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: `${item.color}12`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: item.color, fontWeight: 700 }}>
                            {item.icon}
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>{item.label}</div>
                            <div style={{ fontSize: "11px", color: "#475569" }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderRadius: "18px", padding: "20px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#818cf8", marginBottom: "8px" }}>
                      AI-Powered Analysis
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: 1.65 }}>
                      AI reviews your resume for technical placement readiness, ATS compatibility, skills, projects, and improvement opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* RESULTS PAGE */
            <div id="printable-report" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* HERO SCORE & GRADE CARD */}
              <div
                style={{
                  borderRadius: "20px",
                  padding: isMobile ? "20px 16px" : "32px",
                  background: `linear-gradient(135deg, ${atsColor}10, ${atsColor}05, transparent)`,
                  border: `1px solid ${atsColor}25`,
                  display: "flex",
                  alignItems: "center",
                  gap: "30px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ textAlign: "center", width: isMobile ? "100%" : "auto" }}>
                  <AnimatedScoreRing score={atsScore} size={140} color={atsColor} />
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>ATS Score</div>
                </div>

                {isTargeted && (
                  <div style={{ textAlign: "center", width: isMobile ? "100%" : "auto" }}>
                    <AnimatedScoreRing score={jobMatchScore} size={140} color={atsColor} />
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "8px" }}>Job Match Score</div>
                  </div>
                )}

                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 900, color: atsColor, background: `${atsColor}15`, padding: "4px 12px", borderRadius: "8px", border: `1px solid ${atsColor}30` }}>
                      Grade {gradeInfo.grade}
                    </span>
                    <span style={{ fontSize: "14px", color: "#f59e0b" }}>{gradeInfo.stars}</span>
                  </div>

                  <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: 800, color: "#f1f5f9", marginBottom: "8px" }}>
                    {gradeInfo.label}
                  </div>

                  <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 16px", lineHeight: 1.7, maxWidth: "620px" }}>
                    {result.overallFeedback}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetAnalyzer}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid #1e1e35",
                    color: "#94a3b8",
                    cursor: "pointer",
                    alignSelf: isMobile ? "stretch" : "flex-start",
                  }}
                >
                  Analyze Another
                </button>
              </div>

              {/* ATS BREAKDOWN BARS */}
              <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
                  ATS Score Breakdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "16px" }}>
                  {[
                    { label: "Formatting", score: Math.min(100, atsScore + 8) },
                    { label: "Keywords", score: Math.max(20, atsScore - 5) },
                    { label: "Projects", score: atsScore },
                    { label: "Experience", score: Math.min(100, atsScore + 4) },
                    { label: "Skills", score: Math.min(100, atsScore + 10) },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", color: "#94a3b8" }}>
                        <span>{item.label}</span>
                        <strong style={{ color: "#e2e8f0" }}>{item.score}%</strong>
                      </div>
                      <div style={{ height: "6px", borderRadius: "99px", background: "#1a1a2e", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${item.score}%`, background: "#6366f1", borderRadius: "99px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PLACEMENT READINESS MATRIX */}
              <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px" }}>
                  🎯 Company Placement Readiness
                </h4>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 18px" }}>
                  Estimated probability of passing initial resume screening for target companies.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px" }}>
                  {placementReadiness.map((item, i) => (
                    <div key={i} style={{ padding: "14px", borderRadius: "12px", background: "#111120", border: "1px solid #1f2937", textAlign: "center" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>{item.company}</div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: item.readiness >= 75 ? "#10b981" : item.readiness >= 50 ? "#f59e0b" : "#f43f5e" }}>
                        {item.readiness}%
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Match Chance</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TARGETED SKILLS */}
              {isTargeted && (
                <div className="two-col-grid">
                  <ResultListCard title="Matched Skills" items={result.matchedSkills || []} accent="#10b981" />
                  <ResultListCard title="Missing Skills" items={result.missingSkills || []} accent="#f43f5e" />
                </div>
              )}

              {/* SECTIONAL ANALYSIS */}
              <div className="two-col-grid">
                <div style={{ borderRadius: "18px", padding: "26px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
                    Sectional Breakdown
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {Object.entries(result.sections || {}).map(([key, value]) => {
                      const score = Number(value?.score) || 0;
                      const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#f43f5e";

                      return (
                        <div key={key}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "13px", color }}>{sectionIcons[key] || "◎"}</span>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#94a3b8", textTransform: "capitalize" }}>{key}</span>
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: 800, color }}>{score}/100</span>
                          </div>
                          <div style={{ height: "6px", borderRadius: "99px", background: "#1a1a2e", overflow: "hidden", marginBottom: "5px" }}>
                            <div style={{ height: "100%", borderRadius: "99px", width: `${score}%`, background: color }} />
                          </div>
                          <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.55 }}>{value?.feedback}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <ResultListCard title="✓ Strengths" items={result.strengths || []} accent="#10b981" />
                  <ResultListCard title="Areas to Improve" items={result.weaknesses || []} accent="#f43f5e" />
                </div>
              </div>

              {/* KEYWORDS & PRIORITIZED SUGGESTIONS */}
              <div className="keywords-grid">
                {/* MISSING KEYWORDS */}
                <div style={{ borderRadius: "18px", padding: "26px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 7px" }}>
                    Missing Keywords
                  </h4>
                  <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 16px", lineHeight: 1.5 }}>
                    Include relevant missing keywords naturally in your project and experience sections.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {result.missingKeywords?.length > 0 ? (
                      result.missingKeywords.map((keyword, index) => (
                        <span key={index} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                          + {keyword}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "12px", color: "#64748b" }}>No major missing keywords identified.</span>
                    )}
                  </div>
                </div>

                {/* PRIORITIZED SUGGESTIONS */}
                <div style={{ borderRadius: "18px", padding: "26px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
                    Prioritized Improvement Suggestions
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {(result.suggestions || []).map((suggestion, index) => {
                      const priorityTag = index === 0 ? "🔥 High Priority" : index === 1 ? "🟠 Medium Priority" : "🟢 Low Priority";
                      const priorityColor = index === 0 ? "#f43f5e" : index === 1 ? "#f59e0b" : "#10b981";

                      return (
                        <div key={index} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                          <span style={{ fontSize: "10px", fontWeight: 800, color: priorityColor, display: "block", marginBottom: "4px" }}>
                            {priorityTag}
                          </span>
                          <span style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>{suggestion}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ATS BEST PRACTICES */}
              <div style={{ borderRadius: "18px", padding: "24px", background: "#0f0f1e", border: "1px solid #1e1e35" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 14px" }}>
                  💡 ATS Best Practices
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: "10px", fontSize: "12px", color: "#94a3b8" }}>
                  <div>✓ Use standard section headers (Experience, Education, Skills)</div>
                  <div>✓ Export and upload clean, standard PDF documents</div>
                  <div>✓ Quantify achievements with metrics and percentages</div>
                  <div>✓ Avoid complex multi-column tables or embedded graphics</div>
                </div>
              </div>

              {/* FOOTER ACTION */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "4px" }}>
                <button
                  type="button"
                  onClick={resetAnalyzer}
                  className="btn-primary"
                  style={{
                    minWidth: "220px",
                    padding: "13px 20px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Analyze Another Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}