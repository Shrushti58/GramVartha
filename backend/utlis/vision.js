const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
});

const analyzeImage = async (imageUrl) => {
  try {
    const [result] = await client.labelDetection(imageUrl);

    return result.labelAnnotations.map(label =>
      label.description.toLowerCase()
    );
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

module.exports = { analyzeImage };