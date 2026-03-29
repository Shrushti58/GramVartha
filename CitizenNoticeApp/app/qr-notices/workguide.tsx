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
  { label: 'Birth Certificate',   search: 'birth certificate'   },
  { label: 'Death Certificate',   search: 'death certificate'   },
  { label: 'Residence Proof',     search: 'residence'           },
  { label: 'Caste Certificate',   search: 'caste'               },
  { label: 'Income Certificate',  search: 'income'              },
  { label: '7/12 Land Record',    search: '7/12'                },
  { label: 'Property Tax',        search: 'property tax'        },
  { label: 'Ration Card',         search: 'ration'              },
  { label: 'Pension Application', search: 'pension'             },
  { label: 'NREGA Job Card',      search: 'nrega'               },
  { label: 'PM Awas Yojana',      search: 'awas'                },
  { label: 'Water Connection',    search: 'water'               },
  { label: 'Voter ID Help',       search: 'voter'               },
  { label: 'Scholarship',         search: 'scholarship'         },
];

// ── Next Visit Calculator ──────────────────────────────────────────────────────
function getNextAvailable(availableDays: string[], timing: string, colors: any): {
  dayLabel: string;
  date: string;
  timing: string;
  isToday: boolean;
} {
  if (!availableDays || availableDays.length === 0) {
    return { dayLabel: '—', date: '', timing: timing || '', isToday: false };
  }

  const now = new Date();
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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
          ? (isDark ? `${colors.primary[500]}10` : `${colors.primary[500]}8`) 
          : (isDark ? colors.neutral[800] : colors.neutral[50]), 
        borderColor: checked ? colors.primary[300] : colors.border,
      }
    ]}
    onPress={onToggle}
    activeOpacity={0.7}>
    <View style={[
      styles.checkbox,
      { borderColor: colors.neutral[400], backgroundColor: colors.surface },
      checked && [styles.checkboxChecked, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
    ]}>
      {checked && (
        <Ionicons name="checkmark" size={12} color="#fff" />
      )}
    </View>
    <Text style={[
      styles.docText,
      { color: colors.text.primary },
      checked && [styles.docTextChecked, { color: colors.text.muted }]
    ]}>{doc}</Text>
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, delay: index * 50, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const nextVisit    = getNextAvailable(item.availableDays, item.timing, colors);
  const checkedCount = item.documents.filter((_, i) => checkedDocs[checklistKey(item._id, i)]).length;
  const allReady     = item.documents.length > 0 && checkedCount === item.documents.length;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          expanded && [styles.cardExpanded, { borderColor: colors.primary[400] }]
        ]}
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.85}>

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.cardWorkName, { color: colors.text.primary }]}>{item.workName}</Text>
            <Text style={[styles.cardOfficer, { color: colors.text.secondary }]}>{item.officerName}</Text>
            <Text style={[styles.cardDesignation, { color: colors.text.muted }]}>{item.designation}</Text>
            <View style={[
              styles.nextVisitPill,
              { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderColor: colors.border },
              nextVisit.isToday && [styles.nextVisitPillToday, { backgroundColor: `${colors.primary[500]}20`, borderColor: colors.primary[400] }]
            ]}>
              <Ionicons name="calendar-outline" size={12} color={nextVisit.isToday ? colors.primary[500] : colors.text.muted} />
              <Text style={[
                styles.nextVisitText,
                { color: nextVisit.isToday ? colors.primary[600] : colors.text.secondary },
              ]}>
                Next: {nextVisit.dayLabel}{nextVisit.timing ? `, ${nextVisit.timing.split('–')[0].trim()}` : ''}
              </Text>
            </View>
          </View>
          <View style={[styles.chevron, expanded && styles.chevronExpanded]}>
            <Ionicons name="chevron-down" size={20} color={colors.text.muted} />
          </View>
        </View>

        {expanded && (
          <View style={styles.cardBody}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsGrid}>
              {item.availableDays.length > 0 && (
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={14} color={colors.primary[500]} style={styles.detailIcon} />
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Available Days:</Text>
                  <View style={styles.dayPills}>
                    {item.availableDays.map(d => (
                      <View key={d} style={[styles.dayPill, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.primary[300] }]}>
                        <Text style={[styles.dayPillText, { color: colors.primary[600] }]}>{d.slice(0, 3)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {item.timing ? (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={14} color={colors.primary[500]} style={styles.detailIcon} />
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Timing:</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary, fontWeight: '600' }]}>{item.timing}</Text>
                </View>
              ) : null}

              {item.location ? (
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={14} color={colors.primary[500]} style={styles.detailIcon} />
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Location:</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary, fontWeight: '500' }]}>{item.location}</Text>
                </View>
              ) : null}

              <View style={[
                styles.nextVisitBox,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border },
                nextVisit.isToday && [styles.nextVisitBoxToday, { backgroundColor: `${colors.primary[500]}12`, borderColor: colors.primary[300] }]
              ]}>
                <Text style={[styles.nextVisitBoxLabel, { color: colors.text.muted }]}>Next Available Visit</Text>
                <Text style={[
                  styles.nextVisitBoxDay,
                  { color: colors.text.primary },
                  nextVisit.isToday && [styles.nextVisitBoxDayToday, { color: colors.primary[600] }]
                ]}>
                  {nextVisit.dayLabel}{nextVisit.date ? ` — ${nextVisit.date}` : ''}
                </Text>
                {nextVisit.timing ? (
                  <Text style={[styles.nextVisitBoxTime, { color: colors.text.secondary }]}>{nextVisit.timing}</Text>
                ) : null}
              </View>
            </View>

            {item.documents.length > 0 && (
              <View style={styles.checklistSection}>
                <View style={styles.checklistHeader}>
                  <Text style={[styles.checklistTitle, { color: colors.text.primary }]}>Documents to Bring</Text>
                  <Text style={[
                    styles.checklistProgress,
                    { color: colors.text.secondary },
                    allReady && [styles.checklistProgressDone, { color: colors.success }]
                  ]}>
                    {checkedCount} of {item.documents.length}
                  </Text>
                </View>

                {allReady && (
                  <View style={[styles.allReadyBanner, { backgroundColor: `${colors.success}15`, borderColor: colors.success }]}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={[styles.allReadyText, { color: colors.success }]}>✓ All documents ready — you can visit now</Text>
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

                <TouchableOpacity onPress={() => onResetChecklist(item._id, item.documents.length)} style={styles.resetBtn}>
                  <Text style={[styles.resetBtnText, { color: colors.text.muted }]}>Reset checklist</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.note ? (
              <View style={[
                styles.noteBox,
                { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50], borderColor: colors.border, borderLeftColor: colors.primary[500] }
              ]}>
                <Text style={[styles.noteLabel, { color: colors.text.muted }]}>Important Note</Text>
                <Text style={[styles.noteText, { color: colors.text.secondary }]}>{item.note}</Text>
              </View>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function WorkGuideScreen() {
  const { colors, isDark } = useTheme();
  const [villageId,   setVillageId]   = useState<string>('');
  const [villageName, setVillageName] = useState<string>('');

  const [grouped,           setGrouped]           = useState<GroupedGuide[]>([]);
  const [loading,           setLoading]           = useState(false);
  const [searchTerm,        setSearchTerm]        = useState('');
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [checkedDocs,       setCheckedDocs]       = useState<Record<string, boolean>>({});

  const headerAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // ── Fetch guides once villageId is available ─────────────────────────────────
  useEffect(() => {
    if (villageId) fetchGuides();
  }, [villageId]);

  // ── Load checklist from AsyncStorage ────────────────────────────────────────
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

  // ── Fetch guides ─────────────────────────────────────────────────────────────
  const fetchGuides = async (search?: string) => {
    if (!villageId) return;
    try {
      setLoading(true);
      const base =`${Config.API_BASE_URL}/workguide/village/${villageId}`;
      const url  = search ? `${base}?search=${encodeURIComponent(search)}` : base;
      const res  = await fetch(url);
      const data = await res.json();
      setGrouped(Array.isArray(data) ? data : []);
    } catch (e) {
      setGrouped([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Search ───────────────────────────────────────────────────────────────────
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

  // ── Checklist ────────────────────────────────────────────────────────────────
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

  // Dynamic header colors
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : "#fff";
  const headerSubColor = isDark ? colors.primary[200] : "rgba(255,255,255,0.8)";
  const headerEyebrowColor = isDark ? colors.primary[300] : "rgba(255,255,255,0.6)";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={headerBg} />

      {/* Header */}
      <LinearGradient
        colors={isDark 
          ? [colors.primary[800], colors.primary[900]] 
          : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View style={[styles.accentCircle1, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)" }]} />
        <View style={[styles.accentCircle2, { backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)" }]} />
        
        <View style={styles.headerNavRow}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backBtn, { backgroundColor: isDark ? `${colors.primary[500]}40` : "rgba(255,255,255,0.15)" }]} 
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>VILLAGE SERVICES</Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>Work Guide 📘</Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>{villageName || 'Your Village'}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Quick actions */}
        <View style={[styles.quickSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.quickHeading, { color: colors.text.primary }]}>What do you need?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_ACTIONS.map(action => {
              const isActive = activeQuickAction === action.search;
              return (
                <TouchableOpacity
                  key={action.search}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: isActive ? colors.primary[600] : (isDark ? colors.neutral[700] : colors.neutral[100]),
                      borderColor: isActive ? colors.primary[500] : (isDark ? colors.neutral[500] : colors.neutral[300]),
                      borderWidth: 1.5,
                      shadowColor: isActive ? colors.primary[900] : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isActive ? 0.25 : 0,
                      shadowRadius: 4,
                      elevation: isActive ? 3 : 0,
                    }
                  ]}
                  onPress={() => handleQuickAction(action)}
                  activeOpacity={0.75}>
                  <Text style={[
                    styles.quickChipText,
                    { 
                      color: isActive ? '#FFFFFF' : (isDark ? colors.neutral[200] : colors.neutral[800]),
                      fontWeight: isActive ? '700' : '600',
                    }
                  ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search bar */}
        <View style={styles.searchSection}>
          <View style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}>
            <Ionicons name="search-outline" size={18} color={colors.text.muted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder="Search work, officer, document..."
              placeholderTextColor={colors.text.muted}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={[styles.clearBtn, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} activeOpacity={0.7}>
                <Ionicons name="close" size={12} color={colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          {searchTerm.length > 0 && !loading && (
            <Text style={[styles.searchResultsLabel, { color: colors.text.muted }]}>
              {totalResults > 0
                ? `${totalResults} result${totalResults !== 1 ? 's' : ''} found`
                : `No results for "${searchTerm}"`}
            </Text>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading...</Text>
          </View>
        ) : !villageId ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.border }]}>
              <Ionicons name="qr-code-outline" size={32} color={colors.primary[500]} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Scan Village QR First</Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>Please scan your village QR code to access the work guide.</Text>
            <TouchableOpacity 
              style={[styles.scanBtn, { backgroundColor: colors.primary[600] }]} 
              onPress={() => router.push('/qr-scanner' as any)}>
              <Text style={styles.scanBtnText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.border }]}>
              <Ionicons name="document-text-outline" size={32} color={colors.primary[500]} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {searchTerm ? 'No results found' : 'No services listed yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
              {searchTerm
                ? 'Try a different word or browse quick actions above'
                : 'The village admin will add services soon'}
            </Text>
            {searchTerm ? (
              <TouchableOpacity style={[styles.clearSearchBtn, { backgroundColor: colors.primary[600] }]} onPress={clearSearch} activeOpacity={0.8}>
                <Text style={styles.clearSearchBtnText}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.listSection}>
            {grouped.map(group => (
              <View key={group.category} style={styles.categoryGroup}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryTitle, { color: colors.text.secondary }]}>{group.category}</Text>
                  <Text style={[styles.categoryCount, { color: colors.primary[600], backgroundColor: `${colors.primary[500]}15` }]}>{group.items.length}</Text>
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

  // Header styles
  headerShell: {
    paddingBottom: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  accentCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
  },
  accentCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -30,
    left: 30,
  },
  headerNavRow: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnTxt: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
  },
  headerTitleBlock: {
    paddingHorizontal: 18,
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 4,
  },
  headerBreadcrumbDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "500",
  },

  scrollContent: { paddingBottom: 24 },

  quickSection: {
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  quickHeading: { 
    fontSize: 15, 
    fontWeight: '700', 
    paddingHorizontal: 16, 
    marginBottom: 12,
  },
  quickRow: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    gap: 10,
  },
  quickChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 32,
    minWidth: 110,
    alignItems: 'center',
  },
  quickChipText: { 
    fontSize: 13,
  },

  searchSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  clearBtn: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchResultsLabel: { fontSize: 12, marginTop: 8, paddingHorizontal: 2 },

  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 14 },

  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconBox: { width: 70, height: 70, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  scanBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  scanBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  clearSearchBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  clearSearchBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  listSection: { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  categoryGroup: { gap: 8 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  categoryTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  categoryCount: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  cardExpanded: {},
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 10 },
  cardHeaderLeft: { flex: 1 },
  cardWorkName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardOfficer: { fontSize: 13, marginBottom: 2 },
  cardDesignation: { fontSize: 11, marginBottom: 8 },

  nextVisitPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  nextVisitPillToday: {},
  nextVisitText: { fontSize: 11, fontWeight: '600' },

  chevron: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  chevronExpanded: { transform: [{ rotate: '180deg' }] },

  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },
  divider: { height: 1, marginBottom: 16 },

  detailsGrid: { gap: 12, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  detailIcon: { width: 18 },
  detailLabel: { fontSize: 12, fontWeight: '600' },
  detailValue: { fontSize: 13, flex: 1 },
  dayPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  dayPillText: { fontSize: 11, fontWeight: '700' },

  nextVisitBox: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  nextVisitBoxToday: {},
  nextVisitBoxLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  nextVisitBoxDay: { fontSize: 15, fontWeight: '700' },
  nextVisitBoxDayToday: {},
  nextVisitBoxTime: { fontSize: 12, marginTop: 2 },

  checklistSection: { marginTop: 8 },
  checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  checklistTitle: { fontSize: 14, fontWeight: '700' },
  checklistProgress: { fontSize: 12, fontWeight: '600' },
  checklistProgressDone: {},

  allReadyBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, gap: 6, borderWidth: 1 },
  allReadyText: { fontSize: 12, fontWeight: '600' },

  docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6, borderWidth: 1, gap: 12 },
  docRowChecked: {},
  checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxChecked: {},
  docText: { fontSize: 13, flex: 1, fontWeight: '500' },
  docTextChecked: { textDecorationLine: 'line-through' },
  resetBtn: { alignSelf: 'flex-start', paddingTop: 4 },
  resetBtnText: { fontSize: 11, textDecorationLine: 'underline' },

  noteBox: { marginTop: 12, borderRadius: 10, borderWidth: 1, borderLeftWidth: 3, padding: 12 },
  noteLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  noteText: { fontSize: 12, lineHeight: 18 },
});