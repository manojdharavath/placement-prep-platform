import React from "react";
import { FaRobot, FaArrowRight } from "react-icons/fa";

const AICoach = ({ progress }) => {
  let tip =
    "Complete today's mission to stay consistent with your placement preparation.";

  if (progress?.dsa < 30) {
    tip =
      "Focus on solving at least 2 DSA problems today. Consistency matters more than speed.";
  } else if (progress?.mock < 30) {
    tip =
      "Take a mock test this week to improve your interview confidence.";
  } else if (progress?.resume < 50) {
    tip =
      "Update your resume with your latest projects and achievements.";
  } else {
    tip =
      "Great progress! Keep following your daily mission and stay interview-ready.";
  }

  return (
    <div
      style={{
        background: "#151528",
        borderRadius: "18px",
        padding: "28px",
        border: "1px solid #26263b",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <FaRobot size={28} color="#6366F1" />
        <h2 style={{ margin: 0 }}>AI Coach</h2>
      </div>

      <p
        style={{
          color: "#A1A1AA",
          fontSize: "16px",
          lineHeight: "1.8",
        }}
      >
        {tip}
      </p>

      <button
        style={{
          marginTop: "20px",
          background: "#6366F1",
          border: "none",
          color: "white",
          padding: "12px 22px",
          borderRadius: "10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: "600",
        }}
      >
        View Full Roadmap
        <FaArrowRight />
      </button>
    </div>
  );
};

export default AICoach;