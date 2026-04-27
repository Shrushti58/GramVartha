import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import { fetchWeatherAdvice } from "../services/weatherService";

export const useWeather = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission is required to get weather advice.");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const weatherAdvice = await fetchWeatherAdvice({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });

      setData(weatherAdvice);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load weather advice right now.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  return {
    loading,
    data,
    error,
    reload: loadWeather,
  };
};
