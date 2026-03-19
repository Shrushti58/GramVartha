const Complaint = require("../models/Complaint");
const { analyzeImage } = require("../utlis/vision");

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_KEYWORDS   = ["garbage", "road", "pothole", "waste", "drain", "litter", "damage"];
const INVALID_KEYWORDS = ["selfie", "face", "person", "people", "portrait"];

const FRAUD_WEIGHTS = {
  gallerySource  : 30,
  invalidImage   : 40,
  missingCoords  : 30,
  staleTimestamp : 20,
};

const FRAUD_THRESHOLDS = {
  high   : 60,
  medium : 30,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise AI labels to lowercase strings so keyword matching
 * works regardless of how Google Vision / AWS Rekognition returns them.
 */
function normalizeLabels(raw = []) {
  return raw
    .map((l) => {
      if (typeof l === "string") return l.toLowerCase();
      if (l?.description)        return l.description.toLowerCase();
      if (l?.Name)               return l.Name.toLowerCase();
      return "";
    })
    .filter(Boolean);
}

/**
 * Returns { isValidIssue, fraudScore, remarks } for an issue complaint.
 */
function runFraudCheck({ labels, imageSource, lat, lng, timestamp }) {
  let fraudScore = 0;

  const hasValid     = labels.some((l) => VALID_KEYWORDS.includes(l));
  const hasInvalid   = labels.some((l) => INVALID_KEYWORDS.includes(l));
  const isValidIssue = hasValid && !hasInvalid;

  if (imageSource === "gallery")    fraudScore += FRAUD_WEIGHTS.gallerySource;
  if (!isValidIssue)                fraudScore += FRAUD_WEIGHTS.invalidImage;
  if (isNaN(lat) || isNaN(lng))     fraudScore += FRAUD_WEIGHTS.missingCoords;

  if (timestamp) {
    const ageHours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) fraudScore += FRAUD_WEIGHTS.staleTimestamp;
  }

  let remarks = "Looks fine";
  if (fraudScore > FRAUD_THRESHOLDS.high)        remarks = "High chance of fake issue";
  else if (fraudScore > FRAUD_THRESHOLDS.medium) remarks = "Needs verification";

  return { isValidIssue, fraudScore, remarks };
}

// ─── Controller ───────────────────────────────────────────────────────────────

const createComplaint = async (req, res) => {
  try {
    // ── Auth guard ──────────────────────────────────────────────────────────
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ── Parse & validate base fields ────────────────────────────────────────
    const {
      type,
      title,
      description,
      imageSource = null,
      timestamp   = null,
    } = req.body;

    if (!type || !title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "Missing required fields: type, title, description" });
    }

    if (!["issue", "suggestion"].includes(type)) {
      return res.status(400).json({ message: "Invalid type. Must be 'issue' or 'suggestion'" });
    }

    // ── Suggestion path ──────────────────────────────────────────────────────
    if (type === "suggestion") {
      const complaint = await Complaint.create({
        citizen      : req.user.id,
        village      : req.user.village,
        type,
        title        : title.trim(),
        description  : description.trim(),
        imageUrl     : null,
        location     : null,
        imageSource  : null,
        timestamp    : null,
        aiVerification: undefined,
      });

      return res.status(201).json({ message: "Complaint submitted successfully", complaint });
    }

    // ── Issue path ───────────────────────────────────────────────────────────

    // Validate photo
    if (!req.file) {
      return res.status(400).json({ message: "Issue requires a photo" });
    }

    // ✅ multer-storage-cloudinary already uploaded the file during middleware.
    //    req.file.path holds the Cloudinary secure URL — no manual upload needed.
    const imageUrl = req.file.path;

    // Validate coordinates
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid or missing GPS coordinates" });
    }

    // AI analysis (non-fatal)
    let rawLabels = [];
    try {
      rawLabels = await analyzeImage(imageUrl);
    } catch (visionErr) {
      console.warn("[Vision API error]", visionErr.message);
    }

    const labels = normalizeLabels(rawLabels);

    // Fraud / validity check
    const { isValidIssue, fraudScore, remarks } = runFraudCheck({
      labels,
      imageSource,
      lat,
      lng,
      timestamp,
    });

    // Duplicate check — 0.0005 deg ≈ ~55 m radius
    const nearbyIssue = await Complaint.findOne({
      type   : "issue",
      status : { $ne: "resolved" },
      "location.lat": { $gte: lat - 0.0005, $lte: lat + 0.0005 },
      "location.lng": { $gte: lng - 0.0005, $lte: lng + 0.0005 },
    });

    if (nearbyIssue) {
      return res.status(200).json({
        message     : "Similar issue already reported nearby",
        duplicateOf : nearbyIssue._id,
      });
    }

    // Persist
    const complaint = await Complaint.create({
      citizen      : req.user.id,
      village      : req.user.village,
      type,
      title        : title.trim(),
      description  : description.trim(),
      imageUrl,
      location     : { lat, lng },
      imageSource  : imageSource ?? "camera",
      timestamp    : timestamp ? new Date(timestamp) : new Date(),
      aiVerification: {
        isValidIssue,
        labels,
        fraudScore,
        remarks,
      },
    });

    return res.status(201).json({ message: "Complaint submitted successfully", complaint });

  } catch (err) {
    console.error("[createComplaint]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createComplaint };