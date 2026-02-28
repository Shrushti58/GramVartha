/**
 * QR Scanner Screen - Scan village QR codes
 * Allows citizens to scan QR codes and view village notices
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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Config } from '../constants/config';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      const qrCodeId = data.trim();
      console.log('Scanned QR Code:', qrCodeId);

      // Verify village exists by QR code
      const response = await axios.get(`${Config.API_BASE_URL}/villages/qr/${qrCodeId}`);
      const villageData = response.data.village;

      // Store current scanned village
      const scannedVillageData = {
        villageId: villageData._id,
        villageName: villageData.name,
        district: villageData.district,
        state: villageData.state,
        pincode: villageData.pincode,
        scannedAt: new Date().toISOString(),
        qrCodeId: qrCodeId,
      };

      await AsyncStorage.setItem(
        'scannedVillage',
        JSON.stringify(scannedVillageData)
      );

      // Add to recent villages list
      const recentStr = await AsyncStorage.getItem('recentVillages');
      const recent = recentStr ? JSON.parse(recentStr) : [];
      // Remove duplicate if exists
      const filtered = recent.filter((v: any) => v.villageId !== villageData._id);
      // Add to front
      filtered.unshift(scannedVillageData);
      // Keep only last 10
      await AsyncStorage.setItem('recentVillages', JSON.stringify(filtered.slice(0, 10)));

      Alert.alert('Success', `Village "${villageData.name}" scanned successfully!`, [
        {
          text: 'View Notices',
          onPress: () => {
            router.push(`qr-notices/${villageData._id}` as any);
          },
        },
        {
          text: 'Scan Another',
          onPress: () => {
            setScanned(false);
            setLoading(false);
          },
        },
      ]);
    } catch (err: unknown) {
      console.error('Error verifying QR code:', err);
      const errorMessage = (err as any)?.response?.data?.error || 'Invalid QR code. Please try again.';
      Alert.alert(
        'Error',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setLoading(false);
            },
          },
        ]
      );
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a QR code or village ID');
      return;
    }

    await handleBarCodeScanned({ data: manualInput });
    setManualInput('');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.description}>
            We need camera access to scan QR codes. Please grant permission to continue.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonTextSecondary}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {!showManualInput ? (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            {/* Scanner Frame */}
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Position QR code in frame</Text>
            </View>

            {/* Top Controls */}
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary[500]} />
                  <Text style={styles.loadingText}>Verifying QR code...</Text>
                </View>
              ) : (
                <>
                  {scanned && (
                    <TouchableOpacity
                      style={styles.rescanButton}
                      onPress={() => setScanned(false)}
                    >
                      <Text style={styles.buttonText}>Tap to Rescan</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.manualButton}
                    onPress={() => setShowManualInput(true)}
                  >
                    <Text style={styles.buttonTextSecondary}>Manual Entry</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </CameraView>
        </>
      ) : (
        /* Manual Input Screen */
        <ScrollView style={styles.manualContainer}>
          <View style={styles.manualContent}>
            <Text style={styles.title}>Enter QR Code</Text>
            <Text style={styles.description}>
              Manually enter the QR code or village ID if scanning doesn't work.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter QR code or village ID"
              placeholderTextColor={Colors.textSecondary}
              value={manualInput}
              onChangeText={setManualInput}
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleManualSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Submit</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setShowManualInput(false);
                setManualInput('');
              }}
              disabled={loading}
            >
              <Text style={styles.buttonTextSecondary}>Back to Scanner</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: Colors.primary[500],
    borderRadius: 8,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scannerText: {
    color: Colors.textInverse,
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textInverse,
    fontSize: 24,
    fontWeight: '300',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 20,
    borderRadius: 8,
  },
  loadingText: {
    color: Colors.textInverse,
    fontSize: 14,
    marginTop: 10,
  },
  rescanButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textInverse,
    alignItems: 'center',
  },
  manualContainer: {
    flex: 1,
    paddingTop: 40,
  },
  manualContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 21,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
