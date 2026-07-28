const express = require("express");
const router = express.Router();

const { testAI } = require("../controllers/aiController");

router.get("/test", testAI);

module.exports = router;