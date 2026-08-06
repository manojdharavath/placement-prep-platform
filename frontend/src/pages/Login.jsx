import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
      };

      const { data } = await API.post("/auth/login", payload);

      setSuccessMsg("✓ Welcome back!");

      // Store in auth context
      login(data.user, data.token);

      // Brief pause for success animation feel
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sign in. Please check your credentials and try again."
      );
      setLoading(false);
    }
  };

  const features = [
    {
      title: "DSA Practice",
      text: "Track your coding preparation",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      title: "Mock Tests",
      text: "Test your placement readiness",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "AI Interview",
      text: "Practice realistic interviews",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <rect x="4" y="8" width="16" height="12" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      ),
    },
    {
      title: "Resume Analyzer",
      text: "Improve your resume with AI",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
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

      {/* ================= LEFT SIDE ================= */}

      <section
        className="hidden lg:flex"
        style={{
          width: "50%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #0d0d1f 0%, #121225 55%, #101426 100%)",
          borderRight: "1px solid #1e1e35",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Grid Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.025,
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />

        {/* Purple Glow */}
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.16), transparent 68%)",
            top: "-150px",
            left: "-120px",
            pointerEvents: "none",
          }}
        />

        {/* Blue Glow */}
        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.10), transparent 70%)",
            bottom: "-150px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />

        {/* Left Side Content */}
        <div
          style={{
            width: "100%",
            maxWidth: "530px",
            padding: "50px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "65px",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "25px",
                fontWeight: 800,
                color: "#ffffff",
                boxShadow: "0 10px 30px rgba(99,102,241,0.30)",
              }}
            >
              P
            </div>

            <div>
              <div
                style={{
                  color: "#f8fafc",
                  fontWeight: 750,
                  fontSize: "23px",
                }}
              >
                PlacementPrep
              </div>

              <div
                style={{
                  color: "#818cf8",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginTop: "3px",
                }}
              >
                Pro Platform
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: "46px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: "1.12",
              margin: "0 0 18px",
            }}
          >
            Prepare smarter.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Get placement ready.
            </span>
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "16px",
              lineHeight: "1.7",
              maxWidth: "450px",
              marginBottom: "38px",
            }}
          >
            Everything you need for placement preparation, brought together in
            one intelligent platform.
          </p>

          {/* Features Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: "16px",
                  borderRadius: "13px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    flexShrink: 0,
                    borderRadius: "9px",
                    background: "rgba(99,102,241,0.10)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a5b4fc",
                  }}
                >
                  {feature.icon}
                </div>

                <div>
                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: "14px",
                      fontWeight: 650,
                    }}
                  >
                    {feature.title}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    {feature.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RIGHT SIDE ================= */}

      <section
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 30px",
        }}
      >
        <div
          className="animate-fadeInUp"
          style={{
            width: "100%",
            maxWidth: "440px",
          }}
        >
          {/* Mobile Logo */}
          <div
            className="flex lg:hidden"
            style={{
              alignItems: "center",
              gap: "11px",
              marginBottom: "45px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "19px",
              }}
            >
              P
            </div>

            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                PlacementPrep
              </div>

              <div
                style={{
                  color: "#818cf8",
                  fontSize: "11px",
                }}
              >
                Pro Platform
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div style={{ marginBottom: "34px" }}>
            <p
              style={{
                color: "#818cf8",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: "10px",
              }}
            >
              WELCOME BACK
            </p>

            <h2
              style={{
                fontSize: "34px",
                fontWeight: 800,
                color: "#f8fafc",
                margin: "0 0 10px",
              }}
            >
              Sign in to your account
            </h2>

            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                lineHeight: "1.6",
              }}
            >
              Continue your placement preparation from where you left off.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.22)",
                color: "#fb7185",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
                }}
              >
                Email address
              </label>

              <input
                autoFocus
                type="email"
                name="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  height: "50px",
                  padding: "0 15px",
                  borderRadius: "10px",
                  background: "#111120",
                  border: "1px solid #27273d",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "text",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = "#6366f1";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(99,102,241,0.10)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#27273d";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
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
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    height: "50px",
                    padding: "0 50px 0 15px",
                    borderRadius: "10px",
                    background: "#111120",
                    border: "1px solid #27273d",
                    color: "#f1f5f9",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "text",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(99,102,241,0.10)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#27273d";
                    e.target.style.boxShadow = "none";
                  }}
                />

                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass((prev) => !prev)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    cursor: loading ? "not-allowed" : "pointer",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5 0 9 4 10 8a11.8 11.8 0 0 1-2.1 4.2" />
                      <path d="M6.6 6.6A11.7 11.7 0 0 0 2 12c1 4 5 8 10 8a10.6 10.6 0 0 0 5.4-1.5" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "12px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    color: "#64748b",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={loading}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{
                      accentColor: "#6366f1",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  Remember me
                </label>

                <a
                  href="#forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setError("Password reset feature coming soon!");
                  }}
                  style={{
                    fontSize: "12px",
                    color: "#818cf8",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: "100%",
                height: "50px",
                marginTop: "6px",
                border: "none",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transform: btnHover && !loading ? "translateY(-1px)" : "none",
                boxShadow: btnHover && !loading
                  ? "0 10px 28px rgba(99,102,241,0.30)"
                  : "0 8px 25px rgba(99,102,241,0.18)",
                transition: "all 0.2s ease",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" }}>
                  <span
                    style={{
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#ffffff",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Callout */}
          <div
            style={{
              marginTop: "28px",
              paddingTop: "24px",
              borderTop: "1px solid #1e1e35",
              textAlign: "center",
            }}
          >
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              New to PlacementPrep?{" "}
            </span>

            <Link
              to="/register"
              style={{
                color: "#818cf8",
                fontSize: "13px",
                fontWeight: 650,
                textDecoration: "none",
              }}
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}