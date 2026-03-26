// app/index.tsx
/**
 * Home Screen - QR-First Landing Page
 * Restyled with theme support
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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
import { isLoggedIn } from "../utils/auth";
import { useTheme } from '../context/ThemeContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { ThemedCard } from '../components/ThemedCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ScannedVillage {
  villageId: string;
  villageName: string;
  district: string;
  state: string;
  pincode: string;
  scannedAt: string;
  qrCodeId: string;
}

// ─── Animated scan-ring around CTA ────────────────────────────────────────────
const PulseRing = ({ color }: { color: string }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.28, duration: 1600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.45, duration: 1600, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        { 
          transform: [{ scale }], 
          opacity,
          borderColor: color,
        },
      ]}
    />
  );
};

// ─── QR grid icon (pure view, no emoji) ───────────────────────────────────────
const QRIcon = ({ size = 36, color = '#fff' }: { size?: number; color?: string }) => {
  const cell = size / 7;
  const dot = (x: number, y: number, w = 1, h = 1) => (
    <View
      key={`${x}-${y}`}
      style={{
        position: 'absolute',
        left: x * cell,
        top: y * cell,
        width: cell * w,
        height: cell * h,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
  );

  return (
    <View style={{ width: size, height: size }}>
      {/* Top-left finder */}
      {dot(0, 0, 3, 3)}
      <View style={{ 
        position: 'absolute', 
        left: cell, 
        top: cell, 
        width: cell, 
        height: cell, 
        backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', 
        borderRadius: 1 
      }} />
      {/* Top-right finder */}
      {dot(4, 0, 3, 3)}
      <View style={{ 
        position: 'absolute', 
        left: 5 * cell, 
        top: cell, 
        width: cell, 
        height: cell, 
        backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', 
        borderRadius: 1 
      }} />
      {/* Bottom-left finder */}
      {dot(0, 4, 3, 3)}
      <View style={{ 
        position: 'absolute', 
        left: cell, 
        top: 5 * cell, 
        width: cell, 
        height: cell, 
        backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', 
        borderRadius: 1 
      }} />
      {/* Data dots */}
      {dot(4, 3, 1, 1)}{dot(5, 4, 1, 1)}{dot(6, 3, 1, 1)}
      {dot(4, 5, 1, 1)}{dot(6, 5, 1, 1)}{dot(5, 6, 1, 1)}{dot(6, 6, 1, 1)}
      {dot(3, 3, 1, 1)}{dot(3, 5, 1, 1)}
    </View>
  );
};

// ─── Village card with theme support ──────────────────────────────────────────────
const VillageCard = ({
  item,
  onPress,
  index,
  colors,
}: {
  item: ScannedVillage;
  onPress: () => void;
  index: number;
  colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initials = item.villageName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <TouchableOpacity
        style={[
          styles.villageCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.72}
      >
        <View style={[
          styles.villageAvatar,
          { backgroundColor: `${colors.primary.DEFAULT}18` }
        ]}>
          <Text style={[styles.villageAvatarText, { color: colors.primary.DEFAULT }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.villageCardBody}>
          <Text style={[styles.villageCardName, { color: colors.text.primary }]}>
            {item.villageName}
          </Text>
          <Text style={[styles.villageCardMeta, { color: colors.text.secondary }]}>
            {item.district} · {item.state}
          </Text>
        </View>
        <View style={[
          styles.villageCardArrow,
          { backgroundColor: `${colors.primary.DEFAULT}12` }
        ]}>
          <Text style={[styles.villageCardArrowText, { color: colors.primary.DEFAULT }]}>
            ›
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, isDark, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [recentVillages, setRecentVillages] = useState<ScannedVillage[]>([]);

  // Splash
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  // Content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(splashScale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsLoading(false);
        loadRecentVillages();
      });
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  const loadRecentVillages = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentVillages');
      if (stored) setRecentVillages((JSON.parse(stored) as ScannedVillage[]).slice(0, 5));
    } catch {}
  };

  const handleCreateComplaint = async () => {
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      Alert.alert(
        "Login Required",
        "You must login to create a complaint",
        [
          {
            text: "Login",
            onPress: () => router.push({ pathname: "/auth/login" } as any),
          },
          {
            text: "Register",
            onPress: () => router.push({ pathname: "/auth/register" } as any),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
      return;
    }

    router.push("/complaint" as any);
  };

  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* ── Splash ── */}
      <Animated.View
        pointerEvents={isLoading ? 'auto' : 'none'}
        style={[
          styles.splash,
          { 
            opacity: splashOpacity, 
            transform: [{ scale: splashScale }],
            backgroundColor: colors.primary.DEFAULT,
          },
        ]}
      >
        <View style={styles.splashLogoWrap}>
          <Image
            source={require('../assets/images/gramvarthalogo.png')}
            style={styles.splashLogoImg}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.splashName}>GramVartha</Text>
        <Text style={styles.splashTagline}>Village Notices on Demand</Text>
      </Animated.View>

      {/* ── Main ── */}
      <Animated.View
        style={[
          styles.main,
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Theme Toggle */}
          <View style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            }
          ]}>
            <View style={styles.headerLogo}>
              <View style={[
                styles.headerLogoCircle,
                { backgroundColor: colors.primary.DEFAULT }
              ]}>
                <Image
                  source={require('../assets/images/gramvarthalogo.png')}
                  style={styles.headerLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerAppName, { color: colors.primary[700] }]}>
                  GramVartha
                </Text>
                <Text style={[styles.headerTagline, { color: colors.text.secondary }]}>
                  Digital Village Updates
                </Text>
              </View>
            </View>
            <ThemeToggle variant="icon" />
          </View>

          {/* Hero CTA */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroEyebrow, { color: colors.primary[500] }]}>
              VILLAGE NOTICES
            </Text>
            <Text style={[styles.heroTitle, { color: colors.text.primary }]}>
              Scan once.{'\n'}Stay informed.
            </Text>
            <Text style={[styles.heroSub, { color: colors.text.secondary }]}>
              Point your camera at any village QR code to instantly access local
              notices, announcements, and updates — no sign-up needed.
            </Text>

            {/* Big scan button */}
            <View style={styles.ctaWrapper}>
              <PulseRing color={colors.primary[500]} />
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: colors.primary.DEFAULT }]}
                onPress={() => router.push('/qr-notices/qr-scanner' as any)}
                activeOpacity={0.88}
              >
                <QRIcon size={34} color="#fff" />
                <Text style={styles.ctaLabel}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.primary[500],
                  backgroundColor: `${colors.primary[500]}10`,
                }
              ]}
              onPress={handleCreateComplaint}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary[700] }]}>
                Raise Issue / Complaint
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.workGuideButton,
                { backgroundColor: colors.primary.DEFAULT }
              ]}
              onPress={async () => {
                if (recentVillages.length > 0) {
                  router.push('/qr-notices/workguide' as any);
                } else {
                  Alert.alert(
                    'Scan a Village First',
                    'Please scan your village QR code to access the Work Guide.',
                    [
                      { text: 'Scan Now', onPress: () => router.push('/qr-notices/qr-scanner' as any) },
                      { text: 'Cancel', style: 'cancel' },
                    ]
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.workGuideButtonText}>Work Guide</Text>
            </TouchableOpacity>

            {/* Trust pills */}
            <View style={styles.pillRow}>
              <View style={[
                styles.pill,
                { backgroundColor: `${colors.primary[500]}12` }
              ]}>
                <Text style={[styles.pillDot, { color: colors.primary.DEFAULT }]}>✓</Text>
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>No login</Text>
              </View>
              <View style={[
                styles.pill,
                { backgroundColor: `${colors.primary[500]}12` }
              ]}>
                <Text style={[styles.pillDot, { color: colors.primary.DEFAULT }]}>✓</Text>
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>Instant access</Text>
              </View>
              <View style={[
                styles.pill,
                { backgroundColor: `${colors.primary[500]}12` }
              ]}>
                <Text style={[styles.pillDot, { color: colors.primary.DEFAULT }]}>✓</Text>
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>Free forever</Text>
              </View>
            </View>
          </View>

          {/* Recent villages */}
          {recentVillages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  Recently Scanned
                </Text>
                <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                  {recentVillages.length} village
                  {recentVillages.length > 1 ? 's' : ''}
                </Text>
              </View>
              {recentVillages.map((v, i) => (
                <VillageCard
                  key={v.villageId}
                  item={v}
                  index={i}
                  colors={colors}
                  onPress={() => router.push(`/qr-notices/${v.villageId}` as any)}
                />
              ))}
            </View>
          )}

          {/* How it works */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              How it works
            </Text>
            <ThemedCard variant="elevated" style={styles.stepsCard}>
              {[
                { n: '1', label: 'Find the QR code', sub: 'Posted at the village entrance or notice board' },
                { n: '2', label: 'Scan with the app', sub: 'Tap "Scan QR Code" and point your camera' },
                { n: '3', label: 'Read local notices', sub: 'Announcements, events, and official updates' },
              ].map((step, i, arr) => (
                <View key={step.n}>
                  <View style={styles.stepRow}>
                    <View style={[
                      styles.stepBadge,
                      { backgroundColor: colors.primary.DEFAULT }
                    ]}>
                      <Text style={styles.stepBadgeText}>{step.n}</Text>
                    </View>
                    <View style={styles.stepBody}>
                      <Text style={[styles.stepLabel, { color: colors.text.primary }]}>
                        {step.label}
                      </Text>
                      <Text style={[styles.stepSub, { color: colors.text.secondary }]}>
                        {step.sub}
                      </Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && (
                    <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </ThemedCard>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Splash ──────────────────────────────────────────────────────────────────
  splash: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  splashLogoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  splashLogoImg: { width: 64, height: 64 },
  splashName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  splashTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // ── Main ────────────────────────────────────────────────────────────────────
  main: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Header
  header: {
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: {
    flex: 1,
  },
  headerLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerLogoImg: { width: 32, height: 32 },
  headerAppName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerTagline: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },

  // CTA button
  ctaWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 172,
    height: 172,
    alignSelf: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 2,
  },
  ctaButton: {
    width: 148,
    height: 148,
    borderRadius: 74,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  pillDot: {
    fontSize: 11,
    fontWeight: '700',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Village cards
  villageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
    borderWidth: 1,
  },
  villageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  villageAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  villageCardBody: { flex: 1 },
  villageCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  villageCardMeta: {
    fontSize: 12,
  },
  villageCardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  villageCardArrowText: {
    fontSize: 18,
    lineHeight: 22,
    marginLeft: 1,
  },

  // How it works
  stepsCard: {
    borderRadius: 16,
    padding: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 1,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepBody: { flex: 1 },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  stepConnector: {
    width: 1,
    height: 16,
    marginLeft: 15,
    marginVertical: 4,
  },
  secondaryButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  workGuideButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  workGuideButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});