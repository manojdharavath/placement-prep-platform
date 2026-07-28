const Groq = require("groq-sdk");
const InterviewResult = require("../models/InterviewResult");

// ==========================================
// START INTERVIEW
// ==========================================

// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const {
      role,
      company,
      companyType,
      difficulty,
    } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",

      messages: [
        {
          role: "user",

          content: `
You are a senior technical interviewer conducting a realistic campus placement interview.

Candidate Profile:
Role: ${role || "Software Developer"}
Target Company: ${company || "a top tech company"}
Company Category: ${companyType || "General"}
Difficulty: ${difficulty || "Medium"}

IMPORTANT INTERVIEW BEHAVIOR:

If Company Category is "Core":
- Treat this as a core engineering/company-specific interview.
- Prioritize technical questions relevant to the selected role and company.
- For semiconductor/electronics companies such as Qualcomm, NVIDIA, Intel, Texas Instruments, NXP, Analog Devices, Samsung Semiconductor, and Micron, focus on relevant areas such as:
  - C/C++
  - Computer Architecture
  - Operating Systems
  - Embedded Systems
  - Digital Electronics
  - Microprocessors/Microcontrollers
  - Computer Networks where relevant
  - Electronics/ECE fundamentals where relevant
  - Problem solving and DSA when appropriate
- Do NOT make the interview mainly HR or generic behavioral questions.

If Company Category is "Product":
- Focus strongly on DSA, algorithms, problem solving, CS fundamentals, projects, and software engineering.
- Include behavioral questions occasionally.

If Company Category is "Service":
- Focus on programming fundamentals, OOP, DBMS, SQL, Operating Systems, Computer Networks, projects, aptitude-style technical knowledge, and HR/behavioral questions.

If Company Category is "Custom":
- Infer the likely interview style from the company and selected role.
- If uncertain, conduct a balanced technical placement interview.

The interview must primarily match BOTH:
1. the selected company
2. the selected role

Generate the FIRST interview question.

Prefer starting with a meaningful technical or role-related question rather than a generic behavioral question, especially for Product and Core companies.

Return ONLY valid JSON:
{
  "question": "<opening interview question>",
  "type": "<Technical|HR|Behavioral>",
  "hint": "<short useful hint>"
}
`,
        },
      ],

      temperature: 0.7,
      max_tokens: 500,
    });

    const text =
      completion.choices[0]?.message?.content
        ?.replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    if (!text) {
      return res.status(500).json({
        message: "AI returned an empty response",
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Start Interview JSON Parse Error:",
        parseError.message
      );

      console.error("AI Response:", text);

      return res.status(500).json({
        message:
          "AI returned an invalid interview response. Please try again.",
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Start Interview Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to start interview",
    });
  }
};

// ==========================================
// RESPOND TO INTERVIEW ANSWER
// ==========================================

// @route   POST /api/interview/respond
// @access  Private
const respondToAnswer = async (req, res) => {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const {
      role,
      company,
      companyType,
      difficulty,
      history,
      userAnswer,
      questionNumber,
      totalQuestions,
    } = req.body;

    const isLastQuestion =
      questionNumber >= totalQuestions;

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",

            content: `
You are a senior technical interviewer conducting a realistic campus placement interview.

Target Company: ${company || "a top tech company"}
Company Category: ${companyType || "General"}
Target Role: ${role || "Software Developer"}
Difficulty: ${difficulty || "Medium"}

INTERVIEW RULES:

The interview must be personalized using BOTH the target company and the selected role.

For Core companies:
- Prioritize role-specific technical and core engineering questions.
- For semiconductor and electronics companies such as Qualcomm, NVIDIA, Intel, Texas Instruments, NXP, Analog Devices, Samsung Semiconductor, and Micron, focus on topics relevant to the selected role.
- Relevant areas may include C/C++, Embedded Systems, Computer Architecture, Operating Systems, Digital Electronics, Microprocessors, Microcontrollers, communication protocols, ECE fundamentals, DSA, and problem solving.
- Do not ask only electronics questions if the selected role is software-oriented.
- Do not make the interview mainly HR or behavioral.

For Product companies:
- Prioritize DSA, algorithms, problem solving, CS fundamentals, software engineering, projects, and role-specific technical knowledge.
- Behavioral questions may be included occasionally.

For Service companies:
- Focus on programming fundamentals, OOP, DBMS, SQL, Operating Systems, Computer Networks, projects, basic DSA, and some HR/behavioral questions.

For Custom companies:
- Infer the company's likely interview style from the company name and selected role.
- Generate questions relevant to both the company and role.

QUESTION SELECTION RULES:

- The majority of questions must be Technical.
- Do not ask multiple generic behavioral questions consecutively.
- Questions should become appropriate to the selected difficulty.
- Avoid repeating questions already asked.
- Use the interview history to decide the next question.
- Keep the interview realistic for a fresher/campus placement candidate.

Interview history so far:

${
  history && history.length > 0
    ? history
        .map(
          (h, i) =>
            `Q${i + 1}: ${h.question}
Answer: ${h.answer}`
        )
        .join("\n\n")
    : "No previous questions."
}

The candidate just answered Question ${questionNumber}:

"${userAnswer}"

${
  isLastQuestion
    ? `
This was the LAST question.

Evaluate the candidate's latest answer and the entire interview.

The final evaluation should consider:
- Technical knowledge
- Accuracy
- Problem-solving ability
- Communication
- Role suitability
- Company suitability

Return ONLY valid JSON with no extra text.

{
  "feedback": "<specific constructive feedback on the last answer>",
  "score": <score from 0 to 10>,
  "isComplete": true,
  "finalReport": {
    "overallScore": <score from 0 to 100>,
    "grade": "<A+|A|B+|B|C|D>",
    "summary": "<2-3 sentence overall assessment>",
    "strengths": [
      "<strength 1>",
      "<strength 2>",
      "<strength 3>"
    ],
    "improvements": [
      "<improvement 1>",
      "<improvement 2>",
      "<improvement 3>"
    ],
    "recommendation": "<Strongly Recommend|Recommend|Maybe|Not Recommend>",
    "nextSteps": [
      "<next step 1>",
      "<next step 2>",
      "<next step 3>"
    ]
  }
}
`
    : `
First evaluate the candidate's latest answer.

Then ask the NEXT interview question.

The next question MUST:
- Match the target company
- Match the company category
- Match the selected role
- Match the selected difficulty
- Avoid repeating previous questions
- Prefer technical questions
- Follow naturally from the interview when appropriate

Return ONLY valid JSON with no extra text.

{
  "feedback": "<brief and specific feedback on the candidate's answer>",
  "score": <score from 0 to 10>,
  "isComplete": false,
  "nextQuestion": {
    "question": "<next interview question>",
    "type": "<Technical|HR|Behavioral>",
    "hint": "<short subtle hint>"
  }
}
`
}
`,
          },
        ],

        temperature: 0.7,
        max_tokens: 1200,
      });

    const text =
      completion.choices[0]?.message?.content
        ?.replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    if (!text) {
      return res.status(500).json({
        message: "AI returned an empty response",
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(
        "Interview JSON Parse Error:",
        parseError.message
      );

      console.error("AI Response:", text);

      return res.status(500).json({
        message:
          "AI returned an invalid interview response. Please try again.",
      });
    }

    // ==========================================
    // SAVE COMPLETED INTERVIEW RESULT
    // ==========================================

    if (
      isLastQuestion &&
      data.isComplete === true &&
      data.finalReport
    ) {
      try {
        const overallScore = Math.max(
          0,
          Math.min(
            100,
            Number(data.finalReport.overallScore) || 0
          )
        );

        await InterviewResult.create({
          userId: req.user._id,

          company:
            company?.trim() ||
            "General Company",

          companyType: [
            "Product",
            "Service",
            "Core",
            "Custom",
            "General",
          ].includes(companyType)
            ? companyType
            : "General",

          role:
            role?.trim() ||
            "Software Developer",

          difficulty: [
            "Easy",
            "Medium",
            "Hard",
          ].includes(difficulty)
            ? difficulty
            : "Medium",

          totalQuestions:
            Number(totalQuestions) || 1,

          overallScore,

          grade:
            data.finalReport.grade || "",

          recommendation:
            data.finalReport.recommendation || "",

          strengths: Array.isArray(
            data.finalReport.strengths
          )
            ? data.finalReport.strengths
            : [],

          improvements: Array.isArray(
            data.finalReport.improvements
          )
            ? data.finalReport.improvements
            : [],
        });

        console.log(
          `Interview result saved for user ${req.user._id}`
        );
      } catch (saveError) {
        /*
          IMPORTANT:
          Don't fail the completed interview just because
          saving dashboard statistics failed.
        */
        console.error(
          "Save Interview Result Error:",
          saveError.message
        );
      }
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(
      "Interview Response Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to process answer",
    });
  }
};

module.exports = {
  startInterview,
  respondToAnswer,
};