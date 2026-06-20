const NOT_AVAILABLE = "Information not available in GramVartha records.";

const compact = (values = []) => values.filter(Boolean);

const createCard = ({ type, title, subtitle = "", items = [] }) => ({
  type,
  title,
  subtitle,
  items: compact(items).map(String),
});

const createSuggestion = (label, query) => ({ label, query });

const nextPageQuery = (sources) => {
  const baseQuery = (sources.baseQuery || "Show government schemes")
    .replace(/\bpage\s*\d+\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return `${baseQuery || "Show government schemes"} page ${(sources.page || 1) + 1}`;
};

const buildUnavailableAnswer = () => ({
  type: "smart_assistance",
  intent: "scheme",
  title: "Scheme Information Not Available",
  summary: NOT_AVAILABLE,
  cards: [],
  sections: [],
  suggestions: [
    createSuggestion("All Schemes", "Show government schemes"),
    createSuggestion("Student Schemes", "Show schemes for students"),
    createSuggestion("Women Schemes", "Show women welfare schemes"),
    createSuggestion("Farmer Schemes", "Show farmer schemes"),
  ],
});

const buildClarificationAnswer = (clarification) => ({
  type: "smart_assistance",
  intent: "scheme",
  title: clarification?.detailType ? "Select Scheme" : "Find The Right Scheme",
  summary: clarification?.detailType
    ? "Please choose the scheme first so I can show only the requested information."
    : clarification?.village?.state
    ? `I will search schemes relevant to ${clarification.village.state}. First choose who the scheme is for.`
    : "First choose who the scheme is for so I can show more relevant results.",
  cards: [
    createCard({
      type: "process",
      title: clarification?.question || "Who should I find schemes for?",
      subtitle: "Choose one option",
      items: (clarification?.options?.length ? clarification.options : [{ label: "Type the scheme name" }]).map((option) => option.label),
    }),
  ],
  sections: [],
  suggestions: clarification?.options?.length
    ? clarification.options
    : [
        createSuggestion("Students", "Show schemes for students"),
        createSuggestion("Farmers", "Show farmer schemes"),
        createSuggestion("Women", "Show women welfare schemes"),
        createSuggestion("Pension", "Show pension schemes"),
      ],
});

const buildFocusedDetailAnswer = (scheme, detailType) => {
  const detailConfig = {
    eligibility: {
      title: `${scheme.title} Eligibility`,
      summary: "Eligibility details available in GramVartha records.",
      cardTitle: "Eligibility",
      items: compact([scheme.eligibility]),
      missing: "Eligibility information is not available for this scheme.",
      suggestions: [
        createSuggestion("Documents", `What documents are required for ${scheme.title}?`),
        createSuggestion("How To Apply", `How can I apply for ${scheme.title}?`),
      ],
    },
    documents: {
      title: `${scheme.title} Documents`,
      summary: "Required documents available in GramVartha records.",
      cardTitle: "Required Documents",
      items: scheme.documents || [],
      missing: "Document information is not available for this scheme.",
      suggestions: [
        createSuggestion("Eligibility", `Am I eligible for ${scheme.title}?`),
        createSuggestion("How To Apply", `How can I apply for ${scheme.title}?`),
      ],
    },
    application: {
      title: `${scheme.title} Application Process`,
      summary: "Application steps available in GramVartha records.",
      cardTitle: "Application Process",
      items: scheme.applicationSteps || [],
      missing: "Application process is not available for this scheme.",
      suggestions: [
        createSuggestion("Eligibility", `Am I eligible for ${scheme.title}?`),
        createSuggestion("Documents", `What documents are required for ${scheme.title}?`),
      ],
    },
  };

  const config = detailConfig[detailType];
  if (!config) return null;

  return {
    type: "smart_assistance",
    intent: "scheme",
    title: config.title,
    summary: config.items.length ? config.summary : config.missing,
    cards: config.items.length
      ? [
          createCard({
            type: detailType === "documents" ? "documents" : "process",
            title: config.cardTitle,
            subtitle: scheme.title,
            items: config.items,
          }),
        ]
      : [],
    sections: [],
    suggestions: [
      ...config.suggestions,
      createSuggestion("More Schemes", "Show government schemes"),
    ].slice(0, 4),
  };
};

const formatAmount = (amount) => {
  if (!amount) return "";
  return `Benefit: Rs. ${amount}`;
};

const buildSchemeCard = (scheme) =>
  createCard({
    type: "scheme",
    title: scheme.title,
    subtitle: formatAmount(scheme.amount) || [scheme.level, scheme.state].filter(Boolean).join(" - ") || "Government Scheme",
    items: compact([
      scheme.shortDescription,
      scheme.state && scheme.state !== "Unknown" && `State: ${scheme.state}`,
      scheme.level && `Level: ${scheme.level}`,
      scheme.benefits && `Benefit: ${scheme.benefits}`,
      scheme.eligibility && `Eligibility: ${scheme.eligibility}`,
      scheme.applicationSteps?.[0] && `Apply: ${scheme.applicationSteps[0]}`,
    ]),
  });

const buildFallbackAnswer = ({ sources }) => {
  if (sources.clarification) return buildClarificationAnswer(sources.clarification);

  const schemes = sources.schemes || [];
  if (!schemes.length) return buildUnavailableAnswer();

  if (sources.detailType) {
    const focusedAnswer = buildFocusedDetailAnswer(schemes[0], sources.detailType);
    if (focusedAnswer) return focusedAnswer;
  }

  const cards = schemes.slice(0, 4).map(buildSchemeCard);

  return {
    type: "smart_assistance",
    intent: "scheme",
    title: "Scheme Assistance",
    summary: sources.village?.state
      ? `Showing page ${sources.page || 1} of relevant schemes for ${sources.village.state}.`
      : `Showing page ${sources.page || 1} of matching schemes in GramVartha records.`,
    cards,
    sections: [],
    suggestions: [
      createSuggestion("Check Eligibility", "eligibility"),
      createSuggestion("Required Documents", "documents"),
      createSuggestion("How To Apply", "how to apply"),
      sources.hasMore
        ? createSuggestion("More Schemes", nextPageQuery(sources))
        : createSuggestion("New Search", "Show government schemes"),
    ],
  };
};

module.exports = {
  NOT_AVAILABLE,
  buildFallbackAnswer,
  buildUnavailableAnswer,
};
