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
import Colors from "../../constants/colors";

export default function Login() {
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
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
        text1: "Missing fields",
        text2: "Please enter your phone and password.",
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
      const res = await apiService.loginCitizen({ phone, password });
      await AsyncStorage.setItem("token", res.token);
      Toast.show({
        type: "success",
        text1: "Welcome back!",
        text2: "Logged in successfully.",
      });
      setTimeout(() => router.replace("/complaint"), 1200);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login failed",
        text2: err.response?.data?.message || "Invalid phone or password.",
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

  return (
    <KeyboardAvoidingView
      style={S.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[800]} />

      {/* ── Header ── */}
      <View style={S.headerShell}>
        <View style={S.accentCircle1} />
        <View style={S.accentCircle2} />

        <View style={S.headerNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn} activeOpacity={0.7}>
            <Text style={S.backBtnTxt}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={S.headerTitleBlock}>
          <Text style={S.headerEyebrow}>CITIZEN PORTAL</Text>
          <Text style={S.headerTitle}>Welcome Back 👋</Text>
          <View style={S.headerBreadcrumb}>
            <View style={S.headerBreadcrumbDot} />
            <Text style={S.headerSub}>Sign in to your village account</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Village info (readonly) ── */}
        <View style={S.villageBox}>
          <View style={S.villageIconWrap}>
            <Text style={S.villageIcon}>🏘️</Text>
          </View>
          <View style={S.villageTextBlock}>
            <Text style={S.villageLabel}>VILLAGE</Text>
            <Text style={S.villageName}>{villageName}</Text>
            <Text style={S.villageVerified}>✓ Verified via QR Code</Text>
          </View>
        </View>

        {/* ── Form card ── */}
        <View style={S.card}>
          {fields.map((f, idx) => (
            <View
              key={f.key}
              style={[S.fieldWrap, idx < fields.length - 1 && S.fieldBorder]}
            >
              <Text style={S.fieldLabel}>{f.label}</Text>
              <View style={[S.inputRow, focused === f.key && S.inputRowFocused]}>
                <TextInput
                  style={S.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textMuted}
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
          style={[S.loginBtn, loading && S.loginBtnDisabled]}
          onPress={handleLogin}
          activeOpacity={0.82}
          disabled={loading}
        >
          <Text style={S.loginBtnTxt}>
            {loading ? "Signing in…" : "Login"}
          </Text>
        </TouchableOpacity>

        {/* ── Register redirect ── */}
        <View style={S.registerRow}>
          <Text style={S.registerHint}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => router.replace({ pathname: "/auth/register" } as any)}
            activeOpacity={0.7}
          >
            <Text style={S.registerLink}>  Register</Text>
          </TouchableOpacity>
        </View>

        <Text style={S.terms}>
          Access is restricted to verified village citizens only.
        </Text>
      </ScrollView>

      {/* ── Toast notifications ── */}
      <Toast />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // ── Header ───────────────────────────────────────────────────────────────
  headerShell: {
    backgroundColor: Colors.primary[700],
    paddingBottom: 36,
    overflow: "hidden",
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  accentCircle1: {
    position: "absolute",
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -80, right: -50,
  },
  accentCircle2: {
    position: "absolute",
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -30, left: 30,
  },
  headerNavRow: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.13)",
    justifyContent: "center", alignItems: "center",
  },
  backBtnTxt: { color: "#fff", fontSize: 20, lineHeight: 24, fontWeight: "600" },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10, fontWeight: "800",
    color: "rgba(255,255,255,0.50)",
    letterSpacing: 2.5, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28, fontWeight: "800",
    color: "#fff", letterSpacing: -0.8, lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4,
  },
  headerBreadcrumbDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  headerSub: {
    fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: "500",
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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary[300] ?? "#c9a882",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  villageIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
    justifyContent: "center", alignItems: "center",
  },
  villageIcon: { fontSize: 22 },
  villageTextBlock: { flex: 1, gap: 2 },
  villageLabel: {
    fontSize: 9, fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  villageName: {
    fontSize: 15, fontWeight: "700",
    color: Colors.textPrimary,
  },
  villageVerified: {
    fontSize: 11, fontWeight: "600",
    color: Colors.primary[600] ?? "#8B6B61",
  },

  // ── Form card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldWrap: { paddingHorizontal: 14, paddingVertical: 14 },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  fieldLabel: {
    fontSize: 11, fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: Colors.primary[500] ?? "#a88560",
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    paddingVertical: 0,
  },

  // ── CTA button ───────────────────────────────────────────────────────────
  loginBtn: {
    backgroundColor: Colors.button.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnDisabled: { opacity: 0.62 },
  loginBtnTxt: {
    color: Colors.textInverse,
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
    fontSize: 13, color: Colors.textSecondary, fontWeight: "500",
  },
  registerLink: {
    fontSize: 13, fontWeight: "800",
    color: Colors.primary[600] ?? "#8B6B61",
    letterSpacing: 0.2,
  },
  terms: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});