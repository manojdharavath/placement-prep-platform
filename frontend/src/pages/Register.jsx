import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const { data } = await API.post("/auth/register", formData);

    login(data.user, data.token);

    // Directly go to dashboard — Setup page removed
    navigate("/dashboard");
  } catch (err) {
    setError(
      err.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  const features = [
    { icon: "🧠", title: "AI Interview Assistant",  desc: "Practice with smart AI"          },
    { icon: "📊", title: "DSA Progress Tracker",    desc: "500+ curated problems"            },
    { icon: "📄", title: "Resume ATS Analyzer",     desc: "Beat applicant filters"           },
    { icon: "🎯", title: "Company Prep Guides",     desc: "FAANG & top companies"            },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#0b0b15", fontFamily: "Inter, sans-serif" }}>

      {/* ── Left Panel ── */}
      <div style={{
        width: "50%", position: "relative", overflow: "hidden",
        background: "linear-gradient(145deg, #0d0d1f 0%, #13132b 50%, #0f1628 100%)",
        borderRight: "1px solid #1e1e35",
      }} className="hidden lg:flex">

        {[
          { top: "5%",   left: "10%",  size: 350, color: "#6366f1", delay: "0s"   },
          { top: "55%",  left: "60%",  size: 260, color: "#8b5cf6", delay: "2s"   },
          { top: "75%",  left: "5%",   size: 200, color: "#06b6d4", delay: "1s"   },
        ].map((o, i) => (
          <div key={i} className="animate-float" style={{
            position: "absolute", top: o.top, left: o.left,
            width: o.size, height: o.size, borderRadius: "50%",
            background: `radial-gradient(circle, ${o.color}2e, transparent 70%)`,
            animationDelay: o.delay, pointerEvents: "none",
          }} />
        ))}

        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 10, padding: "0 56px", maxWidth: "520px", margin: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 800, color: "white",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}>P</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "16px" }}>PlacementPrep</div>
              <div style={{ color: "#6366f1", fontSize: "12px", fontWeight: 500 }}>Pro Platform</div>
            </div>
          </div>

          <h1 style={{ fontSize: "42px", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: "16px" }}>
            Start Your<br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8, #a78bfa, #67e8f9)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Placement Journey</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7, marginBottom: "40px" }}>
            Join thousands of students using AI-powered tools to crack their dream company.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "16px 20px", borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                  background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px" }}>{f.title}</div>
                  <div style={{ color: "#475569", fontSize: "12px" }}>{f.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#334155", fontSize: "16px" }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 24px",
        overflowY: "auto",
      }}>
        <div className="animate-fadeInUp" style={{ width: "100%", maxWidth: "420px" }}>

          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>
              Create Account
            </h2>
            <p style={{ fontSize: "14px", color: "#475569" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
              background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)",
              color: "#fb7185", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {[
              { label: "Full Name",       name: "name",     type: "text",     placeholder: "Manoj Kumar"        },
              { label: "Email Address",   name: "email",    type: "email",    placeholder: "you@example.com"    },
            ].map((field) => (
              <div key={field.name}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                  {field.label}
                </label>
                <input
                  type={field.type} name={field.name} required
                  value={formData[field.name]} onChange={handleChange}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e35",
                    color: "#f1f5f9", fontSize: "14px", outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e  => { e.target.style.borderColor = "#1e1e35"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  style={{
                    width: "100%", padding: "12px 48px 12px 16px", borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e35",
                    color: "#f1f5f9", fontSize: "14px", outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)"; }}
                  onBlur={e  => { e.target.style.borderColor = "#1e1e35"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#475569", fontSize: "16px",
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ marginTop: "4px", opacity: loading ? 0.75 : 1 }}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    Creating Account...
                  </span>
                : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#1e1e35", fontSize: "12px", marginTop: "24px" }}>
            By registering, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}