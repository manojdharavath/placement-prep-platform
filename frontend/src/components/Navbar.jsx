import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, LogOut, ChevronDown } from "lucide-react";

export default function Navbar({ title, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const profileRef = useRef(null);

  // Track window resize dynamically
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  // Display a cleaner version of the user's name in navbar
  const displayName = user?.name
    ? user.name
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "My Account";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024;

  return (
    <header
      style={{
        height: "76px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 34px",
        background: "rgba(13, 13, 28, 0.96)",
        borderBottom: "1px solid #1e1e35",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* ================= LEFT ================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {isTablet && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Open sidebar"
          >
            <Menu size={26} />
          </button>
        )}

        <div>
          <h1
            style={{
              fontSize: isMobile ? "18px" : "21px",
              fontWeight: 750,
              color: "#f8fafc",
              margin: 0,
            }}
          >
            {title}
          </h1>

          {!isMobile && (
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0",
              }}
            >
              {today}
            </p>
          )}
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "8px" : "14px",
        }}
      >
        {/* PROFILE TRIGGER & DROPDOWN */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              minHeight: "50px",
              display: "flex",
              alignItems: "center",
              gap: "11px",
              padding: "4px 12px 4px 5px",
              borderRadius: "13px",
              border: profileOpen
                ? "1px solid rgba(99,102,241,0.35)"
                : "1px solid transparent",
              background: profileOpen
                ? "rgba(99,102,241,0.09)"
                : "transparent",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 750,
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {/* User Details */}
            {!isMobile && (
              <div style={{ textAlign: "left", minWidth: "110px" }}>
                <div
                  style={{
                    color: "#f1f5f9",
                    fontSize: "14px",
                    fontWeight: 650,
                    lineHeight: 1.3,
                    maxWidth: "150px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    color: "#818cf8",
                    fontSize: "11.5px",
                    fontWeight: 550,
                    marginTop: "2px",
                    lineHeight: 1.2,
                  }}
                >
                  My Account
                </div>
              </div>
            )}

            {/* Dropdown Chevron */}
            <ChevronDown
              size={16}
              style={{
                color: profileOpen ? "#a5b4fc" : "#64748b",
                transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            />
          </button>

          {/* PROFILE DROPDOWN MENU */}
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "60px",
                width: "300px",
                background: "#111122",
                border: "1px solid #25253d",
                borderRadius: "16px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              {/* Account Header */}
              <div
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.09), rgba(139,92,246,0.04))",
                  borderBottom: "1px solid #1e1e35",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 750,
                    boxShadow: "0 5px 16px rgba(99,102,241,0.3)",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      color: "#f8fafc",
                      fontSize: "15px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayName}
                  </div>
                  <div
                    style={{
                      color: "#818cf8",
                      fontSize: "12px",
                      fontWeight: 550,
                      marginTop: "3px",
                    }}
                  >
                    PlacementPrep Account
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div style={{ padding: "16px 20px 18px" }}>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.9px",
                    marginBottom: "8px",
                  }}
                >
                  Email Address
                </div>
                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: 500,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid #1e1e35",
                    borderRadius: "99px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email || "No email available"}
                </div>

                {/* Dropdown Logout Action */}
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    marginTop: "14px",
                    padding: "10px",
                    borderRadius: "10px",
                    background: "rgba(244,63,94,0.08)",
                    border: "1px solid rgba(244,63,94,0.25)",
                    color: "#fb7185",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}