import axios from "axios";
import { Config } from "../../constants/config";

const weatherApi = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT || 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchWeatherAdvice = async ({ lat, lon }) => {
  const response = await weatherApi.get("/api/v1/weather/advice", {
    params: { lat, lon },
  });

  return response?.data?.data;
};

export default {
  fetchWeatherAdvice,
};
