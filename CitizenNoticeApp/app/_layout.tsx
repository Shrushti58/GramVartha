/**
 * Root Layout
 * Defines the navigation structure using Expo Router
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1e293b',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerShadowVisible: true,
          headerShown: false,
        }}
      >
        {/* PUBLIC SCREENS */}
        <Stack.Screen name="index" />
        <Stack.Screen name="notice" />
        <Stack.Screen name="notice/[id]" />

        {/* AUTH SCREENS */}
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/register" />

        {/* PROTECTED SCREEN */}
        <Stack.Screen name="complaint" />
      </Stack>
      <Toast />
    </>
  );
}