const axios = require("axios");
const Village = require("../models/Village");

const {
  buildBasicWeatherAdvice,
  buildCropWeatherAdvice,
} = require("../service/weatherAdvisoryService");

const fetchVillageWeather = async (villageId) => {
  const village = await Village.findById(villageId);

  if (!village) {
    const error = new Error("Village not found");
    error.statusCode = 404;
    throw error;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    const error = new Error("OPENWEATHER_API_KEY is missing");
    error.statusCode = 500;
    throw error;
  }

  const weatherRes = await axios.get(
    "https://api.openweathermap.org/data/2.5/forecast",
    {
      params: {
        lat: village.latitude,
        lon: village.longitude,
        appid: apiKey,
        units: "metric",
      },
    }
  );

  return {
    village,
    weatherData: weatherRes.data,
  };
};

const getBasicWeatherAdvice = async (req, res) => {
  try {
    const { villageId } = req.params;

    const { village, weatherData } = await fetchVillageWeather(villageId);

    const advice = buildBasicWeatherAdvice(weatherData);

    return res.status(200).json({
      success: true,
      village: {
        id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
      },
      data: advice,
    });
  } catch (err) {
    console.error("[getBasicWeatherAdvice]", err.response?.data || err.message);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch weather advice",
    });
  }
};

const getCropWeatherAdvice = async (req, res) => {
  try {
    const { villageId } = req.params;

    const {
      crop,
      stage,
      soil = "medium",
      lastIrrigationDays = 0,
    } = req.query;

    if (!crop || !stage) {
      return res.status(400).json({
        success: false,
        message: "crop and stage are required",
      });
    }

    const { village, weatherData } = await fetchVillageWeather(villageId);

    const advice = buildCropWeatherAdvice(weatherData, {
      crop,
      stage,
      soil,
      lastIrrigationDays: Number(lastIrrigationDays),
    });

    return res.status(200).json({
      success: true,
      village: {
        id: village._id,
        name: village.name,
        district: village.district,
        state: village.state,
      },
      data: advice,
    });
  } catch (err) {
    console.error("[getCropWeatherAdvice]", err.response?.data || err.message);

    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to generate crop advisory",
    });
  }
};

module.exports = {
  getBasicWeatherAdvice,
  getCropWeatherAdvice,
};