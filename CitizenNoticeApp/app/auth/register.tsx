// app/auth/register.tsx
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
} from "react-native";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import apiService from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function Register() {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState("");
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

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill in all fields.",
      });
      return;
    }
    const villageStr = await AsyncStorage.getItem("scannedVillage");
    const villageObj = JSON.parse(villageStr || "{}");

    if (!villageObj.villageId) {
      Toast.show({
        type: "error",
        text1: "No village found",
        text2: "Please scan your village QR code first.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await apiService.registerCitizen({
        name,
        phone,
        password,
        village: villageObj.villageId,
      });

      await AsyncStorage.setItem("token", res.token);
      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: "Your account has been created.",
      });
      setTimeout(() => router.replace("/"), 1200);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      placeholder: "Enter your full name",
      secure: false,
      value: name,
      onChange: setName,
      keyType: "default" as const,
      autoCapitalize: "words" as const,
    },
    {
      key: "phone",
      label: "Phone Number",
      placeholder: "Enter your phone number",
      secure: false,
      value: phone,
      onChange: setPhone,
      keyType: "phone-pad" as const,
      autoCapitalize: "none" as const,
    },
    {
      key: "password",
      label: "Password",
      placeholder: "Create a password",
      secure: true,
      value: password,
      onChange: setPassword,
      keyType: "default" as const,
      autoCapitalize: "none" as const,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.primary[700]} />

      {/* ── Header ── */}
      <View style={[styles.headerShell, { backgroundColor: colors.primary[700] }]}>
        <View style={[styles.accentCircle1, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={[styles.accentCircle2, { backgroundColor: "rgba(255,255,255,0.04)" }]} />

        <View style={styles.headerNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnTxt}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerEyebrow}>CITIZEN PORTAL</Text>
          <Text style={styles.headerTitle}>Create Account 📝</Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: "rgba(255,255,255,0.45)" }]} />
            <Text style={styles.headerSub}>Register to access your village services</Text>
          </View>
        </View>
      </View>

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
            borderColor: colors.primary[300] || "#c9a882",
            shadowColor: colors.primary[900],
          }
        ]}>
          <View style={[styles.villageIconWrap, { backgroundColor: colors.primary[100] || "#f5efe9" }]}>
            <Text style={styles.villageIcon}>🏘️</Text>
          </View>
          <View style={styles.villageTextBlock}>
            <Text style={[styles.villageLabel, { color: colors.text.muted }]}>VILLAGE</Text>
            <Text style={[styles.villageName, { color: colors.text.primary }]}>{villageName}</Text>
            <Text style={[styles.villageVerified, { color: colors.primary[600] || "#8B6B61" }]}>
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
                  borderColor: colors.primary[500] || "#a88560",
                  backgroundColor: colors.primary[100] || "#f5efe9",
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
                  autoCapitalize={f.autoCapitalize}
                  onFocus={() => setFocused(f.key)}
                  onBlur={() => setFocused(null)}
                  autoCorrect={false}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Register CTA ── */}
        <TouchableOpacity
          style={[
            styles.registerBtn,
            { backgroundColor: colors.button?.primary || colors.primary.DEFAULT },
            loading && styles.registerBtnDisabled
          ]}
          onPress={handleRegister}
          activeOpacity={0.82}
          disabled={loading}
        >
          <Text style={[styles.registerBtnTxt, { color: colors.text.inverse }]}>
            {loading ? "Creating account…" : "Register"}
          </Text>
        </TouchableOpacity>

        {/* ── Login redirect ── */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginHint, { color: colors.text.secondary }]}>
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: "/auth/login" } as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.loginLink, { color: colors.primary[600] || "#8B6B61" }]}>
              {" "}Login
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: colors.text.muted }]}>
          By registering, you agree to receive village notices and updates on your device.
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
    paddingBottom: 28,
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
    backgroundColor: "rgba(255,255,255,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnTxt: {
    color: "#fff",
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
    color: "rgba(255,255,255,0.50)",
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
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
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
  registerBtn: {
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
  registerBtnDisabled: { opacity: 0.62 },
  registerBtnTxt: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginHint: {
    fontSize: 13,
    fontWeight: "500",
  },
  loginLink: {
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