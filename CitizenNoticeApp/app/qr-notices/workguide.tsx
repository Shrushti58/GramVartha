/**
 * Work Guide Screen
 * Helps citizens find the right official, when to visit, and what documents to bring
 * Route: app/qr-notices/workguide.tsx
 */

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
import { Colors } from '../../constants/colors';
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
function getNextAvailable(availableDays: string[], timing: string): {
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

// ── Icons ──────────────────────────────────────────────────────────────────────
const BackArrow = () => (
  <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: Colors.textPrimary, transform: [{ rotate: '45deg' }], marginLeft: 4 }} />
  </View>
);

const SearchIcon = () => (
  <View style={{ width: 16, height: 16 }}>
    <View style={{ width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.textSecondary, position: 'absolute', top: 0, left: 0 }} />
    <View style={{ width: 5, height: 1.5, backgroundColor: Colors.textSecondary, position: 'absolute', bottom: 0, right: 0, transform: [{ rotate: '-45deg' }], borderRadius: 1 }} />
  </View>
);

const CalendarIcon = () => (
  <View style={{ width: 12, height: 12 }}>
    <View style={{ width: 12, height: 10, borderWidth: 1, borderColor: Colors.primary[600], borderRadius: 2, position: 'absolute', bottom: 0 }} />
    <View style={{ width: 3, height: 3, borderLeftWidth: 1, borderColor: Colors.primary[600], position: 'absolute', top: 0, left: 2 }} />
    <View style={{ width: 3, height: 3, borderLeftWidth: 1, borderColor: Colors.primary[600], position: 'absolute', top: 0, right: 2 }} />
  </View>
);

// ── Document Checklist Item ────────────────────────────────────────────────────
const DocItem = ({
  doc,
  guideId,
  index,
  checked,
  onToggle,
}: {
  doc: string;
  guideId: string;
  index: number;
  checked: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity
    style={[styles.docRow, checked && styles.docRowChecked]}
    onPress={onToggle}
    activeOpacity={0.7}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && (
        <View style={styles.checkmark}>
          <View style={styles.checkmarkInner} />
        </View>
      )}
    </View>
    <Text style={[styles.docText, checked && styles.docTextChecked]}>{doc}</Text>
  </TouchableOpacity>
);

// ── Work Guide Card ────────────────────────────────────────────────────────────
const WorkGuideCard = ({
  item,
  checkedDocs,
  onToggleDoc,
  onResetChecklist,
  index,
}: {
  item: WorkGuideItem;
  checkedDocs: Record<string, boolean>;
  onToggleDoc: (guideId: string, docIdx: number) => void;
  onResetChecklist: (guideId: string, docCount: number) => void;
  index: number;
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

  const nextVisit    = getNextAvailable(item.availableDays, item.timing);
  const checkedCount = item.documents.filter((_, i) => checkedDocs[checklistKey(item._id, i)]).length;
  const allReady     = item.documents.length > 0 && checkedCount === item.documents.length;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.card, expanded && styles.cardExpanded]}
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.85}>

        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardWorkName}>{item.workName}</Text>
            <Text style={styles.cardOfficer}>{item.officerName} — {item.designation}</Text>
            <View style={[styles.nextVisitPill, nextVisit.isToday && styles.nextVisitPillToday]}>
              <CalendarIcon />
              <Text style={[styles.nextVisitText, nextVisit.isToday && styles.nextVisitTextToday]}>
                Next visit: {nextVisit.dayLabel}{nextVisit.timing ? `, ${nextVisit.timing.split('–')[0].trim()}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.chevron}>
            <View style={[styles.chevronLine1, expanded && styles.chevronLine1Exp]} />
            <View style={[styles.chevronLine2, expanded && styles.chevronLine2Exp]} />
          </View>
        </View>

        {expanded && (
          <View style={styles.cardBody}>
            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              {item.availableDays.length > 0 && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Available Days</Text>
                  <View style={styles.dayPills}>
                    {item.availableDays.map(d => (
                      <View key={d} style={styles.dayPill}>
                        <Text style={styles.dayPillText}>{d.slice(0, 3)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {item.timing ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Timing</Text>
                  <Text style={styles.detailValue}>{item.timing}</Text>
                </View>
              ) : null}

              {item.location ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Where to go</Text>
                  <Text style={styles.detailValue}>{item.location}</Text>
                </View>
              ) : null}

              <View style={[styles.nextVisitBox, nextVisit.isToday && styles.nextVisitBoxToday]}>
                <Text style={styles.nextVisitBoxLabel}>Next Available Visit</Text>
                <Text style={[styles.nextVisitBoxDay, nextVisit.isToday && styles.nextVisitBoxDayToday]}>
                  {nextVisit.dayLabel}{nextVisit.date ? ` — ${nextVisit.date}` : ''}
                </Text>
                {nextVisit.timing ? (
                  <Text style={styles.nextVisitBoxTime}>{nextVisit.timing}</Text>
                ) : null}
              </View>
            </View>

            {item.documents.length > 0 && (
              <View style={styles.checklistSection}>
                <View style={styles.checklistHeader}>
                  <Text style={styles.checklistTitle}>Documents to Bring</Text>
                  <Text style={[styles.checklistProgress, allReady && styles.checklistProgressDone]}>
                    {checkedCount} of {item.documents.length} ready
                  </Text>
                </View>

                {allReady && (
                  <View style={styles.allReadyBanner}>
                    <Text style={styles.allReadyText}>All documents ready — you can visit now</Text>
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
                  />
                ))}

                <TouchableOpacity onPress={() => onResetChecklist(item._id, item.documents.length)} style={styles.resetBtn}>
                  <Text style={styles.resetBtnText}>Reset checklist</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Note</Text>
                <Text style={styles.noteText}>{item.note}</Text>
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
  const [villageId,   setVillageId]   = useState<string>('');
  const [villageName, setVillageName] = useState<string>('');

  const [grouped,           setGrouped]           = useState<GroupedGuide[]>([]);
  const [loading,           setLoading]           = useState(false);   // ← false, not true
  const [searchTerm,        setSearchTerm]        = useState('');
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [checkedDocs,       setCheckedDocs]       = useState<Record<string, boolean>>({});

  const headerAnim = useRef(new Animated.Value(0)).current;

  // ── Load village from AsyncStorage on mount ──────────────────────────────────
  useEffect(() => {
    const loadVillageAndInit = async () => {
      try {
        // Primary: scannedVillage (single object written right after QR scan)
        const primary = await AsyncStorage.getItem('scannedVillage');
        if (primary) {
          const v = JSON.parse(primary);
          if (v?.villageId) {
            setVillageId(v.villageId);
            setVillageName(v.villageName ?? '');
            return;
          }
        }

        // Fallback: recentVillages array
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
  if (!villageId) {
    console.log('fetchGuides: villageId is empty, skipping');
    return;
  }
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
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <BackArrow />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Work Guide</Text>
          {villageName ? <Text style={styles.headerSub}>{villageName}</Text> : null}
        </View>
        <View style={{ width: 36 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">

        {/* Quick actions */}
        <View style={styles.quickSection}>
          <Text style={styles.quickHeading}>What do you want to do today?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {QUICK_ACTIONS.map(action => (
              <TouchableOpacity
                key={action.search}
                style={[styles.quickChip, activeQuickAction === action.search && styles.quickChipActive]}
                onPress={() => handleQuickAction(action)}
                activeOpacity={0.75}>
                <Text style={[styles.quickChipText, activeQuickAction === action.search && styles.quickChipTextActive]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder="Search by work type, officer, document..."
              placeholderTextColor={Colors.textMuted}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearBtn} activeOpacity={0.7}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {searchTerm.length > 0 && !loading && (
            <Text style={styles.searchResultsLabel}>
              {totalResults > 0
                ? `Showing ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${searchTerm}"`
                : `No results found for "${searchTerm}"`}
            </Text>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={Colors.primary[600]} />
            <Text style={styles.loadingText}>Loading work guide...</Text>
          </View>
        ) : !villageId ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <View style={styles.emptyIconInner} />
            </View>
            <Text style={styles.emptyTitle}>No Village Scanned</Text>
            <Text style={styles.emptySub}>Please scan your village QR code first to view the work guide.</Text>
          </View>
        ) : totalResults === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBox}>
              <View style={styles.emptyIconInner} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchTerm ? `No results for "${searchTerm}"` : 'No entries yet'}
            </Text>
            <Text style={styles.emptySub}>
              {searchTerm
                ? 'Try different words or browse by tapping a quick action above'
                : 'The village admin has not added any work guide entries yet'}
            </Text>
            {searchTerm ? (
              <TouchableOpacity style={styles.clearSearchBtn} onPress={clearSearch} activeOpacity={0.8}>
                <Text style={styles.clearSearchBtnText}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.listSection}>
            {grouped.map(group => (
              <View key={group.category} style={styles.categoryGroup}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{group.category}</Text>
                  <Text style={styles.categoryCount}>{group.items.length}</Text>
                </View>
                {group.items.map((item, idx) => (
                  <WorkGuideCard
                    key={item._id}
                    item={item}
                    index={idx}
                    checkedDocs={checkedDocs}
                    onToggleDoc={toggleDoc}
                    onResetChecklist={resetChecklist}
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

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  headerSub:   { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  scrollContent: { paddingBottom: 24 },

  quickSection: {
    paddingTop: 20, paddingBottom: 4,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  quickHeading: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, paddingHorizontal: 16, marginBottom: 12 },
  quickRow:     { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    backgroundColor: Colors.neutral[100], borderWidth: 1, borderColor: Colors.border,
  },
  quickChipActive:     { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  quickChipText:       { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  quickChipTextActive: { color: '#fff' },

  searchSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 10,
  },
  searchInput:        { flex: 1, fontSize: 14, color: Colors.textPrimary, paddingVertical: 0 },
  clearBtn:           { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.neutral[200], justifyContent: 'center', alignItems: 'center' },
  clearBtnText:       { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },
  searchResultsLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 8, paddingHorizontal: 2 },

  loadingBox:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10 },
  loadingText: { fontSize: 14, color: Colors.textSecondary },

  emptyBox:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconBox:  { width: 56, height: 56, borderRadius: 16, backgroundColor: `${Colors.primary[500]}15`, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyIconInner:{ width: 24, height: 28, borderWidth: 1.5, borderColor: Colors.primary[400], borderRadius: 4 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6, textAlign: 'center' },
  emptySub:      { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  clearSearchBtn:     { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.primary[600] },
  clearSearchBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  listSection:    { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  categoryGroup:  { gap: 8 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  categoryTitle:  { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  categoryCount:  { fontSize: 11, fontWeight: '700', color: Colors.primary[600], backgroundColor: `${Colors.primary[500]}15`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },

  card:        { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 2 },
  cardExpanded:{ borderColor: Colors.primary[300] },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  cardHeaderLeft: { flex: 1 },
  cardWorkName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3, letterSpacing: -0.1 },
  cardOfficer:  { fontSize: 12, color: Colors.textSecondary, marginBottom: 8 },

  nextVisitPill:     { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Colors.neutral[100], borderWidth: 1, borderColor: Colors.border },
  nextVisitPillToday:{ backgroundColor: `${Colors.primary[500]}15`, borderColor: Colors.primary[300] },
  nextVisitText:     { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  nextVisitTextToday:{ color: Colors.primary[700] },

  chevron:      { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  chevronLine1: { width: 8, height: 1.5, backgroundColor: Colors.textSecondary, borderRadius: 1, transform: [{ rotate: '45deg'  }, { translateX:  3 }] },
  chevronLine2: { width: 8, height: 1.5, backgroundColor: Colors.textSecondary, borderRadius: 1, transform: [{ rotate: '-45deg' }, { translateX: -3 }] },
  chevronLine1Exp: { transform: [{ rotate: '-45deg' }, { translateX:  3 }] },
  chevronLine2Exp: { transform: [{ rotate:  '45deg' }, { translateX: -3 }] },

  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
  divider:  { height: 1, backgroundColor: Colors.border, marginBottom: 14 },

  detailsGrid: { gap: 10, marginBottom: 14 },
  detailRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, width: 100, flexShrink: 0 },
  detailValue: { fontSize: 13, color: Colors.textPrimary, flex: 1, fontWeight: '500' },
  dayPills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  dayPill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: `${Colors.primary[500]}15`, borderWidth: 1, borderColor: Colors.primary[200] },
  dayPillText: { fontSize: 11, fontWeight: '700', color: Colors.primary[700] },

  nextVisitBox:        { backgroundColor: Colors.neutral[50], borderRadius: 10, borderWidth: 1, borderColor: Colors.border, padding: 12 },
  nextVisitBoxToday:   { backgroundColor: `${Colors.primary[500]}10`, borderColor: Colors.primary[200] },
  nextVisitBoxLabel:   { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  nextVisitBoxDay:     { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  nextVisitBoxDayToday:{ color: Colors.primary[700] },
  nextVisitBoxTime:    { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  checklistSection: { marginTop: 4 },
  checklistHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  checklistTitle:   { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  checklistProgress:    { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  checklistProgressDone:{ color: Colors.success },
  allReadyBanner: { backgroundColor: '#dcfce7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8, borderWidth: 1, borderColor: '#86efac' },
  allReadyText:   { fontSize: 12, fontWeight: '600', color: '#15803d', textAlign: 'center' },

  docRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.border, gap: 10 },
  docRowChecked:{ backgroundColor: `${Colors.primary[500]}08`, borderColor: Colors.primary[200] },
  checkbox:        { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.neutral[300], backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  checkboxChecked: { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  checkmark:       { width: 10, height: 10, justifyContent: 'center', alignItems: 'center' },
  checkmarkInner:  { width: 6, height: 4, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#fff', transform: [{ rotate: '-45deg' }, { translateY: -1 }] },
  docText:        { fontSize: 13, color: Colors.textPrimary, flex: 1, fontWeight: '500' },
  docTextChecked: { textDecorationLine: 'line-through', color: Colors.textMuted },
  resetBtn:     { alignSelf: 'flex-start', paddingTop: 4 },
  resetBtnText: { fontSize: 11, color: Colors.textMuted, textDecorationLine: 'underline' },

  noteBox:   { marginTop: 10, backgroundColor: Colors.neutral[50], borderRadius: 8, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, borderLeftColor: Colors.primary[400], padding: 10 },
  noteLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  noteText:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});