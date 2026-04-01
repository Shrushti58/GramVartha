// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import "../i18n"; // Initialize i18n
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";



function RootLayoutContent() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text.primary,
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 18,
            color: colors.text.primary,
          },
          headerShadowVisible: true,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="complaint"
          options={{ title: "File Complaint", headerShown: false }}
        />
        <Stack.Screen
          name="qr-scanner"
          options={{ title: "QR Scanner", headerShown: false }}
        />
        <Stack.Screen name="notice" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="qr-notices/workguide"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="qr-notices/[villageId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="notice/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="complaints" options={{ headerShown: false }} />
        <Stack.Screen name="complaints/all-complaints" options={{ headerShown: false }} />
        <Stack.Screen name="complaints/my-complaints" options={{ headerShown: false }} />
        <Stack.Screen name="complaints/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="qr-notices" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}
