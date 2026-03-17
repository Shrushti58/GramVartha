/**
 * Home Screen - QR-First Landing Page
 * Restyled: production-ready civic-tech aesthetic
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
import { Colors } from '../constants/colors';
import { Alert } from "react-native";
import { isLoggedIn } from "../utils/auth";

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
const PulseRing = () => {
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
        { transform: [{ scale }], opacity },
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
      <View style={{ position: 'absolute', left: cell, top: cell, width: cell, height: cell, backgroundColor: color === '#fff' ? Colors.primary[600] : '#fff', borderRadius: 1 }} />
      {/* Top-right finder */}
      {dot(4, 0, 3, 3)}
      <View style={{ position: 'absolute', left: 5 * cell, top: cell, width: cell, height: cell, backgroundColor: color === '#fff' ? Colors.primary[600] : '#fff', borderRadius: 1 }} />
      {/* Bottom-left finder */}
      {dot(0, 4, 3, 3)}
      <View style={{ position: 'absolute', left: cell, top: 5 * cell, width: cell, height: cell, backgroundColor: color === '#fff' ? Colors.primary[600] : '#fff', borderRadius: 1 }} />
      {/* Data dots */}
      {dot(4, 3, 1, 1)}{dot(5, 4, 1, 1)}{dot(6, 3, 1, 1)}
      {dot(4, 5, 1, 1)}{dot(6, 5, 1, 1)}{dot(5, 6, 1, 1)}{dot(6, 6, 1, 1)}
      {dot(3, 3, 1, 1)}{dot(3, 5, 1, 1)}
    </View>
  );
};

// ─── Village card ──────────────────────────────────────────────────────────────
const VillageCard = ({
  item,
  onPress,
  index,
}: {
  item: ScannedVillage;
  onPress: () => void;
  index: number;
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
        style={styles.villageCard}
        onPress={onPress}
        activeOpacity={0.72}
      >
        <View style={styles.villageAvatar}>
          <Text style={styles.villageAvatarText}>{initials}</Text>
        </View>
        <View style={styles.villageCardBody}>
          <Text style={styles.villageCardName}>{item.villageName}</Text>
          <Text style={styles.villageCardMeta}>
            {item.district} · {item.state}
          </Text>
        </View>
        <View style={styles.villageCardArrow}>
          <Text style={styles.villageCardArrowText}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};


// ─── Main Component ────────────────────────────────────────────────────────────
export default function HomeScreen() {
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

  router.push("/complaint");
};
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Splash ── */}
      <Animated.View
        pointerEvents={isLoading ? 'auto' : 'none'}
        style={[
          styles.splash,
          { opacity: splashOpacity, transform: [{ scale: splashScale }] },
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLogo}>
              <View style={styles.headerLogoCircle}>
                <Image
                  source={require('../assets/images/gramvarthalogo.png')}
                  style={styles.headerLogoImg}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.headerAppName}>GramVartha</Text>
                <Text style={styles.headerTagline}>Digital Village Updates</Text>
              </View>
            </View>
          </View>

          {/* Hero CTA */}
          <View style={styles.heroSection}>
            <Text style={styles.heroEyebrow}>VILLAGE NOTICES</Text>
            <Text style={styles.heroTitle}>
              Scan once.{'\n'}Stay informed.
            </Text>
            <Text style={styles.heroSub}>
              Point your camera at any village QR code to instantly access local
              notices, announcements, and updates — no sign-up needed.
            </Text>

            {/* Big scan button */}
            <View style={styles.ctaWrapper}>
              <PulseRing />
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('qr-scanner' as any)}
                activeOpacity={0.88}
              >
                <QRIcon size={34} color="#fff" />
                <Text style={styles.ctaLabel}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
  style={styles.secondaryButton}
  onPress={handleCreateComplaint}
  activeOpacity={0.8}
>
  <Text style={styles.secondaryButtonText}>
    Raise Issue / Complaint
  </Text>
</TouchableOpacity>

            {/* Trust pills */}
            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Text style={styles.pillDot}>✓</Text>
                <Text style={styles.pillText}>No login</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillDot}>✓</Text>
                <Text style={styles.pillText}>Instant access</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillDot}>✓</Text>
                <Text style={styles.pillText}>Free forever</Text>
              </View>
            </View>
          </View>

          {/* Recent villages */}
          {recentVillages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Scanned</Text>
                <Text style={styles.sectionCount}>
                  {recentVillages.length} village
                  {recentVillages.length > 1 ? 's' : ''}
                </Text>
              </View>
              {recentVillages.map((v, i) => (
                <VillageCard
                  key={v.villageId}
                  item={v}
                  index={i}
                  onPress={() => router.push(`qr-notices/${v.villageId}` as any)}
                />
              ))}
            </View>
          )}

          {/* How it works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How it works</Text>
            <View style={styles.stepsCard}>
              {[
                { n: '1', label: 'Find the QR code', sub: 'Posted at the village entrance or notice board' },
                { n: '2', label: 'Scan with the app', sub: 'Tap "Scan QR Code" and point your camera' },
                { n: '3', label: 'Read local notices', sub: 'Announcements, events, and official updates' },
              ].map((step, i, arr) => (
                <View key={step.n}>
                  <View style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{step.n}</Text>
                    </View>
                    <View style={styles.stepBody}>
                      <Text style={styles.stepLabel}>{step.label}</Text>
                      <Text style={styles.stepSub}>{step.sub}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && (
                    <View style={styles.stepConnector} />
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // ── Splash ──────────────────────────────────────────────────────────────────
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary[600],
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
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center' },
  headerLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerLogoImg: { width: 32, height: 32 },
  headerAppName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary[700],
    letterSpacing: -0.3,
  },
  headerTagline: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: Colors.primary[500],
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    borderColor: Colors.primary[500],
  },
  ctaButton: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.primary[700],
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
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: `${Colors.primary[500]}12`,
    gap: 4,
  },
  pillDot: {
    fontSize: 11,
    color: Colors.primary[600],
    fontWeight: '700',
  },
  pillText: {
    fontSize: 11,
    color: Colors.primary[700],
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
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Village cards
  villageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  villageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary[500]}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  villageAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  villageCardBody: { flex: 1 },
  villageCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  villageCardMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  villageCardArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.primary[500]}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  villageCardArrowText: {
    fontSize: 18,
    color: Colors.primary[600],
    lineHeight: 22,
    marginLeft: 1,
  },

  // How it works
  stepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.primary[600],
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
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stepConnector: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
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
  borderColor: Colors.primary[500],
  backgroundColor: `${Colors.primary[500]}10`,
},

secondaryButtonText: {
  color: Colors.primary[700],
  fontSize: 13,
  fontWeight: '600',
},
});

