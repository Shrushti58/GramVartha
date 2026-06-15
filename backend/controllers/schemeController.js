const Scheme = require("../models/Scheme");
const VillageScheme = require("../models/VillageScheme");
const SchemeRequest = require("../models/SchemeRequest");

const getSchemesForCitizen = async (req, res) => {
  try {
    const { villageId, page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const baseSchemes = await Scheme.find({ status: "active" })
      .select("title description amount slug category")
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const schemeIds = baseSchemes.map(s => s._id);

    const overrides = await VillageScheme.find({
      villageId,
      schemeId: { $in: schemeIds },
    }).lean();

    const overrideMap = {};
    overrides.forEach(o => {
      overrideMap[o.schemeId.toString()] = o;
    });

    const merged = baseSchemes.map(scheme => {
      const override = overrideMap[scheme._id.toString()];

      return {
        ...scheme,
        title: override?.customTitle || scheme.title,
        description: override?.customDescription || scheme.description,
        amount: override?.customAmount || scheme.amount,
      };
    });

    const total = await Scheme.countDocuments({ status: "active" });

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: merged,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// controllers/schemeController.js

const getSchemesForOfficial = async (req, res) => {
  try {
    const villageId = req.user.village;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    console.log("Fetching schemes for official - Village ID:", villageId);
    console.log("Pagination - Page:", page, "Limit:", limit);

    // Get base schemes with pagination
    const baseSchemes = await Scheme.find({ status: "active" })
      .sort({ updatedAt: -1 }) // Show newest first
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Found base schemes:", baseSchemes.length);

    const totalSchemes = await Scheme.countDocuments({ status: "active" });
    console.log("Total schemes:", totalSchemes);

    if (!baseSchemes.length) {
      return res.json({
        data: [],
        pagination: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Get overrides for this village
    const overrides = await VillageScheme.find({ 
      villageId: villageId,
      schemeId: { $in: baseSchemes.map(s => s._id) }
    }).lean();

    // Get pending requests
    const requests = await SchemeRequest.find({
      villageId: villageId,
      status: "pending",
      schemeId: { $in: baseSchemes.map(s => s._id) }
    }).lean();

    const overrideMap = {};
    overrides.forEach(o => {
      if (o.schemeId) {
        overrideMap[o.schemeId.toString()] = o;
      }
    });

    const requestMap = {};
    requests.forEach(r => {
      if (r.schemeId) {
        requestMap[r.schemeId.toString()] = r;
      }
    });

    const merged = baseSchemes.map(scheme => {
      const override = overrideMap[scheme._id.toString()];
      const request = requestMap[scheme._id.toString()];

      return {
        _id: scheme._id,
        title: override?.customTitle || scheme.title,
        description: override?.customDescription || scheme.description,
        amount: override?.customAmount || scheme.amount,
        category: scheme.category,
        level: scheme.level,
        slug: scheme.slug,
        eligibility: scheme.eligibility,
        documents: scheme.documents,
        applicationSteps: scheme.applicationSteps,
        tags: scheme.tags,
        requestStatus: request ? "pending" : "none",
        isCustom: override ? true : false,
        updatedAt: scheme.updatedAt
      };
    });

    res.json({
      data: merged,
      pagination: {
        page: page,
        limit: limit,
        total: totalSchemes,
        totalPages: Math.ceil(totalSchemes / limit),
        hasNext: page < Math.ceil(totalSchemes / limit),
        hasPrev: page > 1
      }
    });

  } catch (err) {
    console.error("Error in getSchemesForOfficial:", err);
    res.status(500).json({ error: err.message });
  }
};


const getSchemeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { villageId } = req.query;

    const scheme = await Scheme.findOne({ slug });

    if (!scheme) {
      return res.status(404).json({ message: "Scheme not found" });
    }

    const override = await VillageScheme.findOne({
      schemeId: scheme._id,
      villageId,
    });

    let finalScheme = scheme.toObject();

    if (override) {
      finalScheme = {
        ...finalScheme,
        title: override.customTitle || scheme.title,
        description: override.customDescription || scheme.description,
        amount: override.customAmount || scheme.amount,
      };
    }

    res.json(finalScheme);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const searchSchemes = async (req, res) => {
  try {
    const { category, tag, keyword } = req.query;

    let query = { status: "active" };

    if (category) query.category = category;
    if (tag) query.tags = tag;

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    const schemes = await Scheme.find(query);

    res.json(schemes);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createVillageScheme = async (req, res) => {
  try {
    const villageId = req.user.village;

    const { title, description, amount } = req.body;

    const scheme = await VillageScheme.create({
      villageId,
      isCustom: true,
      customTitle: title,
      customDescription: description,
      customAmount: amount,
      updatedBy: req.user.id,
    });

    res.status(201).json({
      message: "Village scheme created",
      scheme,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVillageScheme = async (req, res) => {
  try {
    const villageId = req.user.village;
    const { schemeId } = req.params;

    const update = req.body;

    const updated = await VillageScheme.findOneAndUpdate(
      { schemeId, villageId },
      {
        ...update,
        updatedBy: req.user.id,
      },
      { upsert: true, new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getSchemesForCitizen,
  getSchemesForOfficial,
  getSchemeBySlug,
  searchSchemes,
  createVillageScheme,
  updateVillageScheme

};