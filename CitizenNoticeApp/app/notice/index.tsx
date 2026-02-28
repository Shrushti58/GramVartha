/**
 * Notices Index - Redirects to QR Scanner
 * This page has been replaced with QR-first workflow
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function NoticesIndexScreen() {
  useEffect(() => {
    // Auto-redirect to QR scanner after 2 seconds
    const timer = setTimeout(() => {
      router.replace('qr-scanner' as any);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>í³±</Text>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.description}>
          Village notices are available by scanning a QR code. This ensures you see notices specific to your village.
        </Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('qr-scanner' as any)}
        >
          <Text style={styles.buttonText}>Go to QR Scanner â†’</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>Redirecting in 2 seconds...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
