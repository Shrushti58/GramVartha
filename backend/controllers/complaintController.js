const Complaint = require("../models/Complaint");
const { analyzeImage } = require("../utlis/vision");
const Citizen = require("../models/Citizens");
const { sendSMS } = require('../service/smsService');

// ─── Valid status values ───────────────────────────────────────────────────────
const VALID_STATUSES = ["pending", "in-progress", "resolved", "rejected"];

// ─── AI Keyword Banks ─────────────────────────────────────────────────────────

// ✅ Labels that confirm a LEGITIMATE civic issue is visible in the photo
const VALID_KEYWORDS = [
  // Waste & sanitation
  "garbage", "waste", "litter", "trash", "rubbish", "debris", "dump",
  "dumpster", "sewage", "sewer", "drainage", "drain", "filth", "dirt",
  "compost", "bin", "landfill", "open defecation",

  // Roads & infrastructure
  "road", "pothole", "crack", "pavement", "footpath", "sidewalk", "asphalt",
  "construction", "broken road", "damaged road", "unpaved", "gravel",
  "speed breaker", "barricade", "bridge", "culvert", "manhole",

  // Water & flooding
  "flood", "waterlogging", "puddle", "overflow", "leakage", "pipe",
  "water pipe", "burst pipe", "stagnant water", "sewage overflow",
  "blocked drain", "clogged", "water logging",

  // Electricity
  "electric pole", "wire", "cable", "streetlight", "lamp post",
  "broken light", "fallen pole", "dangling wire", "power line",
  "transformer", "electricity",

  // Public property damage
  "wall", "fence", "broken", "damaged", "vandalism", "graffiti",
  "collapsed", "dilapidated", "abandoned", "demolition", "rubble",
  "debris pile", "building", "structure",

  // Animals & health hazards
  "stray", "animal", "dog", "cattle", "cow", "pig", "carcass",
  "dead animal", "mosquito", "pest", "rat", "infestation",

  // Trees & vegetation hazards
  "fallen tree", "tree", "branch", "overgrown", "weed", "bush",
  "blocked path", "uprooted",

  // Public spaces
  "park", "playground", "garden", "school", "hospital", "market",
  "bus stop", "public toilet", "toilet", "urinal", "well",
];

// ❌ Labels that suggest the photo is NOT a civic issue (fraud / irrelevant)
const INVALID_KEYWORDS = [
  // People / selfies
  "selfie", "face", "person", "people", "portrait", "human", "man",
  "woman", "child", "crowd", "group", "body",

  // Indoor / unrelated scenes
  "indoor", "room", "bedroom", "kitchen", "office", "interior",
  "furniture", "table", "chair", "sofa", "food", "meal", "plate",
  "restaurant", "shop", "store",

  // Vehicle interiors
  "car interior", "dashboard", "steering wheel",

  // Pure nature (no civic issue)
  "sky", "cloud", "mountain", "beach", "ocean", "river", "sunset",
  "flower", "scenery", "landscape",

  // Documents / screens
  "document", "paper", "screenshot", "screen", "phone screen", "text", "sign",
];

// 🔍 Labels that confirm the issue is STILL present in a resolution photo
const DIRTY_KEYWORDS = [
  // Waste still visible
  "garbage", "waste", "litter", "trash", "rubbish", "debris", "dump", "filth",
  "sewage", "sewage overflow", "open defecation",

  // Water issue still present
  "flood", "waterlogging", "stagnant water", "overflow", "puddle",
  "blocked drain", "clogged",

  // Road damage still visible
  "pothole", "crack", "broken road", "damaged road",

  // Health hazard still present
  "carcass", "dead animal", "infestation", "rat", "pest",
];

const FRAUD_WEIGHTS = {
  gallerySource  : 30,
  invalidImage   : 40,
  missingCoords  : 30,
  staleTimestamp : 20,
};

const FRAUD_THRESHOLDS = { high: 60, medium: 30 };

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

function runFraudCheck({ labels, imageSource, lat, lng, timestamp }) {
  let fraudScore = 0;

  const hasValid     = labels.some((l) => VALID_KEYWORDS.includes(l));
  const hasInvalid   = labels.some((l) => INVALID_KEYWORDS.includes(l));
  const isValidIssue = hasValid && !hasInvalid;

  if (imageSource === "gallery")  fraudScore += FRAUD_WEIGHTS.gallerySource;
  if (!isValidIssue)              fraudScore += FRAUD_WEIGHTS.invalidImage;
  if (isNaN(lat) || isNaN(lng))   fraudScore += FRAUD_WEIGHTS.missingCoords;

  if (timestamp) {
    const ageHours = (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
    if (ageHours > 24) fraudScore += FRAUD_WEIGHTS.staleTimestamp;
  }

  let remarks = "Looks fine";
  if (fraudScore > FRAUD_THRESHOLDS.high)        remarks = "High chance of fake issue";
  else if (fraudScore > FRAUD_THRESHOLDS.medium) remarks = "Needs verification";

  return { isValidIssue, fraudScore, remarks };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

const getComplaints = async (req, res) => {
  try {
    if (!req.user?.village) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filter = { village: req.user.village };
    if (req.query.type)   filter.type   = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(complaints);
  } catch (err) {
    console.error("[getComplaints]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
// UPDATE STATUS
// ─────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ── SMS: notify citizen based on status ──
    try {
      const citizen = await Citizen.findById(complaint.citizen);
      if (citizen?.phone) {
        let message = '';

        if (status === 'resolved') {
          message = `✅ Your complaint "${complaint.title}" (#${complaint._id}) has been RESOLVED by Gram Panchayat. Thank you for reporting!`;
        } else if (status === 'rejected') {
          message = `❌ Your complaint "${complaint.title}" (#${complaint._id}) has been REJECTED by Gram Panchayat. Visit the portal for more details.`;
        } else if (status === 'in_progress') {
          message = `🔧 Your complaint "${complaint.title}" (#${complaint._id}) is now IN PROGRESS. We are working on it!`;
        }

        if (message) await sendSMS(citizen.phone, message);
      }
    } catch (smsErr) {
      console.error("SMS error [updateStatus]:", smsErr.message);
    }

    return res.status(200).json(complaint);
  } catch (err) {
    console.error("[updateStatus]", err);
    return res.status(500).json({ message: "Error updating status" });
  }
};

// ─────────────────────────────────────────
// RESOLVE COMPLAINT
// ─────────────────────────────────────────
const resolveComplaint = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Resolution photo required" });
    }

    const resolvedImageUrl = req.file.path;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (complaint.status === "resolved") {
      return res.status(400).json({ message: "Complaint is already resolved" });
    }

    // ── AI analysis (unchanged) ──
    let labels = [];
    try {
      const raw = await analyzeImage(resolvedImageUrl);
      labels = normalizeLabels(raw);
    } catch (visionErr) {
      console.warn("[Vision API error - resolve]", visionErr.message);
    }

    const hasInvalidContent = labels.some((l) => INVALID_KEYWORDS.includes(l));
    if (hasInvalidContent) {
      const matchedInvalid = labels.filter((l) => INVALID_KEYWORDS.includes(l));
      return res.status(400).json({
        message: "Resolution photo appears to be invalid or unrelated to the complaint.",
        reason: "invalid_image",
        detectedLabels: matchedInvalid,
      });
    }

    const isClean      = !labels.some((l) => DIRTY_KEYWORDS.includes(l));
    const matchedDirty = labels.filter((l) => DIRTY_KEYWORDS.includes(l));
    const score        = isClean ? 80 : 30;
    const remarks      = isClean
      ? "Looks cleaned"
      : `Issue still visible in photo (detected: ${matchedDirty.join(", ")})`;

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
        resolvedImageUrl,
        resolutionVerification: { score, remarks, labels },
      },
      { new: true, runValidators: true }
    );

    // ── SMS: notify citizen of resolution with AI score ──
    try {
      const citizen = await Citizen.findById(complaint.citizen);
      if (citizen?.phone) {
        const message = `✅ Your complaint "${complaint.title}" (#${complaint._id}) has been RESOLVED by Gram Panchayat. Verification score: ${score}/100. ${remarks}`;
        await sendSMS(citizen.phone, message);
      }
    } catch (smsErr) {
      console.error("SMS error [resolveComplaint]:", smsErr.message);
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error("[resolveComplaint]", err);
    return res.status(500).json({ message: "Error resolving complaint" });
  }
};

// ─────────────────────────────────────────
// CREATE COMPLAINT
// ─────────────────────────────────────────
const createComplaint = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    if (type === "suggestion") {
      const complaint = await Complaint.create({
        citizen: req.user.id, village: req.user.village,
        type, title: title.trim(), description: description.trim(),
        imageUrl: null, location: null, imageSource: null,
        timestamp: null, aiVerification: undefined,
      });

      // ── SMS: confirm suggestion received ──
      try {
        const citizen = await Citizen.findById(req.user.id);
        if (citizen?.phone) {
          const message = `📝 Your suggestion "${title.trim()}" has been submitted to Gram Panchayat. We will review it shortly.`;
          await sendSMS(citizen.phone, message);
        }
      } catch (smsErr) {
        console.error("SMS error [createComplaint - suggestion]:", smsErr.message);
      }

      return res.status(201).json({ message: "Complaint submitted successfully", complaint });
    }

    // ── Issue type ──
    if (!req.file) {
      return res.status(400).json({ message: "Issue requires a photo" });
    }

    const imageUrl = req.file.path;
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid or missing GPS coordinates" });
    }

    let rawLabels = [];
    try {
      rawLabels = await analyzeImage(imageUrl);
    } catch (visionErr) {
      console.warn("[Vision API error - create]", visionErr.message);
    }

    const labels = normalizeLabels(rawLabels);
    const { isValidIssue, fraudScore, remarks } = runFraudCheck({
      labels, imageSource, lat, lng, timestamp,
    });

    const nearbyIssue = await Complaint.findOne({
      type: "issue",
      status: { $ne: "resolved" },
      "location.lat": { $gte: lat - 0.0005, $lte: lat + 0.0005 },
      "location.lng": { $gte: lng - 0.0005, $lte: lng + 0.0005 },
    });

    if (nearbyIssue) {
      return res.status(200).json({
        message: "Similar issue already reported nearby",
        duplicateOf: nearbyIssue._id,
      });
    }

    const complaint = await Complaint.create({
      citizen: req.user.id, village: req.user.village,
      type, title: title.trim(), description: description.trim(),
      imageUrl, location: { lat, lng },
      imageSource: imageSource ?? "camera",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      aiVerification: { isValidIssue, labels, fraudScore, remarks },
    });

    // ── SMS: confirm issue complaint received ──
    try {
      const citizen = await Citizen.findById(req.user.id);
      if (citizen?.phone) {
        const message = `📋 Your complaint "${title.trim()}" (#${complaint._id}) has been submitted to Gram Panchayat. We will look into it soon.`;
        await sendSMS(citizen.phone, message);
      }
    } catch (smsErr) {
      console.error("SMS error [createComplaint - issue]:", smsErr.message);
    }

    return res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("[createComplaint]", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getComplaints, updateStatus, resolveComplaint, createComplaint };