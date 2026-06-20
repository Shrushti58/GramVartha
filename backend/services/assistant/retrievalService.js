const Scheme = require("../../models/Scheme");
const Village = require("../../models/Village");
const VillageScheme = require("../../models/VillageScheme");

const VILLAGE_CUSTOM_SOURCE = "Village Custom Scheme";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const topicSynonyms = {
  farming: ["agriculture", "crop", "farmer", "kisan"],
  farm: ["agriculture", "crop", "farmer", "kisan"],
  farmer: ["agriculture", "crop", "kisan"],
  kisan: ["farmer", "agriculture"],
  certificates: ["document", "benefit", "scheme"],
  certificate: ["document", "benefit", "scheme"],
  education: ["student", "school", "scholarship"],
  students: ["student", "school", "scholarship", "education"],
  women: ["women", "woman", "mahila", "girl"],
  welfare: ["scheme", "benefit", "yojana"],
  pension: ["pension", "senior", "widow", "old age"],
  housing: ["housing", "house", "awas", "pmay"],
  business: ["business", "loan", "self employment", "entrepreneur"],
  employment: ["job", "skill", "self employment", "business"],
  health: ["medical", "insurance", "hospital"],
  water: ["water", "sanitation", "drainage"],
  sanitation: ["water", "toilet", "drainage"],
  voter: ["voter", "election"],
};

const schemeProfiles = [
  {
    terms: ["student", "students", "education", "school", "scholarship", "college"],
    categories: ["education", "scholarship"],
    beneficiaries: ["student", "students"],
  },
  {
    terms: ["farmer", "farmers", "farming", "agriculture", "crop", "kisan"],
    categories: ["agriculture", "farmer"],
    beneficiaries: ["farmer", "farmers", "kisan"],
  },
  {
    terms: ["women", "woman", "girl", "mahila", "ladies"],
    categories: ["women", "women welfare", "girl"],
    beneficiaries: ["women", "woman", "girl", "female"],
  },
  {
    terms: ["pension", "senior", "widow", "old age", "elder"],
    categories: ["pension", "social welfare"],
    beneficiaries: ["senior", "widow", "elderly", "old age"],
  },
  {
    terms: ["housing", "house", "home", "awas", "pmay"],
    categories: ["housing", "awas"],
    beneficiaries: ["general"],
  },
  {
    terms: ["business", "loan", "startup", "self employment", "entrepreneur"],
    categories: ["business", "loan", "employment", "self employment"],
    beneficiaries: ["entrepreneur", "business", "youth"],
  },
  {
    terms: ["health", "medical", "hospital", "insurance"],
    categories: ["health", "medical", "insurance"],
    beneficiaries: ["general"],
  },
];

const expandTerms = (terms) => {
  const expanded = new Set(terms);
  terms.forEach((term) => {
    (topicSynonyms[term] || []).forEach((synonym) => expanded.add(synonym));
  });
  return Array.from(expanded).slice(0, 14);
};

const buildRegexFilter = (fields, message) => {
  const baseTerms = message
    .toLowerCase()
    .split(/[^a-z0-9\u0900-\u097F/]+/i)
    .filter((term) => term.length >= 3)
    .slice(0, 8);
  const terms = expandTerms(baseTerms);

  if (!terms.length) return {};

  return {
    $or: fields.flatMap((field) =>
      terms.map((term) => ({ [field]: new RegExp(escapeRegex(term), "i") }))
    ),
  };
};

const normalizeValue = (value = "") => value.toString().toLowerCase().trim();

const normalizeForTitleMatch = (value = "") =>
  normalizeValue(value)
    .replace(/[^a-z0-9\u0900-\u097F]+/gi, " ")
    .replace(/\b(scheme|schemes|yojana|yojanas)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getQueryTerms = (message = "") =>
  expandTerms(
    normalizeValue(message)
      .split(/[^a-z0-9\u0900-\u097F]+/i)
      .filter((term) => term.length >= 3)
      .slice(0, 8)
  );

const getSchemeProfile = (message = "") => {
  const normalized = normalizeValue(message);
  return schemeProfiles.find((profile) =>
    profile.terms.some((term) => normalized.includes(term))
  );
};

const isBroadSchemeQuery = (message = "") => {
  const normalized = normalizeValue(message);
  const meaningfulTerms = normalized
    .split(/[^a-z0-9\u0900-\u097F]+/i)
    .filter((term) => term.length >= 3 && !["show", "give", "tell", "about", "scheme", "schemes", "yojana", "government", "more"].includes(term));

  return meaningfulTerms.length === 0 || /^(show|give|tell)?\s*(me\s*)?(government\s*)?(scheme|schemes|yojana|yojanas)$/i.test(normalized);
};

const getRequestedPage = (message = "") => {
  const match = normalizeValue(message).match(/\bpage\s*(\d+)\b/);
  return Math.max(Number(match?.[1] || 1), 1);
};

const stripPageToken = (message = "") =>
  message.replace(/\bpage\s*\d+\b/gi, "").replace(/\s+/g, " ").trim();

const getDetailType = (message = "") => {
  const normalized = normalizeValue(message);
  if (/\b(eligible|eligibility|qualify|qualification)\b/.test(normalized)) return "eligibility";
  if (/\b(document|documents|paper|papers|required)\b/.test(normalized)) return "documents";
  if (/\b(apply|application|process|how to apply|register)\b/.test(normalized)) return "application";
  return null;
};

const stripDetailTerms = (message = "") =>
  stripPageToken(message)
    .replace(/\b(am i|i am|show|tell|me|for|of|the|scheme|schemes|yojana|yojanas)\b/gi, " ")
    .replace(/\b(eligible|eligibility|qualify|qualification|document|documents|paper|papers|required|apply|application|process|how to apply|register)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const buildClarification = (village) => ({
  village: village
    ? {
        id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
      }
    : null,
  question: "Who should I find schemes for?",
  options: [
    { label: "Students", query: "Show schemes for students" },
    { label: "Farmers", query: "Show farmer schemes" },
    { label: "Women", query: "Show women welfare schemes" },
    { label: "Pension", query: "Show pension schemes" },
  ],
});

const buildSchemeSelection = (village, detailType, schemes) => ({
  village: village
    ? {
        id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
      }
    : null,
  detailType,
  question:
    detailType === "documents"
      ? "Which scheme do you need documents for?"
      : detailType === "application"
      ? "Which scheme do you want to apply for?"
      : "Which scheme do you want eligibility for?",
  options: schemes.slice(0, 4).map((scheme) => ({
    label: scheme.title,
    query:
      detailType === "documents"
        ? `What documents are required for ${scheme.title}?`
        : detailType === "application"
        ? `How can I apply for ${scheme.title}?`
        : `Am I eligible for ${scheme.title}?`,
  })),
});

const normalizeScheme = (scheme) => ({
  id: scheme._id,
  title: scheme.title,
  shortDescription: scheme.shortDescription || "",
  description: scheme.description || "",
  benefits: scheme.benefits || "",
  eligibility: scheme.eligibility || "",
  documents: scheme.documents || [],
  applicationSteps: scheme.applicationSteps || [],
  level: scheme.level,
  category: scheme.category || [],
  beneficiary: scheme.beneficiary,
  amount: scheme.amount,
  sourceUrl: scheme.sourceUrl || "",
  state: scheme.state || "Unknown",
  verificationStatus: scheme.verificationStatus || "needs_verification",
  score: scheme._assistantScore || 0,
});

const isVillageOwnedScheme = (scheme, villageId) =>
  scheme.scope === "village" &&
  scheme.village?.toString() === villageId?.toString();

const buildSchemeScopeFilter = (villageId, villageSchemeIds = []) =>
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
      };

const buildSchemeSearchQuery = ({
  villageId,
  villageState,
  villageSchemeIds,
  queryFilter,
  includeState,
}) => {
  const filters = [buildSchemeScopeFilter(villageId, villageSchemeIds)];

  if (includeState && villageState) {
    filters.push({
      $or: [
        { level: "Central" },
        { state: new RegExp(`^${escapeRegex(villageState)}$`, "i") },
        { state: "Unknown" },
        { state: "All India" },
      ],
    });
  }

  return {
    status: "active",
    ...queryFilter,
    $and: filters,
  };
};

const getVillagePrioritySchemes = async (villageId, villageSchemeIds = []) =>
  Scheme.find({
    status: "active",
    $or: [
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
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

const schemeMatchesTerms = (scheme, terms = []) => {
  if (!terms.length) return true;

  const text = [
    scheme.title,
    scheme.shortDescription,
    scheme.description,
    scheme.benefits,
    scheme.eligibility,
    scheme.beneficiary,
    ...(scheme.category || []),
    ...(scheme.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.some((term) => text.includes(normalizeValue(term)));
};

const searchSchemes = async (message, villageId, limit = 4) => {
  const page = getRequestedPage(message);
  const offset = (page - 1) * limit;
  const detailType = getDetailType(message);
  const detailSearchMessage = stripDetailTerms(message);
  const searchMessage = detailType && detailSearchMessage ? detailSearchMessage : stripPageToken(message);
  const village = await Village.findById(villageId).lean();
  const villageState = village?.state || "";
  const profile = getSchemeProfile(searchMessage);
  const queryTerms = getQueryTerms(searchMessage);

  const villageMappings = await VillageScheme.find({
    villageId,
    isActive: true,
  })
    .limit(200)
    .lean();

  const mappedIds = new Set(villageMappings.map((mapping) => mapping.schemeId?.toString()));
  const villageSchemeIds = Array.from(mappedIds).filter(Boolean);
  const villagePrioritySchemes = await getVillagePrioritySchemes(villageId, villageSchemeIds);

  if (detailType && !detailSearchMessage) {
    return {
      schemes: [],
      clarification: buildSchemeSelection(village, detailType, villagePrioritySchemes),
      detailType,
      page,
      hasMore: false,
    };
  }

  if (isBroadSchemeQuery(searchMessage) && !profile) {
    if (villagePrioritySchemes.length) {
      const pageItems = villagePrioritySchemes.slice(offset, offset + limit);

      return {
        schemes: pageItems.map((scheme) =>
          normalizeScheme({
            ...scheme,
            _assistantScore: isVillageOwnedScheme(scheme, villageId) ? 140 : 90,
          })
        ),
        clarification: null,
        village: buildClarification(village).village,
        page,
        hasMore: offset + limit < villagePrioritySchemes.length,
        resultCount: villagePrioritySchemes.length,
        baseQuery: searchMessage,
        detailType,
      };
    }

    return {
      schemes: [],
      clarification: buildClarification(village),
      detailType,
      page,
      hasMore: false,
    };
  }

  const profileTerms = profile ? [...profile.categories, ...profile.beneficiaries] : [];
  const effectiveMessage = [...queryTerms, ...profileTerms].join(" ") || searchMessage;
  const relevantVillageSchemes = villagePrioritySchemes.filter((scheme) =>
    schemeMatchesTerms(scheme, [...queryTerms, ...profileTerms])
  );
  const queryFilter = buildRegexFilter(
    ["title", "description", "shortDescription", "benefits", "eligibility", "category", "tags", "beneficiary"],
    effectiveMessage
  );

  let candidates = await Scheme.find(
    buildSchemeSearchQuery({
      villageId,
      villageState,
      villageSchemeIds,
      queryFilter,
      includeState: true,
    })
  )
    .limit(120)
    .lean();

  if (!candidates.length) {
    candidates = await Scheme.find(
      buildSchemeSearchQuery({
        villageId,
        villageState,
        villageSchemeIds,
        queryFilter,
        includeState: false,
      })
    )
      .limit(120)
      .lean();
  }

  const candidateMap = new Map();
  [...relevantVillageSchemes, ...candidates].forEach((scheme) => {
    candidateMap.set(scheme._id.toString(), scheme);
  });
  candidates = Array.from(candidateMap.values());

  const scored = candidates
    .map((scheme) => {
      const text = [
        scheme.title,
        scheme.shortDescription,
        scheme.description,
        scheme.benefits,
        scheme.eligibility,
        scheme.beneficiary,
        ...(scheme.category || []),
        ...(scheme.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (isVillageOwnedScheme(scheme, villageId)) score += 140;
      if (mappedIds.has(scheme._id.toString())) score += 90;
      if (scheme.verificationStatus === "verified") score += 10;
      if (scheme.level === "Central") score += 8;
      if (villageState && normalizeValue(scheme.state) === normalizeValue(villageState)) score += 30;
      if (profile) {
        profile.categories.forEach((category) => {
          if (text.includes(category)) score += 18;
        });
        profile.beneficiaries.forEach((beneficiary) => {
          if (text.includes(beneficiary)) score += 18;
        });
      }
      queryTerms.forEach((term) => {
        if (normalizeValue(scheme.title).includes(term)) score += 20;
        else if (text.includes(term)) score += 6;
      });

      return { ...scheme, _assistantScore: score };
    })
    .sort((a, b) => b._assistantScore - a._assistantScore || a.title.localeCompare(b.title));

  if (detailType) {
    const normalizedSearch = normalizeForTitleMatch(searchMessage);
    const exactTitle = scored.find((scheme) => {
      const title = normalizeForTitleMatch(scheme.title);
      return (
        title === normalizedSearch ||
        title.includes(normalizedSearch) ||
        normalizedSearch.includes(title)
      );
    });

    const selected = exactTitle || scored[0];
    return {
      schemes: selected ? [normalizeScheme(selected)] : [],
      clarification: selected ? null : buildSchemeSelection(village, detailType, []),
      village: buildClarification(village).village,
      detailType,
      page,
      hasMore: false,
      resultCount: scored.length,
      baseQuery: searchMessage,
    };
  }

  const pageItems = scored.slice(offset, offset + limit);

  return {
    schemes: pageItems.map(normalizeScheme),
    clarification: null,
    village: buildClarification(village).village,
    page,
    hasMore: offset + limit < scored.length,
    resultCount: scored.length,
    baseQuery: searchMessage,
    detailType,
  };
};

const retrieveContext = async ({ message, villageId }) => {
  const sources = {
    workGuides: [],
    schemes: [],
    notices: [],
    weather: null,
    complaints: [],
  };

  const result = await searchSchemes(message, villageId);
  sources.schemes = result.schemes;
  sources.clarification = result.clarification;
  sources.village = result.village || result.clarification?.village || null;
  sources.page = result.page || 1;
  sources.hasMore = Boolean(result.hasMore);
  sources.resultCount = result.resultCount || 0;
  sources.baseQuery = result.baseQuery || message;
  sources.detailType = result.detailType || null;

  return sources;
};

const hasTrustedContext = (sources) =>
  Boolean(sources.schemes?.length || sources.clarification);

module.exports = {
  retrieveContext,
  hasTrustedContext,
};
