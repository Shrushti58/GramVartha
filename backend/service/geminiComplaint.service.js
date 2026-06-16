const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function cleanJson(text) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

const verifyComplaintWithGemini = async ({
  title,
  description,
  type,
  labels,
}) => {
  const prompt = `
You are an AI complaint verifier for GramVartha, a Gram Panchayat civic issue platform.

Complaint can be in English, Marathi, Hinglish, or mixed language.

Complaint Type: ${type}
Title: ${title}
Description: ${description}

Google Vision Labels:
${labels?.join(", ") || "No labels"}

Valid civic complaints:
road damage, potholes, garbage, drainage, water leakage, streetlight, public health, sanitation, electricity, public property damage, village infrastructure.

Invalid complaints:
selfie, meme, personal fight, political promotion, advertisement, abusive content, unrelated photo, fake complaint.

Return ONLY valid JSON:
{
  "isValidIssue": true,
  "confidence": 0.0,
  "category": "road|water|garbage|streetlight|drainage|health|electricity|sanitation|infrastructure|other",
  "fraudScore": 0.0,
  "language": "english|marathi|hinglish|mixed|unknown",
  "englishRemarks": "short reason in English",
  "marathiRemarks": "short reason in Marathi",
  "priority": "low|medium|high|urgent"
}
`;

  const response = await ai.models.generateContent({
model: "gemini-2.0-flash",
    contents: prompt,
  });

  return JSON.parse(cleanJson(response.text));
};

module.exports = { verifyComplaintWithGemini };