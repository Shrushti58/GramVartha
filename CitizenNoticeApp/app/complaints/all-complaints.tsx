// app/complaints/all-complaints.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert, Animated,
  StatusBar, TextInput, Keyboard, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';
import { isLoggedIn } from '../../utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintType = 'issue' | 'complaint' | 'suggestion';
type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

// ─── Helpers with translation ─────────────────────────────────────────────────
const getTypeStyles = (type: string, t: any) => {
  const map: Record<string, any> = {
    issue: {
      bg: '#FEE9E7',
      bgDark: '#3D1A17',
      fg: '#C0392B',
      label: t('type.issue'),
      icon: '⚠️',
    },
    complaint: {
      bg: '#E8F5E9',
      bgDark: '#1B3A1E',
      fg: '#2E7D32',
      label: t('type.complaint'),
      icon: '📋',
    },
    suggestion: {
      bg: '#E3F2FD',
      bgDark: '#0D2137',
      fg: '#1976D2',
      label: t('type.suggestion'),
      icon: '💡',
    },
  };
  return map[type] || map.issue;
};

const getStatusConfig = (status: string, t: any) => {
  const map: Record<string, any> = {
    pending: {
      bg: '#FEF9E7',
      bgDark: '#342A05',
      fg: '#B7950B',
      dot: '#F1C40F',
      label: t('status.pending'),
      icon: '⏳',
    },
    'in-progress': {
      bg: '#E3F2FD',
      bgDark: '#0D2137',
      fg: '#1976D2',
      dot: '#2196F3',
      label: t('status.in_progress'),
      icon: '🔧',
    },
    resolved: {
      bg: '#E8F5E9',
      bgDark: '#1B3A1E',
      fg: '#2E7D32',
      dot: '#4CAF50',
      label: t('status.resolved'),
      icon: '✅',
    },
    rejected: {
      bg: '#FFEBEE',
      bgDark: '#3D1A1A',
      fg: '#C0392B',
      dot: '#F44336',
      label: t('status.rejected'),
      icon: '❌',
    },
  };
  return map[status] || map.pending;
};

const COMPLAINT_FILTERS = [
  { id: 'all', key: 'filter_all', status: undefined },
  { id: 'pending', key: 'filter_pending', status: 'pending' },
  { id: 'in-progress', key: 'filter_in_progress', status: 'in-progress' },
  { id: 'resolved', key: 'filter_resolved', status: 'resolved' },
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
const ComplaintCard = ({ item, onPress, index, query, colors, isDark, t }: any) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 260, delay: index * 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const typ = getTypeStyles(item.type, t);
  const sta = getStatusConfig(item.status, t);

  const initials = (item.citizen?.name || t('all_complaints.citizen')[0])[0].toUpperCase();
  const avatarBg = isDark ? '#0D2137' : '#E3F2FD';
  const avatarFg = isDark ? '#90CAF9' : '#1976D2';

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
        <View style={[styles.cardStrip, { backgroundColor: sta.dot }]} />

        <View style={styles.cardBody}>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: isDark ? typ.bgDark : typ.bg }]}>
              <Text style={[styles.pillTxt, { color: typ.fg }]}>
                {typ.icon} {typ.label}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: isDark ? sta.bgDark : sta.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: sta.dot }]} />
              <Text style={[styles.pillTxt, { color: sta.fg }]}>{sta.label}</Text>
            </View>
          </View>

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

          {item.imageUrl && (
            <View
              style={[
                styles.evidenceChip,
                {
                  backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50],
                  borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200],
                },
              ]}
            >
              <Text style={styles.evidenceIcon}>📸</Text>
              <Text style={[styles.evidenceText, { color: colors.primary[isDark ? 300 : 700] }]}>
                {t('all_complaints.image_attached')}
              </Text>
            </View>
          )}

          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <View style={styles.cardFooterL}>
              <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={[styles.avatarTxt, { color: avatarFg }]}>{initials}</Text>
              </View>
              <Text
                style={[styles.metaTxt, { color: colors.text.muted }]}
                numberOfLines={1}
              >
                {item.citizen?.name || t('all_complaints.citizen')}
              </Text>
            </View>
            <Text style={[styles.metaTxt, { color: colors.text.muted }]}>
              {formatDate(item.createdAt)}
            </Text>
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
const EmptyState = ({ query, filter, colors, isDark, t }: any) => {
  const filterKey = COMPLAINT_FILTERS.find(f => f.id === filter)?.key || 'filter_all';
  const filterLabel = t(`all_complaints.${filterKey}`);

  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyIconBox,
          {
            backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50],
            borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200],
          },
        ]}
      >
        <Text style={styles.emptyGlyph}>{query ? '🔍' : '📭'}</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        {query ? t('all_complaints.no_results') : t('all_complaints.no_complaints')}
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
        {query
          ? t('all_complaints.no_results_desc', { query })
          : filter === 'all'
          ? t('all_complaints.no_complaints_desc')
          : t('all_complaints.no_complaints_filter_desc', { filter: filterLabel })}
      </Text>
    </View>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPress, colors, isDark, t }: any) => (
  <View style={styles.pagination}>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
      const active = page === p;
      return (
        <TouchableOpacity
          key={p}
          onPress={() => onPress(p)}
          style={[
            styles.pageBtn,
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
                : colors.primary[200],
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
              styles.pageBtnTxt,
              {
                color: active
                  ? '#fff'
                  : isDark
                  ? colors.primary[300]
                  : colors.primary[700],
                fontWeight: active ? '800' : '600',
              },
            ]}
          >
            {p}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── Login Prompt ─────────────────────────────────────────────────────────────
const LoginPrompt = ({ colors, isDark, t }: any) => (
  <View style={[styles.root, { backgroundColor: colors.background }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyIconBox,
          {
            backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50],
            borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200],
          },
        ]}
      >
        <Text style={styles.emptyGlyph}>🔒</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        {t('all_complaints.login_required')}
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
        {t('all_complaints.login_required_desc')}
      </Text>
      <View style={styles.loginButtons}>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: colors.primary[700] }]}
          onPress={() => router.push('/auth/login' as any)}
          activeOpacity={0.82}
        >
          <Text style={styles.emptyBtnText}>{t('all_complaints.login_button')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: colors.secondary || colors.primary[500] }]}
          onPress={() => router.push('/auth/register' as any)}
          activeOpacity={0.82}
        >
          <Text style={styles.emptyBtnText}>{t('all_complaints.register_button')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AllComplaintsScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const searchParams = useLocalSearchParams();
  const villageId = (searchParams.villageId as string) || '';

  const [allComplaints, setAllComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : '#fff';
  const headerSubColor = isDark ? colors.primary[200] : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor = isDark ? colors.primary[300] : 'rgba(255,255,255,0.6)';
  const backBtnBg = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  useEffect(() => {
    const checkLogin = async () => {
      const loggedInStatus = await isLoggedIn();
      setLoggedIn(loggedInStatus);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (villageId && loggedIn) fetchComplaints();
  }, [villageId, selectedFilter, page, loggedIn]);

  useEffect(() => {
    setSearchQuery('');
  }, [selectedFilter]);

  const fetchComplaints = async () => {
    if (!villageId) return;
    try {
      setLoading(true);
      const filterObj = COMPLAINT_FILTERS.find(f => f.id === selectedFilter);
      const response = await apiService.getComplaintsByVillage(villageId, page, 10, {
        status: filterObj?.status,
      });
      setAllComplaints(response.complaints || response);
      setTotalPages(response.pages || 1);
    } catch {
      Alert.alert(t('common.error') || 'Error', t('all_complaints.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
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
      ? allComplaints.filter(c =>
          c.title?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.citizen?.name?.toLowerCase().includes(q)
        )
      : [...allComplaints];
  }, [allComplaints, searchQuery]);

  if (!loggedIn) {
    return <LoginPrompt colors={colors} isDark={isDark} t={t} />;
  }

  if (!villageId) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />
        <LinearGradient
          colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerShell}
        >
          <View style={[styles.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
          <View style={[styles.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />
          <View style={styles.headerNavRow}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: backBtnBg }]} activeOpacity={0.7}>
              <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerTitleBlock}>
            <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
              {t('all_complaints.village_services')}
            </Text>
            <Text style={[styles.headerTitle, { color: headerTextColor }]}>
              {t('all_complaints.title')} 📋
            </Text>
          </View>
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconBox, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50], borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200] }]}>
            <Text style={styles.emptyGlyph}>🔍</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
            {t('all_complaints.no_village')}
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
            {t('all_complaints.no_village_desc')}
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary[700] }]}
            onPress={() => router.push('/qr-scanner' as any)}
            activeOpacity={0.82}
          >
            <Text style={styles.emptyBtnText}>{t('all_complaints.scan_qr')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && allComplaints.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t('all_complaints.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

      <LinearGradient
        colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerShell}
      >
        <View style={[styles.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
        <View style={[styles.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />

        <View style={styles.headerNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: backBtnBg }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            {t('all_complaints.village_services')}
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>
            {t('all_complaints.title')} 📋
          </Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              {t('all_complaints.subtitle')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.searchSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: searchFocused ? (isDark ? `${colors.primary[500]}12` : colors.primary[50]) : colors.background,
              borderColor: searchFocused ? colors.primary[500] : colors.border,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: searchFocused ? colors.primary[500] : colors.text.muted }]}>
            {t('all_complaints.search_icon')}
          </Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder={t('all_complaints.search_placeholder')}
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
              style={[styles.clearBtn, { backgroundColor: isDark ? colors.neutral?.[700] : colors.neutral?.[200] }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearBtnTxt, { color: colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {COMPLAINT_FILTERS.map(f => {
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
                    color: active ? '#fff' : isDark ? colors.primary[300] : colors.primary[700],
                    fontWeight: active ? '700' : '600',
                  },
                ]}
              >
                {t(`all_complaints.${f.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={[
          styles.countRow,
          {
            backgroundColor: isDark ? `${colors.primary[500]}08` : colors.primary[50],
            borderBottomColor: isDark ? `${colors.primary[500]}20` : colors.primary[100],
          },
        ]}
      >
        <Text style={[styles.countNum, { color: colors.primary[isDark ? 300 : 700] }]}>
          {processed.length}
        </Text>
        <Text style={[styles.countLabel, { color: colors.text.muted }]}>
          {processed.length !== 1 ? t('all_complaints.complaints_count') : t('all_complaints.complaint_count_singular')}
          {searchQuery.trim() ? `  ·  ${t('all_complaints.search_results_for')} "${searchQuery.trim()}"` : ''}
        </Text>
      </View>

      {processed.length === 0 ? (
        <EmptyState query={searchQuery} filter={selectedFilter} colors={colors} isDark={isDark} t={t} />
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
              t={t}
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
              title={t('all_complaints.pull_to_refresh')}
            />
          }
          ListFooterComponent={
            totalPages > 1 && !searchQuery.trim() ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPress={setPage}
                colors={colors}
                isDark={isDark}
                t={t}
              />
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
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
  },
  accentCircle2: {
    position: 'absolute',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  headerBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3 },
  headerSub: { fontSize: 12, fontWeight: '500' },

  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  searchIcon: { fontSize: 19, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnTxt: { fontSize: 10, fontWeight: '700' },

  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  filterChipTxt: { fontSize: 12 },

  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 5,
    borderBottomWidth: 1,
  },
  countNum: { fontSize: 13, fontWeight: '800' },
  countLabel: { fontSize: 12, fontWeight: '500' },

  highlight: { backgroundColor: '#FFF176', color: '#222', borderRadius: 2 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 36, gap: 10 },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardStrip: { width: 4 },
  cardBody: { flex: 1, padding: 14, gap: 7 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  pillTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  cardTitle: { fontSize: 15, fontWeight: '800', lineHeight: 21, letterSpacing: -0.2 },
  cardDesc: { fontSize: 12, lineHeight: 18, fontWeight: '500' },

  evidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  evidenceIcon: { fontSize: 12 },
  evidenceText: { fontSize: 11, fontWeight: '700' },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    paddingTop: 9,
    borderTopWidth: 1,
  },
  cardFooterL: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTxt: { fontSize: 10, fontWeight: '800' },
  metaTxt: { fontSize: 11, fontWeight: '500' },

  chevronWrap: { width: 30, justifyContent: 'center', alignItems: 'center' },
  chevron: { fontSize: 22 },

  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 10,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyGlyph: { fontSize: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  emptyBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  loginButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 24,
  },
  pageBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnTxt: { fontSize: 13 },
});