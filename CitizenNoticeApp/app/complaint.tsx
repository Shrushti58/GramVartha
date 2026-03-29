// app/complaint.tsx
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
  Image,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import apiService from "../services/api";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintType = "issue" | "suggestion";

interface PhotoFile {
  uri: string;
  name: string;
  type: string;
}

interface GpsLocation {
  lat: number;
  lng: number;
}

// ─── Helper: build warning messages ──────────────────────────────────────────
function buildWarnings(location: GpsLocation | null): string[] {
  const warnings: string[] = [];
  if (!location) {
    warnings.push("Location required for verification. Capturing automatically…");
  }
  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Complaint() {
  const { colors, isDark } = useTheme();
  const [type, setType] = useState<ComplaintType>("issue");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<PhotoFile | null>(null);
  const [location, setLocation] = useState<GpsLocation | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  // Derived warning list
  const warnings = buildWarnings(location);

  // Dynamic colors based on dark mode
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : "#fff";
  const headerSubColor = isDark ? colors.primary[200] : "rgba(255,255,255,0.8)";
  const headerEyebrowColor = isDark ? colors.primary[300] : "rgba(255,255,255,0.6)";
  const backBtnBg = isDark ? `${colors.primary[500]}40` : "rgba(255,255,255,0.15)";

  // ── Auto-capture location after image is selected ─────────────────────────
  const autoCaptureLocation = useCallback(async () => {
    if (location) return;
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission needed",
          text2: "Please allow location access to submit issue.",
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Toast.show({ type: "success", text1: "Location captured", text2: "GPS coordinates saved." });
    } catch {
      Toast.show({ type: "error", text1: "Location failed", text2: "Could not get your location." });
    } finally {
      setLocLoading(false);
    }
  }, [location]);

  // ── Take photo from camera ────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Camera access needed",
        text2: "Please allow camera access to take a photo.",
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
      aspect: [4, 3],
      exif: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
      setPhotoFile({ uri: result.assets[0].uri, name: "photo.jpg", type: "image/jpeg" });
      setTimestamp(new Date().toISOString());
      // Auto-trigger location after taking photo
      autoCaptureLocation();
    }
  };

  // ── Remove / retake photo ─────────────────────────────────────────────────
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    setTimestamp(null);
  };

  // ── Manual GPS capture ─────────────────────────────────────────────────────
  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission needed",
          text2: "Please allow location access to submit issue.",
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Toast.show({ type: "success", text1: "Location captured", text2: "GPS coordinates saved." });
    } catch {
      Toast.show({ type: "error", text1: "Location failed", text2: "Could not get your location." });
    } finally {
      setLocLoading(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Toast.show({ type: "error", text1: "Missing fields", text2: "Please fill in title and description." });
      return;
    }

    if (type === "issue") {
      if (!photoFile) {
        Toast.show({ type: "error", text1: "Photo required", text2: "Please take a photo of the issue." });
        return;
      }
      if (!location) {
        Toast.show({ type: "error", text1: "Location required", text2: "Please capture your GPS location." });
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());

      if (type === "issue") {
        formData.append("image", photoFile as any);
        formData.append("lat", String(location!.lat));
        formData.append("lng", String(location!.lng));
        formData.append("timestamp", timestamp ?? new Date().toISOString());
        formData.append("imageSource", "camera");
      }

      const res = await apiService.createComplaint(formData);

      if (res.duplicateOf) {
        Toast.show({
          type: "info",
          text1: "Already reported",
          text2: "A similar issue exists nearby. We've noted your report.",
        });
        setTimeout(() => router.back(), 2000);
        return;
      }

      Toast.show({ type: "success", text1: "Submitted!", text2: "Your complaint has been received." });
      setTimeout(() => router.back(), 1200);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />

      {/* ── Header with Gradient ── */}
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
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>CITIZEN PORTAL</Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>New Complaint 📋</Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>Report an issue or share a suggestion</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Type toggle ── */}
        <View style={[
          styles.toggleWrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          {(["issue", "suggestion"] as ComplaintType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.toggleBtn,
                type === t && [styles.toggleBtnActive, { backgroundColor: colors.primary[700] }]
              ]}
              onPress={() => setType(t)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.toggleBtnTxt,
                { color: colors.text.secondary },
                type === t && [styles.toggleBtnTxtActive, { color: "#fff" }]
              ]}>
                {t === "issue" ? "🔧  Issue" : "💡  Suggestion"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Type hint ── */}
        <View style={[
          styles.hintBox,
          {
            backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[100],
            borderLeftColor: colors.primary[500],
          }
        ]}>
          <Text style={[styles.hintText, { color: colors.text.secondary }]}>
            {type === "issue"
              ? "Issues require a photo and your GPS location to verify and locate the problem."
              : "Suggestions are text-only. Share your ideas to improve the village."}
          </Text>
        </View>

        {/* ── Main form card ── */}
        <View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          {/* Title */}
          <View style={[styles.fieldWrap, styles.fieldBorder, { borderBottomColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Title</Text>
            <View style={[
              styles.inputRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
              focused === "title" && {
                borderColor: colors.primary[500],
                backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[50],
              }
            ]}>
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Brief title of your complaint"
                placeholderTextColor={colors.text.muted}
                value={title}
                onChangeText={setTitle}
                onFocus={() => setFocused("title")}
                onBlur={() => setFocused(null)}
                autoCapitalize="sentences"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Description</Text>
            <View style={[
              styles.textAreaRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
              focused === "desc" && {
                borderColor: colors.primary[500],
                backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[50],
              }
            ]}>
              <TextInput
                style={[styles.textArea, { color: colors.text.primary }]}
                placeholder="Describe the issue or suggestion in detail…"
                placeholderTextColor={colors.text.muted}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setFocused("desc")}
                onBlur={() => setFocused(null)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>
          </View>
        </View>

        {/* ── Issue-only: Photo (Camera only) ── */}
        {type === "issue" && (
          <View style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Photo  <Text style={styles.requiredBadge}>REQUIRED</Text>
              </Text>

              {photo ? (
                /* ── Preview + retake ── */
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={[
                    styles.sourceBadge,
                    { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[100] }
                  ]}>
                    <Text style={[styles.sourceBadgeTxt, { color: colors.primary[700] }]}>
                      📸 Camera Photo
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.photoRemoveBtn, { backgroundColor: isDark ? `${colors.error}20` : "#fce8e8" }]}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.photoRemoveTxt, { color: colors.error || "#e05252" }]}>
                      ✕  Take New Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Camera button only ── */
                <TouchableOpacity
                  style={[
                    styles.cameraBtn,
                    {
                      backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[100],
                      borderColor: colors.primary[500],
                    }
                  ]}
                  onPress={handleTakePhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cameraIcon}>📸</Text>
                  <Text style={[styles.cameraBtnTxt, { color: colors.primary[700] }]}>
                    Take Photo
                  </Text>
                  <Text style={[styles.cameraBtnSub, { color: colors.text.muted }]}>
                    Required for issue reports
                  </Text>
                </TouchableOpacity>
              )}

              {/* ── Warning messages ── */}
              {warnings.length > 0 && (
                <View style={styles.warningWrap}>
                  {warnings.map((w, i) => (
                    <View key={i} style={[
                      styles.warningRow,
                      { backgroundColor: isDark ? `${colors.warning}10` : "#fff8ec" }
                    ]}>
                      <Text style={styles.warningIcon}>⚠️</Text>
                      <Text style={[styles.warningText, { color: colors.warning || "#b45309" }]}>{w}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Issue-only: Location ── */}
        {type === "issue" && (
          <View style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                Location  <Text style={styles.requiredBadge}>REQUIRED</Text>
              </Text>

              {location ? (
                <View style={[
                  styles.locRow,
                  { backgroundColor: isDark ? `${colors.primary[500]}12` : colors.primary[100] }
                ]}>
                  <View style={[styles.locIconWrap, { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[200] }]}>
                    <Text style={styles.locIcon}>📍</Text>
                  </View>
                  <View style={styles.locTextBlock}>
                    <Text style={[styles.locCoords, { color: colors.text.primary }]}>
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </Text>
                    <Text style={[styles.locCaptured, { color: colors.primary[500] }]}>
                      ✓ GPS captured
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleGetLocation}
                    style={[styles.locRefreshBtn, { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[200] }]}
                    activeOpacity={0.8}
                    disabled={locLoading}
                  >
                    {locLoading ? (
                      <ActivityIndicator color={colors.primary[500]} size="small" />
                    ) : (
                      <Text style={[styles.locRefreshTxt, { color: colors.primary[700] }]}>Refresh</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.locCaptureBtn,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={handleGetLocation}
                  activeOpacity={0.8}
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <ActivityIndicator color={colors.primary[500]} size="small" />
                  ) : (
                    <Text style={[styles.locCaptureTxt, { color: colors.primary[500] }]}>
                      📍  Capture My Location
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.button?.primary || colors.primary.DEFAULT },
            loading && styles.submitBtnDisabled
          ]}
          onPress={handleSubmit}
          activeOpacity={0.82}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.submitBtnTxt, { color: "#fff" }]}>
              {type === "issue" ? "Submit Complaint" : "Submit Suggestion"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ────────────────────────────────────────────────────────────────
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
    width: 220, height: 220, borderRadius: 110,
    top: -80, right: -50,
  },
  accentCircle2: {
    position: "absolute",
    width: 130, height: 130, borderRadius: 65,
    bottom: -30, left: 30,
  },
  headerNavRow: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 18 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: "600" },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10, fontWeight: "800",
    letterSpacing: 2.5, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28, fontWeight: "800",
    letterSpacing: -0.8, lineHeight: 34,
  },
  headerBreadcrumb: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4 },
  headerBreadcrumbDot: {
    width: 5, height: 5, borderRadius: 3,
  },
  headerSub: { fontSize: 12, fontWeight: "500" },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Type toggle ───────────────────────────────────────────────────────────
  toggleWrap: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },
  toggleBtnActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnTxt: {
    fontSize: 13, fontWeight: "700",
  },
  toggleBtnTxtActive: {},

  // ── Hint box ──────────────────────────────────────────────────────────────
  hintBox: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 18, fontWeight: "500",
  },

  // ── Card ──────────────────────────────────────────────────────────────────
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
    fontSize: 11, fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  requiredBadge: {
    fontSize: 9, fontWeight: "800",
    color: "#e05252",
    letterSpacing: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1, fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },
  textAreaRow: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
  },
  textArea: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },

  // ── Camera button ─────────────────────────────────────────────────────────
  cameraBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  cameraIcon: { fontSize: 32 },
  cameraBtnTxt: {
    fontSize: 14, fontWeight: "700",
  },
  cameraBtnSub: {
    fontSize: 11, fontWeight: "500",
  },

  // ── Photo preview ─────────────────────────────────────────────────────────
  photoPreviewWrap: { gap: 8 },
  photoPreview: {
    width: "100%", height: 200,
    borderRadius: 12,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceBadgeTxt: {
    fontSize: 11, fontWeight: "700",
  },
  photoRemoveBtn: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  photoRemoveTxt: { fontSize: 12, fontWeight: "700" },

  // ── Warning ────────────────────────────────────────────────────────────────
  warningWrap: {
    marginTop: 10,
    gap: 6,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  warningIcon: { fontSize: 13, lineHeight: 18 },
  warningText: {
    flex: 1,
    fontSize: 12, fontWeight: "600",
    lineHeight: 18,
  },

  // ── Location ──────────────────────────────────────────────────────────────
  locCaptureBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
  },
  locCaptureTxt: {
    fontSize: 13, fontWeight: "700",
  },
  locRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  locIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  locIcon: { fontSize: 16 },
  locTextBlock: { flex: 1 },
  locCoords: {
    fontSize: 13, fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  locCaptured: {
    fontSize: 11, fontWeight: "500",
    marginTop: 1,
  },
  locRefreshBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
  },
  locRefreshTxt: {
    fontSize: 11, fontWeight: "700",
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn: {
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
  submitBtnDisabled: { opacity: 0.62 },
  submitBtnTxt: {
    fontSize: 15, fontWeight: "800",
    letterSpacing: 0.3,
  },
});