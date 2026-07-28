const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { startInterview, respondToAnswer } = require("../controllers/interviewController");

router.post("/start",   protect, startInterview);
router.post("/respond", protect, respondToAnswer);

module.exports = router;