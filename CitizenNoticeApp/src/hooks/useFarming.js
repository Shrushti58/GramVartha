import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";
import { fetchFarmingAdvice } from "../services/farmingService";

export const useFarming = ({ crop = "wheat", soilType = "black" } = {}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const loadFarmingAdvice = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission is required for farming advice.");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const advice = await fetchFarmingAdvice({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        crop,
        soilType,
      });

      setData(advice);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load farming advice right now.";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [crop, soilType]);

  useEffect(() => {
    loadFarmingAdvice();
  }, [loadFarmingAdvice]);

  return {
    loading,
    data,
    error,
    reload: loadFarmingAdvice,
  };
};
