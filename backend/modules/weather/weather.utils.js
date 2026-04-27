const ADVICE_CODE = {
  DO_NOT_WATER: "DO_NOT_WATER",
  WATER_REQUIRED: "WATER_REQUIRED",
  LIGHT_WATERING: "LIGHT_WATERING",
  NORMAL_WATERING: "NORMAL_WATERING",
};

const ADVICE_MESSAGE = {
  [ADVICE_CODE.DO_NOT_WATER]:
    "Rain is likely soon, avoid watering to prevent overwatering.",
  [ADVICE_CODE.WATER_REQUIRED]:
    "Hot and dry conditions detected, irrigation is required.",
  [ADVICE_CODE.LIGHT_WATERING]:
    "Humidity is already high, use light watering only.",
  [ADVICE_CODE.NORMAL_WATERING]:
    "Normal conditions detected, follow your regular watering plan.",
};

function getWaterAdvice({ temp, humidity, rainProb, rainMM, month }) {
  const isMonsoonMonth = month >= 6 && month <= 9;

  if ((rainProb > 70 || rainMM > 5) || (isMonsoonMonth && rainProb > 60)) {
    return ADVICE_CODE.DO_NOT_WATER;
  }

  if (temp > 35 && humidity < 40) {
    return ADVICE_CODE.WATER_REQUIRED;
  }

  if (humidity > 80) {
    return ADVICE_CODE.LIGHT_WATERING;
  }

  return ADVICE_CODE.NORMAL_WATERING;
}

function getAdviceMessage(adviceCode) {
  return ADVICE_MESSAGE[adviceCode] || "Follow standard irrigation practices.";
}

module.exports = {
  ADVICE_CODE,
  getWaterAdvice,
  getAdviceMessage,
};
