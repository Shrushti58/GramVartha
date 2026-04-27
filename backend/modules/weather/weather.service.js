const axios = require("axios");
const AppError = require("../../utils/appError");
const { getWaterAdvice, getAdviceMessage } = require("./weather.utils");

const TEN_MINUTES_MS = 10 * 60 * 1000;
const WEATHER_TIMEOUT_MS = Number(process.env.OPENWEATHER_TIMEOUT_MS || 8000);
const WEATHER_CACHE = new Map();

const getCacheKey = (lat, lon) => `${lat.toFixed(4)}:${lon.toFixed(4)}`;

const getCachedAdvice = (cacheKey) => {
  const cachedEntry = WEATHER_CACHE.get(cacheKey);
  if (!cachedEntry) return null;

  if (Date.now() > cachedEntry.expiresAt) {
    WEATHER_CACHE.delete(cacheKey);
    return null;
  }

  return cachedEntry.data;
};

const setCachedAdvice = (cacheKey, data) => {
  WEATHER_CACHE.set(cacheKey, {
    data,
    expiresAt: Date.now() + TEN_MINUTES_MS,
  });
};

const buildOneCallUrl = ({ lat, lon, apiKey }) =>
  `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&appid=${apiKey}`;

const buildCurrentWeatherUrl = ({ lat, lon, apiKey }) =>
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

const buildForecastUrl = ({ lat, lon, apiKey }) =>
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=1&appid=${apiKey}`;

const parseOneCallWeather = (payload) => {
  const current = payload?.current || {};
  const firstHourly = payload?.hourly?.[0] || {};
  const rainVolume =
    Number(firstHourly?.rain?.["1h"]) || Number(current?.rain?.["1h"]) || 0;

  return {
    temp: Number(current?.temp) || 0,
    humidity: Number(current?.humidity) || 0,
    rainProb: Math.round((Number(firstHourly?.pop) || 0) * 100),
    rainMM: rainVolume,
  };
};

const parseFreeTierWeather = (currentPayload, forecastPayload) => {
  const currentMain = currentPayload?.main || {};
  const firstForecast = forecastPayload?.list?.[0] || {};

  // Forecast API rain volume is typically in a 3-hour bucket.
  const rainFromForecast =
    Number(firstForecast?.rain?.["3h"]) || Number(firstForecast?.rain?.["1h"]) || 0;

  return {
    temp: Number(currentMain?.temp) || 0,
    humidity: Number(currentMain?.humidity) || 0,
    rainProb: Math.round((Number(firstForecast?.pop) || 0) * 100),
    rainMM: rainFromForecast,
  };
};

const isProviderAuthError = (error) => error?.response?.status === 401;

async function fetchWithOneCall({ lat, lon, apiKey }, httpClient) {
  const response = await httpClient.get(buildOneCallUrl({ lat, lon, apiKey }), {
    timeout: WEATHER_TIMEOUT_MS,
  });
  return parseOneCallWeather(response?.data || {});
}

async function fetchWithFreeTier({ lat, lon, apiKey }, httpClient) {
  const [currentResponse, forecastResponse] = await Promise.all([
    httpClient.get(buildCurrentWeatherUrl({ lat, lon, apiKey }), {
      timeout: WEATHER_TIMEOUT_MS,
    }),
    httpClient.get(buildForecastUrl({ lat, lon, apiKey }), {
      timeout: WEATHER_TIMEOUT_MS,
    }),
  ]);

  return parseFreeTierWeather(
    currentResponse?.data || {},
    forecastResponse?.data || {}
  );
}

async function fetchWeatherAdvice(
  { lat, lon },
  dependencies = { httpClient: axios }
) {
  const cacheKey = getCacheKey(lat, lon);
  const cached = getCachedAdvice(cacheKey);

  if (cached) {
    return cached;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new AppError("OPENWEATHER_API_KEY is not configured", 500);
  }

  let weather;
  try {
    weather = await fetchWithOneCall({ lat, lon, apiKey }, dependencies.httpClient);
  } catch (error) {
    if (isProviderAuthError(error)) {
      // One Call can return 401 for keys without One Call access.
      weather = await fetchWithFreeTier({ lat, lon, apiKey }, dependencies.httpClient);
    } else {
      throw error;
    }
  }

  const month = new Date().getMonth() + 1;
  const adviceCode = getWaterAdvice({ ...weather, month });

  const result = {
    temperature: weather.temp,
    humidity: weather.humidity,
    rainProbability: weather.rainProb,
    rainfall: weather.rainMM,
    adviceCode,
    adviceMessage: getAdviceMessage(adviceCode),
  };

  setCachedAdvice(cacheKey, result);
  return result;
}

async function getWeatherAdvice(input, dependencies) {
  try {
    return await fetchWeatherAdvice(input, dependencies);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.code === "ECONNABORTED") {
      throw new AppError("Weather provider timeout. Please try again.", 504);
    }

    if (isProviderAuthError(error)) {
      throw new AppError(
        "OpenWeather authentication failed. Verify OPENWEATHER_API_KEY.",
        502,
        process.env.NODE_ENV === "development"
          ? { providerError: error.message }
          : null
      );
    }

    throw new AppError(
      "Unable to fetch weather data from provider",
      502,
      process.env.NODE_ENV === "development" ? { providerError: error.message } : null
    );
  }
}

module.exports = {
  getWeatherAdvice,
  parseOneCallWeather,
  parseFreeTierWeather,
  __cache: WEATHER_CACHE,
};
