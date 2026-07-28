// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================

const dotenv = require("dotenv");
dotenv.config();

// IMPORTANT:
// Nothing that uses GROQ_API_KEY should be imported
// before dotenv.config()

// ==========================================
// PACKAGES
// ==========================================

const express = require("express");
const cors = require("cors");

// ==========================================
// DATABASE
// ==========================================

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const progressRoutes = require("./routes/progressRoutes");
const testRoutes = require("./routes/testRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const userRoutes = require("./routes/userRoutes");
const aiDashboardRoutes = require("./routes/aiDashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Company Prep
const companyPrepRoutes = require("./routes/companyPrepRoutes");

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/problems", problemRoutes);

app.use("/api/dsa", progressRoutes);

app.use("/api/tests", testRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/resume", resumeRoutes);

app.use("/api/interview", interviewRoutes);

app.use("/api/ai-dashboard", aiDashboardRoutes);

app.use("/api/user", userRoutes);

app.use("/api/ai", aiRoutes);

// Company Prep
app.use("/api/company-prep", companyPrepRoutes);

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello Manoj, Backend Connected Successfully 🚀",
  });
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});