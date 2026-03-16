/**
 * QR Scanner Screen - Scan village QR codes
 * Restyled: production-ready, clean civic-tech aesthetic
 */

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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Config } from '../constants/config';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;

// ─── Corner bracket component for scanner frame ───────────────────────────────
const CornerBracket = ({
  position,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
}) => {
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
          isLeft ? { left: 0 } : { right: 0 },
          isTop ? { top: 0 } : { bottom: 0 },
        ]}
      />
      <View
        style={[
          scannerStyles.cornerV,
          isLeft ? { left: 0 } : { right: 0 },
          isTop ? { top: 0 } : { bottom: 0 },
        ]}
      />
    </View>
  );
};

// ─── Animated scan line ────────────────────────────────────────────────────────
const ScanLine = ({ isActive }: { isActive: boolean }) => {
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
      style={[scannerStyles.scanLine, { transform: [{ translateY }] }]}
    />
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
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

    // Store full village object
    await AsyncStorage.setItem(
      "scannedVillage",
      JSON.stringify(scannedVillageData)
    );

    // Store villageId separately for authentication / complaints
    await AsyncStorage.setItem("villageId", villageData._id);

    // Manage recent villages list
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

    Alert.alert(
      "✓ Village Found",
      `"${villageData.name}" has been scanned successfully.`,
      [
        {
          text: "View Notices",
          onPress: () =>
            router.push(`qr-notices/${villageData._id}` as any),
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

  } catch (err: unknown) {
    const errorMessage =
      (err as any)?.response?.data?.error ||
      "Invalid QR code. Please try again.";

    Alert.alert("Unrecognised Code", errorMessage, [
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
      <View style={styles.permissionContainer}>
        <ActivityIndicator color={Colors.primary[500]} />
        <Text style={styles.permissionSubtext}>
          Checking camera permissions…
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>📷</Text>
        </View>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionBody}>
          Allow camera access so you can scan village QR codes and view local
          notices.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Allow Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.ghostBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Manual entry screen ────────────────────────────────────────────────────
  if (showManualInput) {
    return (
      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.manualScroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header row */}
          <View style={styles.manualHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowManualInput(false);
                setManualInput('');
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backChip}
            >
              <Text style={styles.backChipText}>← Scanner</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.manualBody}>
            <Text style={styles.manualLabel}>Manual Entry</Text>
            <Text style={styles.manualTitle}>Enter Village Code</Text>
            <Text style={styles.manualDesc}>
              Type or paste the QR code value or village ID below.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>QR CODE / VILLAGE ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. VLG-MH-2024-0041"
                placeholderTextColor={Colors.textSecondary}
                value={manualInput}
                onChangeText={setManualInput}
                editable={!loading}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleManualSubmit}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleManualSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Look Up Village</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => {
                setShowManualInput(false);
                setManualInput('');
              }}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.ghostBtnText}>Back to Scanner</Text>
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

      {/* Dark vignette overlay with a clear centre window */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top dark band */}
        <View
          style={[
            styles.overlayBand,
            { height: (height - FRAME_SIZE) / 2 - 10 },
          ]}
        />
        {/* Middle row */}
        <View style={styles.overlayMiddleRow}>
          <View
            style={[
              styles.overlaySide,
              { width: (width - FRAME_SIZE) / 2 },
            ]}
          />
          {/* Scanner frame */}
          <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
            <CornerBracket position="tl" />
            <CornerBracket position="tr" />
            <CornerBracket position="bl" />
            <CornerBracket position="br" />
            <ScanLine isActive={!scanned && !loading} />
          </View>
          <View
            style={[
              styles.overlaySide,
              { width: (width - FRAME_SIZE) / 2 },
            ]}
          />
        </View>
        {/* Bottom dark band */}
        <View style={[styles.overlayBand, { flex: 1 }]} />
      </View>

      {/* Close button */}
      <View style={styles.topBar} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Centre instruction text */}
      <View style={styles.frameLabelContainer} pointerEvents="none">
        <Text style={styles.frameLabelText}>
          {loading
            ? 'Verifying…'
            : scanned
            ? 'Code captured'
            : 'Align QR code within frame'}
        </Text>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator
              size="small"
              color={Colors.primary[500]}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.loadingText}>Verifying QR code…</Text>
          </View>
        ) : (
          <>
            {scanned && (
              <TouchableOpacity
                style={styles.primaryBtnSolid}
                onPress={() => {
                  setScanned(false);
                  setLoading(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Scan Again</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.manualEntryBtn}
              onPress={() => setShowManualInput(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.manualEntryText}>Enter code manually</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },

  // Permission / loading screens
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.primary[500]}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconEmoji: { fontSize: 36 },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  permissionBody: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnSolid: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  btnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  ghostBtn: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    width: '100%',
  },
  ghostBtnText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  // Camera overlay
  overlayBand: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
  overlayMiddleRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  overlaySide: {
    backgroundColor: 'rgba(0,0,0,0.62)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18, lineHeight: 20 },

  // Frame label
  frameLabelContainer: {
    position: 'absolute',
    top: (height - FRAME_SIZE) / 2 + FRAME_SIZE + 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frameLabelText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    letterSpacing: 0.3,
    fontWeight: '500',
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  manualEntryBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  manualEntryText: {
    color: Colors.primary[500],
    fontSize: 14,
    fontWeight: '600',
  },

  // Manual entry screen
  manualScroll: { flexGrow: 1, backgroundColor: Colors.background },
  manualHeader: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backChip: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: `${Colors.primary[500]}14`,
  },
  backChipText: {
    color: Colors.primary[500],
    fontSize: 13,
    fontWeight: '600',
  },
  manualBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  manualLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.primary[500],
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  manualTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  manualDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 32,
  },
  inputWrapper: { marginBottom: 20 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginHorizontal: 12,
  },
});

// ─── Scanner frame corner styles ───────────────────────────────────────────────
const BRACKET = 24;
const THICK = 3;
const scannerStyles = StyleSheet.create({
  corner: { position: 'absolute', width: BRACKET, height: BRACKET },
  cornerH: {
    position: 'absolute',
    width: BRACKET,
    height: THICK,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  cornerV: {
    position: 'absolute',
    width: THICK,
    height: BRACKET,
    backgroundColor: Colors.primary[500],
    borderRadius: 2,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.primary[500],
    opacity: 0.75,
  },
});