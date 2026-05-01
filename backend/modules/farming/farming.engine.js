const { CROP_CONFIG } = require("./farming.constants");

function irrigationScore(data) {
  const { temp, humidity, rainProb, rainMM, windSpeed, crop } = data;
  let score = 0;

  if (temp > 35) score += 2;
  if (humidity < 40) score += 2;
  if (windSpeed > 10) score += 1;
  if (rainProb > 60) score -= 3;
  if (rainMM > 5) score -= 4;

  const cropAdjustment = CROP_CONFIG[crop]?.waterNeed || 0;
  score += cropAdjustment;

  return score;
}

function irrigationAdvice(score) {
  if (score >= 3) return "WATER_REQUIRED";
  if (score >= 1 && score <= 2) return "LIGHT_WATERING";
  return "DO_NOT_WATER";
}

function soilMoistureEstimate(data) {
  if (data.rainMM > 10) return "WET";
  if (data.rainMM > 3) return "MODERATE";
  return "DRY";
}

function evaporationIndex(data) {
  if (data.temp > 35 && data.humidity < 40) return "HIGH";
  if (data.temp > 28) return "MEDIUM";
  return "LOW";
}

function diseaseRisk(data) {
  const withinCriticalTemp = data.temp >= 20 && data.temp <= 30;
  if (data.humidity > 80 && withinCriticalTemp) return "HIGH";
  if (data.humidity > 60) return "MEDIUM";
  return "LOW";
}

function sprayAdvice(data) {
  return data.windSpeed > 15 ? "AVOID_SPRAY" : "SAFE_TO_SPRAY";
}

function isRainExpectedInNextHours(forecastList = [], hours = 6) {
  const limitMs = hours * 60 * 60 * 1000;
  const now = Date.now();

  return forecastList.some((item) => {
    const itemTimeMs = Number(item.dt) * 1000;
    const withinWindow = itemTimeMs - now <= limitMs && itemTimeMs >= now;
    const pop = Math.round((Number(item.pop) || 0) * 100);
    const rainMM = Number(item?.rain?.["3h"]) || 0;

    return withinWindow && (pop > 60 || rainMM > 0);
  });
}

function buildInsights({ evaporation, rainExpectedSoon, spray, windSpeed }) {
  const insights = [];

  if (evaporation === "HIGH") insights.push("High evaporation detected");
  if (rainExpectedSoon) insights.push("Rain expected in the next 6 hours");
  if (!rainExpectedSoon) insights.push("No rain expected");
  if (spray === "AVOID_SPRAY")
    insights.push("Wind is strong, avoid spraying");
  if (spray === "SAFE_TO_SPRAY" && windSpeed <= 15)
    insights.push("Wind conditions are suitable for spraying");

  return insights;
}

module.exports = {
  irrigationScore,
  irrigationAdvice,
  soilMoistureEstimate,
  evaporationIndex,
  diseaseRisk,
  sprayAdvice,
  isRainExpectedInNextHours,
  buildInsights,
};
