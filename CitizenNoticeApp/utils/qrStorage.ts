/**
 * Local Storage Management for QR Scanned Villages
 * Handles storing and retrieving scanned village information
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANNED_VILLAGE_KEY = 'scannedVillage';
const SCANNED_VILLAGES_HISTORY_KEY = 'scannedVillagesHistory';

/**
 * Get currently scanned village info
 */
export async function getScannedVillage() {
  try {
    const data = await AsyncStorage.getItem(SCANNED_VILLAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error getting scanned village:', err);
    return null;
  }
}

/**
 * Save scanned village info
 */
export async function saveScannedVillage(villageData: any) {
  try {
    const scannedData = {
      villageId: villageData._id,
      villageName: villageData.name,
      district: villageData.district,
      state: villageData.state,
      pincode: villageData.pincode,
      latitude: villageData.latitude,
      longitude: villageData.longitude,
      scannedAt: new Date().toISOString(),
      qrCodeId: villageData.qrCodeId,
    };

    await AsyncStorage.setItem(SCANNED_VILLAGE_KEY, JSON.stringify(scannedData));

    // Also add to history
    await addToScanHistory(scannedData);

    return scannedData;
  } catch (err) {
    console.error('Error saving scanned village:', err);
    throw err;
  }
}

/**
 * Clear currently scanned village
 */
export async function clearScannedVillage() {
  try {
    await AsyncStorage.removeItem(SCANNED_VILLAGE_KEY);
  } catch (err) {
    console.error('Error clearing scanned village:', err);
  }
}

/**
 * Get scan history
 */
export async function getScanHistory() {
  try {
    const data = await AsyncStorage.getItem(SCANNED_VILLAGES_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error getting scan history:', err);
    return [];
  }
}

/**
 * Add to scan history
 */
async function addToScanHistory(villageData: any) {
  try {
    const history = await getScanHistory();

    // Remove duplicate if exists
    const filtered = history.filter((v: any) => v.villageId !== villageData.villageId);

    // Add new scan to front
    const updated = [
      {
        ...villageData,
        lastScannedAt: new Date().toISOString(),
      },
      ...filtered,
    ];

    // Keep only last 10 scans
    const limited = updated.slice(0, 10);

    await AsyncStorage.setItem(SCANNED_VILLAGES_HISTORY_KEY, JSON.stringify(limited));
  } catch (err) {
    console.error('Error adding to scan history:', err);
  }
}

/**
 * Clear scan history
 */
export async function clearScanHistory() {
  try {
    await AsyncStorage.removeItem(SCANNED_VILLAGES_HISTORY_KEY);
  } catch (err) {
    console.error('Error clearing scan history:', err);
  }
}

/**
 * Remove specific village from history
 */
export async function removeFromHistory(villageId: string) {
  try {
    const history = await getScanHistory();
    const filtered = history.filter((v: any) => v.villageId !== villageId);
    await AsyncStorage.setItem(SCANNED_VILLAGES_HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error removing from history:', err);
  }
}

/**
 * Check if a village is already scanned
 */
export async function isVillageScanned(villageId: string) {
  try {
    const scanned = await getScannedVillage();
    return scanned && scanned.villageId === villageId;
  } catch (err) {
    console.error('Error checking if village is scanned:', err);
    return false;
  }
}

/**
 * Get all scanned villages (current + history)
 */
export async function getAllScannedVillages() {
  try {
    const current = await getScannedVillage();
    const history = await getScanHistory();

    const all = current ? [current, ...history] : history;

    // Remove duplicates
    const seen = new Set();
    return all.filter((v: any) => {
      if (seen.has(v.villageId)) {
        return false;
      }
      seen.add(v.villageId);
      return true;
    });
  } catch (err) {
    console.error('Error getting all scanned villages:', err);
    return [];
  }
}

export default {
  getScannedVillage,
  saveScannedVillage,
  clearScannedVillage,
  getScanHistory,
  clearScanHistory,
  removeFromHistory,
  isVillageScanned,
  getAllScannedVillages,
};
