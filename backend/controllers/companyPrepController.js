const { askGroq } = require("../services/aiService");

// ==========================================
// GENERATE COMPANY PREPARATION PLAN
// ==========================================

// @route   POST /api/company-prep/generate
// @desc    Generate AI-based company preparation plan
// @access  Private

const generateCompanyPrep = async (req, res) => {
  try {
    const {
      company,
      companyType,
      role,
      preparationDays,
    } = req.body;

    // ======================================
    // VALIDATION
    // ======================================

    if (!company || !company.trim()) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    if (!companyType) {
      return res.status(400).json({
        message: "Company type is required",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        message: "Target role is required",
      });
    }

    const allowedCompanyTypes = [
      "Product",
      "Service",
      "Core",
      "Custom",
    ];

    if (
      !allowedCompanyTypes.includes(companyType)
    ) {
      return res.status(400).json({
        message: "Invalid company type",
      });
    }

    const days =
      Number(preparationDays) || 30;

    if (days < 7 || days > 90) {
      return res.status(400).json({
        message:
          "Preparation duration must be between 7 and 90 days",
      });
    }

    // ======================================
    // CREATE AI PROMPT
    // ======================================

    const prompt = `
You are an expert placement mentor helping engineering students prepare for technical company hiring processes.

Create a practical preparation plan for:

Company: ${company.trim()}
Company Category: ${companyType}
Target Role: ${role.trim()}
Preparation Time: ${days} days

The candidate is an engineering student/fresher preparing for placements.

IMPORTANT:

The plan must be tailored to the company category and target role.

COMPANY CATEGORY GUIDANCE:

For PRODUCT companies:
Prioritize DSA, algorithms, problem solving, CS fundamentals, projects, system design basics when appropriate, coding rounds, and technical interviews.

For SERVICE companies:
Prioritize programming fundamentals, aptitude where appropriate, OOP, DBMS, SQL, operating systems, computer networks, projects, communication, and HR/behavioral preparation.

For CORE companies:
Prioritize role-specific engineering knowledge.

For semiconductor, electronics, embedded, and ECE-related companies/roles, consider topics such as:
- C/C++
- Embedded systems
- Digital electronics
- Computer architecture
- Microprocessors
- Microcontrollers
- Operating systems
- Computer networks where relevant
- Electronics/ECE fundamentals
- Verilog/HDL where relevant
- Communication systems where relevant
- Role-specific engineering concepts

Do NOT include every core topic blindly.
Choose topics based on the actual company and role.

For CUSTOM companies:
Infer the most appropriate preparation pattern from the company name and target role.

IMPORTANT ACCURACY RULES:

1. Do not claim that a specific hiring round is guaranteed.
2. Hiring processes can vary by role, location, campus, and year.
3. Describe interview rounds as likely or commonly expected when uncertain.
4. Do not invent exact salary/package information.
5. Do not invent company-specific facts if uncertain.
6. Keep the plan practical for a student.
7. Prioritize important topics instead of giving an enormous syllabus.
8. Make the roadmap achievable within ${days} days.
9. Avoid repetitive advice.
10. The majority of preparation should be relevant to ${role.trim()}.
11. Include both technical preparation and interview readiness.
12. For each important topic, explain briefly why it matters.
13. Roadmap day ranges must logically fit within ${days} days.
14. Return ONLY valid JSON.
15. Do not include markdown or triple backticks.

Return exactly this JSON structure:

{
  "company": "${company.trim()}",
  "companyType": "${companyType}",
  "role": "${role.trim()}",
  "preparationDays": ${days},

  "overview": "<2-3 sentence preparation overview>",

  "difficulty": "<Easy|Medium|Hard|Very Hard>",

  "focusAreas": [
    "<major focus area 1>",
    "<major focus area 2>",
    "<major focus area 3>",
    "<major focus area 4>"
  ],

  "likelyRounds": [
    {
      "round": "<round name>",
      "description": "<short description>",
      "priority": "<High|Medium|Low>"
    }
  ],

  "importantTopics": [
    {
      "topic": "<topic name>",
      "priority": "<High|Medium|Low>",
      "reason": "<why this topic matters for this company and role>"
    }
  ],

  "roadmap": [
    {
      "period": "<example: Days 1-5>",
      "title": "<preparation phase>",
      "tasks": [
        "<specific task 1>",
        "<specific task 2>",
        "<specific task 3>"
      ]
    }
  ],

  "practiceStrategy": {
    "dsa": "<specific DSA preparation advice>",
    "coreSubjects": "<specific CS/core preparation advice>",
    "projects": "<how to prepare projects>",
    "aptitude": "<aptitude advice or Not a major focus>",
    "interview": "<interview preparation advice>"
  },

  "interviewTips": [
    "<specific tip 1>",
    "<specific tip 2>",
    "<specific tip 3>",
    "<specific tip 4>"
  ],

  "finalChecklist": [
    "<checklist item 1>",
    "<checklist item 2>",
    "<checklist item 3>",
    "<checklist item 4>",
    "<checklist item 5>"
  ],

  "recommendedMockTest": {
    "topic": "<best mock-test topic>",
    "difficulty": "<Easy|Medium|Hard>"
  },

  "recommendedInterview": {
    "company": "${company.trim()}",
    "companyType": "${companyType}",
    "role": "${role.trim()}",
    "difficulty": "<Easy|Medium|Hard>"
  }
}
`;

    // ======================================
    // ASK GROQ
    // ======================================

    console.log(
      `Generating Company Prep: ${company} | ${role}`
    );

    const aiResponse = await askGroq(prompt);

    // ======================================
    // CLEAN RESPONSE
    // ======================================

    const cleanedResponse = aiResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let plan;

    try {
      plan = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "Company Prep JSON Parse Error:",
        error.message
      );

      console.error(
        "AI Response:",
        aiResponse
      );

      return res.status(500).json({
        message:
          "AI generated an invalid preparation plan. Please try again.",
      });
    }

    // ======================================
    // BASIC RESPONSE VALIDATION
    // ======================================

    if (
      !plan ||
      typeof plan !== "object" ||
      Array.isArray(plan)
    ) {
      return res.status(500).json({
        message:
          "AI generated an invalid preparation plan.",
      });
    }

    if (
      !Array.isArray(plan.importantTopics) ||
      !Array.isArray(plan.roadmap) ||
      !Array.isArray(plan.interviewTips)
    ) {
      return res.status(500).json({
        message:
          "AI preparation plan is incomplete. Please try again.",
      });
    }

    // ======================================
    // SUCCESS
    // ======================================

    return res.status(200).json({
      success: true,
      source: "AI",
      plan,
    });
  } catch (error) {
    console.error(
      "Generate Company Prep Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to generate company preparation plan",
    });
  }
};

module.exports = {
  generateCompanyPrep,
};