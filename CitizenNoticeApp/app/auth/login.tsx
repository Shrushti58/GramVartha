// app/auth/login.tsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import apiService from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [villageName, setVillageName] = useState<string>("Loading…");

  useEffect(() => {
    AsyncStorage.getItem("scannedVillage").then((str) => {
      try {
        const obj = JSON.parse(str || "{}");
        setVillageName(obj.villageName || "Unknown Village");
      } catch {
        setVillageName("Unknown Village");
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: t('missing_fields'),
        text2: t('enter_phone_password'),
      });
      return;
    }

    const villageStr = await AsyncStorage.getItem("scannedVillage");
    const villageObj = JSON.parse(villageStr || "{}");

    if (!villageObj.villageId) {
      Toast.show({
        type: "error",
        text1: t('no_village_found'),
        text2: t('scan_village_login'),
      });
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.loginCitizen({ phone, password });
      await AsyncStorage.setItem("token", res.token);
      Toast.show({
        type: "success",
        text1: t('welcome_back'),
        text2: t('login_success'),
      });
      setTimeout(() => router.replace("/complaints/my-complaints"), 1200);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: t('login_failed'),
        text2: err.response?.data?.message || t('invalid_credentials'),
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      secure: false,
      value: phone,
      onChange: setPhone,
      keyType: "phone-pad" as const,
    },
    {
      key: "password",
      label: "Password",
      placeholder: "Enter your password",
      secure: true,
      value: password,
      onChange: setPassword,
      keyType: "default" as const,
    },
  ];

  // Dynamic colors based on dark mode for better contrast
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : "#fff";
  const headerSubColor = isDark ? colors.primary[200] : "rgba(255,255,255,0.8)";
  const headerEyebrowColor = isDark ? colors.primary[300] : "rgba(255,255,255,0.6)";
  const backBtnBg = isDark ? `${colors.primary[500]}40` : "rgba(255,255,255,0.15)";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />

      {/* ── Header with Gradient for better visibility ── */}
      <LinearGradient
        colors={isDark 
          ? [colors.primary[800], colors.primary[900]] 
          : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View style={[styles.accentCircle1, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)" }]} />
        <View style={[styles.accentCircle2, { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)" }]} />

        <View style={styles.headerNavRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backBtn, { backgroundColor: backBtnBg }]} 
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            CITIZEN PORTAL
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>Welcome Back 👋</Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              Sign in to your village account
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Village info (readonly) ── */}
        <View style={[
          styles.villageBox,
          {
            backgroundColor: colors.surface,
            borderColor: isDark ? colors.primary[600] : colors.primary[300],
            shadowColor: colors.primary[900],
          }
        ]}>
          <View style={[styles.villageIconWrap, { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[100] }]}>
            <Text style={styles.villageIcon}>🏘️</Text>
          </View>
          <View style={styles.villageTextBlock}>
            <Text style={[styles.villageLabel, { color: colors.text.muted }]}>VILLAGE</Text>
            <Text style={[styles.villageName, { color: colors.text.primary }]}>{villageName}</Text>
            <Text style={[styles.villageVerified, { color: colors.primary[500] }]}>
              ✓ Verified via QR Code
            </Text>
          </View>
        </View>

        {/* ── Form card ── */}
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: colors.primary[900],
          }
        ]}>
          {fields.map((f, idx) => (
            <View
              key={f.key}
              style={[
                styles.fieldWrap,
                idx < fields.length - 1 && [styles.fieldBorder, { borderBottomColor: colors.border }]
              ]}
            >
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                {f.label}
              </Text>
              <View style={[
                styles.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
                focused === f.key && {
                  borderColor: colors.primary[500],
                  backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[50],
                }
              ]}>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.text.muted}
                  value={f.value}
                  onChangeText={f.onChange}
                  secureTextEntry={f.secure}
                  keyboardType={f.keyType}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused(null)}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Login CTA ── */}
        <TouchableOpacity
          style={[
            styles.loginBtn,
            { backgroundColor: colors.button?.primary || colors.primary.DEFAULT },
            loading && styles.loginBtnDisabled
          ]}
          onPress={handleLogin}
          activeOpacity={0.82}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.loginBtnTxt, { color: "#fff" }]}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Register redirect ── */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerHint, { color: colors.text.secondary }]}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: "/auth/register" } as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.registerLink, { color: colors.primary[500] }]}>
              {" "}Register
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: colors.text.muted }]}>
          Access is restricted to verified village citizens only.
        </Text>
      </ScrollView>

      {/* ── Toast notifications ── */}
      <Toast />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ───────────────────────────────────────────────────────────────
  headerShell: {
    paddingBottom: 36,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  accentCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
  },
  accentCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -30,
    left: 30,
  },
  headerNavRow: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnTxt: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  headerTitleBlock: {
    paddingHorizontal: 18,
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },
  headerBreadcrumbDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 14,
  },

  // ── Village box ──────────────────────────────────────────────────────────
  villageBox: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  villageIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  villageIcon: { fontSize: 22 },
  villageTextBlock: { flex: 1, gap: 2 },
  villageLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  villageName: {
    fontSize: 15,
    fontWeight: "700",
  },
  villageVerified: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Form card ────────────────────────────────────────────────────────────
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldWrap: { paddingHorizontal: 14, paddingVertical: 14 },
  fieldBorder: { borderBottomWidth: 1 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },

  // ── CTA button ───────────────────────────────────────────────────────────
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: { opacity: 0.62 },
  loginBtnTxt: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerHint: {
    fontSize: 13,
    fontWeight: "500",
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  terms: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});