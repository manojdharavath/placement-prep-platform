import React from "react";

const ProgressBar = ({ title, value, color }) => {
  return (
    <div
      style={{
        marginBottom: "25px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "white",
            fontSize: "16px",
          }}
        >
          {title}
        </h3>

        <span
          style={{
            color: "#A1A1AA",
          }}
        >
          {value}%
        </span>
      </div>

      <div
        style={{
          width: "100%",
          height: "10px",
          background: "#2A2A40",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color,
            borderRadius: "10px",
            transition: "0.5s",
          }}
        />
      </div>
    </div>
  );
};

const ProgressSection = ({ progress }) => {
  return (
    <div
      style={{
        background: "#151528",
        borderRadius: "18px",
        padding: "28px",
        border: "1px solid #26263b",
        marginBottom: "25px",
      }}
    >
      <h2
        style={{
          color: "white",
          marginTop: 0,
          marginBottom: "25px",
        }}
      >
        📊 Your Progress
      </h2>

      <ProgressBar
        title="DSA Progress"
        value={progress?.dsa || 0}
        color="#6366F1"
      />

      <ProgressBar
        title="Mock Tests"
        value={progress?.mock || 0}
        color="#10B981"
      />

      <ProgressBar
        title="Resume"
        value={progress?.resume || 0}
        color="#F59E0B"
      />
    </div>
  );
};

export default ProgressSection;