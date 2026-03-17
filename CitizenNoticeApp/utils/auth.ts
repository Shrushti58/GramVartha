import AsyncStorage from "@react-native-async-storage/async-storage";

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
  return !!token;
};