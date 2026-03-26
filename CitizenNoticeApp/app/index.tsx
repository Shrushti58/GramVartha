// app/index.tsx
/**
 * Home Screen - QR-First Landing Page
 * Enhanced with detailed work guide and comprehensive app functionality
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
  ActivityIndicator,
  Modal,
  Linking,
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
import { LinearGradient } from 'expo-linear-gradient';

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

// ─── Skeleton Components ─────────────────────────────────────────────────────

const Skeleton = ({ width, height, borderRadius = 12, style }: any) => {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.border : colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

const SkeletonHero = () => {
  const { colors } = useTheme();
  return (
    <View style={styles.heroSection}>
      <Skeleton width={100} height={12} borderRadius={20} style={{ marginBottom: 12 }} />
      <Skeleton width={280} height={40} borderRadius={8} style={{ marginBottom: 12 }} />
      <Skeleton width={width - 80} height={44} borderRadius={8} style={{ marginBottom: 32 }} />
      <View style={styles.ctaWrapper}>
        <Skeleton width={148} height={148} borderRadius={74} />
      </View>
      <View style={styles.pillRow}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} width={80} height={28} borderRadius={20} />
        ))}
      </View>
    </View>
  );
};

const SkeletonVillageCard = () => {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.villageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
      <View style={styles.villageCardBody}>
        <Skeleton width={150} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
        <Skeleton width={120} height={12} borderRadius={4} />
      </View>
      <Skeleton width={28} height={28} borderRadius={14} />
    </View>
  );
};

const SkeletonSection = () => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Skeleton width={120} height={20} borderRadius={6} />
        <Skeleton width={60} height={16} borderRadius={4} />
      </View>
      {[1, 2, 3].map((i) => (
        <SkeletonVillageCard key={i} />
      ))}
    </View>
  );
};
// Add this component before the main component (around line 200)

const SkeletonHomeScreen = () => {
  const { colors } = useTheme();
  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Skeleton */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerLogo}>
            <Skeleton width={44} height={44} borderRadius={22} style={{ marginRight: 10 }} />
            <View>
              <Skeleton width={100} height={18} borderRadius={4} style={{ marginBottom: 4 }} />
              <Skeleton width={80} height={11} borderRadius={4} />
            </View>
          </View>
          <Skeleton width={36} height={36} borderRadius={18} />
        </View>

        <SkeletonHero />
        
        {/* Feature Cards Skeleton */}
        <View style={styles.heroSection}>
          <View style={styles.featureGrid}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Skeleton width={44} height={44} borderRadius={12} style={{ marginBottom: 12 }} />
                <Skeleton width={120} height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width={200} height={32} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
        
        <SkeletonSection />
        
        <View style={styles.section}>
          <Skeleton width={120} height={20} borderRadius={6} style={{ marginBottom: 16 }} />
          <SkeletonStepsCard />
        </View>

        {/* Services Card Skeleton */}
        <View style={styles.section}>
          <Skeleton width={150} height={20} borderRadius={6} style={{ marginBottom: 16 }} />
          <ThemedCard variant="elevated" style={styles.servicesCard}>
            {[1, 2, 3].map((i) => (
              <View key={i}>
                <View style={styles.serviceItem}>
                  <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: 12 }} />
                  <View style={styles.serviceContent}>
                    <Skeleton width={140} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                    <Skeleton width={220} height={12} borderRadius={4} />
                  </View>
                </View>
                {i < 3 && <View style={[styles.serviceDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </ThemedCard>
        </View>

        {/* Tracking Card Skeleton */}
        <View style={styles.section}>
          <Skeleton width={140} height={20} borderRadius={6} style={{ marginBottom: 16 }} />
          <ThemedCard variant="elevated" style={styles.trackingCard}>
            <View style={styles.trackingStatus}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.statusStep}>
                  <Skeleton width={12} height={12} borderRadius={6} />
                  <Skeleton width={40} height={11} borderRadius={4} style={{ marginTop: 4 }} />
                </View>
              ))}
            </View>
            <Skeleton width={250} height={40} borderRadius={8} style={{ alignSelf: 'center', marginTop: 8 }} />
          </ThemedCard>
        </View>
        
        <View style={{ height: 32 }} />
      </ScrollView>
    </ThemedView>
  );
};

const SkeletonStepsCard = () => {
  const { colors } = useTheme();
  return (
    <ThemedCard variant="elevated" style={styles.stepsCard}>
      {[1, 2, 3].map((step, i, arr) => (
        <View key={step}>
          <View style={styles.stepRow}>
            <Skeleton width={32} height={32} borderRadius={16} style={{ marginRight: 14 }} />
            <View style={styles.stepBody}>
              <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 6 }} />
              <Skeleton width={200} height={12} borderRadius={4} />
            </View>
          </View>
          {i < arr.length - 1 && (
            <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
          )}
        </View>
      ))}
    </ThemedCard>
  );
};

// ─── Info Modal Component ─────────────────────────────────────────────────────
const InfoModal = ({ visible, onClose, colors, isDark }: any) => {
  const sections = [
    {
      title: "📱 Scan & Access",
      icon: "qr-code-outline",
      color: colors.primary[500],
      items: [
        "• Find QR code on Panchayat wall or notice board",
        "• Scan with your phone camera - no app download needed",
        "• Instant access to all active village notices",
        "• No registration, no login, no friction"
      ]
    },
    {
      title: "👥 Find Officials",
      icon: "people-outline",
      color: colors.accent.green,
      items: [
        "• Search by name, designation, or responsibility",
        "• View office hours and contact information",
        "• See what documents to carry for each service",
        "• Direct contact details for quick assistance"
      ]
    },
    {
      title: "📝 Report Complaints",
      icon: "alert-circle-outline",
      color: colors.accent.orange,
      items: [
        "• File issues with photos and location",
        "• Track status: Pending → In Progress → Resolved",
        "• Get notified when status changes",
        "• Real accountability and transparency"
      ]
    },
    {
      title: "📢 Village Notices",
      icon: "document-text-outline",
      color: colors.accent.teal,
      items: [
        "• All official announcements in one place",
        "• Filter by category: Development, Health, Education",
        "• Priority tags: Urgent, Important, Regular",
        "• Download attached documents and forms"
      ]
    },
    {
      title: "📋 Work Guide",
      icon: "book-outline",
      color: colors.primary[400],
      items: [
        "• Step-by-step guide for village services",
        "• Required documents checklist",
        "• Application process explained",
        "• Contact information for each service"
      ]
    }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>How GramVartha Works</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
            {sections.map((section, idx) => (
              <View key={idx} style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <View style={[styles.modalSectionIcon, { backgroundColor: `${section.color}15` }]}>
                    <Ionicons name={section.icon as any} size={24} color={section.color} />
                  </View>
                  <Text style={[styles.modalSectionTitle, { color: colors.text.primary }]}>
                    {section.title}
                  </Text>
                </View>
                <View style={styles.modalSectionItems}>
                  {section.items.map((item, itemIdx) => (
                    <Text key={itemIdx} style={[styles.modalItemText, { color: colors.text.secondary }]}>
                      {item}
                    </Text>
                  ))}
                </View>
              </View>
            ))}

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.modalFooterText, { color: colors.text.muted }]}>
                No app download. No registration. Just information at your fingertips.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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

// ─── QR grid icon ───────────────────────────────────────────────────────────
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

// ─── Village card with theme support ──────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, isDark, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [recentVillages, setRecentVillages] = useState<ScannedVillage[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Splash animations
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  // Content animations
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    // Simulate splash screen
    const splashTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(splashScale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]).start(() => {
        setIsLoading(false);
      });
    }, 1500);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadRecentVillages();
    }
  }, [isLoading]);

  const loadRecentVillages = async () => {
    setIsDataLoading(true);
    try {
      const stored = await AsyncStorage.getItem('recentVillages');
      if (stored) {
        const parsed = JSON.parse(stored) as ScannedVillage[];
        setRecentVillages(parsed.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent villages:', error);
    } finally {
      setIsDataLoading(false);
    }
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

  // Show full skeleton while splash is active
  if (isLoading) {
    return <SkeletonHomeScreen />;
  }

  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      {/* Info Modal */}
      <InfoModal 
        visible={showInfoModal} 
        onClose={() => setShowInfoModal(false)}
        colors={colors}
        isDark={isDark}
      />

      {/* ── Splash Overlay (animated) ── */}
      <Animated.View
        pointerEvents="none"
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

      {/* ── Main Content with Fade In ── */}
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
              <LinearGradient
                colors={[colors.primary[500], colors.primary[700]]}
                style={styles.headerLogoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Image
                  source={require('../assets/images/gramvarthalogo.png')}
                  style={styles.headerLogoImg}
                  resizeMode="contain"
                />
              </LinearGradient>
              <View style={styles.headerTextContainer}>
                <Text style={[styles.headerAppName, { color: colors.text.primary }]}>
                  GramVartha
                </Text>
                <Text style={[styles.headerTagline, { color: colors.text.secondary }]}>
                  Digital Village Updates
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => setShowInfoModal(true)}
                style={styles.infoButton}
              >
                <Ionicons name="information-circle-outline" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
              <ThemeToggle variant="icon" />
            </View>
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
                onPress={() => router.push('/qr-scanner' as any)}
                activeOpacity={0.88}
              >
                <QRIcon size={34} color="#fff" />
                <Text style={styles.ctaLabel}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>

            {/* Feature Cards */}
            <View style={styles.featureGrid}>
              <TouchableOpacity 
                style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/qr-notices/workguide' as any)}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                  <Ionicons name="people-outline" size={24} color={colors.primary[500]} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text.primary }]}>Find Officials</Text>
                <Text style={[styles.featureDesc, { color: colors.text.muted }]}>
                  Search by name, designation. View office hours, contact info, required docs.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handleCreateComplaint}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${colors.accent.orange}15` }]}>
                  <Ionicons name="alert-circle-outline" size={24} color={colors.accent.orange} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text.primary }]}>Report & Track</Text>
                <Text style={[styles.featureDesc, { color: colors.text.muted }]}>
                  File issues with photos. Track status: Pending → In Progress → Resolved.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/qr-notices/workguide' as any)}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${colors.accent.teal}15` }]}>
                  <Ionicons name="book-outline" size={24} color={colors.accent.teal} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text.primary }]}>Work Guide</Text>
                <Text style={[styles.featureDesc, { color: colors.text.muted }]}>
                  Step-by-step guides, document checklists, application process explained.
                </Text>
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
              <Ionicons name="alert-circle-outline" size={16} color={colors.primary[700]} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary[700] }]}>
                Raise Issue / Complaint
              </Text>
            </TouchableOpacity>

            {/* Trust pills */}
            <View style={styles.pillRow}>
              <View style={[styles.pill, { backgroundColor: `${colors.primary[500]}12` }]}>
                <Ionicons name="checkmark-circle" size={12} color={colors.primary[500]} />
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>No login</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: `${colors.primary[500]}12` }]}>
                <Ionicons name="flash" size={12} color={colors.primary[500]} />
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>Instant access</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: `${colors.primary[500]}12` }]}>
                <Ionicons name="infinite" size={12} color={colors.primary[500]} />
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>Free forever</Text>
              </View>
            </View>
          </View>

          {/* Recent villages */}
          {!isDataLoading && recentVillages.length > 0 && (
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

          {/* Loading state for recent villages */}
          {isDataLoading && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Skeleton width={120} height={20} borderRadius={6} />
                <Skeleton width={60} height={16} borderRadius={4} />
              </View>
              {[1, 2, 3].map((i) => (
                <SkeletonVillageCard key={i} />
              ))}
            </View>
          )}

          {/* How it works - Enhanced */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              How GramVartha Works
            </Text>
            <ThemedCard variant="elevated" style={styles.stepsCard}>
              {[
                { 
                  n: '1', 
                  label: 'Find QR Code', 
                  sub: 'Look for the GramVartha QR code on Panchayat wall, notice board, or entrance',
                  icon: 'qr-code-outline',
                  details: 'No app download needed - just scan with your phone camera'
                },
                { 
                  n: '2', 
                  label: 'Scan & Access', 
                  sub: 'Point your camera at the QR code for instant access to all active notices',
                  icon: 'camera-outline',
                  details: 'See notices, find officials, and access work guides'
                },
                { 
                  n: '3', 
                  label: 'Stay Informed', 
                  sub: 'Read village announcements, file complaints, and track resolution status',
                  icon: 'notifications-outline',
                  details: 'Get real-time updates on issues you report'
                },
              ].map((step, i, arr) => (
                <View key={step.n}>
                  <View style={styles.stepRow}>
                    <LinearGradient
                      colors={[colors.primary[500], colors.primary[700]]}
                      style={styles.stepBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.stepBadgeText}>{step.n}</Text>
                    </LinearGradient>
                    <View style={styles.stepBody}>
                      <Text style={[styles.stepLabel, { color: colors.text.primary }]}>
                        {step.label}
                      </Text>
                      <Text style={[styles.stepSub, { color: colors.text.secondary }]}>
                        {step.sub}
                      </Text>
                      <Text style={[styles.stepDetail, { color: colors.text.muted }]}>
                        {step.details}
                      </Text>
                    </View>
                    <Ionicons name={step.icon as any} size={20} color={colors.text.muted} />
                  </View>
                  {i < arr.length - 1 && (
                    <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </ThemedCard>
          </View>

          {/* Official Services Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Find the Right Official
            </Text>
            <ThemedCard variant="elevated" style={styles.servicesCard}>
              <View style={styles.serviceItem}>
                <Ionicons name="person-outline" size={20} color={colors.primary[500]} />
                <View style={styles.serviceContent}>
                  <Text style={[styles.serviceTitle, { color: colors.text.primary }]}>
                    Search by Name or Designation
                  </Text>
                  <Text style={[styles.serviceDesc, { color: colors.text.muted }]}>
                    Find the official handling your concern - whether it's development, health, education, or tax
                  </Text>
                </View>
              </View>
              <View style={[styles.serviceDivider, { backgroundColor: colors.border }]} />
              <View style={styles.serviceItem}>
                <Ionicons name="time-outline" size={20} color={colors.primary[500]} />
                <View style={styles.serviceContent}>
                  <Text style={[styles.serviceTitle, { color: colors.text.primary }]}>
                    Office Hours & Contact Info
                  </Text>
                  <Text style={[styles.serviceDesc, { color: colors.text.muted }]}>
                    See when they're available, what documents to carry, and how to reach them
                  </Text>
                </View>
              </View>
              <View style={[styles.serviceDivider, { backgroundColor: colors.border }]} />
              <View style={styles.serviceItem}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary[500]} />
                <View style={styles.serviceContent}>
                  <Text style={[styles.serviceTitle, { color: colors.text.primary }]}>
                    Required Documents
                  </Text>
                  <Text style={[styles.serviceDesc, { color: colors.text.muted }]}>
                    Complete list of documents needed for each service - no more back and forth
                  </Text>
                </View>
              </View>
            </ThemedCard>
          </View>

          {/* Complaint Tracking Preview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Track Your Complaints
            </Text>
            <ThemedCard variant="elevated" style={styles.trackingCard}>
              <View style={styles.trackingStatus}>
                <View style={styles.statusStep}>
                  <View style={[styles.statusDot, { backgroundColor: colors.status.pending }]} />
                  <Text style={[styles.statusText, { color: colors.text.secondary }]}>Pending</Text>
                </View>
                <View style={[styles.statusLine, { backgroundColor: colors.border }]} />
                <View style={styles.statusStep}>
                  <View style={[styles.statusDot, { backgroundColor: colors.status.inProgress }]} />
                  <Text style={[styles.statusText, { color: colors.text.secondary }]}>In Progress</Text>
                </View>
                <View style={[styles.statusLine, { backgroundColor: colors.border }]} />
                <View style={styles.statusStep}>
                  <View style={[styles.statusDot, { backgroundColor: colors.status.completed }]} />
                  <Text style={[styles.statusText, { color: colors.text.secondary }]}>Resolved</Text>
                </View>
              </View>
              <Text style={[styles.trackingNote, { color: colors.text.muted }]}>
                Get notified when status changes. Real accountability, complete transparency.
              </Text>
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
  headerTextContainer: { flex: 1 },
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    padding: 6,
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
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
    marginBottom: 24,
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

  // Feature Cards
  featureGrid: {
    gap: 12,
    marginBottom: 16,
  },
  featureCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Pills
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
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

  // How it works steps
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
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepBody: { flex: 1, marginRight: 12 },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  stepDetail: {
    fontSize: 11,
    lineHeight: 16,
  },
  stepConnector: {
    width: 1,
    height: 20,
    marginLeft: 15,
    marginVertical: 8,
  },

  // Services card
  servicesCard: {
    borderRadius: 16,
    padding: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  serviceDivider: {
    height: 1,
    marginVertical: 4,
  },

  // Tracking card
  trackingCard: {
    borderRadius: 16,
    padding: 16,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusStep: {
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusLine: {
    flex: 1,
    height: 2,
  },
  trackingNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  secondaryButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  workGuideButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalSectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSectionItems: {
    paddingLeft: 56,
    gap: 8,
  },
  modalItemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    paddingTop: 20,
    marginTop: 8,
    borderTopWidth: 1,
    paddingBottom: 20,
  },
  modalFooterText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});