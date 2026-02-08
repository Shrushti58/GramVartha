/**
 * Visitor ID Management
 * Generates and stores unique visitor ID for tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const VISITOR_ID_KEY = '@notice_visitor_id';

/**
 * Generate a unique visitor ID
 */
function generateVisitorId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `visitor_${timestamp}_${random}`;
}

/**
 * Get or create visitor ID
 */
export async function getVisitorId(): Promise<string> {
  try {
    let visitorId = await AsyncStorage.getItem(VISITOR_ID_KEY);
    
    if (!visitorId) {
      visitorId = generateVisitorId();
      await AsyncStorage.setItem(VISITOR_ID_KEY, visitorId);
    }
    
    return visitorId;
  } catch (error) {
    console.error('Error getting visitor ID:', error);
    return generateVisitorId();
  }
}


export async function clearVisitorId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VISITOR_ID_KEY);
  } catch (error) {
    console.error('Error clearing visitor ID:', error);
  }
}