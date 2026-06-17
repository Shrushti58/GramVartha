const buildBasicWeatherAdvice = (weatherData) => {
  const next24Hours = weatherData.list.slice(0, 8);

  let totalRain = 0;
  let maxWind = 0;
  let maxTemp = 0;
  let avgHumidity = 0;

  next24Hours.forEach((item) => {
    totalRain += item.rain?.["3h"] || 0;
    maxWind = Math.max(maxWind, item.wind?.speed || 0);
    maxTemp = Math.max(maxTemp, item.main?.temp || 0);
    avgHumidity += item.main?.humidity || 0;
  });

  avgHumidity = avgHumidity / next24Hours.length;
  const windKmph = maxWind * 3.6;

  return {
    title: "Today's Weather",
    summary:
      totalRain >= 2
        ? "Rain is expected today. Be careful with irrigation and spraying."
        : "Weather looks normal for farm work today.",

    stats: [
      {
        label: "Temperature",
        value: `${maxTemp.toFixed(1)}°C`,
        icon: "🌡️",
      },
      {
        label: "Rain",
        value: `${totalRain.toFixed(1)} mm`,
        icon: "🌧️",
      },
      {
        label: "Wind",
        value: `${windKmph.toFixed(1)} km/h`,
        icon: "💨",
      },
      {
        label: "Humidity",
        value: `${avgHumidity.toFixed(0)}%`,
        icon: "💧",
      },
    ],

    quickAdvice: [
      {
        title: "Irrigation",
        answer: totalRain >= 2 ? "Avoid today" : "Can irrigate if needed",
        icon: "💧",
      },
      {
        title: "Spraying",
        answer: totalRain >= 1 || windKmph >= 20 ? "Avoid today" : "Suitable today",
        icon: "🌿",
      },
    ],

    updatedAt: new Date(),
  };
};

const buildCropWeatherAdvice = (weatherData, farmerInput) => {
  const { crop, stage, soil, lastIrrigationDays } = farmerInput;

  const next24Hours = weatherData.list.slice(0, 8);

  let totalRain = 0;
  let maxWind = 0;
  let maxTemp = 0;
  let avgHumidity = 0;

  next24Hours.forEach((item) => {
    totalRain += item.rain?.["3h"] || 0;
    maxWind = Math.max(maxWind, item.wind?.speed || 0);
    maxTemp = Math.max(maxTemp, item.main?.temp || 0);
    avgHumidity += item.main?.humidity || 0;
  });

  avgHumidity = avgHumidity / next24Hours.length;
  const windKmph = maxWind * 3.6;

  let irrigation;
  let spraying;
  let fertilizer;

  if (totalRain >= 2) {
    irrigation = {
      decision: "avoid",
      title: "Irrigation",
      message: "Avoid irrigation today because rainfall is expected.",
    };
  } else if (lastIrrigationDays >= 4 && maxTemp >= 32) {
    irrigation = {
      decision: "recommended",
      title: "Irrigation",
      message:
        "Irrigation is recommended because temperature is high and the crop was not irrigated recently.",
    };
  } else {
    irrigation = {
      decision: "optional",
      title: "Irrigation",
      message: "Irrigation is optional today. Check soil moisture before watering.",
    };
  }

  if (totalRain >= 1 || windKmph >= 20) {
    spraying = {
      decision: "avoid",
      title: "Spraying",
      message:
        "Avoid spraying today because rain or strong wind may reduce spray effectiveness.",
    };
  } else {
    spraying = {
      decision: "suitable",
      title: "Spraying",
      message: "Spraying is suitable today. Prefer early morning or evening.",
    };
  }

  if (totalRain >= 2) {
    fertilizer = {
      decision: "delay",
      title: "Fertilizer",
      message:
        "Delay fertilizer application because rainfall may wash away nutrients.",
    };
  } else {
    fertilizer = {
      decision: "suitable",
      title: "Fertilizer",
      message: "Fertilizer application is suitable if soil condition is proper.",
    };
  }

  return {
    title: "Detailed Crop Advisory",
    crop,
    stage,
    soil,
    summary: `Advisory generated for ${crop} at ${stage} stage.`,
    weather: {
      rainNext24HoursMM: Number(totalRain.toFixed(1)),
      maxWindKmph: Number(windKmph.toFixed(1)),
      maxTemperatureC: Number(maxTemp.toFixed(1)),
      averageHumidity: Number(avgHumidity.toFixed(0)),
    },
    advice: [irrigation, spraying, fertilizer],
    note: "This advisory is based on weather forecast and farmer inputs. For critical decisions, consult a local agriculture officer.",
    updatedAt: new Date(),
  };
};

module.exports = {
  buildBasicWeatherAdvice,
  buildCropWeatherAdvice,
};