import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { apiService } from "../services/api";
import { getToken } from "./auth";

const PUSH_TOKEN_KEY = "expoPushToken";
const ANDROID_DEFAULT_CHANNEL_ID = "default";
const ANDROID_COMPLAINTS_CHANNEL_ID = "complaints";
const ANDROID_NOTICES_CHANNEL_ID = "notices";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function configureAndroidNotificationChannels() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_CHANNEL_ID, {
    name: "General updates",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2563EB",
  });

  await Notifications.setNotificationChannelAsync(ANDROID_NOTICES_CHANNEL_ID, {
    name: "Village notices",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#16A34A",
  });

  await Notifications.setNotificationChannelAsync(ANDROID_COMPLAINTS_CHANNEL_ID, {
    name: "Complaint updates",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#DC2626",
  });
}

function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as any).easConfig?.projectId
  );
}

async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function getExpoPushToken() {
  if (!Device.isDevice) {
    console.warn("Push notifications require a physical device");
    return null;
  }

  await configureAndroidNotificationChannels();

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    console.warn("Permission denied for push notifications");
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn("EAS projectId is missing; Expo push token registration skipped");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

export async function savePushTokenToBackend(expoPushToken: string) {
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken);

  const authToken = await getToken();
  if (!authToken) return null;

  return apiService.post("/citizen/register-push-token", {
    pushToken: expoPushToken,
  });
}

export async function removePushTokenFromBackend() {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);

  if (!token) return;

  try {
    await apiService.post("/citizen/unregister-push-token", {
      pushToken: token,
    });
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  }
}

export async function getOrCreatePushToken() {
  try {
    const token = await getExpoPushToken();
    if (!token) return null;

    await savePushTokenToBackend(token);

    return token;
  } catch (error) {
    console.error("Error managing push token:", error);
    return null;
  }
}

function handleNotificationTap(notification: Notifications.Notification) {
  const data = notification.request.content.data;

  if (data?.type === "notice" && data?.villageId) {
    router.push(`/qr-notices/${data.villageId}` as any);
  } else if (
    (data?.type === "complaint_resolved" || data?.type === "complaint_rejected") &&
    data?.complaintId
  ) {
    router.push(`/complaints/${data.complaintId}` as any);
  }
}

export function setupNotificationListeners() {
  void configureAndroidNotificationChannels();
  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (response?.notification) {
      handleNotificationTap(response.notification);
    }
  });

  const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
    // Foreground presentation is controlled by setNotificationHandler above.
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationTap(response.notification);
  });

  const tokenSubscription = (Notifications as any).addPushTokenListener?.((token: any) => {
    const tokenValue = typeof token === "string" ? token : token?.data;
    if (tokenValue) {
      void savePushTokenToBackend(tokenValue);
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
    tokenSubscription?.remove?.();
  };
}
