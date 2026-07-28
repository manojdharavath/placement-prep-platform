const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const { protect }       = require("../middleware/authMiddleware");
const { analyzeResume } = require("../controllers/resumeController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    require("fs").mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".pdf", ".docx"
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
});

router.post("/analyze", protect, upload.single("resume"), analyzeResume);

module.exports = router;