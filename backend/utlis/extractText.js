const axios = require("axios");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

/**
 * Extract text from a file URL (PDF or image)
 * @param {string} fileUrl - Cloudinary file URL
 * @param {string} mimetype - MIME type of the file
 */
async function extractText(fileUrl, mimetype) {
  try {
    if (mimetype === "application/pdf") {
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
      const pdfData = await pdfParse(response.data);
      return pdfData.text;
    } else {
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
      const { data } = await Tesseract.recognize(response.data, "eng+hin+mar");
      return data.text;
    }
  } catch (err) {
    console.error("Error extracting text:", err);
    return "";
  }
}

module.exports = { extractText };
