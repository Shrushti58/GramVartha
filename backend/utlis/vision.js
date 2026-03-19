// utils/vision.js

const vision = require("@google-cloud/vision");

const client = new vision.ImageAnnotatorClient({
  keyFilename: "gramvartha-0d3028ac535a.json",
});

const analyzeImage = async (imageUrl) => {
  const [result] = await client.labelDetection(imageUrl);

  return result.labelAnnotations.map(label =>
    label.description.toLowerCase()
  );
};

module.exports = { analyzeImage };