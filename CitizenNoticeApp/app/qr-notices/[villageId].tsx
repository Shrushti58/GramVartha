// app/qr-notices/[villageId].tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
  Animated, StatusBar, TextInput, Keyboard,
  LayoutAnimation, Platform, UIManager,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate, formatViews } from '../../utils/format';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'date' | 'priority';
type SortDir   = 'asc'  | 'desc';
interface SortState { field: SortField; dir: SortDir }

// ─── Helper functions that need theme colors ─────────────────────────────────
const getCategoryStyles = (category: string, colors: any) => {
  const catStyles: Record<string, any> = {
    urgent:        { accent: '#C0392B', bg: '#FEE9E7', fg: '#922B21' },
    development:   { accent: colors.primary[600], bg: `${colors.primary[500]}14`, fg: colors.primary[700] },
    health:        { accent: '#1976D2', bg: '#E3F2FD', fg: '#0D47A1' },
    education:     { accent: '#7B1FA2', bg: '#F3E5F5', fg: '#4A148C' },
    agriculture:   { accent: '#2E7D32', bg: '#E8F5E9', fg: '#1B5E20' },
    employment:    { accent: '#00838F', bg: '#E0F7FA', fg: '#006064' },
    social_welfare:{ accent: '#AD1457', bg: '#FCE4EC', fg: '#880E4F' },
    tax_billing:   { accent: '#E65100', bg: '#FBE9E7', fg: '#BF360C' },
    election:      { accent: '#283593', bg: '#E8EAF6', fg: '#1A237E' },
    general:       { accent: '#546E7A', bg: '#ECEFF1', fg: '#37474F' },
  };
  return catStyles[category] || catStyles.general;
};

const getPriorityStyles = (priority: string) => {
  const priStyles: Record<string, any> = {
    high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High' },
    medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium' },
    low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low' },
  };
  return priStyles[priority] || priStyles.low;
};

const CATEGORIES = [
  { id: 'all',           label: 'All'           },
  { id: 'urgent',        label: 'Urgent'        },
  { id: 'development',   label: 'Development'   },
  { id: 'health',        label: 'Health'        },
  { id: 'education',     label: 'Education'     },
  { id: 'agriculture',   label: 'Agriculture'   },
  { id: 'employment',    label: 'Employment'    },
  { id: 'social_welfare',label: 'Welfare'       },
  { id: 'tax_billing',   label: 'Tax & Billing' },
  { id: 'election',      label: 'Election'      },
  { id: 'general',       label: 'General'       },
];

// ─── Highlighted text ─────────────────────────────────────────────────────────
const HText = ({ text = '', query, style, lines, colors }: { text: string; query: string; style: any; lines?: number; colors: any }) => {
  if (!query.trim()) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts   = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style} numberOfLines={lines}>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={[styles.highlight, { backgroundColor: '#FFF176', color: '#222' }]}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, onClear, colors }: { value: string; onChange: (t: string) => void; onClear: () => void; colors: any }) => (
  <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
    <View style={[styles.searchInner, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.searchIcon, { color: colors.text.secondary }]}>⌕</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text.primary }]}
        placeholder="Search by title, description, author…"
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={[styles.searchClear, { backgroundColor: colors.border }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.searchClearText, { color: colors.text.secondary }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── File chip ────────────────────────────────────────────────────────────────
const FileChip = ({ fileName, colors }: { fileName: string; colors: any }) => (
  <View style={[styles.fileChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
    <View style={[styles.fileChipIcon, { backgroundColor: colors.primary[600] }]}>
      <Text style={styles.fileChipIconText}>↓</Text>
    </View>
    <Text style={[styles.fileChipText, { color: colors.text.secondary }]} numberOfLines={1}>{fileName}</Text>
  </View>
);

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ item, onPress, index, query, colors }: { item: any; onPress: () => void; index: number; query: string; colors: any }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 260, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 240, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = getCategoryStyles(item.category, colors);
  const pri = getPriorityStyles(item.priority);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity 
        style={[
          styles.card, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          item.isPinned && [styles.cardPinned, { borderColor: `${colors.primary[400]}55` }]
        ]} 
        onPress={onPress} 
        activeOpacity={0.74}
      >
        <View style={[styles.cardStrip, { backgroundColor: cat.accent }]} />
        <View style={styles.cardBody}>

          {/* Pills row */}
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: cat.bg }]}>
              <Text style={[styles.pillTxt, { color: cat.fg }]}>{item.category?.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={[styles.priPill, { backgroundColor: pri.bg }]}>
              <View style={[styles.priDot, { backgroundColor: pri.dot }]} />
              <Text style={[styles.pillTxt, { color: pri.fg }]}>{pri.label}</Text>
            </View>
            {item.isPinned && (
              <View style={styles.pinnedBadge}><Text style={styles.pinnedBadgeTxt}>PINNED</Text></View>
            )}
            {item.status && item.status !== 'published' && (
              <View style={[styles.pill, { backgroundColor: '#F5F5F5' }]}>
                <Text style={[styles.pillTxt, { color: '#757575' }]}>{item.status.toUpperCase()}</Text>
              </View>
            )}
          </View>

          <HText text={item.title} query={query} style={[styles.cardTitle, { color: colors.text.primary }]} lines={2} colors={colors} />
          <HText text={item.description} query={query} style={[styles.cardDesc, { color: colors.text.secondary }]} lines={2} colors={colors} />

          {item.fileUrl && <FileChip fileName={item.fileName || 'Attachment'} colors={colors} />}

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.cardFooterL}>
              <View style={[styles.avatar, { backgroundColor: `${cat.accent}22` }]}>
                <Text style={[styles.avatarTxt, { color: cat.accent }]}>
                  {(item.createdBy?.name || 'O')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.metaTxt, { color: colors.text.secondary }]} numberOfLines={1}>{item.createdBy?.name || 'Official'}</Text>
            </View>
            <View style={styles.cardFooterR}>
              <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>{formatDate(item.createdAt)}</Text>
              <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
              <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>{formatViews(item.views || 0)} views</Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronWrap}>
          <Text style={[styles.chevron, { color: cat.accent }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pinned strip ─────────────────────────────────────────────────────────────
const PinnedStrip = ({ notices, onPress, colors }: { notices: any[]; onPress: (id: string) => void; colors: any }) => {
  if (!notices.length) return null;
  return (
    <View style={[styles.pinnedStrip, { borderBottomColor: colors.border }]}>
      <Text style={[styles.pinnedLabel, { color: colors.text.secondary }]}>PINNED</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedScroll}>
        {notices.map((n) => {
          const cat = getCategoryStyles(n.category, colors);
          return (
            <TouchableOpacity 
              key={n._id} 
              style={[
                styles.pinnedCard, 
                { 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border,
                  borderLeftColor: cat.accent 
                }
              ]} 
              onPress={() => onPress(n._id)} 
              activeOpacity={0.75}
            >
              <Text style={[styles.pinnedCat, { color: cat.fg }]}>{n.category?.replace('_', ' ').toUpperCase()}</Text>
              <Text numberOfLines={2} style={[styles.pinnedTitle, { color: colors.text.primary }]}>{n.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, category, colors }: { query: string; category: string; colors: any }) => (
  <View style={styles.emptyWrap}>
    <View style={[styles.emptyCircle, { backgroundColor: `${colors.primary[500]}12` }]}>
      <Text style={[styles.emptyGlyph, { color: colors.primary[500] }]}>{query ? '⌕' : '○'}</Text>
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{query ? 'No results found' : 'No notices found'}</Text>
    <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
      {query
        ? `Nothing matched "${query}". Try different keywords.`
        : category === 'all'
          ? 'This village has no published notices yet.'
          : 'No notices in this category.'}
    </Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QRNoticesScreen() {
  const { colors, isDark } = useTheme();
  const params    = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId) ? params.villageId[0] : (params.villageId || '');

  const [allNotices,        setAllNotices]         = useState<any[]>([]);
  const [village,           setVillage]            = useState<any>(null);
  const [loading,           setLoading]            = useState(true);
  const [refreshing,        setRefreshing]         = useState(false);
  const [selectedCategory,  setSelectedCategory]   = useState('all');
  const [page,              setPage]               = useState(1);
  const [totalPages,        setTotalPages]         = useState(1);
  const [scannedVillageInfo,setScannedVillageInfo] = useState<any>(null);
  const [searchQuery,       setSearchQuery]        = useState('');
  const [sort,              setSort]               = useState<SortState>({ field: 'date', dir: 'desc' });

  useEffect(() => { loadScannedVillageInfo(); fetchNotices(); }, [villageId, page]);
  useEffect(() => { setSearchQuery(''); setPage(1); }, [selectedCategory]);

  const loadScannedVillageInfo = async () => {
    try { const i = await AsyncStorage.getItem('scannedVillage'); if (i) setScannedVillageInfo(JSON.parse(i)); } catch {}
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const r = await apiService.getNoticesByVillage(villageId, page, 10);
      setAllNotices(r.notices); setVillage(r.village); setTotalPages(r.totalPages);
    } catch { Alert.alert('Error', 'Failed to load notices. Please try again.'); }
    finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchNotices(); setRefreshing(false); };

  const handleScanAnother = async () => {
    await AsyncStorage.removeItem('scannedVillage');
    router.replace('/qr-scanner');
  };

  const handleCategoryChange = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(id);
  };

  const handleSort = (field: SortField) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { field, dir: 'desc' }
    );
  };

  // ── Client-side filter + sort ─────────────────────────────────────────────
  const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };
  
  const processed = useMemo(() => {
    // First filter by selected category
    let filtered = selectedCategory === 'all' 
      ? [...allNotices]
      : allNotices.filter(n => n.category === selectedCategory);
    
    // Then filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((n) =>
        n.title?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.createdBy?.name?.toLowerCase().includes(q) ||
        n.category?.toLowerCase().includes(q)
      );
    }
    
    // Then sort
    filtered.sort((a, b) => {
      if (sort.field === 'date') {
        const d = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort.dir === 'desc' ? d : -d;
      }
      const d = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      return sort.dir === 'desc' ? d : -d;
    });
    
    return filtered;
  }, [allNotices, searchQuery, sort, selectedCategory]);

  const pinned  = processed.filter((n) => n.isPinned);
  const regular = processed.filter((n) => !n.isPinned);

  if (loading && allNotices.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[700]} />

      {/* Header - KEPT EXACTLY THE SAME */}
      <View style={[styles.header, { backgroundColor: colors.primary[700] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>{village?.name || 'Village'}</Text>
          {(village?.district || village?.state) && (
            <Text style={styles.headerSub}>{[village?.district, village?.state].filter(Boolean).join(', ')}</Text>
          )}
        </View>
        <TouchableOpacity onPress={handleScanAnother} style={styles.scanBtn} activeOpacity={0.75}>
          <Text style={styles.scanBtnTxt}>Scan New</Text>
        </TouchableOpacity>
      </View>

      {/* Saved banner */}
      {scannedVillageInfo && (
        <View style={[styles.banner, { backgroundColor: '#E8F5E9', borderBottomColor: '#C8E6C9' }]}>
          <View style={[styles.bannerDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={[styles.bannerTxt, { color: '#1B5E20' }]}>Village saved to your device</Text>
        </View>
      )}

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} colors={colors} />

      {/* Category chips */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            const accent = c.id !== 'all' ? getCategoryStyles(c.id, colors).accent : colors.primary[600];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleCategoryChange(c.id)}
                style={[
                  styles.chip, 
                  { 
                    borderColor: colors.border, 
                    backgroundColor: colors.background,
                  },
                  active && { backgroundColor: accent, borderColor: accent }
                ]}
                activeOpacity={0.72}
              >
                <Text style={[
                  styles.chipTxt, 
                  { color: colors.text.secondary },
                  active && styles.chipTxtActive
                ]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count + Sort row */}
      <View style={[styles.controlRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.countTxt, { color: colors.text.secondary }]} numberOfLines={1}>
          <Text style={[styles.countNum, { color: colors.text.primary }]}>{processed.length}</Text>
          {' '}{processed.length !== 1 ? 'notices' : 'notice'}
          {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : selectedCategory !== 'all' ? ` · ${selectedCategory.replace('_', ' ')}` : ''}
        </Text>

        <View style={styles.sortGroup}>
          <Text style={[styles.sortLbl, { color: colors.text.secondary }]}>Sort:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow  = active ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleSort(f)}
                style={[
                  styles.sortBtn, 
                  { 
                    borderColor: colors.border, 
                    backgroundColor: colors.background 
                  },
                  active && [styles.sortBtnActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
                ]}
                activeOpacity={0.72}
              >
                <Text style={[
                  styles.sortBtnTxt, 
                  { color: colors.text.secondary },
                  active && [styles.sortBtnTxtActive, { color: '#fff' }]
                ]}>
                  {f === 'date' ? 'Date' : 'Priority'}{arrow}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      {processed.length === 0 ? (
        <EmptyState query={searchQuery} category={selectedCategory} colors={colors} />
      ) : (
        <FlatList
          data={regular}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <NoticeCard
              item={item} index={index} query={searchQuery} colors={colors}
              onPress={() => router.push(`/notice/${item._id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
          ListHeaderComponent={
            !searchQuery.trim()
              ? <PinnedStrip notices={pinned} onPress={(id) => router.push(`/notice/${id}`)} colors={colors} />
              : null
          }
          ListFooterComponent={
            totalPages > 1 && !searchQuery.trim() ? (
              <View style={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={p} onPress={() => setPage(p)}
                    style={[
                      styles.pageBtn, 
                      { 
                        borderColor: colors.border, 
                        backgroundColor: colors.surface 
                      },
                      page === p && [styles.pageBtnActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      styles.pageBtnTxt, 
                      { color: colors.text.primary },
                      page === p && [styles.pageBtnTxtActive, { color: '#fff' }]
                    ]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, gap: 10,
  },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 22, lineHeight: 26 },
  headerMid:  { flex: 1 },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2, fontWeight: '500' },
  scanBtn:    { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  scanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  banner:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, gap: 8 },
  bannerDot: { width: 7, height: 7, borderRadius: 4 },
  bannerTxt: { fontSize: 12, fontWeight: '600' },

  searchWrap:  { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon:  { fontSize: 18, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  searchClear: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchClearText: { fontSize: 10, fontWeight: '700' },

  filterBar:    { borderBottomWidth: 1 },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 7 },
  chip:         { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipTxt:      { fontSize: 12, fontWeight: '600' },
  chipTxtActive:{ color: '#fff' },

  controlRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, gap: 8,
  },
  countTxt: { fontSize: 12, fontWeight: '500', flex: 1 },
  countNum: { fontSize: 12, fontWeight: '700' },

  sortGroup:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLbl:        { fontSize: 11, fontWeight: '600' },
  sortBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  sortBtnActive:  {},
  sortBtnTxt:     { fontSize: 11, fontWeight: '700' },
  sortBtnTxtActive:{},

  highlight: { borderRadius: 2 },

  pinnedStrip:  { paddingTop: 14, paddingBottom: 4, borderBottomWidth: 1, marginBottom: 4 },
  pinnedLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  pinnedScroll: { paddingHorizontal: 16, gap: 10 },
  pinnedCard:   { width: 176, padding: 12, borderRadius: 12, borderWidth: 1, borderLeftWidth: 3 },
  pinnedCat:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 5 },
  pinnedTitle:  { fontSize: 13, fontWeight: '600', lineHeight: 18 },

  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32, gap: 10 },
  card:        { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  cardPinned:  {},
  cardStrip:   { width: 4 },
  cardBody:    { flex: 1, padding: 13, gap: 6 },

  pillRow:  { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  pillTxt:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  priPill:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, gap: 4 },
  priDot:   { width: 5, height: 5, borderRadius: 3 },

  pinnedBadge:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: '#FFF8E1' },
  pinnedBadgeTxt:{ fontSize: 9, fontWeight: '800', color: '#E65100', letterSpacing: 0.5 },

  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21, letterSpacing: -0.2 },
  cardDesc:  { fontSize: 12, lineHeight: 18 },

  fileChip:        { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 5, maxWidth: '80%' },
  fileChipIcon:    { width: 16, height: 16, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  fileChipIconText:{ color: '#fff', fontSize: 10, fontWeight: '700' },
  fileChipText:    { fontSize: 11, fontWeight: '500', flex: 1 },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1 },
  cardFooterL: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardFooterR: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar:      { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:   { fontSize: 10, fontWeight: '700' },
  metaTxt:     { fontSize: 11, fontWeight: '500' },
  metaDot:     { width: 3, height: 3, borderRadius: 2 },

  chevronWrap: { width: 30, justifyContent: 'center', alignItems: 'center' },
  chevron:     { fontSize: 22 },

  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph:  { fontSize: 28 },
  emptyTitle:  { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  emptyDesc:   { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  pagination:      { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 20 },
  pageBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pageBtnActive:   {},
  pageBtnTxt:      { fontSize: 13, fontWeight: '600' },
  pageBtnTxtActive:{},
});