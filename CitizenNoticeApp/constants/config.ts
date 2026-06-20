/**
 * Application Configuration
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

export const Config = {
  API_BASE_URL: API_BASE_URL,
  API_TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 30000,

  APP_NAME: 'Citizen Notice',
  APP_VERSION: '1.0.0',

  NOTICES_PER_PAGE: 20,

  CACHE_DURATION: 5 * 60 * 1000, 
};

export default Config;
