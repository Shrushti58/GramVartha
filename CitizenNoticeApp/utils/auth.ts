import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "authToken";
const LEGACY_TOKEN_KEY = "token";

type JwtPayload = {
  exp?: number;
  id?: string;
  village?: string;
};

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return !decoded.exp || decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const saveToken = async (token: string) => {
  if (!token || isTokenExpired(token)) {
    throw new Error("Invalid or expired authentication token");
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const getToken = async () => {
  const secureToken = await SecureStore.getItemAsync(TOKEN_KEY);

  if (secureToken) {
    if (isTokenExpired(secureToken)) {
      await logout();
      return null;
    }

    return secureToken;
  }

  const legacyToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);

  if (!legacyToken) return null;

  if (isTokenExpired(legacyToken)) {
    await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
    return null;
  }

  await saveToken(legacyToken);
  return legacyToken;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await AsyncStorage.removeItem(LEGACY_TOKEN_KEY);
};

export const isLoggedIn = async () => Boolean(await getToken());

export const getDecodedToken = async () => {
  const token = await getToken();
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};
