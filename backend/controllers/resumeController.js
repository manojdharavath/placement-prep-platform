const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const { askGroq } = require("../services/aiService");

/* =========================================================
   PDF TEXT EXTRACTION
========================================================= */

const extractPDFText = async (filePath) => {
  let parser = null;

  try {
    const buffer = fs.readFileSync(filePath);

    console.log("PDF file size:", buffer.length, "bytes");

    const pdfModule = require("pdf-parse");

    let text = "";

    /*
      -------------------------------------------------------
      OLD pdf-parse API
      -------------------------------------------------------
      Example:
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
    */

    if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      text = data?.text || "";
    }

    /*
      -------------------------------------------------------
      SOME COMMONJS BUILDS
      -------------------------------------------------------
    */

    else if (typeof pdfModule?.default === "function") {
      const data = await pdfModule.default(buffer);
      text = data?.text || "";
    }

    /*
      -------------------------------------------------------
      NEW pdf-parse API
      -------------------------------------------------------
      Example:
      const { PDFParse } = require("pdf-parse");
    */

    else if (pdfModule?.PDFParse) {
      parser = new pdfModule.PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      text =
        result?.text ||
        result?.pages
          ?.map((page) => page?.text || "")
          .join("\n") ||
        "";
    } else {
      throw new Error(
        "Unsupported pdf-parse API. Check installed pdf-parse version."
      );
    }

    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch {}
    }

    const cleanedText = cleanExtractedText(text);

    console.log(
      "PDF extracted characters:",
      cleanedText.length
    );

    console.log(
      "PDF preview:",
      cleanedText.slice(0, 500)
    );

    return cleanedText;
  } catch (error) {
    console.error(
      "PDF Extraction Error:",
      error.message
    );

    console.error(error);

    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch {}
    }

    return "";
  }
};

/* =========================================================
   CLEAN EXTRACTED TEXT
========================================================= */

const cleanExtractedText = (text = "") => {
  if (!text) return "";

  return text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/* =========================================================
   EXTRACT DOCX TEXT
========================================================= */

const extractDOCXText = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    const text = cleanExtractedText(
      result?.value || ""
    );

    console.log(
      "DOCX extracted characters:",
      text.length
    );

    console.log(
      "DOCX preview:",
      text.slice(0, 500)
    );

    return text;
  } catch (error) {
    console.error(
      "DOCX Extraction Error:",
      error.message
    );

    return "";
  }
};

/* =========================================================
   EXTRACT RESUME TEXT
========================================================= */

const extractText = async (
  filePath,
  mimeType,
  originalName
) => {
  const ext = path
    .extname(originalName)
    .toLowerCase();

  console.log("-----------------------------------");
  console.log("Resume extraction started");
  console.log("File:", originalName);
  console.log("Extension:", ext);
  console.log("MIME:", mimeType);
  console.log("-----------------------------------");

  if (ext === ".pdf") {
    return await extractPDFText(filePath);
  }

  if (ext === ".docx") {
    return await extractDOCXText(filePath);
  }

  /*
    Mammoth officially works with DOCX.
    Old binary .doc files are not reliably supported.
  */

  if (ext === ".doc") {
    console.warn(
      "Legacy .doc format detected. DOCX is recommended."
    );

    return "";
  }

  console.error(
    "Unsupported resume extension:",
    ext
  );

  return "";
};

/* =========================================================
   CHECK WHETHER TEXT IS ACTUALLY USABLE
========================================================= */

const isResumeTextUsable = (text) => {
  if (!text) return false;

  const normalized = text.trim();

  /*
    Don't classify a PDF as scanned just because one
    extraction attempt produced slightly less than 100 chars.
  */

  if (normalized.length < 40) {
    return false;
  }

  /*
    Make sure the extraction contains actual letters.
  */

  const letters =
    normalized.match(/[a-zA-Z]/g) || [];

  if (letters.length < 20) {
    return false;
  }

  return true;
};

/* =========================================================
   CLEAN / PARSE AI JSON
========================================================= */

const parseAIResponse = (response) => {
  if (!response) {
    throw new Error(
      "AI returned an empty response"
    );
  }

  let cleaned = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  /*
    If Groq accidentally adds text around the JSON,
    attempt to isolate the JSON object.
  */

  const firstBrace =
    cleaned.indexOf("{");

  const lastBrace =
    cleaned.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    cleaned = cleaned.slice(
      firstBrace,
      lastBrace + 1
    );
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Resume AI JSON Parse Error:",
      error.message
    );

    console.error(
      "Raw AI Response:",
      response
    );

    throw new Error(
      "Groq returned invalid JSON"
    );
  }
};

/* =========================================================
   GENERAL ATS PROMPT
========================================================= */

const createGeneralPrompt = (resumeText) => {
  return `
You are an expert technical recruiter, ATS resume analyzer, and career coach for engineering students and fresh graduates.

Analyze the resume content below carefully.

RESUME CONTENT:
"""
${resumeText}
"""

Evaluate this resume for general technical placement and internship applications.

IMPORTANT RULES:

1. Base your analysis ONLY on information actually present in the resume.
2. Do not invent experience, projects, achievements, education, certifications, or skills.
3. Do not randomly generate scores.
4. Evaluate ATS readability and content quality separately from candidate ability.
5. Do not penalize a student simply because they do not have full-time professional experience.
6. Internships, projects, coding profiles, certifications, achievements, technical skills and education should be appropriately considered.
7. Strengths must reference real resume content.
8. Weaknesses must be specific to this resume.
9. Missing keywords should be realistic and useful.
10. Do not recommend adding a skill unless the candidate genuinely knows it.
11. Suggestions must be specific and actionable.
12. Consider whether bullet points show measurable impact.
13. Consider whether projects explain technologies, implementation and outcomes.
14. Consider whether the resume is appropriate for technical placements.

Evaluate:

- ATS readability
- Resume structure
- Technical skills
- Projects
- Internship / experience
- Education
- Achievements
- Certifications
- Coding/problem-solving evidence
- Bullet-point quality
- Quantification
- Technical keywords
- Professional presentation
- Role clarity

ATS SCORE GUIDELINE:

90-100 = Exceptional and highly polished
80-89 = Very strong
70-79 = Good with meaningful room for improvement
60-69 = Average
40-59 = Weak
0-39 = Major problems

Do not inflate the score.

Return ONLY valid JSON.

Do not include markdown.
Do not include triple backticks.
Do not include commentary outside the JSON.

Use exactly this structure:

{
  "analysisType": "general",

  "atsScore": <number 0-100>,

  "overallFeedback": "<2-3 sentence honest assessment>",

  "strengths": [
    "<specific resume-based strength 1>",
    "<specific resume-based strength 2>",
    "<specific resume-based strength 3>"
  ],

  "weaknesses": [
    "<specific weakness 1>",
    "<specific weakness 2>",
    "<specific weakness 3>"
  ],

  "missingKeywords": [
    "<keyword 1>",
    "<keyword 2>",
    "<keyword 3>",
    "<keyword 4>",
    "<keyword 5>"
  ],

  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>",
    "<actionable suggestion 4>"
  ],

  "sections": {
    "summary": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },

    "skills": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },

    "experience": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },

    "education": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },

    "projects": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    }
  },

  "topJobMatches": [
    "<realistic role 1>",
    "<realistic role 2>",
    "<realistic role 3>"
  ]
}
`;
};

/* =========================================================
   TARGET JOB PROMPT
========================================================= */

const createTargetJobPrompt = (
  resumeText,
  targetRole,
  jobDescription
) => {
  return `
You are an expert technical recruiter, ATS resume analyzer, and placement coach.

Evaluate the candidate's resume specifically for the following job.

TARGET ROLE:
${targetRole}

JOB DESCRIPTION:
"""
${jobDescription}
"""

CANDIDATE RESUME:
"""
${resumeText}
"""

Compare the resume directly against the target role and job description.

IMPORTANT RULES:

1. Use ONLY evidence present in the candidate's resume.
2. Do not assume the candidate knows a technology unless the resume supports it.
3. Identify important requirements from the job description.
4. Compare those requirements against the resume.
5. Distinguish ATS resume quality from job compatibility.
6. Do not automatically make atsScore and jobMatchScore identical.
7. matchedSkills must contain skills or qualifications clearly supported by the resume.
8. missingSkills must contain important job requirements not clearly supported by the resume.
9. Missing keywords should primarily come from relevant terminology in the job description.
10. Suggestions must help tailor THIS resume for THIS role.
11. Do not advise the candidate to falsely claim skills or experience.
12. Projects should count as evidence when they genuinely demonstrate a required skill.
13. Internship experience should count as experience for a student/fresher.
14. Consider education requirements where relevant.
15. Be realistic rather than overly generous.

ATS SCORE:
Evaluate general ATS/readability/content quality.

JOB MATCH SCORE:
Evaluate how closely the candidate's actual resume matches the provided job.

JOB MATCH GUIDE:

90-100 = Exceptional match
80-89 = Strong match
70-79 = Good match
60-69 = Moderate match
40-59 = Weak match
0-39 = Poor match

Return ONLY valid JSON.

No markdown.
No triple backticks.
No text outside JSON.

Use exactly this structure:

{
  "analysisType": "targeted",

  "atsScore": <number 0-100>,

  "jobMatchScore": <number 0-100>,

  "targetRole": "${targetRole}",

  "overallFeedback": "<2-3 sentence role-specific assessment>",

  "strengths": [
    "<relevant strength 1>",
    "<relevant strength 2>",
    "<relevant strength 3>"
  ],

  "weaknesses": [
    "<role-specific weakness 1>",
    "<role-specific weakness 2>",
    "<role-specific weakness 3>"
  ],

  "matchedSkills": [
    "<matched requirement/skill 1>",
    "<matched requirement/skill 2>",
    "<matched requirement/skill 3>"
  ],

  "missingSkills": [
    "<important missing skill 1>",
    "<important missing skill 2>",
    "<important missing skill 3>"
  ],

  "missingKeywords": [
    "<keyword 1>",
    "<keyword 2>",
    "<keyword 3>",
    "<keyword 4>",
    "<keyword 5>"
  ],

  "suggestions": [
    "<role-specific suggestion 1>",
    "<role-specific suggestion 2>",
    "<role-specific suggestion 3>",
    "<role-specific suggestion 4>"
  ],

  "sections": {
    "summary": {
      "score": <number 0-100>,
      "feedback": "<feedback>"
    },

    "skills": {
      "score": <number 0-100>,
      "feedback": "<feedback>"
    },

    "experience": {
      "score": <number 0-100>,
      "feedback": "<feedback>"
    },

    "education": {
      "score": <number 0-100>,
      "feedback": "<feedback>"
    },

    "projects": {
      "score": <number 0-100>,
      "feedback": "<feedback>"
    }
  },

  "topJobMatches": [
    "<realistic job role 1>",
    "<realistic job role 2>",
    "<realistic job role 3>"
  ]
}
`;
};

/* =========================================================
   UNREADABLE RESUME RESPONSE
========================================================= */

const createUnreadableResumeResponse = (
  analysisType,
  targetRole = ""
) => {
  const base = {
    analysisType,

    atsScore: 0,

    overallFeedback:
      "Resume text extraction failed, so the resume could not be analyzed reliably. This may be caused by the PDF parser, an image-based document, an encrypted PDF, or an unsupported file format.",

    strengths: [],

    weaknesses: [
      "Resume content could not be extracted for analysis",
    ],

    missingKeywords: [],

    suggestions: [
      "Try uploading a text-based PDF or DOCX file",
      "If the PDF contains selectable text but still fails, check the backend PDF extraction logs",
      "Avoid password-protected or encrypted PDF files",
      "For legacy DOC files, save the document as DOCX before uploading",
    ],

    sections: {
      summary: {
        score: 0,
        feedback:
          "Not evaluated because resume extraction failed.",
      },

      skills: {
        score: 0,
        feedback:
          "Not evaluated because resume extraction failed.",
      },

      experience: {
        score: 0,
        feedback:
          "Not evaluated because resume extraction failed.",
      },

      education: {
        score: 0,
        feedback:
          "Not evaluated because resume extraction failed.",
      },

      projects: {
        score: 0,
        feedback:
          "Not evaluated because resume extraction failed.",
      },
    },

    topJobMatches: [],
  };

  if (analysisType === "targeted") {
    return {
      ...base,
      jobMatchScore: 0,
      targetRole,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  return base;
};

/* =========================================================
   VALIDATE / NORMALIZE AI RESULT
========================================================= */

const normalizeScore = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(
    Math.max(0, Math.min(100, number))
  );
};

const normalizeAnalysis = (
  analysis,
  analysisType,
  targetRole
) => {
  const normalized = {
    ...analysis,

    analysisType,

    atsScore: normalizeScore(
      analysis?.atsScore
    ),

    strengths: Array.isArray(
      analysis?.strengths
    )
      ? analysis.strengths
      : [],

    weaknesses: Array.isArray(
      analysis?.weaknesses
    )
      ? analysis.weaknesses
      : [],

    missingKeywords: Array.isArray(
      analysis?.missingKeywords
    )
      ? analysis.missingKeywords
      : [],

    suggestions: Array.isArray(
      analysis?.suggestions
    )
      ? analysis.suggestions
      : [],

    topJobMatches: Array.isArray(
      analysis?.topJobMatches
    )
      ? analysis.topJobMatches
      : [],

    sections:
      analysis?.sections &&
      typeof analysis.sections === "object"
        ? analysis.sections
        : {},
  };

  /*
    Normalize section scores
  */

  Object.keys(
    normalized.sections
  ).forEach((key) => {
    normalized.sections[key] = {
      ...normalized.sections[key],

      score: normalizeScore(
        normalized.sections[key]?.score
      ),
    };
  });

  if (analysisType === "targeted") {
    normalized.targetRole =
      targetRole;

    normalized.jobMatchScore =
      normalizeScore(
        analysis?.jobMatchScore
      );

    normalized.matchedSkills =
      Array.isArray(
        analysis?.matchedSkills
      )
        ? analysis.matchedSkills
        : [];

    normalized.missingSkills =
      Array.isArray(
        analysis?.missingSkills
      )
        ? analysis.missingSkills
        : [];
  }

  return normalized;
};

/* =========================================================
   ANALYZE RESUME
========================================================= */

// @route   POST /api/resume/analyze
// @access  Private

const analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    /* =====================================================
       FILE VALIDATION
    ===================================================== */

    if (!req.file) {
      return res.status(400).json({
        message:
          "No resume file uploaded",
      });
    }

    filePath = req.file.path;

    console.log("\n===================================");
    console.log("NEW RESUME ANALYSIS");
    console.log("===================================");
    console.log(
      "Original file:",
      req.file.originalname
    );
    console.log(
      "Stored file:",
      req.file.path
    );
    console.log(
      "MIME:",
      req.file.mimetype
    );
    console.log(
      "Size:",
      req.file.size,
      "bytes"
    );

    /* =====================================================
       ANALYSIS OPTIONS
    ===================================================== */

    const {
      analysisType = "general",
      targetRole = "",
      jobDescription = "",
    } = req.body;

    if (
      !["general", "targeted"].includes(
        analysisType
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid analysis type",
      });
    }

    const cleanedTargetRole =
      targetRole.trim();

    const cleanedJobDescription =
      jobDescription.trim();

    if (
      analysisType === "targeted" &&
      !cleanedTargetRole
    ) {
      return res.status(400).json({
        message:
          "Target role is required for targeted analysis",
      });
    }

    if (
      analysisType === "targeted" &&
      !cleanedJobDescription
    ) {
      return res.status(400).json({
        message:
          "Job description is required for targeted analysis",
      });
    }

    /* =====================================================
       EXTRACT TEXT
    ===================================================== */

    const resumeText =
      await extractText(
        filePath,
        req.file.mimetype,
        req.file.originalname
      );

    console.log("-----------------------------------");
    console.log(
      "FINAL EXTRACTED LENGTH:",
      resumeText.length
    );

    console.log(
      "TEXT USABLE:",
      isResumeTextUsable(resumeText)
    );

    console.log(
      "FINAL TEXT PREVIEW:"
    );

    console.log(
      resumeText.slice(0, 1000)
    );

    console.log("-----------------------------------");

    /* =====================================================
       DELETE TEMP FILE
    ===================================================== */

    try {
      if (
        filePath &&
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }

      filePath = null;
    } catch (error) {
      console.error(
        "Temporary File Delete Error:",
        error.message
      );
    }

    /* =====================================================
       EXTRACTION FAILURE
    ===================================================== */

    if (
      !isResumeTextUsable(
        resumeText
      )
    ) {
      console.error(
        "Resume extraction failed or produced unusable text."
      );

      return res
        .status(422)
        .json(
          createUnreadableResumeResponse(
            analysisType,
            cleanedTargetRole
          )
        );
    }

    /* =====================================================
       LIMIT INPUT SIZE
    ===================================================== */

    const safeResumeText =
      resumeText.slice(0, 15000);

    const safeJobDescription =
      cleanedJobDescription.slice(
        0,
        10000
      );

    console.log(
      "Text sent to Groq:",
      safeResumeText.length,
      "characters"
    );

    /* =====================================================
       CREATE PROMPT
    ===================================================== */

    let prompt;

    if (
      analysisType === "targeted"
    ) {
      prompt =
        createTargetJobPrompt(
          safeResumeText,
          cleanedTargetRole,
          safeJobDescription
        );
    } else {
      prompt =
        createGeneralPrompt(
          safeResumeText
        );
    }

    /* =====================================================
       CALL GROQ
    ===================================================== */

    console.log(
      `Starting ${analysisType} Groq resume analysis...`
    );

    const aiResponse =
      await askGroq(prompt);

    console.log(
      "Groq response received."
    );

    /* =====================================================
       PARSE RESPONSE
    ===================================================== */

    const parsedAnalysis =
      parseAIResponse(
        aiResponse
      );

    /* =====================================================
       NORMALIZE RESPONSE
    ===================================================== */

    const analysis =
      normalizeAnalysis(
        parsedAnalysis,
        analysisType,
        cleanedTargetRole
      );

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "Resume analysis completed successfully."
    );

    console.log(
      "ATS Score:",
      analysis.atsScore
    );

    if (
      analysisType === "targeted"
    ) {
      console.log(
        "Job Match Score:",
        analysis.jobMatchScore
      );
    }

    console.log("===================================\n");

    return res.status(200).json({
      ...analysis,

      fileName:
        req.file.originalname,

      extractedCharacters:
        resumeText.length,
    });
  } catch (error) {
    console.error(
      "==================================="
    );

    console.error(
      "Resume Analysis Error:"
    );

    console.error(
      error.message
    );

    console.error(error);

    console.error(
      "==================================="
    );

    /*
      Delete temporary file if an
      error happened before cleanup.
    */

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    return res.status(500).json({
      message:
        "Resume analysis failed. Please try again.",
    });
  }
};

module.exports = {
  analyzeResume,
};