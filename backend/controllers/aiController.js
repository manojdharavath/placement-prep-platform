const { askGroq } = require("../services/aiService");

const testAI = async (req, res) => {
  try {
    const response = await askGroq(
      "Reply with exactly: Groq AI is connected successfully"
    );

    res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI Test Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to connect to Groq AI",
    });
  }
};

module.exports = {
  testAI,
};