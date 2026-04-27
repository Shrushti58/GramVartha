import axios from 'axios';
import { Config } from '../constants/config';

const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSchemes = async (state = 'maharashtra') => {
  const response = await api.get('/schemes', {
    params: { state },
  });

  const payload = response?.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data?.schemes)) {
    return payload.data.schemes;
  }

  if (Array.isArray(payload?.schemes)) {
    return payload.schemes;
  }

  return [];
};

export default api;
