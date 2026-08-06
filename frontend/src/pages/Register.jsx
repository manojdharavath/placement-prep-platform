import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // Simple Password Strength Indicator Helper
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: "", color: "", width: "0%" };
    if (pass.length < 6) return { label: "Too short", color: "#f43f5e", width: "25%" };
    if (pass.length < 8) return { label: "Fair", color: "#f59e0b", width: "50%" };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) {
      return { label: "Strong", color: "#10b981", width: "100%" };
    }
    return { label: "Good", color: "#6366f1", width: "75%" };
  };

  const passStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const { data } = await API.post("/auth/register", payload);

      setSuccessMsg("✓ Account created successfully!");

      login(data.user, data.token);

      // Brief delay for smooth UX transition
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      setLoading(false);
    }
  };

  const features = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
        </svg>
      ),
      title: "AI Interview Assistant",
      desc: "Practice with smart AI",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: "DSA Progress Tracker",
      desc: "500+ curated problems",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      title: "Resume ATS Analyzer",
      desc: "Beat applicant filters",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      title: "Company Prep Guides",
      desc: "FAANG & top companies",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#0b0b15",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInToast {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* SUCCESS TOAST */}
      {successMsg && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 100,
            padding: "12px 20px",
            borderRadius: "10px",
            background: "rgba(16,185,129,0.95)",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            boxShadow: "0 10px 25px rgba(16,185,129,0.3)",
            animation: "fadeInToast 0.3s ease-out forwards",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* ── Left Panel ── */}
      <div
        style={{
          width: "50%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #0d0d1f 0%, #13132b 50%, #0f1628 100%)",
          borderRight: "1px solid #1e1e35",
        }}
        className="hidden lg:flex"
      >
        {[
          { top: "5%", left: "10%", size: 350, color: "#6366f1", delay: "0s" },
          { top: "55%", left: "60%", size: 260, color: "#8b5cf6", delay: "2s" },
          { top: "75%", left: "5%", size: 200, color: "#06b6d4", delay: "1s" },
        ].map((o, i) => (
          <div
            key={i}
            className="animate-float"
            style={{
              position: "absolute",
              top: o.top,
              left: o.left,
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.color}2e, transparent 70%)`,
              animationDelay: o.delay,
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            padding: "0 56px",
            maxWidth: "520px",
            margin: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 800,
                color: "white",
                boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              }}
            >
              P
            </div>
            <div>
              <div
                style={{ color: "white", fontWeight: 700, fontSize: "16px" }}
              >
                PlacementPrep
              </div>
              <div
                style={{
                  color: "#6366f1",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                Pro Platform
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            Start Your
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, #818cf8, #a78bfa, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Placement Journey
            </span>
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "15px",
              lineHeight: 1.7,
              marginBottom: "40px",
            }}
          >
            Join thousands of students using AI-powered tools to crack their
            dream company.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.06)")
                }
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a5b4fc",
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    {f.title}
                  </div>
                  <div style={{ color: "#475569", fontSize: "12px" }}>
                    {f.desc}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    color: "#334155",
                    fontSize: "16px",
                  }}
                >
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          overflowY: "auto",
        }}
      >
        <div
          className="animate-fadeInUp"
          style={{ width: "100%", maxWidth: "420px" }}
        >
          <div style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "30px",
                fontWeight: 800,
                color: "#f1f5f9",
                margin: "0 0 8px",
              }}
            >
              Create Account
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#818cf8",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fb7185",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                Full Name
              </label>
              <input
                autoFocus
                type="text"
                name="name"
                required
                disabled={loading}
                value={formData.name}
                onChange={handleChange}
                placeholder="Manoj Kumar"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #1e1e35",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(99,102,241,0.12)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1e1e35";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid #1e1e35",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "text",
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(99,102,241,0.12)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#1e1e35";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid #1e1e35",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "text",
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(99,102,241,0.12)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1e1e35";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    color: "#475569",
                    fontSize: "16px",
                    padding: 0,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div style={{ marginTop: "8px" }}>
                  <div
                    style={{
                      height: "4px",
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: passStrength.width,
                        background: passStrength.color,
                        transition: "width 0.3s ease, background 0.3s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: passStrength.color,
                      fontWeight: 600,
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {passStrength.label}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                marginTop: "6px",
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                border: "none",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Creating Account...
                </span>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              color: "#475569",
              fontSize: "12px",
              marginTop: "24px",
            }}
          >
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}