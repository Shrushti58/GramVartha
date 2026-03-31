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
import { isLoggedIn } from '../../utils/auth';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

// ─── Helper functions ─────────────────────────────────────────────────────────
const getTypeStyles = (type: string) => {
  const typeStyles: Record<string, any> = {
    issue:      { bg: '#FEE9E7', bgDark: '#3D1A17', fg: '#C0392B', label: 'Issue',     icon: '⚠️' },
    complaint:  { bg: '#E8F5E9', bgDark: '#1B3A1E', fg: '#2E7D32', label: 'Complaint', icon: '📋' },
    suggestion: { bg: '#E3F2FD', bgDark: '#0D2137', fg: '#1976D2', label: 'Suggestion',icon: '💡' },
  };
  return typeStyles[type] || typeStyles.issue;
};

const getStatusConfig = (status: string) => {
  const map: Record<string, any> = {
    pending:     { bg: '#FEF9E7', bgDark: '#342A05', fg: '#B7950B', dot: '#F1C40F', label: 'Pending',     icon: '⏳' },
    'in-progress':{ bg: '#E3F2FD', bgDark: '#0D2137', fg: '#1976D2', dot: '#2196F3', label: 'In Progress', icon: '🔧' },
    resolved:    { bg: '#E8F5E9', bgDark: '#1B3A1E', fg: '#2E7D32', dot: '#4CAF50', label: 'Resolved',    icon: '✅' },
    rejected:    { bg: '#FFEBEE', bgDark: '#3D1A1A', fg: '#C0392B', dot: '#F44336', label: 'Rejected',    icon: '❌' },
  };
  return map[status] || map.pending;
};

const MY_FILTERS = [
  { id: 'all',         label: 'All',         status: undefined },
  { id: 'pending',     label: 'Pending',     status: 'pending' },
  { id: 'in-progress', label: 'In Progress', status: 'in-progress' },
  { id: 'resolved',    label: 'Resolved',    status: 'resolved' },
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
          ? <Text key={i} style={styles.highlight}>{p}</Text>
          : p
      )}
    </Text>
  );
};

// ─── Complaint Card ───────────────────────────────────────────────────────────
const ComplaintCard = ({ item, onPress, index, query, colors, isDark }: any) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 280, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 260, delay: index * 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const typ = getTypeStyles(item.type);
  const sta = getStatusConfig(item.status);

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            shadowColor: isDark ? '#000' : sta.dot,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.78}
      >
        {/* Left accent strip — colour-coded by status */}
        <View style={[styles.cardStrip, { backgroundColor: sta.dot }]} />

        <View style={styles.cardBody}>
          {/* Pills row */}
          <View style={styles.pillRow}>
            <View
              style={[
                styles.pill,
                { backgroundColor: isDark ? typ.bgDark : typ.bg },
              ]}
            >
              <Text style={[styles.pillTxt, { color: typ.fg }]}>
                {typ.icon}  {typ.label}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: isDark ? sta.bgDark : sta.bg },
              ]}
            >
              <View style={[styles.statusDot, { backgroundColor: sta.dot }]} />
              <Text style={[styles.pillTxt, { color: sta.fg }]}>{sta.label}</Text>
            </View>
          </View>

          {/* Title + description */}
          <HText
            text={item.title}
            query={query}
            style={[styles.cardTitle, { color: colors.text.primary }]}
            lines={2}
          />
          <HText
            text={item.description}
            query={query}
            style={[styles.cardDesc, { color: colors.text.secondary }]}
            lines={2}
          />

          {/* Evidence chips */}
          {item.imageUrl && (
            <View
              style={[
                styles.evidenceChip,
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
              <Text style={styles.evidenceIcon}>📸</Text>
              <Text style={[styles.evidenceText, { color: colors.primary[isDark ? 300 : 700] }]}>
                Image evidence
              </Text>
            </View>
          )}

          {item.resolvedImageUrl && (
            <View
              style={[
                styles.evidenceChip,
                {
                  backgroundColor: isDark ? '#1B3A1E' : '#E8F5E9',
                  borderColor: isDark ? '#2E7D3250' : '#C8E6C9',
                },
              ]}
            >
              <Text style={styles.evidenceIcon}>✅</Text>
              <Text style={[styles.evidenceText, { color: '#2E7D32' }]}>
                Resolution verified
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.metaTxt, { color: colors.text.muted }]}>
              #{item._id?.slice(-6).toUpperCase()}
            </Text>
            <Text style={[styles.metaTxt, { color: colors.text.muted }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <View style={styles.chevronWrap}>
          <Text style={[styles.chevron, { color: sta.dot }]}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, filter, colors, isDark }: any) => (
  <View style={styles.emptyWrap}>
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
      <Text style={styles.emptyGlyph}>{query ? '🔍' : '📭'}</Text>
    </View>
    <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
      {query ? 'No results found' : 'No complaints yet'}
    </Text>
    <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
      {query
        ? `Nothing matched "${query}". Try different keywords.`
        : filter === 'all'
        ? "You haven't reported any complaints yet.\nTap + New to report an issue."
        : `You have no ${filter.toLowerCase()} complaints.`}
    </Text>
  </View>
);

// ─── Login Prompt ─────────────────────────────────────────────────────────────
const LoginPrompt = ({ colors, isDark }: any) => (
  <View style={[styles.root, { backgroundColor: colors.background }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIconBox, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50], borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200] }]}>
        <Text style={styles.emptyGlyph}>🔒</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Login Required</Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
        You need to be logged in to view your complaints.
      </Text>
      <View style={styles.loginButtons}>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: colors.primary[700] }]}
          onPress={() => router.push('/auth/login' as any)}
          activeOpacity={0.82}
        >
          <Text style={styles.emptyBtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/auth/register' as any)}
          activeOpacity={0.82}
        >
          <Text style={styles.emptyBtnText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyComplaintsScreen() {
  const { colors, isDark } = useTheme();

  const [myComplaints,   setMyComplaints]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [loggedIn,       setLoggedIn]       = useState(false);

  // ── Derived header colours — identical pattern to complaint.tsx ─────────────
  const headerTextColor    = isDark ? colors.primary[100]  : '#fff';
  const headerSubColor     = isDark ? colors.primary[200]  : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor = isDark ? colors.primary[300]  : 'rgba(255,255,255,0.6)';
  const backBtnBg          = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';
  const headerBg           = isDark ? colors.primary[900]  : colors.primary[700];

  useEffect(() => {
    const checkLogin = async () => {
      const loggedInStatus = await isLoggedIn();
      setLoggedIn(loggedInStatus);
    };
    checkLogin();
  }, []);

  useEffect(() => { if (loggedIn) fetchMyComplaints(); }, [selectedFilter, loggedIn]);
  useEffect(() => { setSearchQuery(''); }, [selectedFilter]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const filterObj = MY_FILTERS.find(f => f.id === selectedFilter);
      const response  = await apiService.getMyComplaints();
      let filtered    = response.complaints || response;
      if (filterObj?.status) {
        filtered = filtered.filter((c: any) => c.status === filterObj.status);
      }
      setMyComplaints(filtered);
    } catch {
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
  };

  const processed = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? myComplaints.filter(c =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
        )
      : [...myComplaints];
  }, [myComplaints, searchQuery]);

  // ── Check login ────────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <LoginPrompt colors={colors} isDark={isDark} />;
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading && myComplaints.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading your complaints…
        </Text>
      </View>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={headerBg}
      />

      {/* ── Header with Gradient — same structure as complaint.tsx ── */}
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
        {/* Decorative circles */}
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

        {/* Nav row: back + new button */}
        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/complaint' as any)}
            style={[styles.newBtn, { backgroundColor: backBtnBg, borderColor: isDark ? `${colors.primary[400]}50` : 'rgba(255,255,255,0.3)' }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.newBtnTxt, { color: headerTextColor }]}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            CITIZEN PORTAL
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>
            My Complaints 📋
          </Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              Track your reported issues
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Search bar — matches complaint input style ── */}
      <View
        style={[
          styles.searchSection,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: searchFocused
                ? isDark
                  ? `${colors.primary[500]}12`
                  : colors.primary[50]
                : colors.background,
              borderColor: searchFocused ? colors.primary[500] : colors.border,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: searchFocused ? colors.primary[500] : colors.text.muted }]}>
            ⌕
          </Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search your complaints…"
            placeholderTextColor={colors.text.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={[
                styles.clearBtn,
                { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearBtnTxt, { color: colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter chips — matches complaint toggle style ── */}
      <View
        style={[
          styles.filterBar,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {MY_FILTERS.map(f => {
          const active = selectedFilter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => handleFilterChange(f.id)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active
                    ? colors.primary[700]
                    : isDark
                    ? `${colors.primary[500]}10`
                    : colors.primary[50],
                  borderColor: active
                    ? colors.primary[600]
                    : isDark
                    ? `${colors.primary[500]}25`
                    : colors.primary[100],
                },
                active && {
                  shadowColor: colors.primary[900],
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                },
              ]}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterChipTxt,
                  {
                    color: active
                      ? '#fff'
                      : isDark
                      ? colors.primary[300]
                      : colors.primary[700],
                    fontWeight: active ? '700' : '600',
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Count row ── */}
      <View
        style={[
          styles.countRow,
          {
            backgroundColor: isDark
              ? `${colors.primary[500]}08`
              : colors.primary[50],
            borderBottomColor: isDark
              ? `${colors.primary[500]}20`
              : colors.primary[100],
          },
        ]}
      >
        <Text style={[styles.countNum, { color: colors.primary[isDark ? 300 : 700] }]}>
          {processed.length}
        </Text>
        <Text style={[styles.countLabel, { color: colors.text.muted }]}>
          {processed.length !== 1 ? 'complaints' : 'complaint'}
          {searchQuery.trim() ? `  ·  "${searchQuery.trim()}"` : ''}
        </Text>
      </View>

      {/* ── List / Empty ── */}
      {processed.length === 0 ? (
        <EmptyState
          query={searchQuery}
          filter={selectedFilter}
          colors={colors}
          isDark={isDark}
        />
      ) : (
        <FlatList
          data={processed}
          keyExtractor={item => item._id}
          renderItem={({ item, index }) => (
            <ComplaintCard
              item={item}
              index={index}
              query={searchQuery}
              colors={colors}
              isDark={isDark}
              onPress={() => router.push(`/complaints/${item._id}` as any)}
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
            />
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  loadingWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14,
  },
  loadingText: { fontSize: 14, fontWeight: '500' },

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
  headerNavRow: {
    paddingTop: 54, paddingHorizontal: 16, paddingBottom: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  newBtn: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, borderWidth: 1,
  },
  newBtnTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
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

  // ── Search — matches complaint input style ────────────────────────────────
  searchSection: {
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 14, height: 50, gap: 10,
  },
  searchIcon: { fontSize: 19, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  clearBtn: {
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  clearBtnTxt: { fontSize: 10, fontWeight: '700' },

  // ── Filter chips — matches complaint toggle ────────────────────────────────
  filterBar: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5,
  },
  filterChipTxt: { fontSize: 12 },

  // ── Count row ────────────────────────────────────────────────────────────
  countRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 9, gap: 5,
    borderBottomWidth: 1,
  },
  countNum: { fontSize: 13, fontWeight: '800' },
  countLabel: { fontSize: 12, fontWeight: '500' },

  // ── Highlight ────────────────────────────────────────────────────────────
  highlight: {
    backgroundColor: '#FFF176', color: '#222', borderRadius: 2,
  },

  // ── Card — matches complaint card style ────────────────────────────────────
  listContent: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36, gap: 10,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18, borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  cardStrip: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 7 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7,
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 7, gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  pillTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  cardTitle: {
    fontSize: 15, fontWeight: '800',
    lineHeight: 21, letterSpacing: -0.2,
  },
  cardDesc: { fontSize: 12, lineHeight: 18, fontWeight: '500' },

  evidenceChip: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5, gap: 6,
  },
  evidenceIcon: { fontSize: 12 },
  evidenceText: { fontSize: 11, fontWeight: '700' },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2, paddingTop: 9, borderTopWidth: 1,
  },
  metaTxt: { fontSize: 11, fontWeight: '500' },

  chevronWrap: { width: 30, justifyContent: 'center', alignItems: 'center' },
  chevron: { fontSize: 22, fontWeight: '300' },

  // ── Empty state — matches workguide emptyCard ────────────────────────────
  emptyWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 36, gap: 10,
  },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  emptyGlyph: { fontSize: 30 },
  emptyTitle: {
    fontSize: 18, fontWeight: '800',
    letterSpacing: -0.3, textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13, textAlign: 'center',
    lineHeight: 20, fontWeight: '500',
  },
  emptyBtn: {
    marginTop: 8, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  loginButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
});