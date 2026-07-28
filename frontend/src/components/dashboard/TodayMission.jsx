import React from "react";

const TodayMission = ({ todayPlan = [] }) => {
  const totalMinutes = todayPlan.reduce((total, task) => {
    const minutes = parseInt(task.duration);
    return total + (isNaN(minutes) ? 0 : minutes);
  }, 0);

  return (
    <div
      style={{
        background: "#151528",
        borderRadius: "18px",
        padding: "28px",
        border: "1px solid #26263b",
        color: "white",
        marginBottom: "25px",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: "8px",
          fontSize: "26px",
        }}
      >
        🎯 Today's Mission
      </h2>

      <p
        style={{
          color: "#A1A1AA",
          marginBottom: "25px",
        }}
      >
        Complete today's tasks to stay on track.
      </p>

      {todayPlan.map((task, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px",
            borderRadius: "12px",
            background: "#20203A",
            marginBottom: "15px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                border: "2px solid #6366F1",
              }}
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                }}
              >
                {task.title}
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9CA3AF",
                  fontSize: "14px",
                }}
              >
                {task.category}
              </p>
            </div>
          </div>

          <span
            style={{
              color: "#818CF8",
              fontWeight: "600",
            }}
          >
            {task.duration}
          </span>
        </div>
      ))}

      <div
        style={{
          marginTop: "25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
            }}
          >
            Estimated Time
          </h3>

          <p
            style={{
              marginTop: "6px",
              color: "#9CA3AF",
            }}
          >
            {Math.floor(totalMinutes / 60)} hr {totalMinutes % 60} min
          </p>
        </div>

        <button
          style={{
            background: "#6366F1",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "14px 26px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          ▶ Start Mission
        </button>
      </div>
    </div>
  );
};

export default TodayMission;