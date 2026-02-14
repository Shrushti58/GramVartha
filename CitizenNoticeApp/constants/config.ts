/**
 * Application Configuration
 * Update the API_BASE_URL with your backend server address
 */

// IMPORTANT: Replace with your backend server URL
// For local development:
// - Physical device: Use your computer's IP address (e.g., 'http://192.168.1.100:5000')
// - Android Emulator: Use 'http://10.0.2.2:5000'
// - iOS Simulator: Use 'http://localhost:5000'
// For production: Use your deployed backend URL

export const Config = {
  API_BASE_URL: 'http://192.168.1.5:3000', 
  API_TIMEOUT: 10000, 

  APP_NAME: 'Citizen Notice',
  APP_VERSION: '1.0.0',

  NOTICES_PER_PAGE: 20,

  CACHE_DURATION: 5 * 60 * 1000, 
};

export default Config;