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
import { useTranslation } from 'react-i18next';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'date' | 'priority';
type SortDir   = 'asc'  | 'desc';
interface SortState { field: SortField; dir: SortDir }

// ─── Helper functions with simplified visuals for rural users ────────────────
const getCategoryStyles = (category: string, colors: any) => {
  const catStyles: Record<string, any> = {
    urgent:        { accent: '#E74C3C', bg: '#FEE9E7', fg: '#C0392B' },
    development:   { accent: colors.primary[600], bg: `${colors.primary[500]}12`, fg: colors.primary[700] },
    health:        { accent: '#3498DB', bg: '#E3F2FD', fg: '#1565C0' },
    education:     { accent: '#9B59B6', bg: '#F3E5F5', fg: '#6A1B9A' },
    agriculture:   { accent: '#27AE60', bg: '#E8F5E9', fg: '#1B5E20' },
    employment:    { accent: '#00ACC1', bg: '#E0F7FA', fg: '#006064' },
    social_welfare:{ accent: '#E91E63', bg: '#FCE4EC', fg: '#880E4F' },
    tax_billing:   { accent: '#F39C12', bg: '#FEF9E7', fg: '#D35400' },
    election:      { accent: '#2C3E50', bg: '#ECF0F1', fg: '#2C3E50' },
    general:       { accent: '#7F8C8D', bg: '#F5F5F5', fg: '#546E7A' },
  };
  return catStyles[category] || catStyles.general;
};

const getPriorityStyles = (priority: string, t: any) => {
  const priStyles: Record<string, any> = {
    high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: t('notices.priority_high') },
    medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: t('notices.priority_medium') },
    low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: t('notices.priority_low') },
  };
  return priStyles[priority] || priStyles.low;
};

const CATEGORIES = [
  { id: 'all',           labelKey: 'notices.category_all' },
  { id: 'urgent',        labelKey: 'notices.category_urgent' },
  { id: 'development',   labelKey: 'notices.category_development' },
  { id: 'health',        labelKey: 'notices.category_health' },
  { id: 'education',     labelKey: 'notices.category_education' },
  { id: 'agriculture',   labelKey: 'notices.category_agriculture' },
  { id: 'employment',    labelKey: 'notices.category_employment' },
  { id: 'social_welfare',labelKey: 'notices.category_welfare' },
  { id: 'tax_billing',   labelKey: 'notices.category_tax_billing' },
  { id: 'election',      labelKey: 'notices.category_election' },
  { id: 'general',       labelKey: 'notices.category_general' },
];

// ─── Highlighted text component ─────────────────────────────────────────────
const HighlightText = ({ text = '', query, style, lines, colors }: { text: string; query: string; style: any; lines?: number; colors: any }) => {
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

// ─── Search Bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, onClear, colors, t }: { value: string; onChange: (t: string) => void; onClear: () => void; colors: any; t: any }) => (
  <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
    <View style={[styles.searchInner, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.searchIcon, { color: colors.text.secondary }]}>🔍</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text.primary }]}
        placeholder={t('notices.search_placeholder')}
        placeholderTextColor={colors.text.secondary + '80'}
        value={value}
        onChangeText={onChange}
        returnKeyType="search"
        onSubmitEditing={() => Keyboard.dismiss()}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.searchClear} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <View style={[styles.searchClearInner, { backgroundColor: colors.border }]}>
            <Text style={[styles.searchClearText, { color: colors.text.secondary }]}>✕</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── Notice Card (views removed) ──────────────────────────────────────────────
const NoticeCard = ({ item, onPress, index, query, colors, t }: { item: any; onPress: () => void; index: number; query: string; colors: any; t: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: Math.min(index * 50, 500), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, delay: Math.min(index * 50, 500), useNativeDriver: true }),
    ]).start();
  }, []);

  const cat = getCategoryStyles(item.category, colors);
  const pri = getPriorityStyles(item.priority, t);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          item.isPinned && [styles.cardPinned, { borderColor: colors.primary[400] }]
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.cardStrip, { backgroundColor: cat.accent }]} />
        <View style={styles.cardBody}>
          {/* Header Row - Category & Priority */}
          <View style={styles.cardHeaderRow}>
            <View style={[styles.categoryPill, { backgroundColor: cat.bg }]}>
              <Text style={[styles.categoryText, { color: cat.fg }]}>
                {t(`notices.category_${item.category?.replace('_', '')}`) || item.category?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: pri.bg }]}>
              <Text style={[styles.priorityText, { color: pri.fg }]}>{pri.label}</Text>
            </View>
            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedText}>{t('notices.pinned')}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <HighlightText
            text={item.title}
            query={query}
            style={[styles.cardTitle, { color: colors.text.primary }]}
            lines={2}
            colors={colors}
          />

          {/* Description */}
          <HighlightText
            text={item.description}
            query={query}
            style={[styles.cardDesc, { color: colors.text.secondary }]}
            lines={2}
            colors={colors}
          />

          {/* Footer - Only author and date */}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.authorName, { color: colors.text.secondary }]} numberOfLines={1}>
              {item.createdBy?.name || t('notices.official')}
            </Text>
            <Text style={[styles.dateText, { color: colors.text.secondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pinned Strip ─────────────────────────────────────────────────────────────
const PinnedStrip = ({ notices, onPress, colors, t }: { notices: any[]; onPress: (id: string) => void; colors: any; t: any }) => {
  if (!notices.length) return null;
  return (
    <View style={[styles.pinnedContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.pinnedHeader}>
        <Text style={[styles.pinnedHeaderText, { color: colors.text.secondary }]}>{t('notices.pinned_notices')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pinnedScroll}
        decelerationRate="fast"
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
              activeOpacity={0.7}
            >
              <Text style={[styles.pinnedCatText, { color: cat.fg }]}>
                {t(`notices.category_${n.category?.replace('_', '')}`) || n.category?.replace('_', ' ')}
              </Text>
              <Text numberOfLines={2} style={[styles.pinnedTitle, { color: colors.text.primary }]}>{n.title}</Text>
              <Text style={[styles.pinnedDate, { color: colors.text.secondary }]}>{formatDate(n.createdAt)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, category, colors, t }: { query: string; category: string; colors: any; t: any }) => {
  const getEmptyMessage = () => {
    if (query) return { title: t('notices.empty_no_results_title'), desc: t('notices.empty_no_results_desc') };
    if (category !== 'all') return { title: t('notices.empty_no_notices_title'), desc: t('notices.empty_no_notices_desc') };
    return { title: t('notices.empty_no_notices_yet_title'), desc: t('notices.empty_no_notices_yet_desc') };
  };
  const { title, desc } = getEmptyMessage();

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary[500]}08` }]}>
        <Text style={[styles.emptyIcon, { color: colors.primary[500] }]}>📄</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>{desc}</Text>
    </View>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function QRNoticesScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const params    = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId) ? params.villageId[0] : (params.villageId || '');

  const [allNotices,         setAllNotices]        = useState<any[]>([]);
  const [village,            setVillage]           = useState<any>(null);
  const [loading,            setLoading]           = useState(true);
  const [refreshing,         setRefreshing]        = useState(false);
  const [selectedCategory,   setSelectedCategory]  = useState('all');
  const [searchQuery,        setSearchQuery]       = useState('');
  const [sort,               setSort]              = useState<SortState>({ field: 'date', dir: 'desc' });

  useEffect(() => {
    fetchNotices();
  }, [villageId]);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNoticesByVillage(villageId, 1, 100);
      setAllNotices(response.notices || []);
      setVillage(response.village);
    } catch (error) {
      Alert.alert(t('common.error'), t('notices.error_load_failed'));
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

  const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

  const processedNotices = useMemo(() => {
    let filtered = [...allNotices];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === selectedCategory);
    }
    
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query) ||
        n.createdBy?.name?.toLowerCase().includes(query) ||
        n.category?.toLowerCase().includes(query)
      );
    }
    
    filtered.sort((a, b) => {
      if (sort.field === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sort.dir === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        const rankA = PRIORITY_RANK[a.priority] || 0;
        const rankB = PRIORITY_RANK[b.priority] || 0;
        return sort.dir === 'desc' ? rankB - rankA : rankA - rankB;
      }
    });
    
    return filtered;
  }, [allNotices, selectedCategory, searchQuery, sort]);

  const pinnedNotices = processedNotices.filter(n => n.isPinned);
  const regularNotices = processedNotices.filter(n => !n.isPinned);

  const headerTextColor = isDark ? colors.primary[100] : '#fff';
  const backBtnBg = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  if (loading && allNotices.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>{t('notices.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={isDark ? colors.primary[900] : colors.primary[700]} />

      <LinearGradient
        colors={isDark
          ? [colors.primary[800], colors.primary[900]]
          : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: headerTextColor, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            {village?.name || t('notices.notices')}
          </Text>
          <TouchableOpacity 
            onPress={handleScanAnother} 
            style={styles.scanButton} 
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.scanText, { color: headerTextColor }]}>{t('notices.scan')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} colors={colors} t={t} />

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
                <Text style={[
                  styles.categoryChipText,
                  { color: colors.text.secondary },
                  active && styles.categoryChipTextActive
                ]}>{t(c.labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.controlBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.countContainer}>
          <Text style={[styles.countNumber, { color: colors.primary[600] }]}>{processedNotices.length}</Text>
          <Text style={[styles.countLabel, { color: colors.text.secondary }]}>
            {processedNotices.length !== 1 ? t('notices.notices') : t('notices.notice')}
          </Text>
        </View>

        <View style={styles.sortGroup}>
          <Text style={[styles.sortLabel, { color: colors.text.secondary }]}>{t('notices.sort')}:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow = active ? (sort.dir === 'desc' ? '↓' : '↑') : '';
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
                  {f === 'date' ? t('notices.date') : t('notices.priority')} {arrow}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {processedNotices.length === 0 ? (
        <EmptyState query={searchQuery} category={selectedCategory} colors={colors} t={t} />
      ) : (
        <FlatList
          data={regularNotices}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <NoticeCard
              item={item}
              index={index}
              query={searchQuery}
              colors={colors}
              t={t}
              onPress={() => router.push(`/notice/${item._id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={colors.primary[600]}
              colors={[colors.primary[600]]}
            />
          }
          ListHeaderComponent={
            !searchQuery.trim() && pinnedNotices.length > 0
              ? <PinnedStrip notices={pinnedNotices} onPress={(id) => router.push(`/notice/${id}`)} colors={colors} t={t} />
              : null
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
  loadingText: { fontSize: 14, fontWeight: '500' },

  headerShell: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 8 : 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnTxt: { fontSize: 24, fontWeight: '600' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scanButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scanText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 48, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 10 },
  searchClear: { padding: 6 },
  searchClearInner: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  searchClearText: { fontSize: 11, fontWeight: '700' },

  categoryBar: { borderBottomWidth: 1 },
  categoryScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    minWidth: 65,
    alignItems: 'center',
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },

  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  countContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  countNumber: { fontSize: 16, fontWeight: '800' },
  countLabel: { fontSize: 12, fontWeight: '500' },
  sortGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sortLabel: { fontSize: 11, fontWeight: '600' },
  sortButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  sortButtonActive: {},
  sortButtonText: { fontSize: 12, fontWeight: '600' },
  sortButtonTextActive: { color: '#fff' },

  highlight: { borderRadius: 3, fontWeight: '600' },

  pinnedContainer: { paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1 },
  pinnedHeader: { paddingHorizontal: 16, marginBottom: 10 },
  pinnedHeaderText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  pinnedScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 4 },
  pinnedCard: {
    width: SCREEN_WIDTH * 0.55,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderTopWidth: 3,
    gap: 6,
  },
  pinnedCatText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  pinnedTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  pinnedDate: { fontSize: 10, fontWeight: '500' },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardPinned: { shadowOpacity: 0.08, shadowRadius: 5 },
  cardStrip: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 6 },

  cardHeaderRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 2 },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  pinnedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FFF8E1' },
  pinnedText: { fontSize: 9, fontWeight: '800', color: '#E65100' },

  cardTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22, letterSpacing: -0.2 },
  cardDesc: { fontSize: 13, lineHeight: 19, letterSpacing: -0.2 },

  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 4, 
    paddingTop: 8, 
    borderTopWidth: 1 
  },
  authorName: { 
    fontSize: 11, 
    fontWeight: '600', 
    flex: 1 
  },
  dateText: { 
    fontSize: 10, 
    fontWeight: '500' 
  },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20, opacity: 0.7 },
});