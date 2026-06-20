const Scheme = require("../models/Scheme");
const Village = require("../models/Village");
const VillageScheme = require("../models/VillageScheme");
const SchemeRequest = require("../models/SchemeRequest");

const VILLAGE_CUSTOM_SOURCE = "Village Custom Scheme";

const buildSlug = (title = "") =>
  title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "village-scheme";

const buildVillageSchemeSlug = (title, villageId, suffix = Date.now()) =>
  `${buildSlug(title)}-${villageId}-${suffix}`.toLowerCase();

const buildSchemeQuery = ({
  search,
  category,
  tag,
  beneficiary,
  level,
  state,
  villageId,
  villageSchemeIds = [],
}) => {
  const query = {
    status: "active",
  };
  const filters = [];

  filters.push(
    villageId
      ? {
          $or: [
            {
              scope: "global",
              source: { $ne: VILLAGE_CUSTOM_SOURCE },
            },
            {
              scope: { $exists: false },
              source: { $ne: VILLAGE_CUSTOM_SOURCE },
            },
            {
              scope: "village",
              village: villageId,
            },
            ...(villageSchemeIds.length
              ? [
                  {
                    $and: [
                      { _id: { $in: villageSchemeIds } },
                      { source: VILLAGE_CUSTOM_SOURCE },
                      {
                        $or: [
                          { scope: { $exists: false } },
                          { scope: { $ne: "village" } },
                        ],
                      },
                    ],
                  },
                ]
              : []),
          ],
        }
      : {
          $or: [
            {
              scope: "global",
              source: { $ne: VILLAGE_CUSTOM_SOURCE },
            },
            {
              scope: { $exists: false },
              source: { $ne: VILLAGE_CUSTOM_SOURCE },
            },
          ],
        }
  );

  if (category && category !== "all") {
    query.category = category;
  }

  if (tag && tag !== "all") {
    query.tags = tag;
  }

  if (beneficiary && beneficiary !== "all") {
    query.beneficiary = beneficiary;
  }

  if (level && level !== "all") {
    query.level = level;
  }

  if (state && state !== "all") {
    filters.push({
      $or: [
        { state },
        { state: "All India" },
        { level: "Central" },
        { state: "Unknown" },
      ],
    });
  }

  if (search && search.trim()) {
    query.$text = {
      $search: search.trim(),
    };
  }

  if (filters.length) {
    query.$and = filters;
  }

  return query;
};

const getActiveVillageSchemeIds = async (villageId) => {
  if (!villageId) return [];

  const mappings = await VillageScheme.find({
    villageId,
    isActive: true,
  })
    .select("schemeId")
    .lean();

  return mappings.map((mapping) => mapping.schemeId).filter(Boolean);
};

const findEditableVillageScheme = async (schemeId, villageId) => {
  const scheme = await Scheme.findById(schemeId).select("scope village source").lean();

  if (!scheme) return null;

  if (
    scheme.scope === "village" &&
    scheme.village?.toString() !== villageId.toString()
  ) {
    return null;
  }

  if (scheme.scope !== "village") {
    const existingMapping = await VillageScheme.exists({
      schemeId,
      villageId,
      isActive: true,
    });

    if (!existingMapping || scheme.source !== VILLAGE_CUSTOM_SOURCE) {
      return null;
    }
  }

  return scheme;
};

const mergeVillageOverrides = (schemes, overrides = [], requests = []) => {
  const overrideMap = {};
  const requestMap = {};

  overrides.forEach((o) => {
    if (o.schemeId) {
      overrideMap[o.schemeId.toString()] = o;
    }
  });

  requests.forEach((r) => {
    if (r.schemeId) {
      requestMap[r.schemeId.toString()] = r;
    }
  });

  return schemes.map((scheme) => {
    const override = overrideMap[scheme._id.toString()];
    const request = requestMap[scheme._id.toString()];

    return {
      ...scheme,
      title: override?.customTitle || scheme.title,
      description: override?.customDescription || scheme.description,
      shortDescription:
        override?.customDescription?.slice(0, 160) ||
        scheme.shortDescription ||
        scheme.description?.slice(0, 160),
      amount: override?.customAmount ?? scheme.amount,
      requestStatus: request ? "pending" : "none",
      isCustom: !!override,
    };
  });
};

const getSchemesForCitizen = async (req, res) => {
  try {
    const {
      villageId,
      page = 1,
      limit = 20,
      search = "",
      category,
      tag,
      beneficiary,
      level,
      state,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let finalState = state;

    if (villageId && !state) {
      const village = await Village.findById(villageId).select("state");

      if (village?.state) {
        finalState = village.state;
      }
    }

    const villageSchemeIds = await getActiveVillageSchemeIds(villageId);

    const query = buildSchemeQuery({
      search,
      category,
      tag,
      beneficiary,
      level,
      state: finalState,
      villageId,
      villageSchemeIds,
    });

    const sortQuery = search.trim()
      ? { score: { $meta: "textScore" } }
      : { updatedAt: -1 };

    const projection = search.trim()
      ? {
          score: { $meta: "textScore" },
          title: 1,
          slug: 1,
          description: 1,
          shortDescription: 1,
          amount: 1,
          category: 1,
          level: 1,
          state: 1,
          beneficiary: 1,
          tags: 1,
          updatedAt: 1,
        }
      : "title slug description shortDescription amount category level state beneficiary tags updatedAt";

    const baseSchemes = await Scheme.find(query, projection)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const schemeIds = baseSchemes.map((s) => s._id);

    const overrides = villageId
      ? await VillageScheme.find({
          villageId,
          schemeId: { $in: schemeIds },
        }).lean()
      : [];

    const merged = mergeVillageOverrides(baseSchemes, overrides);

    const total = await Scheme.countDocuments(query);

    return res.json({
      success: true,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      total,
      data: merged,
    });
  } catch (err) {
    console.error("[getSchemesForCitizen]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const getSchemesForOfficial = async (req, res) => {
  try {
    const villageId = req.user.village;

    const {
      page = 1,
      limit = 9,
      search = "",
      category,
      tag,
      beneficiary,
      level,
      state,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let finalState = state;

    if (!finalState && villageId) {
      const village = await Village.findById(villageId).select("state");

      if (village?.state) {
        finalState = village.state;
      }
    }

    const villageSchemeIds = await getActiveVillageSchemeIds(villageId);

    const query = buildSchemeQuery({
      search,
      category,
      tag,
      beneficiary,
      level,
      state: finalState,
      villageId,
      villageSchemeIds,
    });

    const sortQuery = search.trim()
      ? { score: { $meta: "textScore" } }
      : { updatedAt: -1 };

    const projection = search.trim()
      ? { score: { $meta: "textScore" } }
      : {};

    const baseSchemes = await Scheme.find(query, projection)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalSchemes = await Scheme.countDocuments(query);

    if (!baseSchemes.length) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    const schemeIds = baseSchemes.map((s) => s._id);

    const [overrides, requests] = await Promise.all([
      VillageScheme.find({
        villageId,
        schemeId: { $in: schemeIds },
      }).lean(),

      SchemeRequest.find({
        villageId,
        status: "pending",
        schemeId: { $in: schemeIds },
      }).lean(),
    ]);

    const merged = mergeVillageOverrides(baseSchemes, overrides, requests);

    return res.json({
      success: true,
      data: merged,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalSchemes,
        totalPages: Math.ceil(totalSchemes / limitNum),
        hasNext: pageNum < Math.ceil(totalSchemes / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("[getSchemesForOfficial]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const getSchemeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { villageId } = req.query;

    const scheme = await Scheme.findOne({
      slug,
      status: "active",
    }).lean();

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    if (
      scheme.scope === "village" &&
      (!villageId || scheme.village?.toString() !== villageId.toString())
    ) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    let finalScheme = scheme;

    if (villageId) {
      const override = await VillageScheme.findOne({
        schemeId: scheme._id,
        villageId,
      }).lean();

      if (override) {
        finalScheme = {
          ...scheme,
          title: override.customTitle || scheme.title,
          description: override.customDescription || scheme.description,
          shortDescription:
            override.customDescription?.slice(0, 160) ||
            scheme.shortDescription,
          amount: override.customAmount ?? scheme.amount,
          isCustom: true,
        };
      }
    }

    if (
      scheme.source === VILLAGE_CUSTOM_SOURCE &&
      scheme.scope !== "village" &&
      !finalScheme.isCustom
    ) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    return res.json({
      success: true,
      data: finalScheme,
    });
  } catch (err) {
    console.error("[getSchemeBySlug]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const searchSchemes = async (req, res) => {
  try {
    const {
      keyword = "",
      category,
      tag,
      beneficiary,
      level,
      state,
      villageId,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const villageSchemeIds = await getActiveVillageSchemeIds(villageId);

    const query = buildSchemeQuery({
      search: keyword,
      category,
      tag,
      beneficiary,
      level,
      state,
      villageId,
      villageSchemeIds,
    });

    const sortQuery = keyword.trim()
      ? { score: { $meta: "textScore" } }
      : { updatedAt: -1 };

    const schemes = await Scheme.find(
      query,
      keyword.trim() ? { score: { $meta: "textScore" } } : {}
    )
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Scheme.countDocuments(query);

    return res.json({
      success: true,
      data: schemes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("[searchSchemes]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const getSchemeFilters = async (req, res) => {
  try {
    const [categories, beneficiaries, states, levels, tags] = await Promise.all([
      Scheme.distinct("category"),
      Scheme.distinct("beneficiary"),
      Scheme.distinct("state"),
      Scheme.distinct("level"),
      Scheme.distinct("tags"),
    ]);

    return res.json({
      success: true,
      data: {
        categories: categories.filter(Boolean).sort(),
        beneficiaries: beneficiaries.filter(Boolean).sort(),
        states: states.filter(Boolean).sort(),
        levels: levels.filter(Boolean).sort(),
        tags: tags.filter(Boolean).sort(),
      },
    });
  } catch (err) {
    console.error("[getSchemeFilters]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const createVillageScheme = async (req, res) => {
  try {
    const villageId = req.user.village;
    const {
      title,
      description,
      amount = 0,
      eligibility = "",
      documents = [],
      applicationSteps = [],
      category = [],
      beneficiary = "general",
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const baseScheme = await Scheme.create({
      title: title.trim(),
      slug: buildVillageSchemeSlug(title, villageId),
      description: description.trim(),
      shortDescription: description.trim().slice(0, 160),
      amount: Number(amount || 0),
      eligibility: eligibility.trim(),
      documents,
      applicationSteps,
      category,
      beneficiary,
      level: "Unknown",
      status: "active",
      verificationStatus: "needs_verification",
      source: "Village Custom Scheme",
      scope: "village",
      village: villageId,
    });

    const scheme = await VillageScheme.create({
      schemeId: baseScheme._id,
      villageId,
      isCustom: true,
      customTitle: title,
      customDescription: description,
      customAmount: amount,
      updatedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Village scheme created",
      scheme: {
        ...scheme.toObject(),
        baseScheme,
      },
    });
  } catch (err) {
    console.error("[createVillageScheme]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const getVillageSchemesForOfficial = async (req, res) => {
  try {
    const villageId = req.user.village;

    const mappings = await VillageScheme.find({
      villageId,
      isActive: true,
    })
      .populate({
        path: "schemeId",
        match: {
          status: "active",
          $or: [
            { scope: "village", village: villageId },
            {
              source: VILLAGE_CUSTOM_SOURCE,
              $or: [
                { scope: { $exists: false } },
                { scope: { $ne: "village" } },
              ],
            },
          ],
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const schemes = mappings
      .filter((mapping) => mapping.schemeId)
      .map((mapping) => {
        const scheme = mapping.schemeId;

        return {
          _id: scheme._id,
          mappingId: mapping._id,
          title: mapping.customTitle || scheme.title,
          description: mapping.customDescription || scheme.description,
          shortDescription:
            mapping.customDescription?.slice(0, 160) ||
            scheme.shortDescription ||
            scheme.description?.slice(0, 160),
          amount: mapping.customAmount ?? scheme.amount,
          eligibility: scheme.eligibility || "",
          documents: scheme.documents || [],
          applicationSteps: scheme.applicationSteps || [],
          category: scheme.category || [],
          beneficiary: scheme.beneficiary || "general",
          verificationStatus: scheme.verificationStatus,
          createdAt: scheme.createdAt,
          updatedAt: mapping.updatedAt || scheme.updatedAt,
          isCustom: true,
        };
      });

    return res.json({
      success: true,
      data: schemes,
    });
  } catch (err) {
    console.error("[getVillageSchemesForOfficial]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const updateVillageScheme = async (req, res) => {
  try {
    const villageId = req.user.village;
    const { schemeId } = req.params;
    const {
      title,
      description,
      amount = 0,
      eligibility = "",
      documents = [],
      applicationSteps = [],
      category = [],
      beneficiary = "general",
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const scheme = await findEditableVillageScheme(schemeId, villageId);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    const normalizedAmount = Number(amount || 0);

    const updatedScheme = await Scheme.findByIdAndUpdate(
      schemeId,
      {
        title: title.trim(),
        slug: buildVillageSchemeSlug(title, villageId, schemeId),
        description: description.trim(),
        shortDescription: description.trim().slice(0, 160),
        amount: normalizedAmount,
        eligibility: eligibility.trim(),
        documents: Array.isArray(documents) ? documents : [],
        applicationSteps: Array.isArray(applicationSteps) ? applicationSteps : [],
        category: Array.isArray(category) ? category : [],
        beneficiary,
      },
      { new: true }
    ).lean();

    const updated = await VillageScheme.findOneAndUpdate(
      { schemeId, villageId },
      {
        customTitle: title.trim(),
        customDescription: description.trim(),
        customAmount: normalizedAmount,
        isCustom: true,
        isActive: true,
        updatedBy: req.user.id,
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      data: {
        ...updated.toObject(),
        baseScheme: updatedScheme,
      },
    });
  } catch (err) {
    console.error("[updateVillageScheme]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const deleteVillageScheme = async (req, res) => {
  try {
    const villageId = req.user.village;
    const { schemeId } = req.params;

    const scheme = await findEditableVillageScheme(schemeId, villageId);

    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: "Scheme not found",
      });
    }

    await Promise.all([
      VillageScheme.deleteMany({ schemeId, villageId }),
      Scheme.deleteOne({ _id: schemeId }),
    ]);

    return res.json({
      success: true,
      message: "Village scheme deleted",
    });
  } catch (err) {
    console.error("[deleteVillageScheme]", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  getSchemesForCitizen,
  getSchemesForOfficial,
  getSchemeBySlug,
  searchSchemes,
  getSchemeFilters,
  getVillageSchemesForOfficial,
  createVillageScheme,
  updateVillageScheme,
  deleteVillageScheme,
};
