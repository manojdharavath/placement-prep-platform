import React from "react";

const HeroSection = ({ user }) => {
  return (
    <div
      style={{
        background: "#151528",
        borderRadius: "18px",
        padding: "30px",
        color: "white",
        marginBottom: "25px",
        border: "1px solid #26263b",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "32px",
          fontWeight: "700",
        }}
      >
        👋 Welcome, {user?.name}
      </h1>

      <p
        style={{
          color: "#A1A1AA",
          marginTop: "8px",
          fontSize: "16px",
        }}
      >
        Your AI Placement Coach is ready.
      </p>

      <div
        style={{
          display: "flex",
          gap: "18px",
          flexWrap: "wrap",
          marginTop: "25px",
        }}
      >
        <div
          style={{
            background: "#20203A",
            padding: "14px 18px",
            borderRadius: "12px",
            minWidth: "180px",
          }}
        >
          <small style={{ color: "#9CA3AF" }}>
            Preparing For
          </small>

          <h3 style={{ margin: "6px 0 0" }}>
            🏢 {user?.activeCompany}
          </h3>
        </div>

        <div
          style={{
            background: "#20203A",
            padding: "14px 18px",
            borderRadius: "12px",
            minWidth: "180px",
          }}
        >
          <small style={{ color: "#9CA3AF" }}>
            Placement Timeline
          </small>

          <h3 style={{ margin: "6px 0 0" }}>
            ⏳ {user?.timeline} Months
          </h3>
        </div>

        <div
          style={{
            background: "#20203A",
            padding: "14px 18px",
            borderRadius: "12px",
            minWidth: "180px",
          }}
        >
          <small style={{ color: "#9CA3AF" }}>
            Daily Study
          </small>

          <h3 style={{ margin: "6px 0 0" }}>
            📚 {user?.studyHours} Hours
          </h3>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;