const vision = require("@google-cloud/vision");
const fs = require("fs");
const path = require("path");

function resolveCredentialPath(credentialPath) {
  if (!credentialPath) return null;
  if (path.isAbsolute(credentialPath)) return credentialPath;

  const candidates = [
    path.resolve(process.cwd(), credentialPath),
    path.resolve(__dirname, "..", credentialPath),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

function createVisionClient() {
  if (process.env.GOOGLE_VISION_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_VISION_JSON);
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");

      return new vision.ImageAnnotatorClient({
        credentials,
        projectId: process.env.GOOGLE_CLOUD_PROJECT || credentials.project_id,
      });
    } catch (error) {
      console.warn(
        "GOOGLE_VISION_JSON is not valid JSON. Falling back to GOOGLE_APPLICATION_CREDENTIALS."
      );
    }
  }

  const keyFilename = resolveCredentialPath(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (keyFilename) {
    return new vision.ImageAnnotatorClient({
      keyFilename,
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
  }

  throw new Error(
    "Google Vision credentials are missing. Set GOOGLE_VISION_JSON or GOOGLE_APPLICATION_CREDENTIALS."
  );
}

const client = createVisionClient();

const analyzeImage = async (imageUrl) => {
  try {
    console.log(
      "Using Vision Project:",
      process.env.GOOGLE_CLOUD_PROJECT
    );

    const [result] = await client.labelDetection({
      image: {
        source: {
          imageUri: imageUrl,
        },
      },
    });

    return (result.labelAnnotations || []).map((label) =>
      label.description.toLowerCase()
    );

  } catch (error) {
    console.error("Vision Error:", error.message);
    throw error;
  }
};

module.exports = { analyzeImage };
