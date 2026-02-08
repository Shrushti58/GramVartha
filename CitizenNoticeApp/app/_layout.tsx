/**
 * Root Layout
 * Defines the navigation structure using Expo Router
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Public Notices',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="notice/[id]"
          options={{
            title: 'Notice Details',
            headerShown: true,
          }}
        />
      </Stack>
    </>
  );
}