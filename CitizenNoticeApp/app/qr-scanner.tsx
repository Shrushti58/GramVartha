// app/qr-scanner.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Config } from '../constants/config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;

// ─── Corner bracket component for scanner frame ───────────────────────────────
const CornerBracket = ({ position, colors }: { position: 'tl' | 'tr' | 'bl' | 'br'; colors: any }) => {
  const isTop = position.startsWith('t');
  const isLeft = position.endsWith('l');
  return (
    <View
      style={[
        scannerStyles.corner,
        isTop ? { top: -2 } : { bottom: -2 },
        isLeft ? { left: -2 } : { right: -2 },
      ]}
    >
      <View
        style={[
          scannerStyles.cornerH,
          { backgroundColor: colors.primary[500] },
          isLeft ? { left: 0 } : { right: 0 },
          isTop ? { top: 0 } : { bottom: 0 },
        ]}
      />
      <View
        style={[
          scannerStyles.cornerV,
          { backgroundColor: colors.primary[500] },
          isLeft ? { left: 0 } : { right: 0 },
          isTop ? { top: 0 } : { bottom: 0 },
        ]}
      />
    </View>
  );
};

// ─── Animated scan line ────────────────────────────────────────────────────────
const ScanLine = ({ isActive, colors }: { isActive: boolean; colors: any }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isActive]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  return (
    <Animated.View
      style={[
        scannerStyles.scanLine,
        { backgroundColor: colors.primary[500], transform: [{ translateY }] }
      ]}
    />
  );
};

// ─── Success Animation ─────────────────────────────────────────────────────────
const SuccessCheck = ({ visible, colors }: { visible: boolean; colors: any }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 3,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 1500);
    } else {
      scale.setValue(0);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.successOverlay,
        {
          opacity,
          transform: [{ scale }],
          backgroundColor: colors.success,
        }
      ]}
    >
      <Ionicons name="checkmark" size={48} color="#fff" />
    </Animated.View>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function QRScannerScreen() {
  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const cameraRef = useRef(null);

  // Fade-in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    
    // Vibrate on scan
    Vibration.vibrate(100);

    try {
      const qrCodeId = data.trim();

      const response = await axios.get(
        `${Config.API_BASE_URL}/villages/qr/${qrCodeId}`
      );

      const villageData = response.data.village;

      const scannedVillageData = {
        villageId: villageData._id,
        villageName: villageData.name,
        district: villageData.district,
        state: villageData.state,
        pincode: villageData.pincode,
        scannedAt: new Date().toISOString(),
        qrCodeId,
      };

      await AsyncStorage.setItem(
        "scannedVillage",
        JSON.stringify(scannedVillageData)
      );
      await AsyncStorage.setItem("villageId", villageData._id);

      const recentStr = await AsyncStorage.getItem("recentVillages");
      const recent = recentStr ? JSON.parse(recentStr) : [];

      const filtered = recent.filter(
        (v: any) => v.villageId !== villageData._id
      );
      filtered.unshift(scannedVillageData);
      await AsyncStorage.setItem(
        "recentVillages",
        JSON.stringify(filtered.slice(0, 10))
      );

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        Alert.alert(
          "✓ Village Found!",
          `"${villageData.name}" has been scanned successfully.`,
          [
            {
              text: "View Notices",
              onPress: () => router.push(`qr-notices/${villageData._id}` as any),
            },
            {
              text: "Scan Another",
              style: "cancel",
              onPress: () => {
                setScanned(false);
                setLoading(false);
              },
            },
          ]
        );
      }, 500);
      
    } catch (err: unknown) {
      const errorMessage =
        (err as any)?.response?.data?.error ||
        "Invalid QR code. Please try again.";

      Alert.alert("Not Recognized", errorMessage, [
        {
          text: "Try Again",
          onPress: () => {
            setScanned(false);
            setLoading(false);
          },
        },
      ]);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Required', 'Please enter a QR code or village ID.');
      return;
    }
    await handleBarCodeScanned({ data: manualInput });
    setManualInput('');
  };

  // ── Permission screens ─────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.permissionSubtext, { color: colors.text.secondary, marginTop: 16 }]}>
          Checking camera permissions…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary[500]}18` }]}>
          <Ionicons name="camera-outline" size={48} color={colors.primary[500]} />
        </View>
        <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
          Camera Access Needed
        </Text>
        <Text style={[styles.permissionBody, { color: colors.text.secondary }]}>
          We need camera access to scan village QR codes. This helps you quickly access village notices and updates.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary[500] }]}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Allow Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ghostBtn, { borderColor: colors.border }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.ghostBtnText, { color: colors.text.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Manual entry screen ────────────────────────────────────────────────────
  if (showManualInput) {
    return (
      <Animated.View style={[styles.flex, { backgroundColor: colors.background, opacity: fadeAnim }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.manualScroll, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.manualHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowManualInput(false);
                setManualInput('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.backButton, { backgroundColor: `${colors.primary[500]}12` }]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary[500]} />
              <Text style={[styles.backButtonText, { color: colors.primary[500] }]}>Back to Scanner</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.manualBody}>
            <View style={[styles.manualIcon, { backgroundColor: `${colors.primary[500]}12` }]}>
              <Ionicons name="keypad-outline" size={40} color={colors.primary[500]} />
            </View>
            <Text style={[styles.manualTitle, { color: colors.text.primary }]}>
              Enter Village Code
            </Text>
            <Text style={[styles.manualDesc, { color: colors.text.secondary }]}>
              Type or paste the QR code value or village ID from your village notice board
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                QR CODE / VILLAGE ID
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text.primary,
                    backgroundColor: colors.surface,
                  }
                ]}
                placeholder="e.g. VLG-MH-2024-0041"
                placeholderTextColor={colors.text.muted}
                value={manualInput}
                onChangeText={setManualInput}
                editable={!loading}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleManualSubmit}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary[500] },
                loading && styles.btnDisabled
              ]}
              onPress={handleManualSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Find Village</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.text.muted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.ghostBtn, { borderColor: colors.border }]}
              onPress={() => {
                setShowManualInput(false);
                setManualInput('');
              }}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={18} color={colors.text.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.ghostBtnText, { color: colors.text.primary }]}>Use Camera Scanner</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── Camera / scanner screen ────────────────────────────────────────────────
  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Success Animation */}
      <SuccessCheck visible={showSuccess} colors={colors} />

      {/* Dark vignette overlay with clear centre window */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top dark band */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
          style={[styles.overlayBand, { height: (height - FRAME_SIZE) / 2 - 10 }]}
        />
        {/* Middle row */}
        <View style={styles.overlayMiddleRow}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
            style={[styles.overlaySide, { width: (width - FRAME_SIZE) / 2 }]}
          />
          {/* Scanner frame */}
          <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
            <CornerBracket position="tl" colors={colors} />
            <CornerBracket position="tr" colors={colors} />
            <CornerBracket position="bl" colors={colors} />
            <CornerBracket position="br" colors={colors} />
            <ScanLine isActive={!scanned && !loading} colors={colors} />
          </View>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
            style={[styles.overlaySide, { width: (width - FRAME_SIZE) / 2 }]}
          />
        </View>
        {/* Bottom dark band */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={[styles.overlayBand, { flex: 1 }]}
        />
      </View>

      {/* Close button */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Centre instruction text */}
      <View style={styles.frameLabelContainer} pointerEvents="none">
        <Text style={styles.frameLabelText}>
          {loading ? 'Verifying...' : scanned ? 'Code captured!' : 'Align QR code within frame'}
        </Text>
      </View>

      {/* Bottom panel */}
      <View style={[
        styles.bottomPanel,
        {
          backgroundColor: colors.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }
      ]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
            <Text style={[styles.loadingText, { color: colors.text.secondary, marginLeft: 12 }]}>
              Checking village...
            </Text>
          </View>
        ) : (
          <>
            {scanned && (
              <TouchableOpacity
                style={[styles.primaryBtnSolid, { backgroundColor: colors.primary[500] }]}
                onPress={() => {
                  setScanned(false);
                  setLoading(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Scan Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.manualEntryBtn}
              onPress={() => setShowManualInput(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="keypad-outline" size={18} color={colors.primary[500]} />
              <Text style={[styles.manualEntryText, { color: colors.primary[500], marginLeft: 8 }]}>
                Enter code manually
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Permission / loading screens
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  permissionBody: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionSubtext: {
    fontSize: 14,
  },

  // Buttons
  primaryBtn: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnSolid: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  ghostBtn: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    width: '100%',
  },
  ghostBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Camera overlay
  overlayBand: {
    width: '100%',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  overlaySide: {
    height: FRAME_SIZE,
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },

  // Frame label
  frameLabelContainer: {
    position: 'absolute',
    top: (height - FRAME_SIZE) / 2 + FRAME_SIZE + 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frameLabelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  manualEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  manualEntryText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Manual entry screen
  manualScroll: { flexGrow: 1 },
  manualHeader: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  manualBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  manualIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  manualTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  manualDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: {
    fontSize: 13,
    marginHorizontal: 12,
  },

  // Success animation
  successOverlay: {
    position: 'absolute',
    top: height / 2 - 40,
    left: width / 2 - 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

// ─── Scanner frame corner styles ───────────────────────────────────────────────
const BRACKET = 28;
const THICK = 3;
const scannerStyles = StyleSheet.create({
  corner: { position: 'absolute', width: BRACKET, height: BRACKET },
  cornerH: {
    position: 'absolute',
    width: BRACKET,
    height: THICK,
    borderRadius: 2,
  },
  cornerV: {
    position: 'absolute',
    width: THICK,
    height: BRACKET,
    borderRadius: 2,
  },
  scanLine: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
  },
});