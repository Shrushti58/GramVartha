const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

const analyzeImage = async (imageUrl) => {
  try {
    console.log("Using Vision Project:", process.env.GOOGLE_CLOUD_PROJECT);

    const [result] = await client.labelDetection(imageUrl);

    return result.labelAnnotations.map((label) =>
      label.description.toLowerCase()
    );
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

module.exports = { analyzeImage };