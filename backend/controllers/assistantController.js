const mongoose = require("mongoose");

const { retrieveContext, hasTrustedContext } = require("../services/assistant/retrievalService");
const { buildAssistantPrompt } = require("../services/assistant/promptBuilder");
const { summarizeWithAI } = require("../services/assistant/aiService");
const { GOVERNMENT_SOURCE_NAME, GOVERNMENT_SOURCE_URL } = require("../services/schemeSourceInfo");
const {
  NOT_AVAILABLE,
  buildFallbackAnswer,
  buildUnavailableAnswer,
} = require("../services/assistant/fallbackAnswerBuilder");

const sanitizeSources = (sources) => ({
  schemes: sources.schemes || [],
  workGuides: [],
  notices: [],
  weather: null,
  village: sources.village || null,
  clarification: sources.clarification || null,
  page: sources.page || 1,
  hasMore: Boolean(sources.hasMore),
  resultCount: sources.resultCount || 0,
  baseQuery: sources.baseQuery || "",
  detailType: sources.detailType || null,
});

const ASSISTANT_DISCLAIMER =
  "GramVartha is not a government app and is not affiliated with, endorsed by, authorized by, or representing any government entity. Scheme information is for awareness only. Please verify details from the official source or concerned department before applying.";

const getAssistantSourceInfo = (sources = {}) => {
  const schemeSources = (sources.schemes || [])
    .map((scheme) => scheme.sourceInfo)
    .filter(Boolean);

  return (
    schemeSources[0] || {
      sourceType: "government",
      sourceName: GOVERNMENT_SOURCE_NAME,
      sourceUrl: GOVERNMENT_SOURCE_URL,
      disclaimer:
        "GramVartha is not a government app. Scheme information is for awareness only. Please verify details from the official myScheme portal before applying.",
    }
  );
};

const getAssistantSchemeSources = (sources = {}) =>
  (sources.schemes || []).map((scheme) => ({
    schemeId: scheme.id,
    schemeTitle: scheme.title,
    ...(scheme.sourceInfo || getAssistantSourceInfo({ schemes: [scheme] })),
  }));

const allowedCardTypes = new Set([
  "documents",
  "process",
  "scheme",
]);

const sanitizeAssistantAnswer = (answer = {}) => ({
  type: "smart_assistance",
  intent: "scheme",
  title: answer.title || "Scheme Assistance",
  summary: answer.summary || NOT_AVAILABLE,
  cards: Array.isArray(answer.cards)
    ? answer.cards
        .filter((card) => card?.title && allowedCardTypes.has(card.type))
        .map((card) => ({
          type: card.type,
          title: String(card.title),
          subtitle: card.subtitle ? String(card.subtitle) : "",
          items: Array.isArray(card.items) ? card.items.filter(Boolean).map(String) : [],
        }))
    : [],
  sections: Array.isArray(answer.sections)
    ? answer.sections
        .filter((section) => section?.title && Array.isArray(section.items))
        .map((section) => ({
          title: String(section.title),
          items: section.items.filter(Boolean).map(String),
        }))
    : [],
  suggestions: Array.isArray(answer.suggestions)
    ? answer.suggestions
        .filter((suggestion) => suggestion?.label && suggestion?.query)
        .map((suggestion) => ({
          label: String(suggestion.label),
          query: String(suggestion.query),
        }))
        .slice(0, 4)
    : [],
  sourceInfo: answer.sourceInfo || null,
  schemeSources: Array.isArray(answer.schemeSources) ? answer.schemeSources : [],
  disclaimer: answer.disclaimer || ASSISTANT_DISCLAIMER,
});

const chatWithAssistant = async (req, res) => {
  try {
    const { message, villageId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    if (!villageId || !mongoose.Types.ObjectId.isValid(villageId)) {
      return res.status(400).json({
        success: false,
        message: "valid villageId is required",
      });
    }

    const intent = "scheme";
    const sources = await retrieveContext({
      message: message.trim(),
      villageId,
    });

    if (!hasTrustedContext(sources)) {
      const unavailableAnswer = sanitizeAssistantAnswer({
        ...buildUnavailableAnswer(),
        sourceInfo: getAssistantSourceInfo(sources),
        schemeSources: [],
        disclaimer: ASSISTANT_DISCLAIMER,
      });

      return res.status(200).json({
        success: true,
        ...unavailableAnswer,
        sources: sanitizeSources(sources),
      });
    }

    let assistantAnswer = buildFallbackAnswer({
      sources,
    });

    try {
      const prompt = buildAssistantPrompt({ message, intent, sources });
      const aiSummary = await summarizeWithAI(prompt);
      if (!sources.clarification && !sources.detailType && aiSummary?.answer && aiSummary.answer !== NOT_AVAILABLE) {
        assistantAnswer.summary = aiSummary.answer;
      }
    } catch (error) {
      console.error("[assistant ai summary skipped]", error.message);
    }

    const safeAnswer = sanitizeAssistantAnswer({
      ...assistantAnswer,
      sourceInfo: getAssistantSourceInfo(sources),
      schemeSources: getAssistantSchemeSources(sources),
      disclaimer: ASSISTANT_DISCLAIMER,
    });

    return res.status(200).json({
      success: true,
      ...safeAnswer,
      sources: sanitizeSources(sources),
    });
  } catch (error) {
    console.error("[chatWithAssistant]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process assistant request",
    });
  }
};

module.exports = {
  chatWithAssistant,
};
