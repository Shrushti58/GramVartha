import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.warn('⚠️ Notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('⚠️ Permission denied for push notifications');
    return null;
  }

  try {
    // Fallback projectId - test UUID format
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '65e8f3a2-c1b2-e4f5-a6b7-c8d9e0f1a2b3';
    
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    console.log('✅ Push notification token obtained:', token.data);
    return token.data;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    console.log('💡 To fix this:');
    console.log('   1. Run: npm install -g eas-cli');
    console.log('   2. Run: eas init');
    console.log('   3. This will link your project to Expo and update app.json with correct projectId');
    return null;
  }
}

export async function savePushTokenToBackend(expoPushToken: string) {
  try {
    // Save to local storage for persistence
    await AsyncStorage.setItem('expoPushToken', expoPushToken);

    // Send to backend - use /citizen endpoint
    const response = await apiService.post('/citizen/register-push-token', {
      pushToken: expoPushToken
    });

    console.log('✅ Push token registered with backend');
    return response.data;
  } catch (error) {
    console.error('❌ Error saving push token to backend:', error);
  }
}

export function setupNotificationListeners() {
  // Listener for when notification is received while app is foregrounded
  const foregroundNotificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('📬 Notification received (foreground):', notification);
      handleNotification(notification);
    }
  );

  // Listener for when user taps on notification
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('👆 Notification tapped:', response.notification);
    handleNotificationTap(response.notification);
  });

  return () => {
    foregroundNotificationListener.remove();
    responseListener.remove();
  };
}

function handleNotification(notification: Notifications.Notification) {
  // Show alert or update state based on notification data
  const data = notification.request.content.data;
  console.log('Notification data:', data);
}

function handleNotificationTap(notification: Notifications.Notification) {
  const data = notification.request.content.data;

  if (data?.type === 'notice') {
    // Navigate to notice details
    console.log('Navigating to notice for village:', data.villageId);
    // You can use expo-router to navigate here
  } else if (data?.type === 'complaint_resolved' || data?.type === 'complaint_rejected') {
    // Navigate to complaint details
    console.log('Navigating to complaint:', data.complaintId);
  }
}

export async function getOrCreatePushToken() {
  try {
    // Check if token already exists
    let token = await AsyncStorage.getItem('expoPushToken');

    if (!token) {
      // Register for push notifications
      token = await registerForPushNotificationsAsync();

      if (token) {
        await savePushTokenToBackend(token);
      }
    } else {
      // Token exists but verify it's with backend
      try {
        await savePushTokenToBackend(token);
      } catch (error) {
        console.warn('Could not verify token with backend:', error);
      }
    }

    return token;
  } catch (error) {
    console.error('Error managing push token:', error);
    return null;
  }
}
