const axios = require("axios");
const AppError = require("../../utils/appError");
const {
  irrigationScore,
  irrigationAdvice,
  soilMoistureEstimate,
  evaporationIndex,
  diseaseRisk,
  sprayAdvice,
  isRainExpectedInNextHours,
  buildInsights,
} = require("./farming.engine");

const TEN_MINUTES_MS = 10 * 60 * 1000;
const WEATHER_TIMEOUT_MS = Number(process.env.OPENWEATHER_TIMEOUT_MS || 8000);
const FARMING_CACHE = new Map();

const buildForecastUrl = ({ lat, lon, apiKey }) =>
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

const cacheKey = ({ lat, lon, crop, soilType }) =>
  `${lat.toFixed(4)}:${lon.toFixed(4)}:${crop || "na"}:${soilType || "na"}`;

function getCachedValue(key) {
  const cached = FARMING_CACHE.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    FARMING_CACHE.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedValue(key, data) {
  FARMING_CACHE.set(key, { data, expiresAt: Date.now() + TEN_MINUTES_MS });
}

function transformForecastPayload(payload) {
  const list = Array.isArray(payload?.list) ? payload.list : [];
  const currentSlot = list[0] || {};
  const next12HourForecast = list.slice(0, 4);

  const temp = Number(currentSlot?.main?.temp) || 0;
  const humidity = Number(currentSlot?.main?.humidity) || 0;
  const rainProb = Math.round((Number(currentSlot?.pop) || 0) * 100);
  const rainMM = Number(currentSlot?.rain?.["3h"]) || 0;
  const windSpeedKmH = (Number(currentSlot?.wind?.speed) || 0) * 3.6;

  return {
    base: {
      temp,
      humidity,
      rainProb,
      rainMM,
      windSpeed: Number(windSpeedKmH.toFixed(2)),
    },
    forecastList: next12HourForecast,
  };
}

function buildIrrigationMessage(advice) {
  if (advice === "DELAY_WATERING") {
    return "Rain is likely soon. Wait before irrigating to save water and prevent overwatering.";
  }
  if (advice === "WATER_REQUIRED") {
    return "Your crop is likely losing moisture quickly. Plan irrigation today.";
  }
  if (advice === "LIGHT_WATERING") {
    return "Field conditions are borderline dry. Use light, controlled watering.";
  }
  return "Current moisture conditions are acceptable. Skip irrigation for now.";
}

function buildSprayMessage(spraying) {
  if (spraying === "AVOID_SPRAY") {
    return "Wind is strong right now. Spraying may drift and waste chemicals.";
  }
  return "Wind conditions are stable. Spraying can be done safely with normal care.";
}

function buildDiseaseMessage(disease) {
  if (disease === "HIGH") {
    return "Disease pressure is high. Inspect leaves and stems closely today.";
  }
  if (disease === "MEDIUM") {
    return "Disease risk is moderate. Keep regular monitoring and preventive care.";
  }
  return "Disease risk is low under current weather conditions.";
}

function buildHumanAdvisor({
  crop,
  soilType,
  irrigation,
  spraying,
  disease,
  evaporation,
  soilMoisture,
  rainExpectedSoon,
}) {
  const cropName = crop || "your crop";
  const soilName = soilType || "your soil";
  const whenToWater =
    irrigation === "WATER_REQUIRED"
      ? "Water in early morning (5:30-8:00 AM) or evening (5:30-7:00 PM)."
      : "Recheck field moisture in the evening before taking action.";

  const immediateAction =
    irrigation === "DELAY_WATERING"
      ? "Wait for expected rain before irrigating."
      : irrigation === "WATER_REQUIRED"
      ? "Start planned irrigation today."
      : irrigation === "LIGHT_WATERING"
      ? "Give light irrigation only in dry patches."
      : "Skip irrigation for now.";

  const avoidAction =
    spraying === "AVOID_SPRAY"
      ? "Avoid spraying now due to wind drift risk."
      : "Avoid over-spraying; use recommended dose only.";

  const nextCheck =
    disease === "HIGH"
      ? "Inspect lower leaf surface and stem base within 12 hours."
      : disease === "MEDIUM"
      ? "Inspect crop once in the next 24 hours."
      : "Routine crop check by tomorrow morning is enough.";

  const reason = [
    `Humidity is ${soilMoisture === "DRY" ? "supporting moisture loss" : "moderate to high"}.`,
    rainExpectedSoon
      ? "Forecast indicates rain soon."
      : "No significant rain is forecast soon.",
    evaporation === "HIGH"
      ? "Evaporation rate is high, so water loss will be faster."
      : "Evaporation pressure is manageable.",
  ];

  return {
    headline: `Advice for ${cropName} on ${soilName} soil`,
    summary: buildIrrigationMessage(irrigation),
    todayPlan: {
      immediateAction,
      timing: whenToWater,
      avoidAction,
      nextCheck,
    },
    reasons: reason,
    doNow: [
      irrigation === "DO_NOT_WATER" || irrigation === "DELAY_WATERING"
        ? "Do not irrigate immediately."
        : "Schedule irrigation in cooler hours (early morning or evening).",
      spraying === "AVOID_SPRAY"
        ? "Postpone spraying until wind speed drops."
        : "If spraying today, keep nozzle pressure controlled to reduce drift.",
    ],
    caution: buildSprayMessage(spraying),
    diseaseNote: buildDiseaseMessage(disease),
    waterManagement:
      evaporation === "HIGH"
        ? "Evaporation is high, prefer short and efficient irrigation cycles."
        : "Evaporation is manageable, continue with planned irrigation intervals.",
  };
}

function generateAdvice({ weatherData, crop, soilType }) {
  const decisionInput = {
    ...weatherData.base,
    crop,
    soilType,
  };

  const score = irrigationScore(decisionInput);
  let irrigation = irrigationAdvice(score);
  const rainExpectedSoon = isRainExpectedInNextHours(weatherData.forecastList, 6);

  if (rainExpectedSoon) {
    irrigation = "DELAY_WATERING";
  }

  const spraying = sprayAdvice(decisionInput);
  const evaporation = evaporationIndex(decisionInput);
  const soilMoisture = soilMoistureEstimate(decisionInput);
  const disease = diseaseRisk(decisionInput);
  const advisor = buildHumanAdvisor({
    crop,
    soilType,
    irrigation,
    spraying,
    disease,
    evaporation,
    soilMoisture,
    rainExpectedSoon,
  });

  return {
    irrigation: {
      advice: irrigation,
      score,
    },
    spraying,
    metrics: {
      soilMoisture,
      evaporation,
      diseaseRisk: disease,
    },
    advisor,
    insights: buildInsights({
      evaporation,
      rainExpectedSoon,
      spray: spraying,
      windSpeed: decisionInput.windSpeed,
    }),
  };
}

async function getFarmingAdvice(
  { lat, lon, crop, soilType },
  dependencies = { httpClient: axios }
) {
  const apiKey = (process.env.OPENWEATHER_API_KEY || "").trim();
  if (!apiKey) {
    throw new AppError("OPENWEATHER_API_KEY is not configured", 500);
  }

  const key = cacheKey({ lat, lon, crop, soilType });
  const cached = getCachedValue(key);
  if (cached) return cached;

  try {
    const response = await dependencies.httpClient.get(
      buildForecastUrl({ lat, lon, apiKey }),
      { timeout: WEATHER_TIMEOUT_MS }
    );

    const weatherData = transformForecastPayload(response?.data || {});
    const advice = generateAdvice({ weatherData, crop, soilType });
    setCachedValue(key, advice);
    return advice;
  } catch (error) {
    if (error?.code === "ECONNABORTED") {
      throw new AppError("Weather provider timeout. Please try again.", 504);
    }

    if (error?.response?.status === 401) {
      throw new AppError(
        "OpenWeather authentication failed. Verify OPENWEATHER_API_KEY.",
        502,
        process.env.NODE_ENV === "development"
          ? { providerError: error.message }
          : null
      );
    }

    throw new AppError(
      "Unable to fetch farming weather data from provider",
      502,
      process.env.NODE_ENV === "development"
        ? { providerError: error.message }
        : null
    );
  }
}

module.exports = {
  getFarmingAdvice,
  transformForecastPayload,
  generateAdvice,
  __cache: FARMING_CACHE,
};
