// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";
import { STACK_SCREENS } from "../constants/stackScreens";



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
        {STACK_SCREENS.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            options={screen.options}
          />
        ))}
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
