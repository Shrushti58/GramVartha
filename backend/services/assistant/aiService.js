const { GoogleGenAI } = require("@google/genai");

const cleanJson = (text = "") =>
  text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const summarizeWithAI = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
  });

  const parsed = JSON.parse(cleanJson(response.text));

  return {
    answer: parsed.answer || "Information not available in GramVartha records.",
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  };
};

module.exports = {
  summarizeWithAI,
};
