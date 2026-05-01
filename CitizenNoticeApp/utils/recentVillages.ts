import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScannedVillage } from "../constants/home";

const RECENT_VILLAGES_KEY = "recentVillages";
const RECENT_VILLAGES_LIMIT = 5;

export async function getRecentVillages() {
  const stored = await AsyncStorage.getItem(RECENT_VILLAGES_KEY);
  return stored
    ? (JSON.parse(stored) as ScannedVillage[]).slice(0, RECENT_VILLAGES_LIMIT)
    : [];
}
