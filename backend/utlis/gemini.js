const axios = require("axios");

/**
 * Generate AI explanation from text using Gemini API
 */
async function generateAIExplanation(text) {
  if (!text || text.trim() === "") return "";

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:predict",
      { instances: [{ content: text }] },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GOOGLE_GEMINI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.predictions[0].content;
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return text;
  }
}

module.exports = { generateAIExplanation };
