/**
 * Application Configuration
 * Update the API_BASE_URL with your backend server address
 */

import { Platform } from 'react-native';

// Get API URL from environment variables
const API_BASE_URL =process.env.EXPO_PUBLIC_API_BASE_URL;;

export const Config = {
  API_BASE_URL: API_BASE_URL,
  API_TIMEOUT: 10000,

  APP_NAME: 'Citizen Notice',
  APP_VERSION: '1.0.0',

  NOTICES_PER_PAGE: 20,

  CACHE_DURATION: 5 * 60 * 1000, 
};

export default Config;