const GOVERNMENT_SOURCE_NAME = "myScheme - Government of India";
const GOVERNMENT_SOURCE_URL = "https://www.myscheme.gov.in";
const VILLAGE_SOURCE_NAME = "Participating Gram Panchayat";
const VILLAGE_CUSTOM_SOURCE = "Village Custom Scheme";

const isVillageScheme = (scheme = {}) =>
  scheme.scope === "village" ||
  scheme.source === VILLAGE_CUSTOM_SOURCE ||
  Boolean(scheme.village);

const getSchemeSourceInfo = (scheme = {}) => {
  if (isVillageScheme(scheme)) {
    return {
      sourceType: "village",
      sourceName: VILLAGE_SOURCE_NAME,
      sourceUrl: null,
      disclaimer:
        "This scheme information is provided and maintained by the respective Gram Panchayat through GramVartha.",
    };
  }

  return {
    sourceType: "government",
    sourceName: GOVERNMENT_SOURCE_NAME,
    sourceUrl: scheme.sourceUrl || GOVERNMENT_SOURCE_URL,
    disclaimer:
      "GramVartha is not a government app. Scheme information is for awareness only. Please verify eligibility, benefits, documents, and application steps from the official myScheme portal before applying.",
  };
};

const normalizeSchemeSourceFields = (scheme = {}) => {
  const sourceInfo = getSchemeSourceInfo(scheme);

  if (sourceInfo.sourceType === "village") {
    return {
      ...scheme,
      source: VILLAGE_SOURCE_NAME,
      sourceUrl: null,
      verificationStatus: "panchayat_provided",
      sourceInfo,
    };
  }

  return {
    ...scheme,
    source: scheme.sourceUrl ? scheme.source || GOVERNMENT_SOURCE_NAME : GOVERNMENT_SOURCE_NAME,
    sourceUrl: scheme.sourceUrl || GOVERNMENT_SOURCE_URL,
    verificationStatus: scheme.sourceUrl
      ? scheme.verificationStatus || "needs_user_verification"
      : "needs_user_verification",
    sourceInfo,
  };
};

module.exports = {
  GOVERNMENT_SOURCE_NAME,
  GOVERNMENT_SOURCE_URL,
  VILLAGE_SOURCE_NAME,
  VILLAGE_CUSTOM_SOURCE,
  getSchemeSourceInfo,
  isVillageScheme,
  normalizeSchemeSourceFields,
};
