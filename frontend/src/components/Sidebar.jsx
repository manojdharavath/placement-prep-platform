import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    path: "/company-dna",
    label: "Company Prep",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    path: "/dsa",
    label: "DSA Tracker",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    path: "/mock-tests",
    label: "Mock Tests",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    path: "/resume-analyzer",
    label: "Resume Analyzer",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  },
  {
    path: "/interview",
    label: "AI Interview",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { pathname } = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isTabletOrMobile = windowWidth <= 1024;

  return (
    <>
      <aside
        style={{
          position: "fixed",
          left: isTabletOrMobile ? (sidebarOpen ? 0 : "-260px") : 0,
          transition: "left .3s ease",
          top: 0,
          width: "256px",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#0d0d1c",
          borderRight: "1px solid #1e1e35",
          zIndex: 200,
        }}
      >
        {/* LOGO */}
        <div
          style={{
            height: "76px",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid #1e1e35",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#ffffff",
              fontSize: "19px",
              fontWeight: 800,
              boxShadow: "0 5px 18px rgba(99,102,241,0.35)",
            }}
          >
            P
          </div>

          <div>
            <div
              style={{
                color: "#f8fafc",
                fontSize: "16px",
                fontWeight: 750,
                lineHeight: 1.2,
                letterSpacing: "-0.2px",
              }}
            >
              PlacementPrep
            </div>

            <div
              style={{
                color: "#818cf8",
                fontSize: "12px",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Pro Platform
            </div>
          </div>
        </div>

        {/* NAVIGATION LABEL */}
        <div style={{ padding: "28px 20px 10px" }}>
          <span
            style={{
              color: "#475569",
              fontSize: "11px",
              fontWeight: 750,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            Navigation
          </span>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "4px 12px 20px",
            overflowY: "auto",
          }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path === "/mock-tests" && pathname.startsWith("/test"));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isTabletOrMobile) {
                    setSidebarOpen(false);
                  }
                }}
                style={{
                  textDecoration: "none",
                  display: "block",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    minHeight: "50px",
                    display: "flex",
                    alignItems: "center",
                    gap: "13px",
                    padding: "0 14px",
                    borderRadius: "11px",
                    background: isActive
                      ? "linear-gradient(90deg, rgba(99,102,241,0.18), rgba(99,102,241,0.09))"
                      : "transparent",
                    border: `1px solid ${
                      isActive ? "rgba(99,102,241,0.32)" : "transparent"
                    }`,
                    color: isActive ? "#d5dcff" : "#94a3b8",
                    fontSize: "14px",
                    fontWeight: isActive ? 650 : 500,
                    transition:
                      "background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#d1d5db";
                      e.currentTarget.style.transform = "translateX(2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  {/* ICON */}
                  <span
                    style={{
                      width: "22px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: isActive ? "#8b8fff" : "inherit",
                    }}
                  >
                    {item.icon}
                  </span>

                  {/* LABEL */}
                  <span style={{ flex: 1, whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>

                  {/* ACTIVE DOT */}
                  {isActive && (
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: "#818cf8",
                        boxShadow: "0 0 10px rgba(129,140,248,0.85)",
                      }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM */}
        <div
          style={{
            padding: "18px 20px 20px",
            borderTop: "1px solid #1e1e35",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "11px 12px",
              borderRadius: "10px",
              background: "rgba(99,102,241,0.04)",
              border: "1px solid rgba(99,102,241,0.08)",
            }}
          >
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Placement preparation
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: 600,
                marginTop: "3px",
              }}
            >
              Learn • Practice • Improve
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && isTabletOrMobile && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 150,
          }}
        />
      )}
    </>
  );
}