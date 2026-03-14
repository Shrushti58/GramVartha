/**
 * QR Notices Screen — Search + Sort (date / priority)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
  Animated, StatusBar, TextInput, Keyboard,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { apiService } from '../../services/api';
import { formatDate, formatViews } from '../../utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'date' | 'priority';
type SortDir   = 'asc'  | 'desc';
interface SortState { field: SortField; dir: SortDir }

// ─── Constants ────────────────────────────────────────────────────────────────
const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

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

const CAT: Record<string, { accent: string; bg: string; fg: string }> = {
  urgent:        { accent: '#C0392B', bg: '#FEE9E7', fg: '#922B21' },
  development:   { accent: Colors.primary[600], bg: `${Colors.primary[500]}14`, fg: Colors.primary[700] },
  health:        { accent: '#1976D2', bg: '#E3F2FD', fg: '#0D47A1' },
  education:     { accent: '#7B1FA2', bg: '#F3E5F5', fg: '#4A148C' },
  agriculture:   { accent: '#2E7D32', bg: '#E8F5E9', fg: '#1B5E20' },
  employment:    { accent: '#00838F', bg: '#E0F7FA', fg: '#006064' },
  social_welfare:{ accent: '#AD1457', bg: '#FCE4EC', fg: '#880E4F' },
  tax_billing:   { accent: '#E65100', bg: '#FBE9E7', fg: '#BF360C' },
  election:      { accent: '#283593', bg: '#E8EAF6', fg: '#1A237E' },
  general:       { accent: '#546E7A', bg: '#ECEFF1', fg: '#37474F' },
};
const getCat = (c: string) => CAT[c] || CAT.general;

const PRIORITY_CFG: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High'   },
  medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium' },
  low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low'    },
};
const getPri = (p: string) => PRIORITY_CFG[p] || PRIORITY_CFG.low;

// ─── Highlighted text ─────────────────────────────────────────────────────────
const HText = ({ text = '', query, style, lines }: { text: string; query: string; style: any; lines?: number }) => {
  if (!query.trim()) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts   = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style} numberOfLines={lines}>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={styles.highlight}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, onClear }: { value: string; onChange: (t: string) => void; onClear: () => void }) => (
  <View style={styles.searchWrap}>
    <View style={styles.searchInner}>
      <Text style={styles.searchIcon}>⌕</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by title, description, author…"
        placeholderTextColor={Colors.textSecondary}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.searchClearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── File chip ────────────────────────────────────────────────────────────────
const FileChip = ({ fileName }: { fileName: string }) => (
  <View style={styles.fileChip}>
    <View style={styles.fileChipIcon}><Text style={styles.fileChipIconText}>↓</Text></View>
    <Text style={styles.fileChipText} numberOfLines={1}>{fileName}</Text>
  </View>
);

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ item, onPress, index, query }: { item: any; onPress: () => void; index: number; query: string }) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 260, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 240, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = getCat(item.category);
  const pri = getPri(item.priority);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity style={[styles.card, item.isPinned && styles.cardPinned]} onPress={onPress} activeOpacity={0.74}>
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

          <HText text={item.title}       query={query} style={styles.cardTitle} lines={2} />
          <HText text={item.description} query={query} style={styles.cardDesc}  lines={2} />

          {item.fileUrl && <FileChip fileName={item.fileName || 'Attachment'} />}

          <View style={styles.cardFooter}>
            <View style={styles.cardFooterL}>
              <View style={[styles.avatar, { backgroundColor: `${cat.accent}22` }]}>
                <Text style={[styles.avatarTxt, { color: cat.accent }]}>
                  {(item.createdBy?.name || 'O')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.metaTxt} numberOfLines={1}>{item.createdBy?.name || 'Official'}</Text>
            </View>
            <View style={styles.cardFooterR}>
              <Text style={styles.metaTxt}>{formatDate(item.createdAt)}</Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaTxt}>{formatViews(item.views || 0)} views</Text>
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
const PinnedStrip = ({ notices, onPress }: { notices: any[]; onPress: (id: string) => void }) => {
  if (!notices.length) return null;
  return (
    <View style={styles.pinnedStrip}>
      <Text style={styles.pinnedLabel}>PINNED</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedScroll}>
        {notices.map((n) => {
          const cat = getCat(n.category);
          return (
            <TouchableOpacity key={n._id} style={[styles.pinnedCard, { borderLeftColor: cat.accent }]} onPress={() => onPress(n._id)} activeOpacity={0.75}>
              <Text style={[styles.pinnedCat, { color: cat.fg }]}>{n.category?.replace('_', ' ').toUpperCase()}</Text>
              <Text numberOfLines={2} style={styles.pinnedTitle}>{n.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, category }: { query: string; category: string }) => (
  <View style={styles.emptyWrap}>
    <View style={styles.emptyCircle}>
      <Text style={styles.emptyGlyph}>{query ? '⌕' : '○'}</Text>
    </View>
    <Text style={styles.emptyTitle}>{query ? 'No results found' : 'No notices found'}</Text>
    <Text style={styles.emptyDesc}>
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

  useEffect(() => { loadScannedVillageInfo(); fetchNotices(); }, [villageId, selectedCategory, page]);
  useEffect(() => { setSearchQuery(''); }, [selectedCategory]);

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
    router.replace('qr-scanner' as any);
  };

  const handleCategoryChange = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(id); setPage(1);
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
  const processed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = q
      ? allNotices.filter((n) =>
          n.title?.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.createdBy?.name?.toLowerCase().includes(q) ||
          n.category?.toLowerCase().includes(q)
        )
      : [...allNotices];

    list.sort((a, b) => {
      if (sort.field === 'date') {
        const d = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return sort.dir === 'desc' ? d : -d;
      }
      const d = (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
      return sort.dir === 'desc' ? d : -d;
    });

    return list;
  }, [allNotices, searchQuery, sort]);

  const pinned  = processed.filter((n) => n.isPinned);
  const regular = processed.filter((n) => !n.isPinned);

  if (loading && allNotices.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={styles.loadingText}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[700]} />

      {/* Header */}
      <View style={styles.header}>
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
        <View style={styles.banner}>
          <View style={styles.bannerDot} />
          <Text style={styles.bannerTxt}>Village saved to your device</Text>
        </View>
      )}

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />

      {/* Category chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            const accent = c.id !== 'all' ? getCat(c.id).accent : Colors.primary[600];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleCategoryChange(c.id)}
                style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
                activeOpacity={0.72}
              >
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count + Sort row */}
      <View style={styles.controlRow}>
        {/* Count */}
        <Text style={styles.countTxt} numberOfLines={1}>
          <Text style={styles.countNum}>{processed.length}</Text>
          {' '}{processed.length !== 1 ? 'notices' : 'notice'}
          {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : selectedCategory !== 'all' ? ` · ${selectedCategory.replace('_', ' ')}` : ''}
        </Text>

        {/* Sort buttons */}
        <View style={styles.sortGroup}>
          <Text style={styles.sortLbl}>Sort:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow  = active ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleSort(f)}
                style={[styles.sortBtn, active && styles.sortBtnActive]}
                activeOpacity={0.72}
              >
                <Text style={[styles.sortBtnTxt, active && styles.sortBtnTxtActive]}>
                  {f === 'date' ? 'Date' : 'Priority'}{arrow}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* List */}
      {processed.length === 0 ? (
        <EmptyState query={searchQuery} category={selectedCategory} />
      ) : (
        <FlatList
          data={regular}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <NoticeCard
              item={item} index={index} query={searchQuery}
              onPress={() => router.push(`notice/${item._id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary[600]} />}
          ListHeaderComponent={
            !searchQuery.trim()
              ? <PinnedStrip notices={pinned} onPress={(id) => router.push(`notice/${id}` as any)} />
              : null
          }
          ListFooterComponent={
            totalPages > 1 && !searchQuery.trim() ? (
              <View style={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={p} onPress={() => setPage(p)}
                    style={[styles.pageBtn, page === p && styles.pageBtnActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.pageBtnTxt, page === p && styles.pageBtnTxtActive]}>{p}</Text>
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
  root: { flex: 1, backgroundColor: Colors.background },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 14 },
  loadingText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },

  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary[700],
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, gap: 10,
  },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 22, lineHeight: 26 },
  headerMid:  { flex: 1 },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2, fontWeight: '500' },
  scanBtn:    { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  scanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  banner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#C8E6C9', gap: 8 },
  bannerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E7D32' },
  bannerTxt: { fontSize: 12, color: '#1B5E20', fontWeight: '600' },

  // Search
  searchWrap:  { backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon:  { fontSize: 18, color: Colors.textSecondary, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500', paddingVertical: 0 },
  searchClear: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  searchClearText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },

  // Filter
  filterBar:    { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 7 },
  chip:         { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  chipTxt:      { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  chipTxtActive:{ color: '#fff' },

  // Control row
  controlRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8,
  },
  countTxt: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  countNum: { fontSize: 12, color: Colors.textPrimary, fontWeight: '700' },

  // Sort
  sortGroup:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLbl:        { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  sortBtn:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  sortBtnActive:  { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  sortBtnTxt:     { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  sortBtnTxtActive:{ color: '#fff' },

  // Highlight
  highlight: { backgroundColor: '#FFF176', color: '#222', borderRadius: 2 },

  // Pinned strip
  pinnedStrip:  { paddingTop: 14, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 4 },
  pinnedLabel:  { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1, paddingHorizontal: 16, marginBottom: 10 },
  pinnedScroll: { paddingHorizontal: 16, gap: 10 },
  pinnedCard:   { width: 176, padding: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3 },
  pinnedCat:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 5 },
  pinnedTitle:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },

  // Cards
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32, gap: 10 },
  card:        { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardPinned:  { borderColor: `${Colors.primary[400]}55` },
  cardStrip:   { width: 4 },
  cardBody:    { flex: 1, padding: 13, gap: 6 },

  pillRow:  { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  pillTxt:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  priPill:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, gap: 4 },
  priDot:   { width: 5, height: 5, borderRadius: 3 },

  pinnedBadge:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: '#FFF8E1' },
  pinnedBadgeTxt:{ fontSize: 9, fontWeight: '800', color: '#E65100', letterSpacing: 0.5 },

  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 21, letterSpacing: -0.2 },
  cardDesc:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  fileChip:        { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: Colors.background, borderRadius: 6, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 4, gap: 5, maxWidth: '80%' },
  fileChipIcon:    { width: 16, height: 16, borderRadius: 4, backgroundColor: Colors.primary[600], justifyContent: 'center', alignItems: 'center' },
  fileChipIconText:{ color: '#fff', fontSize: 10, fontWeight: '700' },
  fileChipText:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', flex: 1 },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  cardFooterL: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  cardFooterR: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar:      { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  avatarTxt:   { fontSize: 10, fontWeight: '700' },
  metaTxt:     { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaDot:     { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },

  chevronWrap: { width: 30, justifyContent: 'center', alignItems: 'center' },
  chevron:     { fontSize: 22 },

  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary[500]}12`, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph:  { fontSize: 28, color: Colors.primary[500] },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  emptyDesc:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  pagination:      { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 20 },
  pageBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  pageBtnActive:   { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  pageBtnTxt:      { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  pageBtnTxtActive:{ color: '#fff' },
});