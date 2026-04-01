// app/index.tsx
/**
 * Home Screen - QR-First Landing Page
 * Enhanced with sticky header, sticky bottom nav tabs, scrollable content
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
  Platform,
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
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { use } from 'i18next';

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

// ─── Bottom Tab Config ────────────────────────────────────────────────────────
// Scan is defined separately as the center FAB; the four regular tabs surround it
const TABS = [
  {
    key: 'notices',
    labelKey: 'tab_notices',
    icon: 'document-text-outline' as const,
    activeIcon: 'document-text' as const,
  },
  {
    key: 'complaint',
    labelKey: 'tab_report',
    icon: 'alert-circle-outline' as const,
    activeIcon: 'alert-circle' as const,
  },
  // Center scan placeholder — rendered by TabItem isScan
  {
    key: 'scan',
    labelKey: 'tab_scan',
    icon: 'qr-code-outline' as const,
    activeIcon: 'qr-code' as const,
  },
  {
    key: 'workguide',
    labelKey: 'tab_guide',
    icon: 'book-outline' as const,
    activeIcon: 'book' as const,
  },
  {
    key: 'villages',
    labelKey: 'tab_recent',
    icon: 'time-outline' as const,
    activeIcon: 'time' as const,
  },
];

// ─── Skeleton Components ─────────────────────────────────────────────────────

const Skeleton = ({ width, height, borderRadius = 12, style }: any) => {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: colors.border, opacity }, style]}
    />
  );
};

const SkeletonVillageCard = () => {
  const { colors } = useTheme();
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

// ─── Info Modal ───────────────────────────────────────────────────────────────
const InfoModal = ({ visible, onClose, colors, isDark }: any) => {
  const { t } = useTranslation();
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
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{t('how_app_works')}</Text>
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

// ─── Animated Pulse Ring ──────────────────────────────────────────────────────
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
      style={[styles.pulseRing, { transform: [{ scale }], opacity, borderColor: color }]}
    />
  );
};

// ─── QR grid icon ─────────────────────────────────────────────────────────────
const QRIcon = ({ size = 36, color = '#fff' }: { size?: number; color?: string }) => {
  const cell = size / 7;
  const dot = (x: number, y: number, w = 1, h = 1) => (
    <View
      key={`${x}-${y}`}
      style={{
        position: 'absolute',
        left: x * cell, top: y * cell,
        width: cell * w, height: cell * h,
        backgroundColor: color, borderRadius: 1,
      }}
    />
  );
  return (
    <View style={{ width: size, height: size }}>
      {dot(0, 0, 3, 3)}
      <View style={{ position: 'absolute', left: cell, top: cell, width: cell, height: cell, backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', borderRadius: 1 }} />
      {dot(4, 0, 3, 3)}
      <View style={{ position: 'absolute', left: 5 * cell, top: cell, width: cell, height: cell, backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', borderRadius: 1 }} />
      {dot(0, 4, 3, 3)}
      <View style={{ position: 'absolute', left: cell, top: 5 * cell, width: cell, height: cell, backgroundColor: color === '#fff' ? '#6D4C41' : '#fff', borderRadius: 1 }} />
      {dot(4, 3, 1, 1)}{dot(5, 4, 1, 1)}{dot(6, 3, 1, 1)}
      {dot(4, 5, 1, 1)}{dot(6, 5, 1, 1)}{dot(5, 6, 1, 1)}{dot(6, 6, 1, 1)}
      {dot(3, 3, 1, 1)}{dot(3, 5, 1, 1)}
    </View>
  );
};

// ─── Village Card ─────────────────────────────────────────────────────────────
const VillageCard = ({ item, onPress, index, colors }: {
  item: ScannedVillage; onPress: () => void; index: number; colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay: index * 60, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 320, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const initials = item.villageName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.villageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.72}
      >
        <View style={[styles.villageAvatar, { backgroundColor: `${colors.primary.DEFAULT}18` }]}>
          <Text style={[styles.villageAvatarText, { color: colors.primary.DEFAULT }]}>{initials}</Text>
        </View>
        <View style={styles.villageCardBody}>
          <Text style={[styles.villageCardName, { color: colors.text.primary }]}>{item.villageName}</Text>
          <Text style={[styles.villageCardMeta, { color: colors.text.secondary }]}>{item.district} · {item.state}</Text>
        </View>
        <View style={[styles.villageCardArrow, { backgroundColor: `${colors.primary.DEFAULT}12` }]}>
          <Text style={[styles.villageCardArrowText, { color: colors.primary.DEFAULT }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
const TabItem = ({
  tab,
  isActive,
  onPress,
  colors,
  isScan,
}: {
  tab: typeof TABS[0];
  isActive: boolean;
  onPress: () => void;
  colors: any;
  isScan?: boolean;
}) => {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevActive = useRef(isActive);

  useEffect(() => {
    if (isActive && !prevActive.current) {
      // Tap bounce
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
      ]).start();
      // Glow fade in
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else if (!isActive && prevActive.current) {
      Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
    prevActive.current = isActive;
  }, [isActive]);

  if (isScan) {
    return (
      <TouchableOpacity
        style={styles.tabItemCenter}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Outer glow ring */}
        <Animated.View
          style={[
            styles.scanGlowRing,
            {
              borderColor: colors.primary[500],
              opacity: glowAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={[colors.primary[400], colors.primary[700]]}
            style={styles.tabScanButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Inner white shimmer ring */}
            <View style={styles.scanInnerRing} />
            <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={27} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={[styles.tabLabelCenter, { color: colors.primary[500] }]}>
          {t(tab.labelKey)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.75}>
      <Animated.View
        style={[
          styles.tabIconWrap,
          isActive && { backgroundColor: `${colors.primary[500]}15` },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Active top indicator dot */}
        {isActive && (
          <View style={[styles.tabActiveDot, { backgroundColor: colors.primary[500] }]} />
        )}
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={isActive ? colors.primary[500] : colors.text.muted}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? colors.primary[500] : colors.text.muted },
          isActive && styles.tabLabelActive,
        ]}
      >
        {t(tab.labelKey)}
      </Text>
    </TouchableOpacity>
  );
};

const BottomTabBar = ({
  activeTab,
  onTabPress,
  colors,
  isDark,
  bottomInset,
}: {
  activeTab: string;
  onTabPress: (key: string) => void;
  colors: any;
  isDark: boolean;
  bottomInset: number;
}) => {
  // Layout: [notices] [complaint] [SCAN-FAB] [workguide] [villages]
  const leftTabs  = TABS.filter(t => t.key === 'notices' || t.key === 'complaint');
  const rightTabs = TABS.filter(t => t.key === 'workguide' || t.key === 'villages');
  const scanTab   = TABS.find(t => t.key === 'scan')!;

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: bottomInset > 0 ? bottomInset : 10,
        },
      ]}
    >
      {leftTabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
          colors={colors}
        />
      ))}

      {/* Centre elevated Scan FAB */}
      <TabItem
        tab={scanTab}
        isActive={activeTab === 'scan'}
        onPress={() => onTabPress('scan')}
        colors={colors}
        isScan
      />

      {rightTabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={() => onTabPress(tab.key)}
          colors={colors}
        />
      ))}
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [recentVillages, setRecentVillages] = useState<ScannedVillage[]>([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');

  const splashOpacity = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;


  useEffect(() => {
    const splashTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(splashScale, { toValue: 1.08, duration: 500, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
        Animated.timing(contentSlide, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]).start(() => setIsLoading(false));
    }, 1500);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) loadRecentVillages();
  }, [isLoading]);

  const loadRecentVillages = async () => {
    setIsDataLoading(true);
    try {
      const stored = await AsyncStorage.getItem('recentVillages');
      if (stored) {
        const parsed = JSON.parse(stored) as ScannedVillage[];
        setRecentVillages(parsed.slice(0, 5));
      }
    } catch (e) {
      console.error('Failed to load recent villages:', e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleCreateComplaint = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert(
        t('login_required'),
        t('login_required_message'),
        [
          { text: t('login'), onPress: () => router.push({ pathname: "/auth/login" } as any) },
          { text: t('register'), onPress: () => router.push({ pathname: "/auth/register" } as any) },
          { text: t('cancel'), style: "cancel" },
        ]
      );
      return;
    }
    router.push("/complaint" as any);
  };

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    switch (key) {
      case 'scan':
        router.push('/qr-scanner' as any);
        break;
      case 'notices':
        if (!recentVillages.length) {
          Alert.alert(t('scan_first'), t('scan_first_message'));
        } else {
          router.push(`/qr-notices/${recentVillages[0].villageId}` as any);
        }
        break;
      case 'complaint':
        handleCreateComplaint();
        break;
      case 'workguide':
        router.push('/qr-notices/workguide' as any);
        break;
      case 'villages':
        if (!recentVillages.length) {
          Alert.alert(t('no_villages'), t('scan_village_first'));
        } else {
          router.push(`/qr-notices/${recentVillages[0].villageId}` as any);
        }
        break;
    }
  };

  // HEADER HEIGHT for scroll padding
  const HEADER_HEIGHT = 90 + insets.top;

  if (isLoading) {
    // Simple splash placeholder while animating
    return (
      <ThemedView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary.DEFAULT} />
        <Animated.View
          style={[
            styles.splash,
            { opacity: splashOpacity, transform: [{ scale: splashScale }], backgroundColor: colors.primary.DEFAULT },
          ]}
        >
          <View style={styles.splashLogoWrap}>
            <Image source={require('../assets/images/gramvarthalogo.png')} style={styles.splashLogoImg} resizeMode="contain" />
          </View>
          <Text style={styles.splashName}>{t('brand')}</Text>
          <Text style={styles.splashTagline}>{t('village_notices_on_demand')}</Text>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />

      <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} colors={colors} isDark={isDark} />

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerLogo}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            style={styles.headerLogoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image source={require('../assets/images/gramvarthalogo.png')} style={styles.headerLogoImg} resizeMode="contain" />
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerAppName, { color: colors.text.primary }]}>{t('brand')}</Text>
            <Text style={[styles.headerTagline, { color: colors.text.secondary }]}>{t('digital_village_updates')}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <LanguageSwitcher />
          <ThemeToggle variant="icon" />
        </View>
      </View>

      {/* ── SCROLLABLE MAIN CONTENT ────────────────────────────────── */}
      <Animated.ScrollView
        style={{ flex: 1, opacity: contentOpacity }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 },
        ]}
      >
        {/* Hero CTA */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroEyebrow, { color: colors.primary[500] }]}>{t('village_notices')}</Text>
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>{t('scan_once_stay_informed')}</Text>
          <Text style={[styles.heroSub, { color: colors.text.secondary }]}>{t('hero_description')}</Text>

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
            style={[styles.secondaryButton, { borderColor: colors.primary[500], backgroundColor: `${colors.primary[500]}10` }]}
            onPress={handleCreateComplaint}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle-outline" size={16} color={colors.primary[700]} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary[700] }]}>Raise Issue / Complaint</Text>
          </TouchableOpacity>

          <View style={styles.pillRow}>
            {[
              { icon: 'checkmark-circle', label: 'No login' },
              { icon: 'flash', label: 'Instant access' },
              { icon: 'infinite', label: 'Free forever' },
            ].map((pill) => (
              <View key={pill.label} style={[styles.pill, { backgroundColor: `${colors.primary[500]}12` }]}>
                <Ionicons name={pill.icon as any} size={12} color={colors.primary[500]} />
                <Text style={[styles.pillText, { color: colors.primary[700] }]}>{pill.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Villages */}
        {!isDataLoading && recentVillages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recently Scanned</Text>
              <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                {recentVillages.length} village{recentVillages.length > 1 ? 's' : ''}
              </Text>
            </View>
            {recentVillages.map((v, i) => (
              <VillageCard
                key={v.villageId} item={v} index={i} colors={colors}
                onPress={() => router.push(`/qr-notices/${v.villageId}` as any)}
              />
            ))}
          </View>
        )}

        {isDataLoading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Skeleton width={120} height={20} borderRadius={6} />
              <Skeleton width={60} height={16} borderRadius={4} />
            </View>
            {[1, 2, 3].map((i) => <SkeletonVillageCard key={i} />)}
          </View>
        )}

        {/* How it works */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>How GramVartha Works</Text>
          <ThemedCard variant="elevated" style={styles.stepsCard}>
            {[
              { n: '1', label: 'Find QR Code', sub: 'Look for the GramVartha QR code on Panchayat wall, notice board, or entrance', icon: 'qr-code-outline', details: 'No app download needed - just scan with your phone camera' },
              { n: '2', label: 'Scan & Access', sub: 'Point your camera at the QR code for instant access to all active notices', icon: 'camera-outline', details: 'See notices, find officials, and access work guides' },
              { n: '3', label: 'Stay Informed', sub: 'Read village announcements, file complaints, and track resolution status', icon: 'notifications-outline', details: 'Get real-time updates on issues you report' },
            ].map((step, i, arr) => (
              <View key={step.n}>
                <View style={styles.stepRow}>
                  <LinearGradient colors={[colors.primary[500], colors.primary[700]]} style={styles.stepBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.stepBadgeText}>{step.n}</Text>
                  </LinearGradient>
                  <View style={styles.stepBody}>
                    <Text style={[styles.stepLabel, { color: colors.text.primary }]}>{step.label}</Text>
                    <Text style={[styles.stepSub, { color: colors.text.secondary }]}>{step.sub}</Text>
                    <Text style={[styles.stepDetail, { color: colors.text.muted }]}>{step.details}</Text>
                  </View>
                  <Ionicons name={step.icon as any} size={20} color={colors.text.muted} />
                </View>
                {i < arr.length - 1 && <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </ThemedCard>
        </View>

        {/* Find Officials */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Find the Right Official</Text>
          <ThemedCard variant="elevated" style={styles.servicesCard}>
            {[
              { icon: 'person-outline', title: 'Search by Name or Designation', desc: 'Find the official handling your concern - whether it\'s development, health, education, or tax' },
              { icon: 'time-outline', title: 'Office Hours & Contact Info', desc: 'See when they\'re available, what documents to carry, and how to reach them' },
              { icon: 'document-text-outline', title: 'Required Documents', desc: 'Complete list of documents needed for each service - no more back and forth' },
            ].map((item, i, arr) => (
              <View key={item.title}>
                <View style={styles.serviceItem}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary[500]} />
                  <View style={styles.serviceContent}>
                    <Text style={[styles.serviceTitle, { color: colors.text.primary }]}>{item.title}</Text>
                    <Text style={[styles.serviceDesc, { color: colors.text.muted }]}>{item.desc}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={[styles.serviceDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </ThemedCard>
        </View>

        {/* Complaint Tracking */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Track Your Complaints</Text>
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

        {/* View Complaints */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>View Complaints</Text>
          <View style={styles.complaintsQuickAccess}>
            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                if (!recentVillages.length) {
                  Alert.alert(t('no_village'), t('scan_village_complaints'));
                  return;
                }
                router.push(`/complaints/all-complaints?villageId=${recentVillages[0].villageId}` as any);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${colors.accent.orange}15` }]}>
                <Ionicons name="list-outline" size={24} color={colors.accent.orange} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>All Village Issues</Text>
                <Text style={[styles.quickAccessDesc, { color: colors.text.muted }]}>See all complaints & issues reported in your village</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAccessButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push('/complaints/my-complaints' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${colors.primary[500]}15` }]}>
                <Ionicons name="checkmark-done-outline" size={24} color={colors.primary[500]} />
              </View>
              <View style={styles.quickAccessContent}>
                <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>My Complaints</Text>
                <Text style={[styles.quickAccessDesc, { color: colors.text.muted }]}>Track the status of your reported complaints</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </Animated.ScrollView>

      {/* ── STICKY BOTTOM TAB BAR ─────────────────────────────────── */}
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        colors={colors}
        isDark={isDark}
        bottomInset={insets.bottom}
      />
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
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  splashLogoImg: { width: 64, height: 64 },
  splashName: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 6 },
  splashTagline: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500', letterSpacing: 0.3 },

  // ── Sticky Header ────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Elevation / shadow for sticky feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  headerLogo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerTextContainer: { flex: 1 },
  headerLogoCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  headerLogoImg: { width: 32, height: 32 },
  headerAppName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  headerTagline: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoButton: { padding: 6 },

  // ── Scroll Content ───────────────────────────────────────────────────────────
  scrollContent: { paddingBottom: 24 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8 },
  heroTitle: { fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.8, marginBottom: 12 },
  heroSub: { fontSize: 14, lineHeight: 22, marginBottom: 32 },

  ctaWrapper: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, width: 172, height: 172, alignSelf: 'center',
  },
  pulseRing: {
    position: 'absolute', width: 172, height: 172, borderRadius: 86, borderWidth: 2,
  },
  ctaButton: {
    width: 148, height: 148, borderRadius: 74,
    justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
  },
  ctaLabel: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.2, textAlign: 'center' },

  featureGrid: { gap: 12, marginBottom: 16 },
  featureCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 13, lineHeight: 18 },

  pillRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
  pillText: { fontSize: 11, fontWeight: '600' },

  secondaryButton: {
    marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 13, fontWeight: '600' },

  section: { paddingHorizontal: 20, paddingTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2, marginBottom: 14 },
  sectionCount: { fontSize: 12, fontWeight: '500' },

  villageCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8, borderWidth: 1,
  },
  villageAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  villageAvatarText: { fontSize: 13, fontWeight: '700' },
  villageCardBody: { flex: 1 },
  villageCardName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  villageCardMeta: { fontSize: 12 },
  villageCardArrow: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  villageCardArrowText: { fontSize: 18, lineHeight: 22, marginLeft: 1 },

  stepsCard: { borderRadius: 16, padding: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  stepBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepBody: { flex: 1, marginRight: 12 },
  stepLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  stepSub: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  stepDetail: { fontSize: 11, lineHeight: 16 },
  stepConnector: { width: 1, height: 20, marginLeft: 15, marginVertical: 8 },

  servicesCard: { borderRadius: 16, padding: 16 },
  serviceItem: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  serviceContent: { flex: 1 },
  serviceTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  serviceDesc: { fontSize: 12, lineHeight: 18 },
  serviceDivider: { height: 1, marginVertical: 4 },

  trackingCard: { borderRadius: 16, padding: 16 },
  trackingStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statusStep: { alignItems: 'center', gap: 6 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '500' },
  statusLine: { flex: 1, height: 2 },
  trackingNote: { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  complaintsQuickAccess: { gap: 10 },
  quickAccessButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  quickAccessIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickAccessContent: { flex: 1 },
  quickAccessTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  quickAccessDesc: { fontSize: 12, lineHeight: 16 },

  // ── Bottom Tab Bar ───────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    // Pronounced shadow for floating feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 20,
  },

  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
    paddingTop: 4,
  },

  // Icon pill container — shows coloured bg when active
  tabIconWrap: {
    width: 48,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },

  // Tiny dot above icon when active
  tabActiveDot: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    fontWeight: '700',
  },

  // Center scan tab — elevated above the bar
  tabItemCenter: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -28,           // lifts the whole item up
    paddingBottom: 2,
  },

  // Outer animated glow ring around scan button
  scanGlowRing: {
    position: 'absolute',
    top: -6,
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },

  // Gradient scan circle
  tabScanButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    // Strong shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 14,
    overflow: 'hidden',
    position: 'relative',
  },

  // Subtle inner highlight arc on scan button
  scanInnerRing: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  tabLabelCenter: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.9 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalClose: { padding: 4 },
  modalBody: { padding: 20 },
  modalSection: { marginBottom: 24 },
  modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  modalSectionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalSectionTitle: { fontSize: 18, fontWeight: '700' },
  modalSectionItems: { paddingLeft: 56, gap: 8 },
  modalItemText: { fontSize: 14, lineHeight: 20 },
  modalFooter: { paddingTop: 20, marginTop: 8, borderTopWidth: 1, paddingBottom: 20 },
  modalFooterText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});