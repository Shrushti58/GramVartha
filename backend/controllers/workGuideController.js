const WorkGuide = require("../models/WorkGuide");
const Admin     = require("../models/Admin");
const Officals  = require("../models/Officials");

async function getVillageAdmin(userId) {
  return Admin.findOne({ _id: userId, role: "admin", status: "approved" });
}

async function getApprovedOfficial(userId) {
  return Officals.findOne({ _id: userId, status: "approved" });
}

const getWorkGuides = async (req, res) => {
  
  try {
    const { villageId } = req.params;
    const { search }    = req.query;

    const filter = { village: villageId, isActive: true };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { workName:       regex },
        { category:       regex },
        { officerName:    regex },
        { designation:    regex },
        { documents:      regex },
        { searchKeywords: regex },
        { location:       regex },
        { note:           regex },
      ];
    }

    const guides = await WorkGuide.find(filter)
      .sort({ category: 1, workName: 1 })
      .lean();

    // Group by category
    const grouped = {};
    for (const guide of guides) {
      if (!grouped[guide.category]) grouped[guide.category] = [];
      grouped[guide.category].push(guide);
    }

    const result = Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("[getWorkGuides]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getWorkGuideById = async (req, res) => {
  
  try {
    const guide = await WorkGuide.findById(req.params.id).lean();
    if (!guide) {
      return res.status(404).json({ message: "Work guide entry not found" });
    }
    return res.status(200).json(guide);
  } catch (err) {
    console.error("[getWorkGuideById]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const createWorkGuide = async (req, res) => {
  try {
    const admin = await getVillageAdmin(req.user?.id);
    if (!admin) {
      return res.status(403).json({
        message: "Forbidden — only village admins can create work guide entries",
      });
    }

    const {
      category,
      workName,
      officerName,
      designation,
      availableDays  = [],
      timing         = "",
      location       = "",
      documents      = [],
      searchKeywords = [],
      note           = "",
      isActive       = true,
    } = req.body;

    if (!category || !workName?.trim() || !officerName?.trim() || !designation?.trim()) {
      return res.status(400).json({
        message: "category, workName, officerName and designation are required",
      });
    }

    const workGuide = await WorkGuide.create({
      village:        admin.village,
      category,
      workName:       workName.trim(),
      officerName:    officerName.trim(),
      designation:    designation.trim(),
      availableDays,
      timing:         timing.trim(),
      location:       location.trim(),
      documents:      documents.map((d) => d.trim()).filter(Boolean),
      searchKeywords: searchKeywords.map((k) => k.trim()).filter(Boolean),
      note:           note.trim(),
      isActive,
    });

    return res.status(201).json({ message: "Work guide entry created", workGuide });
  } catch (err) {
    console.error("[createWorkGuide]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateWorkGuide = async (req, res) => {
  try {
    const guide = await WorkGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: "Work guide entry not found" });
    }

    // Check who is making the request — admin takes priority
    const admin    = await getVillageAdmin(req.user?.id);
    const official = !admin ? await getApprovedOfficial(req.user?.id) : null;

    if (!admin && !official) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Village ownership check
    const userVillage = admin ? admin.village : official.village;
    if (guide.village.toString() !== userVillage.toString()) {
      return res.status(403).json({ message: "Forbidden — not your village" });
    }

    // ── Village admin: full update ────────────────────────────────────────────
    if (admin) {
      const {
        category, workName, officerName, designation,
        availableDays, timing, location,
        documents, searchKeywords, note, isActive,
      } = req.body;

      if (category       !== undefined) guide.category       = category;
      if (workName       !== undefined) guide.workName       = workName.trim();
      if (officerName    !== undefined) guide.officerName    = officerName.trim();
      if (designation    !== undefined) guide.designation    = designation.trim();
      if (availableDays  !== undefined) guide.availableDays  = availableDays;
      if (timing         !== undefined) guide.timing         = timing.trim();
      if (location       !== undefined) guide.location       = location.trim();
      if (documents      !== undefined) guide.documents      = documents.map((d) => d.trim()).filter(Boolean);
      if (searchKeywords !== undefined) guide.searchKeywords = searchKeywords.map((k) => k.trim()).filter(Boolean);
      if (note           !== undefined) guide.note           = note.trim();
      if (isActive       !== undefined) guide.isActive       = isActive;

      await guide.save();
      return res.status(200).json({ message: "Work guide updated", workGuide: guide });
    }

    // ── Official: only timing and availableDays ───────────────────────────────
    const { timing, availableDays } = req.body;

    if (timing        !== undefined) guide.timing        = timing.trim();
    if (availableDays !== undefined) guide.availableDays = availableDays;

    await guide.save();
    return res.status(200).json({
      message: "Timing and availability updated",
      workGuide: guide,
    });

  } catch (err) {
    console.error("[updateWorkGuide]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteWorkGuide = async (req, res) => {
  try {
    const admin = await getVillageAdmin(req.user?.id);
    if (!admin) {
      return res.status(403).json({
        message: "Forbidden — only village admins can delete work guide entries",
      });
    }

    const guide = await WorkGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: "Work guide entry not found" });
    }

    if (guide.village.toString() !== admin.village.toString()) {
      return res.status(403).json({ message: "Forbidden — not your village" });
    }

    await guide.deleteOne();
    return res.status(200).json({ message: "Work guide entry deleted" });
  } catch (err) {
    console.error("[deleteWorkGuide]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getWorkGuides,
  getWorkGuideById,
  createWorkGuide,
  updateWorkGuide,
  deleteWorkGuide,
};