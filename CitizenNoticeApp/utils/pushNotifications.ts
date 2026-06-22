import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Platform } from "react-native";
import { Config } from "../constants/config";
import { apiService } from "../services/api";
import { getToken } from "./auth";

const PUSH_TOKEN_KEY = "expoPushToken";
const ANDROID_DEFAULT_CHANNEL_ID = "default";
const ANDROID_COMPLAINTS_CHANNEL_ID = "complaints";
const ANDROID_NOTICES_CHANNEL_ID = "notices";

function isExpoPushToken(token?: string | null) {
  return /^Expo(nent)?PushToken\[[\w-]+\]$/.test(token || "");
}

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

  console.log("[push-token] Configuring Android notification channels");

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
  console.log("[push-token] Existing notification permission", { status: existingStatus });

  if (existingStatus === "granted") {
    console.log("[push-token] Notification permission already granted");
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log("[push-token] Notification permission requested", { status });
  return status === "granted";
}

async function getExpoPushToken() {
  console.log("[push-token] Token generation started", {
    platform: Platform.OS,
    isDevice: Device.isDevice,
  });

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
  console.log("[push-token] EAS project id check", {
    hasProjectId: Boolean(projectId),
  });

  if (!projectId) {
    console.warn("EAS projectId is missing; Expo push token registration skipped");
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  console.log("[push-token] Expo token generated", { token: token.data });
  return token.data;
}

export async function savePushTokenToBackend(expoPushToken: string) {
  if (!isExpoPushToken(expoPushToken)) {
    console.log("[push-token] Backend registration skipped: not an Expo token", {
      token: expoPushToken,
    });
    return null;
  }

  await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken);
  console.log("[push-token] Token stored locally", { token: expoPushToken });

  const authToken = await getToken();
  if (!authToken) {
    console.log("[push-token] Backend registration skipped: no auth token");
    return null;
  }

  console.log("[push-token] Registering token with backend", {
    apiBaseUrl: Config.API_BASE_URL,
    endpoint: "/citizen/register-push-token",
    hasAuthToken: true,
    token: expoPushToken,
  });

  try {
    const result = await apiService.post("/citizen/register-push-token", {
      pushToken: expoPushToken,
    });
    console.log("[push-token] Backend registration response", result);

    return result;
  } catch (error: any) {
    console.error("[push-token] Backend registration failed", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      data: error?.data,
    });
    throw error;
  }
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
    console.log("[push-token] getOrCreatePushToken started");
    const token = await getExpoPushToken();
    if (!token) {
      console.log("[push-token] getOrCreatePushToken stopped: no Expo token");
      return null;
    }

    await savePushTokenToBackend(token);

    console.log("[push-token] getOrCreatePushToken completed");
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
    if (isExpoPushToken(tokenValue)) {
      void savePushTokenToBackend(tokenValue);
    } else if (tokenValue) {
      console.log("[push-token] Native device token changed; Expo token registration skipped", {
        token: tokenValue,
      });
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
    tokenSubscription?.remove?.();
  };
}
