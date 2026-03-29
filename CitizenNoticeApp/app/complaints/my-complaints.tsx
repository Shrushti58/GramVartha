// app/complaints/my-complaints.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert, Animated,
  StatusBar, TextInput, Keyboard, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

// ─── Helper functions ─────────────────────────────────────────────────────────
const getTypeStyles = (type: string) => {
  const typeStyles: Record<string, any> = {
    issue: { bg: '#FEE9E7', fg: '#C0392B', label: 'Issue', icon: '⚠️' },
    complaint: { bg: '#E8F5E9', fg: '#2E7D32', label: 'Complaint', icon: '📋' },
  };
  return typeStyles[type] || typeStyles.issue;
};

const getStatusStyles = (status: string) => {
  const statusStyles: Record<string, any> = {
    pending: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Pending', icon: '⏳' },
    'in-progress': { bg: '#E3F2FD', fg: '#1976D2', dot: '#2196F3', label: 'In Progress', icon: '🔧' },
    resolved: { bg: '#E8F5E9', fg: '#2E7D32', dot: '#4CAF50', label: 'Resolved', icon: '✅' },
    rejected: { bg: '#FFEBEE', fg: '#C0392B', dot: '#F44336', label: 'Rejected', icon: '❌' },
  };
  return statusStyles[status] || statusStyles.pending;
};

const MY_FILTERS = [
  { id: 'all', label: 'All', status: undefined },
  { id: 'pending', label: 'Pending', status: 'pending' },
  { id: 'in-progress', label: 'In Progress', status: 'in-progress' },
  { id: 'resolved', label: 'Resolved', status: 'resolved' },
];

// ─── Highlighted text ─────────────────────────────────────────────────────────
const HText = ({ text = '', query, style, lines }: any) => {
  if (!query.trim()) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <Text style={style} numberOfLines={lines}>
      {parts.map((p: string, i: number) =>
        p.toLowerCase() === query.toLowerCase()
          ? <Text key={i} style={[styles.highlight, { backgroundColor: '#FFF176', color: '#222' }]}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Search bar ───────────────────────────────────────────────────────────────
const SearchBar = ({ value, onChange, onClear, colors }: any) => (
  <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
    <View style={[styles.searchInner, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.searchIcon, { color: colors.text.secondary }]}>⌕</Text>
      <TextInput
        style={[styles.searchInput, { color: colors.text.primary }]}
        placeholder="Search your complaints…"
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

// ─── Complaint Card ───────────────────────────────────────────────────────────
const ComplaintCard = ({ item, onPress, index, query, colors }: any) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 260, delay: index * 40, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 240, delay: index * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  const typ = getTypeStyles(item.type);
  const sta = getStatusStyles(item.status);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onPress}
        activeOpacity={0.74}
      >
        <View style={[styles.cardStrip, { backgroundColor: sta.dot }]} />
        <View style={styles.cardBody}>

          {/* Pills row */}
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: typ.bg }]}>
              <Text style={[styles.pillTxt, { color: typ.fg }]}>{typ.icon} {typ.label}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: sta.bg }]}>
              <Text style={[styles.pillTxt, { color: sta.fg }]}>{sta.icon} {sta.label}</Text>
            </View>
          </View>

          <HText text={item.title} query={query} style={[styles.cardTitle, { color: colors.text.primary }]} lines={2} />
          <HText text={item.description} query={query} style={[styles.cardDesc, { color: colors.text.secondary }]} lines={2} />

          {item.imageUrl && (
            <View style={[styles.fileChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[styles.fileChipIcon, { backgroundColor: colors.primary[600] }]}>
                <Text style={styles.fileChipIconText}>📸</Text>
              </View>
              <Text style={[styles.fileChipText, { color: colors.text.secondary }]} numberOfLines={1}>Image evidence</Text>
            </View>
          )}

          {item.resolvedImageUrl && (
            <View style={[styles.fileChip, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
              <View style={[styles.fileChipIcon, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.fileChipIconText}>✅</Text>
              </View>
              <Text style={[styles.fileChipText, { color: '#2E7D32' }]} numberOfLines={1}>Resolution verified</Text>
            </View>
          )}

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.cardFooterL}>
              <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>
                #{item._id?.slice(-6).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardFooterR}>
              <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronWrap}>
          <Text style={[styles.chevron, { color: sta.dot }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, filter, colors }: any) => (
  <View style={styles.emptyWrap}>
    <View style={[styles.emptyCircle, { backgroundColor: `${colors.primary[500]}12` }]}>
      <Text style={[styles.emptyGlyph, { color: colors.primary[500] }]}>{query ? '⌕' : '📭'}</Text>
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>{query ? 'No results found' : 'No complaints yet'}</Text>
    <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
      {query
        ? `Nothing matched "${query}". Try different keywords.`
        : filter === 'all'
          ? 'You haven\'t reported any complaints yet.\nTap the button below to report an issue.'
          : `You have no ${filter.toLowerCase()} complaints.`}
    </Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyComplaintsScreen() {
  const { colors, isDark } = useTheme();

  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchMyComplaints(); }, [selectedFilter, page]);
  useEffect(() => { setSearchQuery(''); }, [selectedFilter]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const filterObj = MY_FILTERS.find(f => f.id === selectedFilter);
      const response = await apiService.getMyComplaints();
      
      // Filter by status if needed
      let filtered = response.complaints || response;
      if (filterObj?.status) {
        filtered = filtered.filter((c: any) => c.status === filterObj.status);
      }
      
      setMyComplaints(filtered);
      setTotalPages(Math.ceil(filtered.length / 10) || 1);
    } catch (err) {
      console.error('Fetch my complaints error:', err);
      Alert.alert('Error', 'Failed to load your complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyComplaints();
    setRefreshing(false);
  };

  const handleFilterChange = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFilter(id);
    setPage(1);
  };

  const processed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? myComplaints.filter((c) =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        )
      : [...myComplaints];
  }, [myComplaints, searchQuery]);

  if (loading && myComplaints.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading your complaints…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[700]} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary[700] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle} numberOfLines={1}>Your Complaints</Text>
          <Text style={styles.headerSub}>Track your reported issues</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/complaint' as any)}
          style={styles.addBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.addBtnTxt}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} colors={colors} />

      {/* Filter chips */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {MY_FILTERS.map((f) => {
          const active = selectedFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => handleFilterChange(f.id)}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.background },
                active && { backgroundColor: colors.primary[600], borderColor: colors.primary[600] }
              ]}
              activeOpacity={0.72}
            >
              <Text style={[
                styles.chipTxt,
                { color: colors.text.secondary },
                active && { color: '#fff' }
              ]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count row */}
      <View style={[styles.countRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.countTxt, { color: colors.text.secondary }]} numberOfLines={1}>
          <Text style={[styles.countNum, { color: colors.text.primary }]}>{processed.length}</Text>
          {' '}{processed.length !== 1 ? 'complaints' : 'complaint'}
          {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : ''}
        </Text>
      </View>

      {/* List */}
      {processed.length === 0 ? (
        <EmptyState query={searchQuery} filter={selectedFilter} colors={colors} />
      ) : (
        <FlatList
          data={processed}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <ComplaintCard
              item={item}
              index={index}
              query={searchQuery}
              colors={colors}
              onPress={() => router.push(`/complaints/${item._id}` as any)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
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
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 22, lineHeight: 26 },
  headerMid: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.58)', marginTop: 2, fontWeight: '500' },
  addBtn: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  addBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  // Search
  searchWrap: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon: { fontSize: 18, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  searchClear: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchClearText: { fontSize: 10, fontWeight: '700' },

  // Filter
  filterBar: { borderBottomWidth: 1, paddingHorizontal: 8, paddingVertical: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginHorizontal: 4 },
  chipTxt: { fontSize: 12, fontWeight: '600' },

  // Count row
  countRow: { paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  countTxt: { fontSize: 12, fontWeight: '500' },
  countNum: { fontSize: 12, fontWeight: '700' },

  // Highlight
  highlight: { borderRadius: 2 },

  // Cards
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 32, gap: 10 },
  card: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  cardStrip: { width: 4 },
  cardBody: { flex: 1, padding: 13, gap: 6 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  pillTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, gap: 4 },

  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21, letterSpacing: -0.2 },
  cardDesc: { fontSize: 12, lineHeight: 18 },

  fileChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, gap: 5, maxWidth: '80%' },
  fileChipIcon: { width: 16, height: 16, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  fileChipIconText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fileChipText: { fontSize: 11, fontWeight: '500', flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1 },
  cardFooterL: { flex: 1 },
  cardFooterR: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTxt: { fontSize: 11, fontWeight: '500' },
  chevronWrap: { width: 30, justifyContent: 'center', alignItems: 'center' },
  chevron: { fontSize: 22 },

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph: { fontSize: 28 },
  emptyTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
