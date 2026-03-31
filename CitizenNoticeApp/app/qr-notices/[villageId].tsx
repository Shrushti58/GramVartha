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
import { LinearGradient } from 'expo-linear-gradient';

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
    urgent:        { accent: '#E74C3C', bg: '#FEE9E7', fg: '#C0392B', icon: '⚠️' },
    development:   { accent: colors.primary[600], bg: `${colors.primary[500]}12`, fg: colors.primary[700], icon: '🏗️' },
    health:        { accent: '#3498DB', bg: '#E3F2FD', fg: '#1565C0', icon: '🏥' },
    education:     { accent: '#9B59B6', bg: '#F3E5F5', fg: '#6A1B9A', icon: '📚' },
    agriculture:   { accent: '#27AE60', bg: '#E8F5E9', fg: '#1B5E20', icon: '🌾' },
    employment:    { accent: '#00ACC1', bg: '#E0F7FA', fg: '#006064', icon: '💼' },
    social_welfare:{ accent: '#E91E63', bg: '#FCE4EC', fg: '#880E4F', icon: '🤝' },
    tax_billing:   { accent: '#F39C12', bg: '#FEF9E7', fg: '#D35400', icon: '💰' },
    election:      { accent: '#2C3E50', bg: '#ECF0F1', fg: '#2C3E50', icon: '🗳️' },
    general:       { accent: '#7F8C8D', bg: '#F5F5F5', fg: '#546E7A', icon: '📢' },
  };
  return catStyles[category] || catStyles.general;
};

const getPriorityStyles = (priority: string) => {
  const priStyles: Record<string, any> = {
    high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High', icon: '🔴' },
    medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium', icon: '🟡' },
    low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low', icon: '🔵' },
  };
  return priStyles[priority] || priStyles.low;
};

const CATEGORIES = [
  { id: 'all',           label: 'All',           icon: '✨' },
  { id: 'urgent',        label: 'Urgent',        icon: '⚠️' },
  { id: 'development',   label: 'Development',   icon: '🏗️' },
  { id: 'health',        label: 'Health',        icon: '🏥' },
  { id: 'education',     label: 'Education',     icon: '📚' },
  { id: 'agriculture',   label: 'Agriculture',   icon: '🌾' },
  { id: 'employment',    label: 'Employment',    icon: '💼' },
  { id: 'social_welfare',label: 'Welfare',       icon: '🤝' },
  { id: 'tax_billing',   label: 'Tax & Billing', icon: '💰' },
  { id: 'election',      label: 'Election',      icon: '🗳️' },
  { id: 'general',       label: 'General',       icon: '📢' },
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
          ? <Text key={i} style={[styles.highlight, { backgroundColor: '#FFE082', color: '#3E2723' }]}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, onClear, colors }: { value: string; onChange: (t: string) => void; onClear: () => void; colors: any }) => (
  <Animated.View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
    <View style={[styles.searchInner, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.searchIcon, { color: colors.text.secondary }]}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text.primary }]}
        placeholder="Search notices..."
        placeholderTextColor={colors.text.secondary + '80'}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={[styles.searchClearInner, { backgroundColor: colors.border }]}>
            <Text style={[styles.searchClearText, { color: colors.text.secondary }]}>✕</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </Animated.View>
);

// ─── File chip ────────────────────────────────────────────────────────────────
const FileChip = ({ fileName, colors }: { fileName: string; colors: any }) => (
  <View style={[styles.fileChip, { backgroundColor: `${colors.primary[500]}08`, borderColor: colors.border }]}>
    <View style={[styles.fileChipIcon, { backgroundColor: colors.primary[600] }]}>
      <Text style={styles.fileChipIconText}>📎</Text>
    </View>
    <Text style={[styles.fileChipText, { color: colors.text.secondary }]} numberOfLines={1}>{fileName}</Text>
  </View>
);

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ item, onPress, index, query, colors }: { item: any; onPress: () => void; index: number; query: string; colors: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, delay: index * 50, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = getCategoryStyles(item.category, colors);
  const pri = getPriorityStyles(item.priority);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          item.isPinned && [styles.cardPinned, { borderColor: colors.primary[400], shadowColor: colors.primary[400] }]
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={[styles.cardStrip, { backgroundColor: cat.accent }]} />
        <View style={styles.cardBody}>

          {/* Header Row - Category & Priority */}
          <View style={styles.cardHeaderRow}>
            <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryText, { color: cat.fg }]}>{item.category?.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: pri.bg }]}>
              <Text style={styles.priorityIcon}>{pri.icon}</Text>
              <Text style={[styles.priorityText, { color: pri.fg }]}>{pri.label}</Text>
            </View>
            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedIcon}>📌</Text>
                <Text style={styles.pinnedText}>PINNED</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <HText
            text={item.title}
            query={query}
            style={[styles.cardTitle, { color: colors.text.primary }]}
            lines={2}
            colors={colors}
          />

          {/* Description */}
          <HText
            text={item.description}
            query={query}
            style={[styles.cardDesc, { color: colors.text.secondary + 'CC' }]}
            lines={2}
            colors={colors}
          />

          {/* Attachment */}
          {item.fileUrl && <FileChip fileName={item.fileName || 'Attachment'} colors={colors} />}

          {/* Footer */}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.authorSection}>
              <View style={[styles.authorAvatar, { backgroundColor: `${cat.accent}15` }]}>
                <Text style={[styles.authorInitial, { color: cat.accent }]}>
                  {(item.createdBy?.name || 'O')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.authorName, { color: colors.text.secondary }]} numberOfLines={1}>
                {item.createdBy?.name || 'Official'}
              </Text>
            </View>
            <View style={styles.metaSection}>
              <Text style={[styles.metaText, { color: colors.text.secondary + '99' }]}>{formatDate(item.createdAt)}</Text>
              <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
              <Text style={[styles.metaText, { color: colors.text.secondary + '99' }]}>{formatViews(item.views || 0)} views</Text>
            </View>
          </View>
        </View>

        <View style={styles.chevronContainer}>
          <View style={[styles.chevronCircle, { backgroundColor: `${cat.accent}10` }]}>
            <Text style={[styles.chevron, { color: cat.accent }]}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pinned strip ─────────────────────────────────────────────────────────────
const PinnedStrip = ({ notices, onPress, colors }: { notices: any[]; onPress: (id: string) => void; colors: any }) => {
  if (!notices.length) return null;
  return (
    <View style={[styles.pinnedContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.pinnedHeader}>
        <Text style={styles.pinnedHeaderIcon}>📌</Text>
        <Text style={[styles.pinnedHeaderText, { color: colors.text.secondary }]}>PINNED NOTICES</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pinnedScroll}
        decelerationRate="fast"
        snapToInterval={200}
        snapToAlignment="start"
      >
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
                  borderTopColor: cat.accent,
                }
              ]}
              onPress={() => onPress(n._id)}
              activeOpacity={0.8}
            >
              <View style={styles.pinnedCardHeader}>
                <Text style={[styles.pinnedCatIcon, { color: cat.accent }]}>{cat.icon}</Text>
                <Text style={[styles.pinnedCatText, { color: cat.fg }]}>{n.category?.replace('_', ' ')}</Text>
              </View>
              <Text numberOfLines={2} style={[styles.pinnedTitle, { color: colors.text.primary }]}>{n.title}</Text>
              <View style={styles.pinnedFooter}>
                <Text style={[styles.pinnedDate, { color: colors.text.secondary + '99' }]}>{formatDate(n.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, category, colors }: { query: string; category: string; colors: any }) => {
  const getEmptyMessage = () => {
    if (query) return { title: 'No Results Found', desc: `We couldn't find any notices matching "${query}". Try different keywords.`, icon: '🔍' };
    if (category !== 'all') return { title: 'No Notices', desc: `No ${category.replace('_', ' ')} notices available in this village.`, icon: '📭' };
    return { title: 'No Notices Yet', desc: 'This village has no published notices at the moment.', icon: '🏠' };
  };
  const { title, desc, icon } = getEmptyMessage();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary[500]}08` }]}>
        <Text style={[styles.emptyIcon, { color: colors.primary[500] }]}>{icon}</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>{desc}</Text>
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function QRNoticesScreen() {
  const { colors, isDark } = useTheme();
  const params    = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId) ? params.villageId[0] : (params.villageId || '');

  const [allNotices,         setAllNotices]        = useState<any[]>([]);
  const [village,            setVillage]           = useState<any>(null);
  const [loading,            setLoading]           = useState(true);
  const [refreshing,         setRefreshing]        = useState(false);
  const [selectedCategory,   setSelectedCategory]  = useState('all');
  const [page,               setPage]              = useState(1);
  const [totalPages,         setTotalPages]        = useState(1);
  const [scannedVillageInfo, setScannedVillageInfo]= useState<any>(null);
  const [searchQuery,        setSearchQuery]       = useState('');
  const [sort,               setSort]              = useState<SortState>({ field: 'date', dir: 'desc' });

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
    router.replace('/qr-scanner');
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
  const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

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

  // ── Derived header colors (same pattern as complaint.tsx) ─────────────────
  const headerTextColor   = isDark ? colors.primary[100] : '#fff';
  const headerSubColor    = isDark ? colors.primary[200] : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor= isDark ? colors.primary[300] : 'rgba(255,255,255,0.6)';
  const backBtnBg         = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  if (loading && allNotices.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading notices...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? colors.primary[900] : colors.primary[700]} />

      {/* ── Header with Gradient (matches complaint.tsx) ── */}
      <LinearGradient
        colors={isDark
          ? [colors.primary[800], colors.primary[900]]
          : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        {/* Decorative circles */}
        <View style={[styles.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
        <View style={[styles.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />

        {/* Nav row: back + scan */}
        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleScanAnother} style={styles.scanButton} activeOpacity={0.8}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={[styles.scanText, { color: headerTextColor }]}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>VILLAGE NOTICES</Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]} numberOfLines={1}>
            {village?.name ? `${village.name} 📋` : 'Notices 📋'}
          </Text>
          {(village?.district || village?.state) && (
            <View style={styles.headerBreadcrumb}>
              <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
              <Text style={[styles.headerSub, { color: headerSubColor }]}>
                {[village?.district, village?.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Saved banner */}
      {scannedVillageInfo && (
        <Animated.View style={[styles.banner, { backgroundColor: '#E8F5E9', borderBottomColor: '#C8E6C9' }]}>
          <View style={[styles.bannerDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={[styles.bannerText, { color: '#1B5E20' }]}>✓ Village saved to your device</Text>
        </Animated.View>
      )}

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} colors={colors} />

      {/* Category chips */}
      <View style={[styles.categoryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          decelerationRate="fast"
        >
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            const accent = c.id !== 'all' ? getCategoryStyles(c.id, colors).accent : colors.primary[600];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleCategoryChange(c.id)}
                style={[
                  styles.categoryChip,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  },
                  active && { backgroundColor: accent, borderColor: accent }
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryChipIcon}>{c.icon}</Text>
                <Text style={[
                  styles.categoryChipText,
                  { color: colors.text.secondary },
                  active && styles.categoryChipTextActive
                ]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count + Sort row */}
      <View style={[styles.controlBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.countContainer}>
          <Text style={[styles.countNumber, { color: colors.primary[600] }]}>{processed.length}</Text>
          <Text style={[styles.countLabel, { color: colors.text.secondary }]}>
            {processed.length !== 1 ? 'notices' : 'notice'}
          </Text>
          {(searchQuery.trim() || selectedCategory !== 'all') && (
            <View style={[styles.filterChip, { backgroundColor: colors.border }]}>
              <Text style={[styles.filterChipText, { color: colors.text.secondary }]}>
                {searchQuery.trim() ? `"${searchQuery.trim()}"` : selectedCategory.replace('_', ' ')}
              </Text>
            </View>
          )}
        </View>

        {/* Sort buttons */}
        <View style={styles.sortGroup}>
          <Text style={[styles.sortLabel, { color: colors.text.secondary }]}>Sort:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow  = active ? (sort.dir === 'desc' ? '↓' : '↑') : '';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleSort(f)}
                style={[
                  styles.sortButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background
                  },
                  active && [styles.sortButtonActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: colors.text.secondary },
                  active && styles.sortButtonTextActive
                ]}>
                  {f === 'date' ? 'Date' : 'Priority'} {arrow}
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
            totalPages > 1 && !searchQuery.trim() && regular.length > 0 ? (
              <View style={styles.pagination}>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={p} onPress={() => setPage(p)}
                    style={[
                      styles.pageButton,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.surface
                      },
                      page === p && [styles.pageButtonActive, { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }]
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.pageButtonText,
                      { color: colors.text.primary },
                      page === p && styles.pageButtonTextActive
                    ]}>{p}</Text>
                  </TouchableOpacity>
                ))}
                {totalPages > 5 && (
                  <>
                    <Text style={[styles.pageDots, { color: colors.text.secondary }]}>...</Text>
                    <TouchableOpacity
                      onPress={() => setPage(totalPages)}
                      style={[
                        styles.pageButton,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.surface
                        },
                        page === totalPages && [styles.pageButtonActive, { backgroundColor: colors.primary[600] }]
                      ]}
                    >
                      <Text style={[styles.pageButtonText, { color: colors.text.primary }, page === totalPages && styles.pageButtonTextActive]}>{totalPages}</Text>
                    </TouchableOpacity>
                  </>
                )}
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
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  loadingText: { fontSize: 14, fontWeight: '500', letterSpacing: -0.2 },

  // ── Header (complaint-style) ───────────────────────────────────────────────
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
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scanIcon: { fontSize: 14 },
  scanText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10, fontWeight: '800',
    letterSpacing: 2.5, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28, fontWeight: '800',
    letterSpacing: -0.8, lineHeight: 34,
  },
  headerBreadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3 },
  headerSub: { fontSize: 12, fontWeight: '500' },

  // ── Banner ─────────────────────────────────────────────────────────────────
  banner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  bannerDot: { width: 8, height: 8, borderRadius: 4 },
  bannerText: { fontSize: 12, fontWeight: '600' },

  // ── Search ─────────────────────────────────────────────────────────────────
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 48, gap: 10 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 0, letterSpacing: -0.2 },
  searchClear: { padding: 4 },
  searchClearInner: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchClearText: { fontSize: 10, fontWeight: '700' },

  // ── Category ───────────────────────────────────────────────────────────────
  categoryBar: { borderBottomWidth: 1 },
  categoryScroll: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  categoryChipIcon: { fontSize: 13 },
  categoryChipText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.2 },
  categoryChipTextActive: { color: '#fff' },

  // ── Control row ────────────────────────────────────────────────────────────
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  countContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4, flexWrap: 'wrap', flex: 1 },
  countNumber: { fontSize: 15, fontWeight: '800' },
  countLabel: { fontSize: 12, fontWeight: '500' },
  filterChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 6 },
  filterChipText: { fontSize: 10, fontWeight: '600' },

  sortGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  sortButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  sortButtonActive: {},
  sortButtonText: { fontSize: 12, fontWeight: '600' },
  sortButtonTextActive: { color: '#fff' },

  // ── Highlight ──────────────────────────────────────────────────────────────
  highlight: { borderRadius: 3, fontWeight: '600' },

  // ── Pinned strip ───────────────────────────────────────────────────────────
  pinnedContainer: { paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, marginBottom: 4 },
  pinnedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 12 },
  pinnedHeaderIcon: { fontSize: 12 },
  pinnedHeaderText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  pinnedScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  pinnedCard: {
    width: SCREEN_WIDTH * 0.55,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderTopWidth: 3,
    gap: 8,
  },
  pinnedCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedCatIcon: { fontSize: 12 },
  pinnedCatText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  pinnedTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19, letterSpacing: -0.2 },
  pinnedFooter: { marginTop: 4 },
  pinnedDate: { fontSize: 10, fontWeight: '500' },

  // ── Cards ──────────────────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardPinned: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, borderLeftWidth: 0 },
  cardStrip: { width: 5 },
  cardBody: { flex: 1, padding: 16, gap: 8 },

  cardHeaderRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 2 },
  categoryPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  categoryIcon: { fontSize: 10 },
  categoryText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityIcon: { fontSize: 9 },
  priorityText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#FFF8E1' },
  pinnedIcon: { fontSize: 9 },
  pinnedText: { fontSize: 9, fontWeight: '800', color: '#E65100', letterSpacing: 0.4 },

  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22, letterSpacing: -0.3 },
  cardDesc: { fontSize: 13, lineHeight: 19, letterSpacing: -0.2 },

  fileChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, gap: 7, maxWidth: '75%' },
  fileChipIcon: { width: 18, height: 18, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  fileChipIconText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fileChipText: { fontSize: 11, fontWeight: '500', flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 10, borderTopWidth: 1 },
  authorSection: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  authorAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  authorInitial: { fontSize: 11, fontWeight: '700' },
  authorName: { fontSize: 11, fontWeight: '600', flex: 1 },
  metaSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 10, fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 2 },

  chevronContainer: { width: 44, justifyContent: 'center', alignItems: 'center' },
  chevronCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  chevron: { fontSize: 20, fontWeight: '400', marginTop: -2 },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 21, opacity: 0.7 },

  // ── Pagination ─────────────────────────────────────────────────────────────
  pagination: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 24 },
  pageButton: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pageButtonActive: {},
  pageButtonText: { fontSize: 14, fontWeight: '600' },
  pageButtonTextActive: { color: '#fff' },
  pageDots: { fontSize: 14, fontWeight: '500', paddingHorizontal: 4 },
});