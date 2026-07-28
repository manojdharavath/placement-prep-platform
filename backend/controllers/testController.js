const Question = require("../models/Question");
const Result = require("../models/Result");
const { askGroq } = require("../services/aiService");

// ==========================================
// GET AVAILABLE TOPICS
// ==========================================

// @route   GET /api/tests/topics
// @desc    Get all available test topics with question counts
// @access  Private
const getTopics = async (req, res) => {
  try {
    const topics = await Question.aggregate([
      {
        $group: {
          _id: {
            topic: "$topic",
            difficulty: "$difficulty",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.topic": 1,
        },
      },
    ]);

    res.status(200).json(topics);
  } catch (error) {
    console.error("Get Topics Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET DATABASE QUESTIONS
// ==========================================

// @route   GET /api/tests/questions
// @desc    Get random database questions
// @access  Private
const getQuestions = async (req, res) => {
  try {
    const { topic, difficulty } = req.query;

    if (!topic || !difficulty) {
      return res.status(400).json({
        message: "Topic and difficulty required",
      });
    }

    const questions = await Question.aggregate([
      {
        $match: {
          topic,
          difficulty,
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
      {
        $project: {
          correctAnswer: 0,
          explanation: 0,
        },
      },
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        message: "No questions found for this topic",
      });
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error("Get Questions Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GENERATE AI MOCK TEST
// ==========================================

// @route   POST /api/tests/ai-generate
// @desc    Generate 10 fresh MCQs using Groq
// @access  Private
const generateAITest = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({
        message: "Topic and difficulty are required",
      });
    }

    const allowedTopics = [
      "JavaScript",
      "Data Structures",
      "Algorithms",
      "System Design",
      "Database",
      "Operating Systems",
      "Computer Networks",
      "OOP Concepts",
    ];

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({
        message: "Invalid topic",
      });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        message: "Invalid difficulty",
      });
    }

const prompt = `
You are an expert technical interviewer creating a placement-focused mock test for engineering students.

Generate exactly 10 multiple-choice questions.

Topic: ${topic}
Difficulty: ${difficulty}

Difficulty Guidelines:

If difficulty is Easy:
- Focus on fundamental concepts and basic understanding.
- Questions should be clear and direct.
- Avoid unnecessarily tricky questions.

If difficulty is Medium:
- Focus on campus placement tests and technical interviews.
- Test conceptual understanding and practical application.
- Include scenario-based questions where appropriate.
- Avoid questions that are only simple definitions.

If difficulty is Hard:
- Focus on advanced technical interviews.
- Test deeper understanding, edge cases, problem solving, and tricky concepts.
- Questions should require reasoning rather than simple memorization.

Requirements:

1. Generate exactly 10 questions.
2. Every question must be strictly relevant to "${topic}".
3. Every question must match "${difficulty}" difficulty.
4. Every question must have exactly 4 options.
5. Exactly ONE option must be correct.
6. correctAnswer must be the zero-based index:
   0 = first option
   1 = second option
   2 = third option
   3 = fourth option
7. Provide a short and clear explanation for the correct answer.
8. Questions should be useful for technical placements, coding assessments, or technical interviews.
9. Do not generate duplicate or nearly identical questions.
10. Avoid ambiguous questions.
11. Avoid ambiguous answer choices.
12. Do not use "All of the above".
13. Do not use "None of the above".
14. Make incorrect options believable and technically plausible.
15. Do not make the correct option obviously longer or more detailed than the other options.
16. Verify that correctAnswer actually points to the correct option before returning the response.

Return ONLY a valid JSON array.

Do not include markdown.
Do not include triple backticks.
Do not include any text before or after the JSON.

Return exactly this structure:

[
  {
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0,
    "explanation": "Short explanation of why the answer is correct."
  }
]
`;

    // Ask Groq
    const aiResponse = await askGroq(prompt);

    let generatedQuestions;

    try {
      // Clean possible markdown fences just in case
      const cleanedResponse = aiResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      generatedQuestions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        "AI JSON Parse Error:",
        parseError.message
      );

      console.error("AI Response:", aiResponse);

      return res.status(500).json({
        message:
          "AI generated an invalid response. Please try again.",
      });
    }

    // Validate array
    if (!Array.isArray(generatedQuestions)) {
      return res.status(500).json({
        message: "AI response is not a question array",
      });
    }

    // Validate exactly 10 questions
    if (generatedQuestions.length !== 10) {
      return res.status(500).json({
        message:
          "AI did not generate exactly 10 questions. Please try again.",
      });
    }

    // Validate every question
    const validQuestions = generatedQuestions.every(
      (q) =>
        typeof q.question === "string" &&
        q.question.trim() !== "" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every(
          (option) => typeof option === "string"
        ) &&
        Number.isInteger(q.correctAnswer) &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        typeof q.explanation === "string"
    );

    if (!validQuestions) {
      return res.status(500).json({
        message:
          "AI generated questions in an invalid format. Please try again.",
      });
    }

    // Prepare questions for MongoDB
    const questionsToSave = generatedQuestions.map(
      (q) => ({
        topic,
        difficulty,
        question: q.question.trim(),
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })
    );

    // Save AI questions so existing submitTest can grade them
    const savedQuestions =
      await Question.insertMany(questionsToSave);

    // IMPORTANT:
    // Hide correct answers before sending test to frontend
    const questionsForFrontend = savedQuestions.map(
      (q) => ({
        _id: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
      })
    );

    res.status(201).json({
      success: true,
      source: "AI",
      topic,
      difficulty,
      totalQuestions: questionsForFrontend.length,
      questions: questionsForFrontend,
    });
  } catch (error) {
    console.error(
      "Generate AI Test Error:",
      error.message
    );

    res.status(500).json({
      message: "Failed to generate AI mock test",
    });
  }
};

// ==========================================
// SUBMIT TEST
// ==========================================

// @route   POST /api/tests/submit
// @desc    Submit answers and calculate result
// @access  Private
const submitTest = async (req, res) => {
  try {
    const {
      topic,
      difficulty,
      answers,
      timeTaken,
    } = req.body;

    if (
      !topic ||
      !difficulty ||
      !Array.isArray(answers) ||
      answers.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid test submission",
      });
    }

    const questionIds = answers.map(
      (answer) => answer.questionId
    );

    const questions = await Question.find({
      _id: {
        $in: questionIds,
      },
    });

    let correctAnswers = 0;

    const gradedAnswers = answers.map((answer) => {
      const question = questions.find(
        (q) =>
          q._id.toString() ===
          answer.questionId.toString()
      );

      const isCorrect =
        question &&
        question.correctAnswer ===
          answer.selectedAnswer;

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: Boolean(isCorrect),
      };
    });

    const score = Math.round(
      (correctAnswers / answers.length) * 100
    );

    const result = await Result.create({
      userId: req.user._id,
      topic,
      difficulty,
      totalQuestions: answers.length,
      correctAnswers,
      score,
      timeTaken,
      answers: gradedAnswers,
    });

    // Return answers/explanations AFTER submission
    const questionsWithAnswers = questions.map(
      (q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })
    );

    res.status(201).json({
      result,
      questions: questionsWithAnswers,
    });
  } catch (error) {
    console.error(
      "Submit Test Error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// GET TEST RESULTS
// ==========================================

// @route   GET /api/tests/results
// @desc    Get recent results for logged-in user
// @access  Private
const getResults = async (req, res) => {
  try {
    const results = await Result.find({
      userId: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(20);

    res.status(200).json(results);
  } catch (error) {
    console.error(
      "Get Results Error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getTopics,
  getQuestions,
  generateAITest,
  submitTest,
  getResults,
};