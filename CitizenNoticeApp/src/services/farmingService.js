import axios from "axios";
import { Config } from "../../constants/config";

const farmingApi = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.API_TIMEOUT || 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchFarmingAdvice = async ({ lat, lon, crop, soilType }) => {
  const response = await farmingApi.get("/api/v1/farming/advice", {
    params: { lat, lon, crop, soilType },
  });

  return response?.data?.data;
};

export default {
  fetchFarmingAdvice,
};
