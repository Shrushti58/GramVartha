// app/qr-notices/workguide.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Animated,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { Config } from '../../constants/config';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// ── Types ──────────────────────────────────────────────────────────────────────
interface WorkGuideItem {
  _id: string;
  category: string;
  workName: string;
  officerName: string;
  designation: string;
  availableDays: string[];
  timing: string;
  location: string;
  documents: string[];
  note?: string;
  isActive: boolean;
}

interface GroupedGuide {
  category: string;
  items: WorkGuideItem[];
}

// ── Constants ──────────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { labelKey: 'birth_certificate',         search: 'birth certificate'   },
  { labelKey: 'death_certificate',         search: 'death certificate'   },
  { labelKey: 'residence_proof',           search: 'residence'           },
  { labelKey: 'caste_certificate',         search: 'caste'               },
  { labelKey: 'income_certificate',        search: 'income'              },
  { labelKey: 'seven_twelve_land_record',  search: '7/12'                },
  { labelKey: 'property_tax',              search: 'property tax'        },
  { labelKey: 'ration_card',               search: 'ration'              },
  { labelKey: 'pension_application',       search: 'pension'             },
  { labelKey: 'nrega_job_card',            search: 'nrega'               },
  { labelKey: 'pm_awas_yojana',            search: 'awas'                },
  { labelKey: 'water_connection',          search: 'water'               },
  { labelKey: 'voter_id_help',             search: 'voter'               },
  { labelKey: 'scholarship',               search: 'scholarship'         },
];

// ── Next Visit Calculator ──────────────────────────────────────────────────────
function getNextAvailable(
  availableDays: string[],
  timing: string,
): { dayLabel: string; date: string; timing: string; isToday: boolean } {
  if (!availableDays || availableDays.length === 0) {
    return { dayLabel: '—', date: '', timing: timing || '', isToday: false };
  }

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let endHour = 24;
  try {
    const parts = timing.split(/[–\-]/);
    const endStr = parts[parts.length - 1].trim();
    const match = endStr.match(/(\d+):?(\d*)\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2] || '0');
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      endHour = h + m / 60;
    }
  } catch {}

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayName = dayNames[checkDate.getDay()];

    if (availableDays.includes(dayName)) {
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const isToday = i === 0;
      if (isToday && currentHour >= endHour) continue;

      let dayLabel: string;
      if (i === 0) dayLabel = 'Today';
      else if (i === 1) dayLabel = 'Tomorrow';
      else dayLabel = dayName;

      const dateStr = checkDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      return { dayLabel, date: dateStr, timing: timing || '', isToday: i === 0 };
    }
  }

  return { dayLabel: availableDays[0], date: '', timing: timing || '', isToday: false };
}

// ── Checklist key ──────────────────────────────────────────────────────────────
const checklistKey = (guideId: string, docIdx: number) =>
  `workguide_checklist_${guideId}_${docIdx}`;

// ─── Document Checklist Item ────────────────────────────────────────────────────
const DocItem = ({
  doc,
  guideId,
  index,
  checked,
  onToggle,
  colors,
  isDark,
}: {
  doc: string;
  guideId: string;
  index: number;
  checked: boolean;
  onToggle: () => void;
  colors: any;
  isDark: boolean;
}) => (
  <TouchableOpacity
    style={[
      styles.docRow,
      {
        backgroundColor: checked
          ? isDark
            ? `${colors.primary[500]}18`
            : `${colors.primary[500]}0E`
          : isDark
          ? colors.background
          : colors.neutral[50],
        borderColor: checked ? colors.primary[300] : colors.border,
      },
    ]}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.checkbox,
        { borderColor: colors.neutral[400], backgroundColor: colors.surface },
        checked && {
          backgroundColor: colors.primary[600],
          borderColor: colors.primary[600],
        },
      ]}
    >
      {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
    </View>
    <Text
      style={[
        styles.docText,
        { color: colors.text.primary },
        checked && { textDecorationLine: 'line-through', color: colors.text.muted },
      ]}
    >
      {doc}
    </Text>
  </TouchableOpacity>
);

// ── Work Guide Card ────────────────────────────────────────────────────────────
const WorkGuideCard = ({
  item,
  checkedDocs,
  onToggleDoc,
  onResetChecklist,
  index,
  colors,
  isDark,
}: {
  item: WorkGuideItem;
  checkedDocs: Record<string, boolean>;
  onToggleDoc: (guideId: string, docIdx: number) => void;
  onResetChecklist: (guideId: string, docCount: number) => void;
  index: number;
  colors: any;
  isDark: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay: index * 55, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 55, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const nextVisit    = getNextAvailable(item.availableDays, item.timing);
  const checkedCount = item.documents.filter((_, i) => checkedDocs[checklistKey(item._id, i)]).length;
  const allReady     = item.documents.length > 0 && checkedCount === item.documents.length;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: expanded ? colors.primary[400] : colors.border,
          },
          expanded && {
            shadowColor: colors.primary[500],
            shadowOpacity: isDark ? 0.18 : 0.12,
            shadowRadius: 12,
            elevation: 4,
          },
        ]}
      >
        {/* Card Header — always visible */}
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpanded(p => !p)}
          activeOpacity={0.82}
        >
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.cardWorkName, { color: colors.text.primary }]}>
              {item.workName}
            </Text>
            <Text style={[styles.cardOfficer, { color: colors.text.secondary }]}>
              {item.officerName}
            </Text>
            <Text style={[styles.cardDesignation, { color: colors.text.muted }]}>
              {item.designation}
            </Text>

            {/* Next visit pill */}
            <View
              style={[
                styles.nextVisitPill,
                {
                  backgroundColor: isDark ? colors.neutral[700] : colors.primary[50],
                  borderColor: isDark ? colors.primary[700] : colors.primary[200],
                },
                nextVisit.isToday && {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}35`
                    : colors.primary[100],
                  borderColor: colors.primary[400],
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={11}
                color={nextVisit.isToday ? colors.primary[500] : colors.primary[400]}
              />
              <Text
                style={[
                  styles.nextVisitText,
                  {
                    color: nextVisit.isToday
                      ? colors.primary[600]
                      : isDark
                      ? colors.primary[300]
                      : colors.primary[700],
                  },
                ]}
              >
                Next: {nextVisit.dayLabel}
                {nextVisit.timing ? `, ${nextVisit.timing.split('–')[0].trim()}` : ''}
              </Text>
            </View>
          </View>

          {/* Chevron */}
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <View
              style={[
                styles.chevronWrap,
                {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}15`
                    : colors.primary[50],
                  borderColor: expanded ? colors.primary[300] : colors.border,
                },
              ]}
            >
              <Ionicons
                name="chevron-down"
                size={16}
                color={expanded ? colors.primary[500] : colors.text.muted}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Card Body — expanded */}
        {expanded && (
          <View style={styles.cardBody}>
            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Details grid */}
            <View style={styles.detailsGrid}>
              {item.availableDays.length > 0 && (
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIconWrap,
                      {
                        backgroundColor: isDark
                          ? `${colors.primary[500]}20`
                          : colors.primary[50],
                      },
                    ]}
                  >
                    <Ionicons name="calendar" size={13} color={colors.primary[500]} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                      AVAILABLE DAYS
                    </Text>
                    <View style={styles.dayPills}>
                      {item.availableDays.map(d => (
                        <View
                          key={d}
                          style={[
                            styles.dayPill,
                            {
                              backgroundColor: isDark
                                ? `${colors.primary[500]}18`
                                : colors.primary[50],
                              borderColor: colors.primary[300],
                            },
                          ]}
                        >
                          <Text style={[styles.dayPillText, { color: colors.primary[600] }]}>
                            {d.slice(0, 3)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              {item.timing ? (
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIconWrap,
                      {
                        backgroundColor: isDark
                          ? `${colors.primary[500]}20`
                          : colors.primary[50],
                      },
                    ]}
                  >
                    <Ionicons name="time-outline" size={13} color={colors.primary[500]} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                      TIMING
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                      {item.timing}
                    </Text>
                  </View>
                </View>
              ) : null}

              {item.location ? (
                <View style={styles.detailRow}>
                  <View
                    style={[
                      styles.detailIconWrap,
                      {
                        backgroundColor: isDark
                          ? `${colors.primary[500]}20`
                          : colors.primary[50],
                      },
                    ]}
                  >
                    <Ionicons name="location-outline" size={13} color={colors.primary[500]} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailLabel, { color: colors.text.muted }]}>
                      LOCATION
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                      {item.location}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            {/* Next visit box */}
            <View
              style={[
                styles.nextVisitBox,
                {
                  backgroundColor: isDark ? colors.neutral[700] : colors.primary[50],
                  borderColor: isDark ? colors.primary[700] : colors.primary[200],
                },
                nextVisit.isToday && {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}30`
                    : colors.primary[100],
                  borderColor: colors.primary[400],
                },
              ]}
            >
              <Text
                style={[
                  styles.nextVisitBoxLabel,
                  { color: isDark ? colors.primary[300] : colors.primary[600] },
                ]}
              >
                Next Available Visit
              </Text>
              <Text
                style={[
                  styles.nextVisitBoxDay,
                  { color: colors.text.primary[300] },
                  nextVisit.isToday && {
                    color: isDark ? colors.primary[300] : colors.primary[700],
                  },
                ]}
              >
                {nextVisit.dayLabel}
                {nextVisit.date ? ` — ${nextVisit.date}` : ''}
              </Text>
              {nextVisit.timing ? (
                <Text
                  style={[
                    styles.nextVisitBoxTime,
                    { color: isDark ? colors.primary[200] : colors.primary[700] },
                  ]}
                >
                  {nextVisit.timing}
                </Text>
              ) : null}
            </View>

            {/* Documents checklist */}
            {item.documents.length > 0 && (
              <View style={styles.checklistSection}>
                <View style={styles.checklistHeader}>
                  <Text style={[styles.checklistTitle, { color: colors.text.primary }]}>
                    Documents to Bring
                  </Text>
                  <Text
                    style={[
                      styles.checklistProgress,
                      { color: colors.text.secondary },
                      allReady && { color: colors.success },
                    ]}
                  >
                    {checkedCount}/{item.documents.length}
                  </Text>
                </View>

                {allReady && (
                  <View
                    style={[
                      styles.allReadyBanner,
                      {
                        backgroundColor: isDark
                          ? `${colors.success}18`
                          : `${colors.success}12`,
                        borderColor: colors.success,
                      },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.allReadyText, { color: colors.success }]}>
                      All documents ready — you can visit now
                    </Text>
                  </View>
                )}

                {item.documents.map((doc, i) => (
                  <DocItem
                    key={i}
                    doc={doc}
                    guideId={item._id}
                    index={i}
                    checked={!!checkedDocs[checklistKey(item._id, i)]}
                    onToggle={() => onToggleDoc(item._id, i)}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}

                <TouchableOpacity
                  onPress={() => onResetChecklist(item._id, item.documents.length)}
                  style={styles.resetBtn}
                >
                  <Text style={[styles.resetBtnText, { color: colors.text.muted }]}>
                    Reset checklist
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Note */}
            {item.note ? (
              <View
                style={[
                  styles.noteBox,
                  {
                    backgroundColor: isDark
                      ? `${colors.warning}10`
                      : '#fff8ec',
                    borderColor: isDark ? `${colors.warning}30` : '#f59e0b40',
                    borderLeftColor: '#f59e0b',
                  },
                ]}
              >
                <View style={styles.noteHeaderRow}>
                  <Text style={styles.noteIcon}>⚠️</Text>
                  <Text style={[styles.noteLabel, { color: colors.warning || '#b45309' }]}>
                    IMPORTANT NOTE
                  </Text>
                </View>
                <Text style={[styles.noteText, { color: colors.text.secondary }]}>
                  {item.note}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function WorkGuideScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const [villageId,         setVillageId]         = useState<string>('');
  const [villageName,       setVillageName]       = useState<string>('');
  const [grouped,           setGrouped]           = useState<GroupedGuide[]>([]);
  const [loading,           setLoading]           = useState(false);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [checkedDocs,       setCheckedDocs]       = useState<Record<string, boolean>>({});
  const [focused,           setFocused]           = useState(false);

  // Dynamic header colors — mirrors complaint.tsx exactly
  const headerBg         = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor  = isDark ? colors.primary[100]  : '#fff';
  const headerSubColor   = isDark ? colors.primary[200]  : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor = isDark ? colors.primary[300] : 'rgba(255,255,255,0.6)';
  const backBtnBg        = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  // ── Load village from AsyncStorage on mount ──────────────────────────────────
  useEffect(() => {
    const loadVillageAndInit = async () => {
      try {
        const primary = await AsyncStorage.getItem('scannedVillage');
        if (primary) {
          const v = JSON.parse(primary);
          if (v?.villageId) {
            setVillageId(v.villageId);
            setVillageName(v.villageName ?? '');
            return;
          }
        }
        const recent = await AsyncStorage.getItem('recentVillages');
        if (recent) {
          const arr = JSON.parse(recent);
          if (Array.isArray(arr) && arr.length > 0) {
            const v = arr[0];
            if (v?.villageId) {
              setVillageId(v.villageId);
              setVillageName(v.villageName ?? '');
            }
          }
        }
      } catch {}
    };
    loadVillageAndInit();
    loadChecklist();
  }, []);

  useEffect(() => {
    if (villageId) fetchGuides();
  }, [villageId]);

  // ── Load checklist ────────────────────────────────────────────────────────────
  const loadChecklist = async () => {
    try {
      const keys   = await AsyncStorage.getAllKeys();
      const wgKeys = keys.filter(k => k.startsWith('workguide_checklist_'));
      if (wgKeys.length === 0) return;
      const pairs  = await AsyncStorage.multiGet(wgKeys);
      const result: Record<string, boolean> = {};
      pairs.forEach(([key, value]) => {
        if (value === 'true') result[key] = true;
      });
      setCheckedDocs(result);
    } catch {}
  };

  // ── Fetch guides ──────────────────────────────────────────────────────────────
  const fetchGuides = async (search?: string) => {
    if (!villageId) return;
    try {
      setLoading(true);
      const base = `${Config.API_BASE_URL}/workguide/village/${villageId}`;
      const url  = search ? `${base}?search=${encodeURIComponent(search)}` : base;
      const res  = await fetch(url);
      const data = await res.json();
      setGrouped(Array.isArray(data) ? data : []);
    } catch {
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Search ────────────────────────────────────────────────────────────────────
  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setActiveQuickAction(null);
    fetchGuides(text);
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setSearchTerm(action.search);
    setActiveQuickAction(action.search);
    fetchGuides(action.search);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveQuickAction(null);
    fetchGuides();
  };

  // ── Checklist ─────────────────────────────────────────────────────────────────
  const toggleDoc = async (guideId: string, docIdx: number) => {
    const key    = checklistKey(guideId, docIdx);
    const newVal = !checkedDocs[key];
    setCheckedDocs(prev => ({ ...prev, [key]: newVal }));
    try {
      if (newVal) await AsyncStorage.setItem(key, 'true');
      else        await AsyncStorage.removeItem(key);
    } catch {}
  };

  const resetChecklist = async (guideId: string, docCount: number) => {
    const keys = Array.from({ length: docCount }, (_, i) => checklistKey(guideId, i));
    setCheckedDocs(prev => {
      const next = { ...prev };
      keys.forEach(k => delete next[k]);
      return next;
    });
    try {
      await AsyncStorage.multiRemove(keys);
    } catch {}
  };

  const totalResults = grouped.reduce((sum, g) => sum + g.items.length, 0);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={headerBg}
      />

      {/* ── Header with Gradient — matches complaint.tsx ── */}
      <LinearGradient
        colors={
          isDark
            ? [colors.primary[800], colors.primary[900]]
            : [colors.primary[600], colors.primary[700]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View
          style={[
            styles.accentCircle1,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(255,255,255,0.06)',
            },
          ]}
        />
        <View
          style={[
            styles.accentCircle2,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.02)'
                : 'rgba(255,255,255,0.04)',
            },
          ]}
        />

        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            {t('village_services')}
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>
            {t('work_guide')}
          </Text>
          <View style={styles.headerBreadcrumb}>
            <View
              style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]}
            />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              {villageName || t('your_village')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Quick Actions ── */}
        <View style={styles.quickSection}>
          <Text style={[styles.quickHeading, { color: colors.text.primary }]}>
            {t('what_do_you_need')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {QUICK_ACTIONS.map(action => {
              const isActive = activeQuickAction === action.search;
              return (
                <TouchableOpacity
                  key={action.search}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: isActive
                        ? colors.primary[700]
                        : isDark
                        ? `${colors.primary[500]}15`
                        : colors.primary[50],
                      borderColor: isActive
                        ? colors.primary[500]
                        : isDark
                        ? `${colors.primary[500]}30`
                        : colors.primary[200],
                    },
                    isActive && {
                      shadowColor: colors.primary[900],
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 3,
                    },
                  ]}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      {
                        color: isActive
                          ? '#fff'
                          : isDark
                          ? colors.primary[300]
                          : colors.primary[700],
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}
                  >
                    {t(action.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Search Bar — card-style matching complaint inputs ── */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                borderColor: focused ? colors.primary[500] : colors.border,
                backgroundColor: focused
                  ? isDark
                    ? `${colors.primary[500]}12`
                    : colors.primary[50]
                  : colors.surface,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={17}
              color={focused ? colors.primary[500] : colors.text.muted}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              value={searchTerm}
              onChangeText={handleSearch}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t('search_work_officer_document')}
              placeholderTextColor={colors.text.muted}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={[
                  styles.clearBtn,
                  {
                    backgroundColor: isDark
                      ? colors.neutral[700]
                      : colors.neutral[200],
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={12} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {searchTerm.length > 0 && !loading && (
            <View
              style={[
                styles.searchResultsChip,
                {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}12`
                    : colors.primary[50],
                  borderColor: isDark
                    ? `${colors.primary[500]}30`
                    : colors.primary[200],
                },
              ]}
            >
              <Text style={[styles.searchResultsLabel, { color: colors.primary[600] }]}>
                {totalResults > 0
                  ? `${totalResults} ${totalResults !== 1 ? t('results_found') : t('result_found')}`
                  : `${t('no_results_for')} "${searchTerm}"`}
              </Text>
            </View>
          )}
        </View>

        {/* ── Content ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              {t('loading')}
            </Text>
          </View>
        ) : !villageId ? (
          /* ── No village scanned ── */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}15`
                    : colors.primary[50],
                  borderColor: isDark
                    ? `${colors.primary[500]}30`
                    : colors.primary[200],
                },
              ]}
            >
              <Ionicons name="qr-code-outline" size={32} color={colors.primary[500]} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {t('scan_village_qr_first')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
              {t('scan_village_to_access_guide')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary[700] }]}
              onPress={() => router.push('/qr-scanner' as any)}
              activeOpacity={0.82}
            >
              <Text style={styles.emptyBtnText}>{t('scan_qr_code')}</Text>
            </TouchableOpacity>
          </View>
        ) : totalResults === 0 ? (
          /* ── Empty state ── */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}15`
                    : colors.primary[50],
                  borderColor: isDark
                    ? `${colors.primary[500]}30`
                    : colors.primary[200],
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color={colors.primary[500]}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {searchTerm ? t('no_results_found') : t('no_services_listed_yet')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
              {searchTerm
                ? t('try_different_word')
                : t('admin_will_add_services')}
            </Text>
            {searchTerm ? (
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary[700] }]}
                onPress={clearSearch}
                activeOpacity={0.82}
              >
                <Text style={styles.emptyBtnText}>{t('clear_search')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          /* ── Results list ── */
          <View style={styles.listSection}>
            {grouped.map(group => (
              <View key={group.category} style={styles.categoryGroup}>
                {/* Category header — matches complaint's fieldLabel pattern */}
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: colors.text.muted }]}>
                    {group.category}
                  </Text>
                  <View
                    style={[
                      styles.categoryCountBadge,
                      {
                        backgroundColor: isDark
                          ? `${colors.primary[500]}18`
                          : colors.primary[50],
                        borderColor: isDark
                          ? `${colors.primary[500]}30`
                          : colors.primary[200],
                      },
                    ]}
                  >
                    <Text
                      style={[styles.categoryCount, { color: colors.primary[600] }]}
                    >
                      {group.items.length}
                    </Text>
                  </View>
                </View>

                {group.items.map((item, idx) => (
                  <WorkGuideCard
                    key={item._id}
                    item={item}
                    index={idx}
                    checkedDocs={checkedDocs}
                    onToggleDoc={toggleDoc}
                    onResetChecklist={resetChecklist}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header — identical structure to complaint.tsx ──────────────────────────
  headerShell: {
    paddingBottom: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  accentCircle1: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    top: -80, right: -50,
  },
  accentCircle2: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    bottom: -30, left: 30,
  },
  headerNavRow: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 18 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10, fontWeight: '800',
    letterSpacing: 2.5, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28, fontWeight: '800',
    letterSpacing: -0.8, lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4,
  },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3 },
  headerSub: { fontSize: 12, fontWeight: '500' },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: { paddingBottom: 24 },

  // ── Quick actions ─────────────────────────────────────────────────────────
  quickSection: { paddingTop: 20, paddingBottom: 4 },
  quickHeading: {
    fontSize: 13, fontWeight: '800',
    letterSpacing: 0.3,
    paddingHorizontal: 16, marginBottom: 12,
  },
  quickRow: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1.5,
    alignItems: 'center',
  },
  quickChipText: { fontSize: 12 },

  // ── Search ────────────────────────────────────────────────────────────────
  searchSection: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, gap: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 14, height: 50,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  searchResultsChip: {
    alignSelf: 'flex-start',
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  searchResultsLabel: { fontSize: 11, fontWeight: '700' },

  // ── Loading ───────────────────────────────────────────────────────────────
  loadingBox: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60, gap: 10,
  },
  loadingText: { fontSize: 14 },

  // ── Empty state card — matches complaint card style ────────────────────────
  emptyCard: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden', alignItems: 'center',
    paddingVertical: 48, paddingHorizontal: 28,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18, fontWeight: '800',
    letterSpacing: -0.3, marginBottom: 8, textAlign: 'center',
  },
  emptySub: {
    fontSize: 13, textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },
  emptyBtn: {
    borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },

  // ── List ─────────────────────────────────────────────────────────────────
  listSection: { paddingHorizontal: 16, paddingTop: 12, gap: 20 },
  categoryGroup: { gap: 8 },
  categoryHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
    paddingHorizontal: 2,
  },
  categoryTitle: {
    fontSize: 10, fontWeight: '800',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  categoryCountBadge: {
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  categoryCount: { fontSize: 11, fontWeight: '800' },

  // ── Card — matches complaint card style ────────────────────────────────────
  card: {
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden', marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: 16, gap: 10,
  },
  cardHeaderLeft: { flex: 1 },
  cardWorkName: { fontSize: 15, fontWeight: '800', marginBottom: 3, letterSpacing: -0.2 },
  cardOfficer: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  cardDesignation: { fontSize: 11, fontWeight: '500', marginBottom: 10 },

  chevronWrap: {
    width: 30, height: 30, borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },

  nextVisitPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1,
  },
  nextVisitText: { fontSize: 11, fontWeight: '600' },

  // ── Card body ─────────────────────────────────────────────────────────────
  cardBody: { paddingHorizontal: 14, paddingBottom: 16 },
  divider: { height: 1, marginBottom: 14 },

  // Details grid — cleaner icon+label+value layout
  detailsGrid: { gap: 10, marginBottom: 14 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  detailContent: { flex: 1 },
  detailLabel: {
    fontSize: 9, fontWeight: '800',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  dayPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayPill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, borderWidth: 1,
  },
  dayPillText: { fontSize: 11, fontWeight: '700' },

  // Next visit box
  nextVisitBox: {
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14,
  },
  nextVisitBoxLabel: {
    fontSize: 9, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4,
  },
  nextVisitBoxDay: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  nextVisitBoxTime: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  // Checklist — matches complaint warning/field card style
  checklistSection: { marginTop: 4 },
  checklistHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  checklistTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  checklistProgress: { fontSize: 12, fontWeight: '700' },

  allReadyBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 9,
    marginBottom: 10, gap: 7,
  },
  allReadyText: { fontSize: 12, fontWeight: '700' },

  docRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 6, borderWidth: 1, gap: 12,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  docText: { fontSize: 13, flex: 1, fontWeight: '500' },

  resetBtn: { alignSelf: 'flex-start', paddingTop: 6 },
  resetBtnText: { fontSize: 11, textDecorationLine: 'underline' },

  // Note box — mirrors complaint warning row style
  noteBox: {
    marginTop: 12, borderRadius: 10,
    borderWidth: 1, borderLeftWidth: 3, padding: 12,
  },
  noteHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  noteIcon: { fontSize: 12 },
  noteLabel: {
    fontSize: 9, fontWeight: '800',
    letterSpacing: 0.8, textTransform: 'uppercase',
  },
  noteText: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
});