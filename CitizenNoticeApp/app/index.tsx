/**
 * Home Screen - QR-First Landing Page
 * Simple landing page guiding users to scan QR codes for village notices
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface ScannedVillage {
  villageId: string;
  villageName: string;
  district: string;
  state: string;
  pincode: string;
  scannedAt: string;
  qrCodeId: string;
}

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [recentVillages, setRecentVillages] = useState<ScannedVillage[]>([]);
  
  // Animation values
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const appNameSlide = useRef(new Animated.Value(0)).current;
  const qrButtonScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Splash animation
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(appNameSlide, {
          toValue: -50,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLoading(false);
        loadRecentVillages();
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animate QR button after content loads
  useEffect(() => {
    if (!isLoading) {
      Animated.sequence([
        Animated.timing(qrButtonScale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(qrButtonScale, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(qrButtonScale, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [isLoading]);

  const loadRecentVillages = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentVillages');
      if (stored) {
        const villages = JSON.parse(stored) as ScannedVillage[];
        setRecentVillages(villages.slice(0, 5)); // Show last 5 scanned
      }
    } catch (err) {
      console.error('Error loading recent villages:', err);
    }
  };

  const handleVillagePress = (village: ScannedVillage) => {
    router.push(`qr-notices/${village.villageId}` as any);
  };

  const handleScanQR = () => {
    router.push('qr-scanner' as any);
  };

  // Splash Screen
  const SplashScreen = () => (
    <Animated.View 
      style={[
        styles.splashContainer,
        {
          opacity: splashOpacity,
          transform: [{ scale: logoScale }]
        }
      ]}
    >
      <View style={styles.splashContent}>
        <View style={styles.splashLogoCircle}>
          <Image
            source={require("../assets/images/gramvarthalogo.png")}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
        </View>
        <Animated.Text 
          style={[
            styles.splashAppName,
            {
              transform: [{ translateY: appNameSlide }]
            }
          ]}
        >
          GramVartha
        </Animated.Text>
        <Text style={styles.splashTagline}>Village Notices on Demand</Text>
      </View>
    </Animated.View>
  );

  // Main Content
  const MainContent = () => (
    <Animated.View style={[styles.mainContainer, { opacity: contentOpacity }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../assets/images/gramvarthalogo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.appName}>GramVartha</Text>
              <Text style={styles.tagline}>Digital Village Updates</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Scan QR to View</Text>
          <Text style={styles.welcomeSubtitle}>Village notices from your area</Text>
        </View>

        {/* Large QR Scanner Button */}
        <Animated.View 
          style={[
            styles.qrButtonContainer,
            {
              transform: [{ scale: qrButtonScale }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={handleScanQR}
            activeOpacity={0.85}
          >
            <Text style={styles.qrButtonIcon}>Ì≥±</Text>
            <Text style={styles.qrButtonTitle}>Scan QR Code</Text>
            <Text style={styles.qrButtonSubtitle}>Point camera at QR code</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={[styles.infoCard, { backgroundColor: Colors.primary[50] }]}>
            <Text style={styles.infoIcon}>‚úì</Text>
            <Text style={styles.infoText}>No login required</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: Colors.success + '15' }]}>
            <Text style={styles.infoIcon}>Ì≥ç</Text>
            <Text style={styles.infoText}>Location-based notices</Text>
          </View>
        </View>

        {/* Recently Scanned Section */}
        {recentVillages.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recently Scanned</Text>
            <FlatList
              data={recentVillages}
              keyExtractor={(item) => item.villageId}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recentVillageCard}
                  onPress={() => handleVillagePress(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.recentVillageContent}>
                    <Text style={styles.recentVillageLabel}>Ì≥ç {item.villageName}</Text>
                    <Text style={styles.recentVillageSubtitle}>
                      {item.district}, {item.state}
                    </Text>
                  </View>
                  <Text style={styles.recentVillageArrow}>‚Üí</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* How it Works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howItWorksTitle}>How it works</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Scan the village QR code</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>View all village notices</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Get location-based updates</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {isLoading ? <SplashScreen /> : <MainContent />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContainer: {
    flex: 1,
  },

  // Splash Screen Styles
  splashContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
  },
  splashLogoCircle: {
    width: 120,
    height: 120,
    backgroundColor: Colors.surface,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  splashLogoImage: {
    width: 80,
    height: 80,
  },
  splashAppName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textInverse,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  splashTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Header Styles
  header: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 56,
    height: 56,
    backgroundColor: Colors.primary[600],
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: 45,
    height: 45,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary[700],
    lineHeight: 26,
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // QR Button
  qrButtonContainer: {
    marginBottom: 24,
  },
  qrButton: {
    backgroundColor: Colors.primary[600],
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: Colors.primary[700],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  qrButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  qrButtonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textInverse,
    marginBottom: 4,
  },
  qrButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // Info Cards
  infoCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },

  // Recent Villages
  recentSection: {
    marginBottom: 24,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  recentVillageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentVillageContent: {
    flex: 1,
  },
  recentVillageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  recentVillageSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recentVillageArrow: {
    fontSize: 16,
    color: Colors.primary[600],
  },

  // How It Works
  howItWorks: {
    backgroundColor: Colors.primary[50],
    borderRadius: 16,
    padding: 16,
  },
  howItWorksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[600],
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
    textAlignVertical: 'center',
    textAlign: 'center',
    marginRight: 10,
  },
  stepText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
});
