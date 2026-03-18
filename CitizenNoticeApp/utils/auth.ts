import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode";

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem("token", token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};

export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      await AsyncStorage.removeItem("token");
      return false;
    }

    return true;
  } catch {
    return false;
  }
};