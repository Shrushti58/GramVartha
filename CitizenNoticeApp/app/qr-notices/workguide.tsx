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

// ── Icons with theme support ──────────────────────────────────────────────────
const BackArrow = ({ colors }: { colors: any }) => (
  <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.text.primary, transform: [{ rotate: '45deg' }], marginLeft: 4 }} />
  </View>
);

const SearchIcon = ({ colors }: { colors: any }) => (
  <View style={{ width: 16, height: 16 }}>
    <View style={{ width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: colors.text.secondary, position: 'absolute', top: 0, left: 0 }} />
    <View style={{ width: 5, height: 1.5, backgroundColor: colors.text.secondary, position: 'absolute', bottom: 0, right: 0, transform: [{ rotate: '-45deg' }], borderRadius: 1 }} />
  </View>
);

const CalendarIcon = ({ colors }: { colors: any }) => (
  <View style={{ width: 12, height: 12 }}>
    <View style={{ width: 12, height: 10, borderWidth: 1, borderColor: colors.primary[600], borderRadius: 2, position: 'absolute', bottom: 0 }} />
    <View style={{ width: 3, height: 3, borderLeftWidth: 1, borderColor: colors.primary[600], position: 'absolute', top: 0, left: 2 }} />
    <View style={{ width: 3, height: 3, borderLeftWidth: 1, borderColor: colors.primary[600], position: 'absolute', top: 0, right: 2 }} />
  </View>
);

// ── Document Checklist Item ────────────────────────────────────────────────────
const DocItem = ({
  doc,
  guideId,
  index,
  checked,
  onToggle,
  colors,
}: {
  doc: string;
  guideId: string;
  index: number;
  checked: boolean;
  onToggle: () => void;
  colors: any;
}) => (
  <TouchableOpacity
    style={[
      styles.docRow,
      { backgroundColor: colors.neutral[50], borderColor: colors.border },
      checked && [styles.docRowChecked, { backgroundColor: `${colors.primary[500]}08`, borderColor: colors.primary[200] }]
    ]}
    onPress={onToggle}
    activeOpacity={0.7}>
    <View style={[
      styles.checkbox,
      { borderColor: colors.neutral[300], backgroundColor: '#fff' },
      checked && [styles.checkboxChecked, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
    ]}>
      {checked && (
        <View style={styles.checkmark}>
          <View style={styles.checkmarkInner} />
        </View>
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
}: {
  item: WorkGuideItem;
  checkedDocs: Record<string, boolean>;
  onToggleDoc: (guideId: string, docIdx: number) => void;
  onResetChecklist: (guideId: string, docCount: number) => void;
  index: number;
  colors: any;
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
          expanded && [styles.cardExpanded, { borderColor: colors.primary[300] }]
        ]}
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.85}>

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.cardWorkName, { color: colors.text.primary }]}>{item.workName}</Text>
            <Text style={[styles.cardOfficer, { color: colors.text.secondary }]}>{item.officerName} — {item.designation}</Text>
            <View style={[
              styles.nextVisitPill,
              { backgroundColor: colors.neutral[100], borderColor: colors.border },
              nextVisit.isToday && [styles.nextVisitPillToday, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.primary[300] }]
            ]}>
              <CalendarIcon colors={colors} />
              <Text style={[
                styles.nextVisitText,
                { color: colors.text.secondary },
                nextVisit.isToday && [styles.nextVisitTextToday, { color: colors.primary[700] }]
              ]}>
                Next visit: {nextVisit.dayLabel}{nextVisit.timing ? `, ${nextVisit.timing.split('–')[0].trim()}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.chevron}>
            <View style={[styles.chevronLine1, { backgroundColor: colors.text.secondary }, expanded && styles.chevronLine1Exp]} />
            <View style={[styles.chevronLine2, { backgroundColor: colors.text.secondary }, expanded && styles.chevronLine2Exp]} />
          </View>
        </View>

        {expanded && (
          <View style={styles.cardBody}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsGrid}>
              {item.availableDays.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Available Days</Text>
                  <View style={styles.dayPills}>
                    {item.availableDays.map(d => (
                      <View key={d} style={[styles.dayPill, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.primary[200] }]}>
                        <Text style={[styles.dayPillText, { color: colors.primary[700] }]}>{d.slice(0, 3)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {item.timing ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Timing</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary }]}>{item.timing}</Text>
                </View>
              ) : null}

              {item.location ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>Where to go</Text>
                  <Text style={[styles.detailValue, { color: colors.text.primary }]}>{item.location}</Text>
                </View>
              ) : null}

              <View style={[
                styles.nextVisitBox,
                { backgroundColor: colors.neutral[50], borderColor: colors.border },
                nextVisit.isToday && [styles.nextVisitBoxToday, { backgroundColor: `${colors.primary[500]}10`, borderColor: colors.primary[200] }]
              ]}>
                <Text style={[styles.nextVisitBoxLabel, { color: colors.text.muted }]}>Next Available Visit</Text>
                <Text style={[
                  styles.nextVisitBoxDay,
                  { color: colors.text.primary },
                  nextVisit.isToday && [styles.nextVisitBoxDayToday, { color: colors.primary[700] }]
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
                    {checkedCount} of {item.documents.length} ready
                  </Text>
                </View>

                {allReady && (
                  <View style={[styles.allReadyBanner, { backgroundColor: '#dcfce7', borderColor: '#86efac' }]}>
                    <Text style={[styles.allReadyText, { color: '#15803d' }]}>All documents ready — you can visit now</Text>
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
                { backgroundColor: colors.neutral[50], borderColor: colors.border, borderLeftColor: colors.primary[400] }
              ]}>
                <Text style={[styles.noteLabel, { color: colors.text.muted }]}>Note</Text>
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <Animated.View style={[styles.header, { opacity: headerAnim, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.neutral[100] }]} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow colors={colors} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Work Guide</Text>
          {villageName ? <Text style={[styles.headerSub, { color: colors.text.secondary }]}>{villageName}</Text> : null}
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Quick actions */}
        <View style={[styles.quickSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.quickHeading, { color: colors.text.primary }]}>What do you want to do today?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.search}
                style={[
                  styles.quickChip,
                  { backgroundColor: colors.neutral[100], borderColor: colors.border },
                  activeQuickAction === action.search && [styles.quickChipActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
                ]}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.75}>
                <Text style={[
                  styles.quickChipText,
                  { color: colors.text.primary },
                  activeQuickAction === action.search && [styles.quickChipTextActive, { color: '#fff' }]
                ]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search bar */}
        <View style={styles.searchSection}>
          <View style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}>
            <SearchIcon colors={colors} />
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder="Search by work type, officer, document..."
              placeholderTextColor={colors.text.muted}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={[styles.clearBtn, { backgroundColor: colors.neutral[200] }]} activeOpacity={0.7}>
                <Text style={[styles.clearBtnText, { color: colors.text.secondary }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {searchTerm.length > 0 && !loading && (
            <Text style={[styles.searchResultsLabel, { color: colors.text.muted }]}>
              {totalResults > 0
                ? `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchTerm}"`
                : `No results found for "${searchTerm}"`}
            </Text>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary[600]} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading work guide...</Text>
          </View>
        ) : !villageId ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.border }]}>
              <View style={[styles.emptyIconInner, { borderColor: colors.primary[400] }]} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Village Scanned</Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>Please scan your village QR code first to view the work guide.</Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${colors.primary[500]}15`, borderColor: colors.border }]}>
              <View style={[styles.emptyIconInner, { borderColor: colors.primary[400] }]} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
              {searchTerm ? `No results for "${searchTerm}"` : 'No entries yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.text.secondary }]}>
              {searchTerm
                ? 'Try different words or browse by tapping a quick action above'
                : 'The village admin has not added any work guide entries yet'}
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

  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  headerSub:   { fontSize: 11, marginTop: 1 },

  scrollContent: { paddingBottom: 24 },

  quickSection: {
    paddingTop: 20, paddingBottom: 4,
    borderBottomWidth: 1,
  },
  quickHeading: { fontSize: 14, fontWeight: '700', paddingHorizontal: 16, marginBottom: 12 },
  quickRow:     { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    borderWidth: 1,
  },
  quickChipActive:     {},
  quickChipText:       { fontSize: 13, fontWeight: '600' },
  quickChipTextActive: {},

  searchSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10,
  },
  searchInput:        { flex: 1, fontSize: 14, paddingVertical: 0 },
  clearBtn:           { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  clearBtnText:       { fontSize: 10, fontWeight: '700' },
  searchResultsLabel: { fontSize: 12, marginTop: 8, paddingHorizontal: 2 },

  loadingBox:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 14 },

  emptyBox:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconBox:  { width: 56, height: 56, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyIconInner:{ width: 24, height: 28, borderWidth: 1.5, borderRadius: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  emptySub:      { fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  clearSearchBtn:     { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  clearSearchBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  listSection:    { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  categoryGroup:  { gap: 8 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  categoryTitle:  { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  categoryCount:  { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  card:        { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 2 },
  cardExpanded:{},
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  cardHeaderLeft: { flex: 1 },
  cardWorkName: { fontSize: 15, fontWeight: '700', marginBottom: 3, letterSpacing: -0.1 },
  cardOfficer:  { fontSize: 12, marginBottom: 8 },

  nextVisitPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  nextVisitPillToday:{},
  nextVisitText:     { fontSize: 11, fontWeight: '600' },
  nextVisitTextToday:{},

  chevron:      { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  chevronLine1: { width: 8, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg'  }, { translateX:  3 }] },
  chevronLine2: { width: 8, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateX: -3 }] },
  chevronLine1Exp: { transform: [{ rotate: '-45deg' }, { translateX:  3 }] },
  chevronLine2Exp: { transform: [{ rotate:  '45deg' }, { translateX: -3 }] },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  divider:  { height: 1, marginBottom: 14 },

  detailsGrid: { gap: 10, marginBottom: 14 },
  detailRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', width: 100, flexShrink: 0 },
  detailValue: { fontSize: 13, flex: 1, fontWeight: '500' },
  dayPills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  dayPill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  dayPillText: { fontSize: 11, fontWeight: '700' },

  nextVisitBox:        { borderRadius: 10, borderWidth: 1, padding: 12 },
  nextVisitBoxToday:   {},
  nextVisitBoxLabel:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  nextVisitBoxDay:     { fontSize: 15, fontWeight: '700' },
  nextVisitBoxDayToday:{},
  nextVisitBoxTime:    { fontSize: 12, marginTop: 2 },

  checklistSection: { marginTop: 4 },
  checklistHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  checklistTitle:   { fontSize: 13, fontWeight: '700' },
  checklistProgress:{ fontSize: 12, fontWeight: '600' },
  checklistProgressDone:{},
  allReadyBanner: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, borderWidth: 1 },
  allReadyText:   { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  docRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, borderWidth: 1, gap: 10 },
  docRowChecked:{},
  checkbox:        { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxChecked: {},
  checkmark:       { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  checkmarkInner:  { width: 6, height: 4, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#fff', transform: [{ rotate: '-45deg' }, { translateY: -1 }] },
  docText:        { fontSize: 13, flex: 1, fontWeight: '500' },
  docTextChecked: { textDecorationLine: 'line-through' },
  resetBtn:     { alignSelf: 'flex-start', paddingTop: 4 },
  resetBtnText: { fontSize: 11, textDecorationLine: 'underline' },

  noteBox:   { marginTop: 10, borderRadius: 8, borderWidth: 1, borderLeftWidth: 3, padding: 10 },
  noteLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  noteText:  { fontSize: 12, lineHeight: 18 },
});