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
import { useState, useCallback, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import apiService from "../services/api";
import { router } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
function buildWarnings(location: GpsLocation | null, t: any): string[] {
  const warnings: string[] = [];
  if (!location) {
    warnings.push(t('complaint.location_required_warning'));
  }
  return warnings;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Complaint() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
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
  const [villageId, setVillageId] = useState<string | null>(null);
  const [villageName, setVillageName] = useState<string>("");
  const [isVillageLoaded, setIsVillageLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Dynamic colors based on dark mode
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : "#fff";
  const headerSubColor = isDark ? colors.primary[200] : "rgba(255,255,255,0.8)";
  const headerEyebrowColor = isDark ? colors.primary[300] : "rgba(255,255,255,0.6)";
  const backBtnBg = isDark ? `${colors.primary[500]}40` : "rgba(255,255,255,0.15)";

  // Derived warning list
  const warnings = buildWarnings(location, t);

  // ── Load village data from AsyncStorage with extensive debugging ────────────
  useEffect(() => {
    loadVillageData();
  }, []);

  const loadVillageData = async () => {
    try {
      console.log('================== LOADING VILLAGE DATA ==================');
      
      // Check all AsyncStorage keys
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', allKeys);
      
      const villageStr = await AsyncStorage.getItem("scannedVillage");
      console.log('Raw village string from storage:', villageStr);
      
      if (villageStr) {
        const villageData = JSON.parse(villageStr);
        console.log('Parsed village data:', JSON.stringify(villageData, null, 2));
        console.log('All fields in villageData:', Object.keys(villageData));
        
        // Try different possible field names
        const vid = villageData.villageId || villageData._id || villageData.id;
        const vname = villageData.villageName || villageData.name;
        
        console.log('Extracted villageId:', vid);
        console.log('Extracted villageName:', vname);
        console.log('villageData.villageId:', villageData.villageId);
        console.log('villageData._id:', villageData._id);
        console.log('villageData.id:', villageData.id);
        
        if (vid && vid !== 'undefined' && vid !== 'null') {
          setVillageId(vid);
          setVillageName(vname || "Unknown Village");
          setIsVillageLoaded(true);
          setDebugInfo(`✅ Loaded: ${vname} (${vid})`);
          console.log('✅ SUCCESS: Village set successfully!');
          console.log('   Village ID:', vid);
          console.log('   Village Name:', vname);
        } else {
          console.error('❌ Invalid village ID extracted:', vid);
          setDebugInfo(`❌ Invalid village ID: ${vid}`);
          setIsVillageLoaded(false);
        }
      } else {
        console.error('❌ No "scannedVillage" key found in AsyncStorage');
        setDebugInfo('❌ No village found. Please scan QR code first.');
        setIsVillageLoaded(false);
        
        // Try to find if village data is stored under a different key
        for (const key of allKeys) {
          if (key.includes('village') || key.includes('Village')) {
            const value = await AsyncStorage.getItem(key);
            console.log(`Found potential village data in key "${key}":`, value);
          }
        }
      }
      console.log('=======================================================');
    } catch (error) {
      console.error('❌ Error loading village data:', error);
      setDebugInfo(`❌ Error: ${error}`);
      setIsVillageLoaded(false);
    }
  };

  // ── Auto-capture location after image is selected ─────────────────────────
  const autoCaptureLocation = useCallback(async () => {
    if (location) return;
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: t('complaint.permission_needed'),
          text2: t('complaint.allow_location_access'),
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Toast.show({ 
        type: "success", 
        text1: t('complaint.location_captured'), 
        text2: t('complaint.gps_coordinates_saved') 
      });
    } catch {
      Toast.show({ 
        type: "error", 
        text1: t('complaint.location_failed'), 
        text2: t('complaint.could_not_get_location') 
      });
    } finally {
      setLocLoading(false);
    }
  }, [location, t]);

  // ── Take photo from camera ────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: t('complaint.camera_access_needed'),
        text2: t('complaint.allow_camera_access'),
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
          text1: t('complaint.permission_needed'),
          text2: t('complaint.allow_location_access'),
        });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Toast.show({ 
        type: "success", 
        text1: t('complaint.location_captured'), 
        text2: t('complaint.gps_coordinates_saved') 
      });
    } catch {
      Toast.show({ 
        type: "error", 
        text1: t('complaint.location_failed'), 
        text2: t('complaint.could_not_get_location') 
      });
    } finally {
      setLocLoading(false);
    }
  };

  // ── Manual reload village data ─────────────────────────────────────────────
  const handleReloadVillage = async () => {
    Toast.show({ type: "info", text1: "Reloading Village Data..." });
    await loadVillageData();
    if (villageId) {
      Toast.show({ 
        type: "success", 
        text1: "Village Loaded", 
        text2: `${villageName} (${villageId})` 
      });
    } else {
      Toast.show({ 
        type: "error", 
        text1: "No Village Found", 
        text2: "Please scan a QR code first" 
      });
    }
  };

  // ── Submit with extensive debugging ────────────────────────────────────────
  const handleSubmit = async () => {
    console.log('================== SUBMITTING COMPLAINT ==================');
    console.log('Current villageId state:', villageId);
    console.log('Current villageName:', villageName);
    console.log('isVillageLoaded:', isVillageLoaded);
    console.log('Type:', type);
    console.log('Title:', title);
    console.log('Description length:', description.length);
    
    // Double-check from storage directly
    const freshStorage = await AsyncStorage.getItem("scannedVillage");
    console.log('Fresh from storage:', freshStorage);
    
    let finalVillageId = villageId;
    
    if (!finalVillageId && freshStorage) {
      const freshData = JSON.parse(freshStorage);
      finalVillageId = freshData.villageId || freshData._id || freshData.id;
      console.log('Using fresh village ID from storage:', finalVillageId);
      
      if (finalVillageId) {
        setVillageId(finalVillageId);
        setVillageName(freshData.villageName || freshData.name);
        setIsVillageLoaded(true);
      }
    }
    
    if (!finalVillageId) {
      console.error('❌ CRITICAL: No village ID available for submission!');
      Toast.show({ 
        type: "error", 
        text1: "No Village Found", 
        text2: "Please scan a village QR code first" 
      });
      return;
    }
    
    if (!title.trim() || !description.trim()) {
      Toast.show({ 
        type: "error", 
        text1: t('auth.missing_fields'), 
        text2: t('complaint.fill_all_fields') 
      });
      return;
    }

    if (type === "issue") {
      if (!photoFile) {
        Toast.show({ 
          type: "error", 
          text1: t('complaint.photo_required'), 
          text2: t('complaint.take_photo_of_issue') 
        });
        return;
      }
      if (!location) {
        Toast.show({ 
          type: "error", 
          text1: t('complaint.location_required'), 
          text2: t('complaint.capture_gps_location') 
        });
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("village", finalVillageId); // IMPORTANT: Using 'village' field
      
      console.log('📤 FormData contents:');
      console.log('  - type:', type);
      console.log('  - title:', title.trim());
      console.log('  - description:', description.trim());
      console.log('  - village:', finalVillageId);
      console.log('  - village type:', typeof finalVillageId);

      if (type === "issue") {
        formData.append("image", photoFile as any);
        formData.append("lat", String(location!.lat));
        formData.append("lng", String(location!.lng));
        formData.append("timestamp", timestamp ?? new Date().toISOString());
        formData.append("imageSource", "camera");
        console.log('  - lat:', location!.lat);
        console.log('  - lng:', location!.lng);
        console.log('  - timestamp:', timestamp);
      }

      console.log('🚀 Sending request to API...');
      const res = await apiService.createComplaint(formData);
      console.log('✅ API Response:', JSON.stringify(res, null, 2));

      if (res.duplicateOf) {
        Toast.show({
          type: "info",
          text1: t('complaint.already_reported'),
          text2: t('complaint.duplicate_issue_message'),
        });
        setTimeout(() => router.back(), 2000);
        return;
      }

      Toast.show({ 
        type: "success", 
        text1: t('complaint.submitted'), 
        text2: `Complaint submitted for ${villageName}` 
      });
      console.log('✅ Complaint submitted successfully for village:', finalVillageId);
      setTimeout(() => router.back(), 1200);
    } catch (err: any) {
      console.error('❌ Submission error:', err);
      console.error('Error response:', err.response?.data);
      Toast.show({
        type: "error",
        text1: t('complaint.submission_error'),
        text2: err.response?.data?.message || err.message || t('complaint.try_again'),
      });
    } finally {
      setLoading(false);
      console.log('================== SUBMISSION END ==================');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />

      {/* Debug Banner */}
      <View style={[styles.debugBanner, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]}>
        <Text style={[styles.debugText, { color: villageId ? '#4CAF50' : '#f44336', fontSize: 10 }]}>
          {villageId ? `✅ ${villageName} (${villageId.substring(0, 8)}...)` : debugInfo || '⚠️ No Village Loaded'}
        </Text>
      </View>

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
          
          {/* Reload Village Button */}
          <TouchableOpacity 
            onPress={handleReloadVillage} 
            style={[styles.reloadBtn, { backgroundColor: backBtnBg }]} 
            activeOpacity={0.7}
          >
            <Text style={[styles.reloadBtnTxt, { color: headerTextColor }]}>🔄</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>{t('common.citizen_portal')}</Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>{t('complaint.new_complaint')} 📋</Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>{t('complaint.report_issue_or_suggestion')}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Village Info Card */}
        {villageId && (
          <View style={[
            styles.villageCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary[500],
            }
          ]}>
            <View style={[styles.villageIconWrap, { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[100] }]}>
              <Text style={styles.villageIcon}>🏘️</Text>
            </View>
            <View style={styles.villageTextBlock}>
              <Text style={[styles.villageLabel, { color: colors.text.muted }]}>Reporting for Village</Text>
              <Text style={[styles.villageName, { color: colors.text.primary, fontWeight: 'bold' }]}>{villageName}</Text>
              <Text style={[styles.villageId, { color: colors.text.muted, fontSize: 10 }]}>ID: {villageId}</Text>
            </View>
          </View>
        )}

        {/* ── Type toggle ── */}
        <View style={[
          styles.toggleWrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}>
          {(["issue", "suggestion"] as ComplaintType[]).map((complaintType) => (
              <TouchableOpacity
                key={complaintType}
                style={[
                  styles.toggleBtn,
                  type === complaintType && [styles.toggleBtnActive, { backgroundColor: colors.primary[700] }]
                ]}
                onPress={() => setType(complaintType)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.toggleBtnTxt,
                  { color: colors.text.secondary },
                  type === complaintType && [styles.toggleBtnTxtActive, { color: "#fff" }]
                ]}>
                  {complaintType === "issue" ? `🔧 ${t('complaint.issue')}` : `💡 ${t('complaint.suggestion')}`}
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
              ? t('complaint.issue_hint')
              : t('complaint.suggestion_hint')}
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
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>{t('complaint.title')}</Text>
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
                placeholder={t('complaint.title_placeholder')}
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
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>{t('complaint.description')}</Text>
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
                placeholder={t('complaint.description_placeholder')}
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
                {t('complaint.photo')}  <Text style={styles.requiredBadge}>{t('complaint.required')}</Text>
              </Text>

              {photo ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={[
                    styles.sourceBadge,
                    { backgroundColor: isDark ? `${colors.primary[500]}20` : colors.primary[100] }
                  ]}>
                    <Text style={[styles.sourceBadgeTxt, { color: colors.primary[700] }]}>
                      📸 {t('complaint.camera_photo')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.photoRemoveBtn, { backgroundColor: isDark ? `${colors.error}20` : "#fce8e8" }]}
                    onPress={handleRemovePhoto}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.photoRemoveTxt, { color: colors.error || "#e05252" }]}>
                      ✕  {t('complaint.take_new_photo')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
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
                    {t('complaint.take_photo')}
                  </Text>
                  <Text style={[styles.cameraBtnSub, { color: colors.text.muted }]}>
                    {t('complaint.required_for_issue')}
                  </Text>
                </TouchableOpacity>
              )}

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
                {t('complaint.location')}  <Text style={styles.requiredBadge}>{t('complaint.required')}</Text>
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
                      ✓ {t('complaint.gps_captured')}
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
                      <Text style={[styles.locRefreshTxt, { color: colors.primary[700] }]}>{t('complaint.refresh')}</Text>
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
                      📍  {t('complaint.capture_my_location')}
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
            (loading || !isVillageLoaded) && styles.submitBtnDisabled
          ]}
          onPress={handleSubmit}
          activeOpacity={0.82}
          disabled={loading || !isVillageLoaded}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[styles.submitBtnTxt, { color: "#fff" }]}>
              {!isVillageLoaded ? "Loading Village..." : (type === "issue" ? t('complaint.submit_complaint') : t('complaint.submit_suggestion'))}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  debugBanner: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 10,
    fontWeight: '500',
  },

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
  headerNavRow: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: "600" },
  reloadBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  reloadBtnTxt: { fontSize: 20, lineHeight: 24 },
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

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },

  villageCard: {
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
  villageId: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

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