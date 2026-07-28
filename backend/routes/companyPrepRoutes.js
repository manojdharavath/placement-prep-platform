const express = require("express");
const router = express.Router();

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  generateCompanyPrep,
} = require("../controllers/companyPrepController");

// POST /api/company-prep/generate
router.post(
  "/generate",
  protect,
  generateCompanyPrep
);

module.exports = router;