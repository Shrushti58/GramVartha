// app/index.tsx
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
  ScrollView,
  Alert,
  Modal,
  RefreshControl, // Added this import
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLoggedIn } from "../utils/auth";
import { useTheme } from '../context/ThemeContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedCard } from '../components/ThemedCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const TABS = [
  { key: 'notices',   labelKey: 'tabs.tab_notices',  icon: 'document-text-outline' as const,  activeIcon: 'document-text' as const },
  { key: 'complaint', labelKey: 'tabs.tab_report',   icon: 'alert-circle-outline' as const,   activeIcon: 'alert-circle' as const },
  { key: 'scan',      labelKey: 'tabs.tab_scan',     icon: 'qr-code-outline' as const,        activeIcon: 'qr-code' as const },
  { key: 'workguide', labelKey: 'tabs.tab_guide',    icon: 'book-outline' as const,           activeIcon: 'book' as const },
  { key: 'villages',  labelKey: 'tabs.tab_recent',   icon: 'time-outline' as const,           activeIcon: 'time' as const },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ width: w, height: h, borderRadius = 12, style }: any) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      style={[{ width: w, height: h, borderRadius, backgroundColor: colors.border, opacity }, style]}
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

// ─── Info Modal ───────────────────────────────────────────────────────────────
const InfoModal = ({ visible, onClose, colors }: any) => {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('modal.scan_access_section', '📱 Scan & Access'),
      icon: 'qr-code-outline', color: colors.primary[500],
      items: [
        t('modal.scan_access_item_1', '• Find QR code on Panchayat wall or notice board'),
        t('modal.scan_access_item_2', '• Scan with your phone camera - no app download needed'),
        t('modal.scan_access_item_3', '• Instant access to all active village notices'),
        t('modal.scan_access_item_4', '• No registration, no login, no friction'),
      ],
    },
    {
      title: t('modal.find_officials_section', '👥 Find Officials'),
      icon: 'people-outline', color: colors.accent.green,
      items: [
        t('modal.find_officials_item_1', '• Search by name, designation, or responsibility'),
        t('modal.find_officials_item_2', '• View office hours and contact information'),
        t('modal.find_officials_item_3', '• See what documents to carry for each service'),
        t('modal.find_officials_item_4', '• Direct contact details for quick assistance'),
      ],
    },
    {
      title: t('modal.report_complaints_section', '📝 Report Complaints'),
      icon: 'alert-circle-outline', color: colors.accent.orange,
      items: [
        t('modal.report_complaints_item_1', '• File issues with photos and location'),
        t('modal.report_complaints_item_2', '• Track status: Pending → In Progress → Resolved'),
        t('modal.report_complaints_item_3', '• Get notified when status changes'),
        t('modal.report_complaints_item_4', '• Real accountability and transparency'),
      ],
    },
    {
      title: t('modal.village_notices_section', '📢 Village Notices'),
      icon: 'document-text-outline', color: colors.accent.teal,
      items: [
        t('modal.village_notices_item_1', '• All official announcements in one place'),
        t('modal.village_notices_item_2', '• Filter by category: Development, Health, Education'),
        t('modal.village_notices_item_3', '• Priority tags: Urgent, Important, Regular'),
        t('modal.village_notices_item_4', '• Download attached documents and forms'),
      ],
    },
    {
      title: t('modal.work_guide_section', '📋 Work Guide'),
      icon: 'book-outline', color: colors.primary[400],
      items: [
        t('modal.work_guide_item_1', '• Step-by-step guide for village services'),
        t('modal.work_guide_item_2', '• Required documents checklist'),
        t('modal.work_guide_item_3', '• Application process explained'),
        t('modal.work_guide_item_4', '• Contact information for each service'),
      ],
    },
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <LinearGradient
            colors={[colors.primary[500], colors.primary[700]]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{t('modal.how_app_works', 'How GramVartha Works')}</Text>
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
                  <Text style={[styles.modalSectionTitle, { color: colors.text.primary }]}>{section.title}</Text>
                </View>
                <View style={styles.modalSectionItems}>
                  {section.items.map((item, i) => (
                    <Text key={i} style={[styles.modalItemText, { color: colors.text.secondary }]}>{item}</Text>
                  ))}
                </View>
              </View>
            ))}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.modalFooterText, { color: colors.text.muted }]}>
                {t('modal.modal_footer', 'No app download. No registration. Just information at your fingertips.')}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Pulse Ring ───────────────────────────────────────────────────────────────
const PulseRing = ({ color }: { color: string }) => {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.28, duration: 1600, useNativeDriver: true }),
          Animated.timing(scale,   { toValue: 1,    duration: 1600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0,    duration: 1600, useNativeDriver: true }),
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

// ─── QR Icon ──────────────────────────────────────────────────────────────────
const QRIcon = ({ size = 36, color = '#fff' }: { size?: number; color?: string }) => {
  const cell = size / 7;
  const dot = (x: number, y: number, w = 1, h = 1) => (
    <View
      key={`${x}-${y}`}
      style={{
        position: 'absolute', left: x * cell, top: y * cell,
        width: cell * w, height: cell * h, backgroundColor: color, borderRadius: 1,
      }}
    />
  );
  const inner = color === '#fff' ? '#6D4C41' : '#fff';
  return (
    <View style={{ width: size, height: size }}>
      {dot(0,0,3,3)}
      <View style={{ position:'absolute', left: cell, top: cell, width: cell, height: cell, backgroundColor: inner, borderRadius: 1 }} />
      {dot(4,0,3,3)}
      <View style={{ position:'absolute', left: 5*cell, top: cell, width: cell, height: cell, backgroundColor: inner, borderRadius: 1 }} />
      {dot(0,4,3,3)}
      <View style={{ position:'absolute', left: cell, top: 5*cell, width: cell, height: cell, backgroundColor: inner, borderRadius: 1 }} />
      {dot(4,3,1,1)}{dot(5,4,1,1)}{dot(6,3,1,1)}
      {dot(4,5,1,1)}{dot(6,5,1,1)}{dot(5,6,1,1)}{dot(6,6,1,1)}
      {dot(3,3,1,1)}{dot(3,5,1,1)}
    </View>
  );
};

// ─── Village Card ─────────────────────────────────────────────────────────────
const VillageCard = ({ item, onPress, index, colors }: {
  item: ScannedVillage; onPress: () => void; index: number; colors: any;
}) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 320, delay: index * 60, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);
  const initials = item.villageName.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.villageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress} activeOpacity={0.72}
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

// ─── Improved Splash ──────────────────────────────────────────────────────────
const SplashScreen = ({ exitOpacity, exitScale }: { exitOpacity: Animated.Value; exitScale: Animated.Value }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const logoScale    = useRef(new Animated.Value(0.55)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const ring1Scale   = useRef(new Animated.Value(0.6)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale   = useRef(new Animated.Value(0.6)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale   = useRef(new Animated.Value(0.6)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;
  const nameSlide    = useRef(new Animated.Value(22)).current;
  const nameOpacity  = useRef(new Animated.Value(0)).current;
  const tagSlide     = useRef(new Animated.Value(14)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const shimmerX     = useRef(new Animated.Value(-120)).current;
  const dot1Opacity  = useRef(new Animated.Value(0.2)).current;
  const dot2Opacity  = useRef(new Animated.Value(0.2)).current;
  const dot3Opacity  = useRef(new Animated.Value(0.2)).current;

  const rippleAnim = (rScale: Animated.Value, rOpacity: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(rScale,   { toValue: 2.1, duration: 1400, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(rOpacity, { toValue: 0.3, duration: 200,  useNativeDriver: true }),
            Animated.timing(rOpacity, { toValue: 0,   duration: 1200, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(rScale,   { toValue: 0.6, duration: 0, useNativeDriver: true }),
          Animated.timing(rOpacity, { toValue: 0,   duration: 0, useNativeDriver: true }),
        ]),
      ])
    );

  const dotAnim = (dot: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1,   duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale,   { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerX, { toValue: 120,  duration: 900, useNativeDriver: true }),
          Animated.timing(shimmerX, { toValue: -120, duration: 0,   useNativeDriver: true }),
          Animated.delay(1800),
        ])
      ).start();
    }, 400);

    rippleAnim(ring1Scale, ring1Opacity, 0).start();
    rippleAnim(ring2Scale, ring2Opacity, 450).start();
    rippleAnim(ring3Scale, ring3Opacity, 900).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(nameSlide,   { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
        Animated.timing(nameOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 300);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(tagSlide,   { toValue: 0, friction: 8, tension: 100, useNativeDriver: true }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 550);

    setTimeout(() => {
      dotAnim(dot1Opacity, 0).start();
      dotAnim(dot2Opacity, 200).start();
      dotAnim(dot3Opacity, 400).start();
    }, 800);
  }, []);

  const LOGO_SIZE = 120;

  return (
    <Animated.View
      style={[
        styles.splash,
        { backgroundColor: colors.primary[700], opacity: exitOpacity, transform: [{ scale: exitScale }] },
      ]}
    >
      <View style={[styles.splashGlow, { backgroundColor: `${colors.primary[400]}30` }]} />

      <View style={styles.splashLogoContainer}>
        {[
          { scale: ring1Scale, opacity: ring1Opacity },
          { scale: ring2Scale, opacity: ring2Opacity },
          { scale: ring3Scale, opacity: ring3Opacity },
        ].map((r, i) => (
          <Animated.View
            key={i}
            style={[
              styles.splashRipple,
              {
                width: LOGO_SIZE, height: LOGO_SIZE,
                borderRadius: LOGO_SIZE / 2,
                borderColor: 'rgba(255,255,255,0.5)',
                transform: [{ scale: r.scale }],
                opacity: r.opacity,
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.splashLogoCircle,
            {
              width: LOGO_SIZE, height: LOGO_SIZE,
              borderRadius: LOGO_SIZE / 2,
              backgroundColor: 'rgba(255,255,255,0.14)',
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
              overflow: 'hidden',
            },
          ]}
        >
          <Image
            source={require('../assets/images/gramvarthalogo.png')}
            style={{ width: LOGO_SIZE * 0.62, height: LOGO_SIZE * 0.62 }}
            resizeMode="contain"
          />
          <Animated.View
            style={[styles.splashShimmer, { transform: [{ translateX: shimmerX }, { rotate: '25deg' }] }]}
          />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.splashName, { opacity: nameOpacity, transform: [{ translateY: nameSlide }] }]}>
        {t('common.brand')}
      </Animated.Text>
      <Animated.Text style={[styles.splashTagline, { opacity: tagOpacity, transform: [{ translateY: tagSlide }] }]}>
        {t('common.village_notices_on_demand')}
      </Animated.Text>

      <View style={styles.splashDots}>
        {[dot1Opacity, dot2Opacity, dot3Opacity].map((dotOp, i) => (
          <Animated.View
            key={i}
            style={[styles.splashDot, { backgroundColor: 'rgba(255,255,255,0.8)', opacity: dotOp }]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Tab Item ─────────────────────────────────────────────────────────────────
const TabItem = ({
  tab, isActive, onPress, colors, isScan,
}: {
  tab: typeof TABS[0]; isActive: boolean; onPress: () => void; colors: any; isScan?: boolean;
}) => {
  const { t } = useTranslation();
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const prevActive = useRef(isActive);

  useEffect(() => {
    if (isActive && !prevActive.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }),
      ]).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else if (!isActive && prevActive.current) {
      Animated.timing(glowAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
    prevActive.current = isActive;
  }, [isActive]);

  if (isScan) {
    return (
      <TouchableOpacity style={styles.tabItemCenter} onPress={onPress} activeOpacity={0.85}>
        <Animated.View
          style={[
            styles.scanGlowRing,
            { borderColor: colors.primary[500], opacity: glowAnim, transform: [{ scale: scaleAnim }] },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={[colors.primary[400], colors.primary[700]]}
            style={styles.tabScanButton}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.scanInnerRing} />
            <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={27} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={[styles.tabLabelCenter, { color: colors.primary[500] }]}>{t(tab.labelKey)}</Text>
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
        {isActive && <View style={[styles.tabActiveDot, { backgroundColor: colors.primary[500] }]} />}
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={isActive ? colors.primary[500] : colors.text.muted}
        />
      </Animated.View>
      <Text style={[styles.tabLabel, { color: isActive ? colors.primary[500] : colors.text.muted }, isActive && styles.tabLabelActive]}>
        {t(tab.labelKey)}
      </Text>
    </TouchableOpacity>
  );
};

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
const BottomTabBar = ({ activeTab, onTabPress, colors, isDark, bottomInset }: {
  activeTab: string; onTabPress: (k: string) => void; colors: any; isDark: boolean; bottomInset: number;
}) => {
  const leftTabs  = TABS.filter(t => t.key === 'notices' || t.key === 'complaint');
  const rightTabs = TABS.filter(t => t.key === 'workguide' || t.key === 'villages');
  const scanTab   = TABS.find(t => t.key === 'scan')!;
  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: bottomInset > 0 ? bottomInset : 10 },
      ]}
    >
      {leftTabs.map(tab => (
        <TabItem key={tab.key} tab={tab} isActive={activeTab === tab.key} onPress={() => onTabPress(tab.key)} colors={colors} />
      ))}
      <TabItem tab={scanTab} isActive={activeTab === 'scan'} onPress={() => onTabPress('scan')} colors={colors} isScan />
      {rightTabs.map(tab => (
        <TabItem key={tab.key} tab={tab} isActive={activeTab === tab.key} onPress={() => onTabPress(tab.key)} colors={colors} />
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [isLoading,      setIsLoading]      = useState(true);
  const [isDataLoading,  setIsDataLoading]  = useState(true);
  const [recentVillages, setRecentVillages] = useState<ScannedVillage[]>([]);
  const [showInfoModal,  setShowInfoModal]  = useState(false);
  const [activeTab,      setActiveTab]      = useState('scan');
  const [refreshing,     setRefreshing]     = useState(false); // Added state for pull-to-refresh

  const splashOpacity  = useRef(new Animated.Value(1)).current;
  const splashScale    = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide   = useRef(new Animated.Value(24)).current;

  
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(splashOpacity,  { toValue: 0,   duration: 500, useNativeDriver: true }),
        Animated.timing(splashScale,    { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1,   duration: 600, delay: 200, useNativeDriver: true }),
        Animated.timing(contentSlide,   { toValue: 0,   duration: 500, delay: 200, useNativeDriver: true }),
      ]).start(() => setIsLoading(false));
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) loadRecentVillages();
  }, [isLoading]);

  const loadRecentVillages = async () => {
    setIsDataLoading(true);
    try {
      const stored = await AsyncStorage.getItem('recentVillages');
      if (stored) setRecentVillages((JSON.parse(stored) as ScannedVillage[]).slice(0, 5));
    } catch (e) { console.error(e); }
    finally { setIsDataLoading(false); }
  };

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecentVillages();
    setRefreshing(false);
  };

  const handleCreateComplaint = async () => {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      Alert.alert(
        t('home.login_required'),
        t('home.login_required_message'),
        [
          { text: t('common.login'),    onPress: () => router.push('/auth/login' as any) },
          { text: t('common.register'), onPress: () => router.push('/auth/register' as any) },
          { text: t('home.cancel'), style: 'cancel' },
        ]
      );
      return;
    }
    router.push('/complaint' as any);
  };

  const handleTabPress = (key: string) => {
    setActiveTab(key);
    switch (key) {
      case 'scan':
        router.push('/qr-scanner' as any); break;
      case 'notices':
        recentVillages.length
          ? router.push(`/qr-notices/${recentVillages[0].villageId}` as any)
          : Alert.alert(t('home.scan_first'), t('home.scan_first_message'));
        break;
      case 'complaint':
        handleCreateComplaint(); break;
      case 'workguide':
        router.push('/qr-notices/workguide' as any); break;
      case 'villages':
        recentVillages.length
          ? router.push(`/qr-notices/${recentVillages[0].villageId}` as any)
          : Alert.alert(t('home.no_villages'), t('home.scan_village_first'));
        break;
    }
  };

  return (
    <ThemedView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[700]} />

      {/* Splash — always mounted, fades out */}
      <SplashScreen exitOpacity={splashOpacity} exitScale={splashScale} />

      {/* Main content fades in underneath */}
      <Animated.View style={[{ flex: 1 }, { opacity: contentOpacity, transform: [{ translateY: contentSlide }] }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />

        <InfoModal visible={showInfoModal} onClose={() => setShowInfoModal(false)} colors={colors} isDark={isDark} />

        {/* ── Sticky Header ─────────────────────────────────────────── */}
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
          {/* Logo — has full flex, never compressed */}
          <View style={styles.headerLogo}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={styles.headerLogoCircle}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Image
                source={require('../assets/images/gramvarthalogo.png')}
                style={styles.headerLogoImg}
                resizeMode="contain"
              />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerAppName, { color: colors.text.primary }]} numberOfLines={1}>
                {t('common.brand')}
              </Text>
              <Text style={[styles.headerTagline, { color: colors.text.secondary }]} numberOfLines={1}>
                {t('common.digital_village_updates')}
              </Text>
            </View>
          </View>

          {/* Compact actions row: info + 72px lang pill + theme */}
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <LanguageSwitcher />
            <ThemeToggle variant="icon" />
          </View>
        </View>

        {/* ── Scrollable Content with Pull-to-Refresh ───────────────────────────────────── */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary[500]]} // Android
              tintColor={colors.primary[500]} // iOS
              titleColor={colors.primary[500]} // iOS title color
              title={t('common.pull_to_refresh', 'Pull to refresh')} // Optional: iOS only
            />
          }
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroEyebrow, { color: colors.primary[500] }]}>
              {t('common.village_notices')}
            </Text>
            <Text style={[styles.heroTitle, { color: colors.text.primary }]}>
              {t('common.scan_once_stay_informed')}
            </Text>
            <Text style={[styles.heroSub, { color: colors.text.secondary }]}>
              {t('common.hero_description')}
            </Text>

            {/* CTA */}
            <View style={styles.ctaWrapper}>
              <PulseRing color={colors.primary[500]} />
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: colors.primary.DEFAULT }]}
                onPress={() => router.push('/qr-scanner' as any)}
                activeOpacity={0.88}
              >
                <QRIcon size={34} color="#fff" />
                <Text style={styles.ctaLabel}>{t('home.scan_qr_code')}</Text>
              </TouchableOpacity>
            </View>

            {/* Feature Cards */}
            <View style={styles.featureGrid}>
              {[
                {
                  icon: 'people-outline', color: colors.primary[500], bg: `${colors.primary[500]}15`,
                  titleKey: 'home.find_officials', descKey: 'home.find_officials_desc',
                  onPress: () => router.push('/qr-notices/workguide' as any),
                },
                {
                  icon: 'alert-circle-outline', color: colors.accent.orange, bg: `${colors.accent.orange}15`,
                  titleKey: 'home.report_track', descKey: 'home.report_track_desc',
                  onPress: handleCreateComplaint,
                },
                {
                  icon: 'book-outline', color: colors.accent.teal, bg: `${colors.accent.teal}15`,
                  titleKey: 'home.work_guide', descKey: 'home.work_guide_desc',
                  onPress: () => router.push('/qr-notices/workguide' as any),
                },
              ].map((f, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={f.onPress}
                >
                  <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                    <Ionicons name={f.icon as any} size={24} color={f.color} />
                  </View>
                  <Text style={[styles.featureTitle, { color: colors.text.primary }]}>{t(f.titleKey)}</Text>
                  <Text style={[styles.featureDesc,  { color: colors.text.muted }]}>{t(f.descKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary[500], backgroundColor: `${colors.primary[500]}10` }]}
              onPress={handleCreateComplaint} activeOpacity={0.8}
            >
              <Ionicons name="alert-circle-outline" size={16} color={colors.primary[700]} style={{ marginRight: 6 }} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary[700] }]}>{t('home.raise_issue')}</Text>
            </TouchableOpacity>

            <View style={styles.pillRow}>
              {[
                { icon: 'checkmark-circle', label: t('common.no_login') },
                { icon: 'flash',            label: t('common.instant_access') },
                { icon: 'infinite',         label: t('common.free_forever') },
              ].map(p => (
                <View key={p.label} style={[styles.pill, { backgroundColor: `${colors.primary[500]}12` }]}>
                  <Ionicons name={p.icon as any} size={12} color={colors.primary[500]} />
                  <Text style={[styles.pillText, { color: colors.primary[700] }]}>{p.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Villages */}
          {!isDataLoading && recentVillages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('home.recently_scanned')}</Text>
                <Text style={[styles.sectionCount, { color: colors.text.secondary }]}>
                  {recentVillages.length} {t('home.village')}{recentVillages.length > 1 ? t('home.villages') : ''}
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
                <Skeleton width={60}  height={16} borderRadius={4} />
              </View>
              {[1,2,3].map(i => <SkeletonVillageCard key={i} />)}
            </View>
          )}

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('home.how_it_works')}</Text>
            <ThemedCard variant="elevated" style={styles.stepsCard}>
              {[
                { n:'1', label: t('home.find_qr'),       sub: t('home.find_qr_sub'),       icon: 'qr-code-outline',       details: t('home.find_qr_detail') },
                { n:'2', label: t('home.scan_access'),   sub: t('home.scan_access_sub'),   icon: 'camera-outline',        details: t('home.scan_access_detail') },
                { n:'3', label: t('home.stay_informed'), sub: t('home.stay_informed_sub'), icon: 'notifications-outline', details: t('home.stay_informed_detail') },
              ].map((step, i, arr) => (
                <View key={step.n}>
                  <View style={styles.stepRow}>
                    <LinearGradient colors={[colors.primary[500], colors.primary[700]]} style={styles.stepBadge} start={{x:0,y:0}} end={{x:1,y:1}}>
                      <Text style={styles.stepBadgeText}>{step.n}</Text>
                    </LinearGradient>
                    <View style={styles.stepBody}>
                      <Text style={[styles.stepLabel,  { color: colors.text.primary }]}>{step.label}</Text>
                      <Text style={[styles.stepSub,    { color: colors.text.secondary }]}>{step.sub}</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('home.find_right_official')}</Text>
            <ThemedCard variant="elevated" style={styles.servicesCard}>
              {[
                { icon: 'person-outline',        title: t('home.search_official'), desc: t('home.search_official_desc') },
                { icon: 'time-outline',          title: t('home.office_hours'),    desc: t('home.office_hours_desc') },
                { icon: 'document-text-outline', title: t('home.required_docs'),   desc: t('home.required_docs_desc') },
              ].map((item, i, arr) => (
                <View key={item.title}>
                  <View style={styles.serviceItem}>
                    <Ionicons name={item.icon as any} size={20} color={colors.primary[500]} />
                    <View style={styles.serviceContent}>
                      <Text style={[styles.serviceTitle, { color: colors.text.primary }]}>{item.title}</Text>
                      <Text style={[styles.serviceDesc,  { color: colors.text.muted }]}>{item.desc}</Text>
                    </View>
                  </View>
                  {i < arr.length - 1 && <View style={[styles.serviceDivider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </ThemedCard>
          </View>

          {/* Complaint Tracking */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('home.track_complaints')}</Text>
            <ThemedCard variant="elevated" style={styles.trackingCard}>
              <View style={styles.trackingStatus}>
                {[
                  { dot: colors.status.pending,    label: t('home.pending') },
                  { dot: colors.status.inProgress, label: t('home.in_progress') },
                  { dot: colors.status.completed,  label: t('home.resolved') },
                ].map((s, i, arr) => (
                  <React.Fragment key={s.label}>
                    <View style={styles.statusStep}>
                      <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
                      <Text style={[styles.statusText, { color: colors.text.secondary }]}>{s.label}</Text>
                    </View>
                    {i < arr.length - 1 && <View style={[styles.statusLine, { backgroundColor: colors.border }]} />}
                  </React.Fragment>
                ))}
              </View>
              <Text style={[styles.trackingNote, { color: colors.text.muted }]}>{t('home.tracking_note')}</Text>
            </ThemedCard>
          </View>

          {/* View Complaints */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('home.view_complaints')}</Text>
            <View style={styles.complaintsQuickAccess}>
              <TouchableOpacity
                style={[styles.quickAccessButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  if (!recentVillages.length) { Alert.alert(t('home.no_village'), t('home.scan_village_complaints')); return; }
                  router.push(`/complaints/all-complaints?villageId=${recentVillages[0].villageId}` as any);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${colors.accent.orange}15` }]}>
                  <Ionicons name="list-outline" size={24} color={colors.accent.orange} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>{t('home.all_village_issues')}</Text>
                  <Text style={[styles.quickAccessDesc,  { color: colors.text.muted }]}>{t('home.all_village_issues_desc')}</Text>
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
                  <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>{t('home.my_complaints')}</Text>
                  <Text style={[styles.quickAccessDesc,  { color: colors.text.muted }]}>{t('home.my_complaints_desc')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/schemes' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${colors.accent.teal}15` }]}>
                  <Ionicons name="library-outline" size={24} color={colors.accent.teal} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>
                    {t('home.gov_schemes', 'Government Schemes')}
                  </Text>
                  <Text style={[styles.quickAccessDesc, { color: colors.text.muted }]}>
                    {t('home.gov_schemes_desc', 'Browse schemes and check eligibility details')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickAccessButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/farming-assistant' as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${colors.accent.green}15` }]}>
                  <Ionicons name="rainy-outline" size={24} color={colors.accent.green} />
                </View>
                <View style={styles.quickAccessContent}>
                  <Text style={[styles.quickAccessTitle, { color: colors.text.primary }]}>
                    {t('home.farming_advisor', 'Smart Farming Weather')}
                  </Text>
                  <Text style={[styles.quickAccessDesc, { color: colors.text.muted }]}>
                    {t('home.farming_advisor_desc', 'Location-based irrigation advice for crops')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* ── Sticky Bottom Tab Bar ─────────────────────────────────── */}
        <BottomTabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          colors={colors}
          isDark={isDark}
          bottomInset={insets.bottom}
        />
      </Animated.View>
    </ThemedView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Splash
  splash: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  splashGlow: {
    position: 'absolute',
    width: width * 1.4, height: width * 1.4,
    borderRadius: width * 0.7,
    top: -width * 0.2, alignSelf: 'center',
  },
  splashLogoContainer: {
    width: 120, height: 120,
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  splashRipple:     { position: 'absolute', borderWidth: 1.5 },
  splashLogoCircle: {
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  splashShimmer: {
    position: 'absolute', top: 0, bottom: 0,
    width: 40, backgroundColor: 'rgba(255,255,255,0.18)',
  },
  splashName: {
    fontSize: 34, fontWeight: '800', color: '#fff',
    letterSpacing: -0.5, marginBottom: 8,
  },
  splashTagline: {
    fontSize: 14, color: 'rgba(255,255,255,0.72)',
    fontWeight: '500', letterSpacing: 0.4, marginBottom: 36,
  },
  splashDots: { flexDirection: 'row', gap: 8 },
  splashDot:  { width: 6, height: 6, borderRadius: 3 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  // Logo side — flex:1 so it takes available space but can shrink
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,          // allow shrink below intrinsic width
    marginRight: 8,
  },
  headerLogoCircle: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,        // never compress the logo circle
  },
  headerLogoImg: { width: 28, height: 28 },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,          // allow text to truncate
  },
  headerAppName:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  headerTagline:  { fontSize: 10, fontWeight: '500', marginTop: 1 },

  // Actions side — fixed, never expands
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  infoButton: { padding: 4 },

  // Hero
  heroSection: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20 },
  heroEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 8 },
  heroTitle:   { fontSize: 32, fontWeight: '800', lineHeight: 38, letterSpacing: -0.8, marginBottom: 12 },
  heroSub:     { fontSize: 14, lineHeight: 22, marginBottom: 32 },

  ctaWrapper: {
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, width: 172, height: 172, alignSelf: 'center',
  },
  pulseRing: { position: 'absolute', width: 172, height: 172, borderRadius: 86, borderWidth: 2 },
  ctaButton: {
    width: 148, height: 148, borderRadius: 74,
    justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 18, elevation: 10,
  },
  ctaLabel: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: 0.2, textAlign: 'center' },

  featureGrid:  { gap: 12, marginBottom: 16 },
  featureCard:  { padding: 16, borderRadius: 16, borderWidth: 1 },
  featureIcon:  { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  featureDesc:  { fontSize: 13, lineHeight: 18 },

  secondaryButton: {
    marginTop: 16, alignSelf: 'center',
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 13, fontWeight: '600' },

  pillRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  pill:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
  pillText:{ fontSize: 11, fontWeight: '600' },

  // Sections
  section:       { paddingHorizontal: 20, paddingTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', letterSpacing: -0.2, marginBottom: 14 },
  sectionCount:  { fontSize: 12, fontWeight: '500' },

  // Village Card
  villageCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8, borderWidth: 1,
  },
  villageAvatar:       { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  villageAvatarText:   { fontSize: 13, fontWeight: '700' },
  villageCardBody:     { flex: 1 },
  villageCardName:     { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  villageCardMeta:     { fontSize: 12 },
  villageCardArrow:    { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  villageCardArrowText:{ fontSize: 18, lineHeight: 22, marginLeft: 1 },

  // Steps
  stepsCard:     { borderRadius: 16, padding: 20 },
  stepRow:       { flexDirection: 'row', alignItems: 'flex-start' },
  stepBadge:     { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  stepBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepBody:      { flex: 1, marginRight: 12 },
  stepLabel:     { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  stepSub:       { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  stepDetail:    { fontSize: 11, lineHeight: 16 },
  stepConnector: { width: 1, height: 20, marginLeft: 15, marginVertical: 8 },

  // Services
  servicesCard:   { borderRadius: 16, padding: 16 },
  serviceItem:    { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  serviceContent: { flex: 1 },
  serviceTitle:   { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  serviceDesc:    { fontSize: 12, lineHeight: 18 },
  serviceDivider: { height: 1, marginVertical: 4 },

  // Tracking
  trackingCard:   { borderRadius: 16, padding: 16 },
  trackingStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  statusStep:     { alignItems: 'center', gap: 6 },
  statusDot:      { width: 12, height: 12, borderRadius: 6 },
  statusText:     { fontSize: 11, fontWeight: '500' },
  statusLine:     { flex: 1, height: 2 },
  trackingNote:   { fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Quick Access
  complaintsQuickAccess: { gap: 10 },
  quickAccessButton:     { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  quickAccessIcon:       { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  quickAccessContent:    { flex: 1 },
  quickAccessTitle:      { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  quickAccessDesc:       { fontSize: 12, lineHeight: 16 },

  // Tab Bar
  tabBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.10, shadowRadius: 16, elevation: 20,
  },
  tabItem:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 2, paddingTop: 4 },
  tabIconWrap:   { width: 48, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 4, position: 'relative' },
  tabActiveDot:  { position: 'absolute', top: -8, width: 4, height: 4, borderRadius: 2 },
  tabLabel:      { fontSize: 10, fontWeight: '500', textAlign: 'center', letterSpacing: 0.1 },
  tabLabelActive:{ fontWeight: '700' },
  tabItemCenter: { flex: 1.1, alignItems: 'center', justifyContent: 'flex-end', marginTop: -28, paddingBottom: 2 },
  scanGlowRing:  { position: 'absolute', top: -6, width: 72, height: 72, borderRadius: 36, borderWidth: 2 },
  tabScanButton: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30, shadowRadius: 12, elevation: 14,
    overflow: 'hidden', position: 'relative',
  },
  scanInnerRing: {
    position: 'absolute', top: 4, left: 4,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.30)',
  },
  tabLabelCenter: { fontSize: 10, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },

  // Modal
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: height * 0.9 },
  modalHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalTitle:         { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalClose:         { padding: 4 },
  modalBody:          { padding: 20 },
  modalSection:       { marginBottom: 24 },
  modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  modalSectionIcon:   { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalSectionTitle:  { fontSize: 18, fontWeight: '700' },
  modalSectionItems:  { paddingLeft: 56, gap: 8 },
  modalItemText:      { fontSize: 14, lineHeight: 20 },
  modalFooter:        { paddingTop: 20, marginTop: 8, borderTopWidth: 1, paddingBottom: 20 },
  modalFooterText:    { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
