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
import Colors from "../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintType = "issue" | "suggestion";
type ImageSource = "camera" | "gallery" | null;

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
function buildWarnings(imageSource: ImageSource, location: GpsLocation | null): string[] {
  const warnings: string[] = [];
  if (imageSource === "gallery") {
    warnings.push("Gallery images are less reliable — camera photos are preferred for verification.");
  }
  if (imageSource !== null && !location) {
    warnings.push("Location required for verification. Capturing automatically…");
  }
  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Complaint() {
  const [type, setType]               = useState<ComplaintType>("issue");
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto]             = useState<string | null>(null);
  const [photoFile, setPhotoFile]     = useState<PhotoFile | null>(null);
  const [imageSource, setImageSource] = useState<ImageSource>(null);
  const [location, setLocation]       = useState<GpsLocation | null>(null);
  const [locLoading, setLocLoading]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);
  const [timestamp, setTimestamp]     = useState<string | null>(null);

  // Derived warning list — recomputed on every render (cheap)
  const aiWarnings = buildWarnings(imageSource, location);

  // ── Auto-capture location after image is selected ─────────────────────────
  const autoCapureLocation = useCallback(async () => {
    if (location) return; // already have one
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Permission denied",
          text2: "Allow location access to tag this issue.",
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

  // ── Apply picked asset to state ───────────────────────────────────────────
  const applyAsset = useCallback(
    (asset: ImagePicker.ImagePickerAsset, source: ImageSource) => {
      setPhoto(asset.uri);
      setPhotoFile({ uri: asset.uri, name: "photo.jpg", type: "image/jpeg" });
      setImageSource(source);
      setTimestamp(new Date().toISOString());
      // Auto-trigger location after image selection
      autoCapureLocation();
    },
    [autoCapureLocation]
  );

  // ── Take photo from camera ────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission denied",
        text2: "Allow camera access to take a photo.",
      });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false, // disabled per requirement
      aspect: [4, 3],
      exif: true,           // capture EXIF data
    });
    if (!result.canceled && result.assets[0]) {
      applyAsset(result.assets[0], "camera");
    }
  };

  // ── Pick from gallery ─────────────────────────────────────────────────────
  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission denied",
        text2: "Allow library access to upload a photo.",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      exif: true, // capture EXIF data
    });
    if (!result.canceled && result.assets[0]) {
      applyAsset(result.assets[0], "gallery");
    }
  };

  // ── Remove / retake photo ─────────────────────────────────────────────────
  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoFile(null);
    setImageSource(null);
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
          text1: "Permission denied",
          text2: "Allow location access to tag this issue.",
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
        Toast.show({ type: "error", text1: "Photo required", text2: "Please attach a photo for issues." });
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
        formData.append("image", photoFile as any);         // renamed from "photo"
        formData.append("lat", String(location!.lat));
        formData.append("lng", String(location!.lng));
        formData.append("timestamp", timestamp ?? new Date().toISOString());
        formData.append("imageSource", imageSource ?? "camera");
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
          <Text style={S.headerTitle}>New Complaint 📋</Text>
          <View style={S.headerBreadcrumb}>
            <View style={S.headerBreadcrumbDot} />
            <Text style={S.headerSub}>Report an issue or share a suggestion</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={S.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Type toggle ── */}
        <View style={S.toggleWrap}>
          {(["issue", "suggestion"] as ComplaintType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[S.toggleBtn, type === t && S.toggleBtnActive]}
              onPress={() => setType(t)}
              activeOpacity={0.8}
            >
              <Text style={[S.toggleBtnTxt, type === t && S.toggleBtnTxtActive]}>
                {t === "issue" ? "🔧  Issue" : "💡  Suggestion"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Type hint ── */}
        <View style={S.hintBox}>
          <Text style={S.hintText}>
            {type === "issue"
              ? "Issues require a photo and your GPS location to verify and locate the problem."
              : "Suggestions are text-only. Share your ideas to improve the village."}
          </Text>
        </View>

        {/* ── Main form card ── */}
        <View style={S.card}>
          {/* Title */}
          <View style={[S.fieldWrap, S.fieldBorder]}>
            <Text style={S.fieldLabel}>Title</Text>
            <View style={[S.inputRow, focused === "title" && S.inputRowFocused]}>
              <TextInput
                style={S.input}
                placeholder="Brief title of your complaint"
                placeholderTextColor={Colors.textMuted}
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
          <View style={S.fieldWrap}>
            <Text style={S.fieldLabel}>Description</Text>
            <View style={[S.textAreaRow, focused === "desc" && S.inputRowFocused]}>
              <TextInput
                style={S.textArea}
                placeholder="Describe the issue or suggestion in detail…"
                placeholderTextColor={Colors.textMuted}
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

        {/* ── Issue-only: Photo ── */}
        {type === "issue" && (
          <View style={S.card}>
            <View style={S.fieldWrap}>
              <Text style={S.fieldLabel}>
                Photo  <Text style={S.requiredBadge}>REQUIRED</Text>
              </Text>

              {photo ? (
                /* ── Preview + retake ── */
                <View style={S.photoPreviewWrap}>
                  <Image source={{ uri: photo }} style={S.photoPreview} resizeMode="cover" />

                  {/* Source badge */}
                  <View style={[S.sourceBadge, imageSource === "gallery" && S.sourceBadgeGallery]}>
                    <Text style={S.sourceBadgeTxt}>
                      {imageSource === "camera" ? "📸 Camera" : "🖼️ Gallery"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={S.photoRemoveBtn}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.8}
                  >
                    <Text style={S.photoRemoveTxt}>✕  Remove / Retake</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ── Dual picker buttons ── */
                <View style={S.pickerButtonsWrap}>
                  <TouchableOpacity
                    style={[S.pickerBtn, S.pickerBtnCamera]}
                    onPress={handleTakePhoto}
                    activeOpacity={0.8}
                  >
                    <Text style={S.pickerBtnIcon}>📸</Text>
                    <Text style={[S.pickerBtnTxt, S.pickerBtnTxtCamera]}>
                      Take Photo
                    </Text>
                    <Text style={S.pickerBtnSub}>Recommended</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[S.pickerBtn, S.pickerBtnGallery]}
                    onPress={handlePickFromGallery}
                    activeOpacity={0.8}
                  >
                    <Text style={S.pickerBtnIcon}>🖼️</Text>
                    <Text style={[S.pickerBtnTxt, S.pickerBtnTxtGallery]}>
                      Upload from Gallery
                    </Text>
                    <Text style={S.pickerBtnSub}>Less reliable</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── AI Warning messages ── */}
              {aiWarnings.length > 0 && (
                <View style={S.warningWrap}>
                  {aiWarnings.map((w, i) => (
                    <View key={i} style={S.warningRow}>
                      <Text style={S.warningIcon}>⚠️</Text>
                      <Text style={S.warningText}>{w}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Issue-only: Location ── */}
        {type === "issue" && (
          <View style={S.card}>
            <View style={S.fieldWrap}>
              <Text style={S.fieldLabel}>
                Location  <Text style={S.requiredBadge}>REQUIRED</Text>
              </Text>

              {location ? (
                <View style={S.locRow}>
                  <View style={S.locIconWrap}>
                    <Text style={S.locIcon}>📍</Text>
                  </View>
                  <View style={S.locTextBlock}>
                    <Text style={S.locCoords}>
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </Text>
                    <Text style={S.locCaptured}>GPS captured</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleGetLocation}
                    style={S.locRefreshBtn}
                    activeOpacity={0.8}
                    disabled={locLoading}
                  >
                    {locLoading ? (
                      <ActivityIndicator color={Colors.primary[600] ?? "#8B6B61"} size="small" />
                    ) : (
                      <Text style={S.locRefreshTxt}>Refresh</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={S.locCaptureBtn}
                  onPress={handleGetLocation}
                  activeOpacity={0.8}
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <ActivityIndicator color={Colors.primary[600] ?? "#8B6B61"} size="small" />
                  ) : (
                    <Text style={S.locCaptureTxt}>📍  Capture My Location</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* ── Submit ── */}
        <TouchableOpacity
          style={[S.submitBtn, loading && S.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.82}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={S.submitBtnTxt}>Submit Complaint</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // ── Header ────────────────────────────────────────────────────────────────
  headerShell: {
    backgroundColor: Colors.primary[700],
    paddingBottom: 28,
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
  headerNavRow: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 18 },
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
  headerBreadcrumb: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4 },
  headerBreadcrumbDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: "500" },

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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 11,
    borderRadius: 11,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary[700],
    shadowColor: Colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnTxt: {
    fontSize: 13, fontWeight: "700",
    color: Colors.textSecondary,
  },
  toggleBtnTxtActive: { color: "#fff" },

  // ── Hint box ──────────────────────────────────────────────────────────────
  hintBox: {
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary[500] ?? "#a88560",
  },
  hintText: {
    fontSize: 12, color: Colors.textSecondary,
    lineHeight: 18, fontWeight: "500",
  },

  // ── Card ──────────────────────────────────────────────────────────────────
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
  requiredBadge: {
    fontSize: 9, fontWeight: "800",
    color: "#e05252",
    letterSpacing: 1,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  inputRowFocused: {
    borderColor: Colors.primary[500] ?? "#a88560",
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
  },
  input: {
    flex: 1, fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    paddingVertical: 0,
  },
  textAreaRow: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
  },
  textArea: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    lineHeight: 22,
  },

  // ── Dual picker buttons ───────────────────────────────────────────────────
  pickerButtonsWrap: {
    flexDirection: "row",
    gap: 10,
  },
  pickerBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
    gap: 4,
  },
  pickerBtnCamera: {
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
    borderColor: Colors.primary[400] ?? "#b89a70",
  },
  pickerBtnGallery: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  pickerBtnIcon: { fontSize: 22 },
  pickerBtnTxt: {
    fontSize: 12, fontWeight: "700",
    textAlign: "center",
  },
  pickerBtnTxtCamera: {
    color: Colors.primary[700] ?? "#6D4C41",
  },
  pickerBtnTxtGallery: {
    color: Colors.textSecondary,
  },
  pickerBtnSub: {
    fontSize: 10, fontWeight: "500",
    color: Colors.textMuted,
  },

  // ── Photo preview ─────────────────────────────────────────────────────────
  photoPreviewWrap: { gap: 8 },
  photoPreview: {
    width: "100%", height: 180,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary[200] ?? "#e8d8c8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeGallery: {
    backgroundColor: "#fff3e0",
  },
  sourceBadgeTxt: {
    fontSize: 10, fontWeight: "700",
    color: Colors.primary[700] ?? "#6D4C41",
  },
  photoRemoveBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fce8e8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  photoRemoveTxt: { fontSize: 12, fontWeight: "700", color: "#e05252" },

  // ── AI Warning ────────────────────────────────────────────────────────────
  warningWrap: {
    marginTop: 10,
    gap: 6,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#fff8ec",
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
    color: "#b45309",
    lineHeight: 18,
  },

  // ── Location ──────────────────────────────────────────────────────────────
  locCaptureBtn: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    paddingVertical: 16,
    alignItems: "center",
  },
  locCaptureTxt: {
    fontSize: 13, fontWeight: "700",
    color: Colors.primary[600] ?? "#8B6B61",
  },
  locRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.primary[100] ?? "#f5efe9",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  locIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary[200] ?? "#e8d8c8",
    justifyContent: "center", alignItems: "center",
  },
  locIcon: { fontSize: 16 },
  locTextBlock: { flex: 1 },
  locCoords: {
    fontSize: 13, fontWeight: "700",
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  locCaptured: {
    fontSize: 11, fontWeight: "500",
    color: Colors.primary[600] ?? "#8B6B61",
    marginTop: 1,
  },
  locRefreshBtn: {
    backgroundColor: Colors.primary[200] ?? "#e8d8c8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
  },
  locRefreshTxt: {
    fontSize: 11, fontWeight: "700",
    color: Colors.primary[700] ?? "#6D4C41",
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn: {
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
  submitBtnDisabled: { opacity: 0.62 },
  submitBtnTxt: {
    color: Colors.textInverse,
    fontSize: 15, fontWeight: "800",
    letterSpacing: 0.3,
  },
});