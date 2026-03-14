/**
 * QR Notices Screen
 * Improved cards · Search · Sort by date / priority
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

// ─── Data maps ────────────────────────────────────────────────────────────────
const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const CAT_MAP: Record<string, { accent: string; bg: string; fg: string }> = {
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
const getCat = (c: string) => CAT_MAP[c] || CAT_MAP.general;

const PRI_MAP: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High'   },
  medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium' },
  low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low'    },
};
const getPri = (p: string) => PRI_MAP[p] || PRI_MAP.low;

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

// ─── HText — inline search highlight ─────────────────────────────────────────
const HText = ({
  text = '',
  query,
  style,
  lines,
}: {
  text: string;
  query: string;
  style: any;
  lines?: number;
}) => {
  if (!query.trim()) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const esc   = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${esc})`, 'gi'));
  return (
    <Text style={style} numberOfLines={lines}>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={S.highlight}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── File attachment row ──────────────────────────────────────────────────────
const FileRow = ({ fileName }: { fileName: string }) => {
  const ext = fileName.split('.').pop()?.toUpperCase() || 'FILE';
  return (
    <View style={S.fileRow}>
      <View style={S.fileIcon}>
        <Text style={S.fileIconTxt}>↓</Text>
      </View>
      <Text style={S.fileName} numberOfLines={1}>{fileName}</Text>
      <Text style={S.fileExt}>{ext}</Text>
    </View>
  );
};

// ─── Notice Card ──────────────────────────────────────────────────────────────
const NoticeCard = ({
  item,
  onPress,
  index,
  query = '',
}: {
  item: any;
  onPress: () => void;
  index: number;
  query?: string;
}) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 300, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, delay: index * 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = getCat(item.category);
  const pri = getPri(item.priority);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        style={[S.card, item.isPinned && { borderColor: `${cat.accent}44` }]}
        onPress={onPress}
        activeOpacity={0.76}
      >
        {/* Top accent bar */}
        <View style={[S.accentBar, { backgroundColor: cat.accent }]} />

        {/* Body */}
        <View style={S.cardBody}>

          {/* Pills */}
          <View style={S.pillRow}>
            <View style={[S.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={[S.catBadgeTxt, { color: cat.fg }]}>
                {item.category?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <View style={[S.priBadge, { backgroundColor: pri.bg }]}>
              <View style={[S.priDot, { backgroundColor: pri.dot }]} />
              <Text style={[S.priBadgeTxt, { color: pri.fg }]}>{pri.label}</Text>
            </View>

            {item.isPinned && (
              <View style={S.pinnedBadge}>
                <Text style={S.pinnedBadgeTxt}>PINNED</Text>
              </View>
            )}

            {item.status && item.status !== 'published' && (
              <View style={S.draftBadge}>
                <Text style={S.draftBadgeTxt}>{item.status.toUpperCase()}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <HText text={item.title} query={query} style={S.cardTitle} lines={2} />

          {/* Description */}
          <HText text={item.description} query={query} style={S.cardDesc} lines={2} />

          {/* File */}
          {item.fileUrl && <FileRow fileName={item.fileName || 'Attachment'} />}
        </View>

        {/* Footer tray */}
        <View style={S.cardFooter}>
          <View style={S.footerLeft}>
            <View style={[S.avatar, { backgroundColor: `${cat.accent}20` }]}>
              <Text style={[S.avatarTxt, { color: cat.accent }]}>
                {(item.createdBy?.name || 'O')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={S.authorName} numberOfLines={1}>
              {item.createdBy?.name || 'Official'}
            </Text>
          </View>
          <View style={S.footerRight}>
            <Text style={S.metaTxt}>{formatDate(item.createdAt)}</Text>
            <View style={S.metaSep} />
            <Text style={S.metaTxt}>{formatViews(item.views || 0)} views</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pinned strip ─────────────────────────────────────────────────────────────
const PinnedStrip = ({
  notices,
  onPress,
}: {
  notices: any[];
  onPress: (id: string) => void;
}) => {
  if (!notices.length) return null;
  return (
    <View style={S.pinnedStrip}>
      <Text style={S.pinnedStripLbl}>PINNED</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.pinnedScroll}
      >
        {notices.map((n) => {
          const cat = getCat(n.category);
          return (
            <TouchableOpacity
              key={n._id}
              style={[S.pinnedCard, { borderTopColor: cat.accent }]}
              onPress={() => onPress(n._id)}
              activeOpacity={0.75}
            >
              <View style={[S.pinnedCatDot, { backgroundColor: cat.accent }]} />
              <Text style={[S.pinnedCatTxt, { color: cat.fg }]}>
                {n.category?.replace('_', ' ').toUpperCase()}
              </Text>
              <Text numberOfLines={2} style={S.pinnedCardTitle}>{n.title}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, category }: { query: string; category: string }) => (
  <View style={S.emptyWrap}>
    <View style={S.emptyCircle}>
      <Text style={S.emptyGlyph}>{query ? '⌕' : '○'}</Text>
    </View>
    <Text style={S.emptyTitle}>{query ? 'No results found' : 'No notices found'}</Text>
    <Text style={S.emptyDesc}>
      {query
        ? `Nothing matched "${query}". Try different keywords.`
        : category === 'all'
          ? 'This village has no published notices yet.'
          : 'No notices in this category.'}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function QRNoticesScreen() {
  const params    = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId)
    ? params.villageId[0]
    : (params.villageId || '');

  const [allNotices,         setAllNotices]         = useState<any[]>([]);
  const [village,            setVillage]            = useState<any>(null);
  const [loading,            setLoading]            = useState(true);
  const [refreshing,         setRefreshing]         = useState(false);
  const [selectedCategory,   setSelectedCategory]   = useState('all');
  const [page,               setPage]               = useState(1);
  const [totalPages,         setTotalPages]         = useState(1);
  const [scannedVillageInfo, setScannedVillageInfo] = useState<any>(null);
  const [searchQuery,        setSearchQuery]        = useState('');
  const [sort,               setSort]               = useState<SortState>({ field: 'date', dir: 'desc' });

  useEffect(() => {
    loadScannedVillageInfo();
    fetchNotices();
  }, [villageId, selectedCategory, page]);

  useEffect(() => { setSearchQuery(''); }, [selectedCategory]);

  const loadScannedVillageInfo = async () => {
    try {
      const raw = await AsyncStorage.getItem('scannedVillage');
      if (raw) setScannedVillageInfo(JSON.parse(raw));
    } catch {}
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const r = await apiService.getNoticesByVillage(villageId, page, 10);
      setAllNotices(r.notices);
      setVillage(r.village);
      setTotalPages(r.totalPages);
    } catch {
      Alert.alert('Error', 'Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  const handleScanAnother = async () => {
    await AsyncStorage.removeItem('scannedVillage');
    router.replace('qr-scanner' as any);
  };

  const handleCategoryChange = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategory(id);
    setPage(1);
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

  const pinned  = processed.filter((n) =>  n.isPinned);
  const regular = processed.filter((n) => !n.isPinned);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && allNotices.length === 0) {
    return (
      <View style={S.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary[600]} />
        <Text style={S.loadingTxt}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[700]} />

      {/* ── Header ── */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn} activeOpacity={0.7}>
          <Text style={S.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={S.headerMid}>
          <Text style={S.headerTitle} numberOfLines={1}>
            {village?.name || 'Village'}
          </Text>
          {(village?.district || village?.state) && (
            <Text style={S.headerSub}>
              {[village?.district, village?.state].filter(Boolean).join(', ')}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleScanAnother} style={S.scanBtn} activeOpacity={0.75}>
          <Text style={S.scanBtnTxt}>Scan New</Text>
        </TouchableOpacity>
      </View>

      {/* ── Saved banner ── */}
      {scannedVillageInfo && (
        <View style={S.banner}>
          <View style={S.bannerDot} />
          <Text style={S.bannerTxt}>Village saved to your device</Text>
        </View>
      )}

      {/* ── Search ── */}
      <View style={S.searchWrap}>
        <View style={S.searchInner}>
          <Text style={S.searchIcon}>⌕</Text>
          <TextInput
            style={S.searchInput}
            placeholder="Search by title, description, author…"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={S.searchClear}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={S.searchClearTxt}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category chips ── */}
      <View style={S.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.filterScroll}
        >
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            const accent = c.id !== 'all' ? getCat(c.id).accent : Colors.primary[600];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleCategoryChange(c.id)}
                style={[S.chip, active && { backgroundColor: accent, borderColor: accent }]}
                activeOpacity={0.72}
              >
                <Text style={[S.chipTxt, active && S.chipTxtActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Count + sort row ── */}
      <View style={S.controlRow}>
        <Text style={S.countTxt} numberOfLines={1}>
          <Text style={S.countNum}>{processed.length}</Text>
          {' '}{processed.length !== 1 ? 'notices' : 'notice'}
          {searchQuery.trim()
            ? ` · "${searchQuery.trim()}"`
            : selectedCategory !== 'all'
              ? ` · ${selectedCategory.replace('_', ' ')}`
              : ''}
        </Text>

        <View style={S.sortGroup}>
          <Text style={S.sortLbl}>Sort:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow  = active ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleSort(f)}
                style={[S.sortBtn, active && S.sortBtnActive]}
                activeOpacity={0.72}
              >
                <Text style={[S.sortBtnTxt, active && S.sortBtnTxtActive]}>
                  {f === 'date' ? 'Date' : 'Priority'}{arrow}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── List ── */}
      {processed.length === 0 ? (
        <EmptyState query={searchQuery} category={selectedCategory} />
      ) : (
        <FlatList
          data={regular}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <NoticeCard
              item={item}
              index={index}
              query={searchQuery}
              onPress={() => router.push(`notice/${item._id}` as any)}
            />
          )}
          contentContainerStyle={S.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary[600]}
            />
          }
          ListHeaderComponent={
            !searchQuery.trim()
              ? <PinnedStrip notices={pinned} onPress={(id) => router.push(`notice/${id}` as any)} />
              : null
          }
          ListFooterComponent={
            totalPages > 1 && !searchQuery.trim() ? (
              <View style={S.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPage(p)}
                    style={[S.pageBtn, page === p && S.pageBtnActive]}
                    activeOpacity={0.75}
                  >
                    <Text style={[S.pageBtnTxt, page === p && S.pageBtnTxtActive]}>{p}</Text>
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
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 14 },
  loadingTxt:  { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary[700],
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, gap: 10,
  },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 22, lineHeight: 26 },
  headerMid:  { flex: 1 },
  headerTitle:{ fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSub:  { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2, fontWeight: '500' },
  scanBtn:    { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  scanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  // Banner
  banner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#C8E6C9', gap: 8 },
  bannerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E7D32' },
  bannerTxt: { fontSize: 12, color: '#1B5E20', fontWeight: '600' },

  // Search
  searchWrap:     { backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon:     { fontSize: 18, color: Colors.textSecondary, lineHeight: 22 },
  searchInput:    { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500', paddingVertical: 0 },
  searchClear:    { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  searchClearTxt: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },

  // Category chips
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
  sortGroup:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLbl:         { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  sortBtn:         { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  sortBtnActive:   { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  sortBtnTxt:      { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  sortBtnTxtActive:{ color: '#fff' },

  // Notice cards
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 10 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accentBar: { height: 3, width: '100%' },
  cardBody:  { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 7 },

  // Pill badges
  pillRow:      { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  catBadge:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  catBadgeTxt:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  priBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 5 },
  priDot:       { width: 6, height: 6, borderRadius: 3 },
  priBadgeTxt:  { fontSize: 10, fontWeight: '700' },
  pinnedBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FFF3E0' },
  pinnedBadgeTxt:{ fontSize: 10, fontWeight: '800', color: '#E65100', letterSpacing: 0.4 },
  draftBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#ECEFF1' },
  draftBadgeTxt:{ fontSize: 10, fontWeight: '700', color: '#546E7A', letterSpacing: 0.4 },

  // Card content
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 21, letterSpacing: -0.3 },
  cardDesc:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // File row
  fileRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 7, gap: 7, marginTop: 2, marginBottom: 4 },
  fileIcon:    { width: 20, height: 20, borderRadius: 5, backgroundColor: Colors.primary[600], justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  fileIconTxt: { color: '#fff', fontSize: 11, fontWeight: '700', lineHeight: 14 },
  fileName:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500', flex: 1 },
  fileExt:     { fontSize: 10, fontWeight: '700', color: Colors.primary[600], letterSpacing: 0.3 },

  // Card footer tray
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.background, marginTop: 8 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  footerRight:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar:     { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTxt:  { fontSize: 10, fontWeight: '800' },
  authorName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', flex: 1 },
  metaTxt:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaSep:    { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },

  // Search highlight
  highlight: { backgroundColor: '#FFF176', color: '#222', borderRadius: 2 },

  // Pinned strip
  pinnedStrip:   { paddingTop: 14, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 4 },
  pinnedStripLbl:{ fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2, paddingHorizontal: 16, marginBottom: 10 },
  pinnedScroll:  { paddingHorizontal: 16, gap: 10 },
  pinnedCard:    { width: 180, padding: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 3, gap: 5 },
  pinnedCatDot:  { width: 6, height: 6, borderRadius: 3 },
  pinnedCatTxt:  { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  pinnedCardTitle:{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },

  // Empty state
  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary[500]}12`, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph:  { fontSize: 28, color: Colors.primary[500] },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  emptyDesc:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Pagination
  pagination:      { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 20 },
  pageBtn:         { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  pageBtnActive:   { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  pageBtnTxt:      { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  pageBtnTxtActive:{ color: '#fff' },
});