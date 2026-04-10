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
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

// ─── Helper functions with translations ─────────────────────────────────────────
const getTypeStyles = (type: string, t: any) => {
  const typeStyles: Record<string, any> = {
    issue: { 
      bg: '#FEE9E7', 
      bgDark: '#3D1A17', 
      fg: '#C0392B', 
      label: t('type.issue'), 
      icon: '⚠️' 
    },
    complaint: { 
      bg: '#E8F5E9', 
      bgDark: '#1B3A1E', 
      fg: '#2E7D32', 
      label: t('type.complaint'), 
      icon: '📋' 
    },
    suggestion: { 
      bg: '#E3F2FD', 
      bgDark: '#0D2137', 
      fg: '#1976D2', 
      label: t('type.suggestion'), 
      icon: '💡' 
    },
  };
  return typeStyles[type] || typeStyles.issue;
};

const getStatusConfig = (status: string, t: any) => {
  const map: Record<string, any> = {
    pending: { 
      bg: '#FEF9E7', 
      bgDark: '#342A05', 
      fg: '#B7950B', 
      dot: '#F1C40F', 
      label: t('status.pending'), 
      icon: '⏳' 
    },
    'in-progress': { 
      bg: '#E3F2FD', 
      bgDark: '#0D2137', 
      fg: '#1976D2', 
      dot: '#2196F3', 
      label: t('status.in_progress'), 
      icon: '🔧' 
    },
    resolved: { 
      bg: '#E8F5E9', 
      bgDark: '#1B3A1E', 
      fg: '#2E7D32', 
      dot: '#4CAF50', 
      label: t('status.resolved'), 
      icon: '✅' 
    },
    rejected: { 
      bg: '#FFEBEE', 
      bgDark: '#3D1A1A', 
      fg: '#C0392B', 
      dot: '#F44336', 
      label: t('status.rejected'), 
      icon: '❌' 
    },
  };
  return map[status] || map.pending;
};

const MY_FILTERS = [
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
                {typ.icon} {typ.label}
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
                {t('my_complaints.image_evidence')}
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
                {t('my_complaints.resolution_verified')}
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
const EmptyState = ({ query, filter, colors, isDark, t }: any) => {
  const filterKey = MY_FILTERS.find(f => f.id === filter)?.key || 'filter_all';
  const filterLabel = t(`my_complaints.${filterKey}`);

  return (
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
        {query ? t('my_complaints.no_results') : t('my_complaints.no_complaints')}
      </Text>
      <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
        {query
          ? t('my_complaints.no_results_desc', { query })
          : filter === 'all'
          ? t('my_complaints.no_complaints_desc')
          : t('my_complaints.no_complaints_filter_desc', { filter: filterLabel })}
      </Text>
    </View>
  );
};


// ─── Login Prompt (Redesigned) ─────────────────────────────────────────────────────────────
const LoginPrompt = ({ colors, isDark, t }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const headerBg = isDark ? colors.primary[900] : colors.primary[700];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />
      
      {/* Decorative Header */}
      <LinearGradient
        colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loginHeader}
      >
        <View style={[styles.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
        <View style={[styles.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />
        
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.loginBackBtn, { backgroundColor: isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)' }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.loginBackBtnTxt, { color: '#fff' }]}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.loginHeaderContent}>
          <View style={styles.loginIconContainer}>
            <LinearGradient
              colors={[colors.primary[400], colors.primary[600]]}
              style={styles.loginIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.loginIconText}>🔒</Text>
            </LinearGradient>
          </View>
          <Text style={styles.loginHeaderTitle}>{t('all_complaints.login_required')}</Text>
          <Text style={styles.loginHeaderSubtitle}>
            {t('all_complaints.login_required_desc')}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <Animated.View 
        style={[
          styles.loginContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.loginFeatures}>
            <View style={styles.loginFeature}>
              <View style={[styles.loginFeatureIcon, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50] }]}>
                <Text style={styles.loginFeatureIconText}>📝</Text>
              </View>
              <View style={styles.loginFeatureText}>
                <Text style={[styles.loginFeatureTitle, { color: colors.text.primary }]}>
                  {t('all_complaints.feature_submit')}
                </Text>
                <Text style={[styles.loginFeatureDesc, { color: colors.text.secondary }]}>
                  {t('all_complaints.feature_submit_desc')}
                </Text>
              </View>
            </View>

            <View style={styles.loginFeature}>
              <View style={[styles.loginFeatureIcon, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50] }]}>
                <Text style={styles.loginFeatureIconText}>🔍</Text>
              </View>
              <View style={styles.loginFeatureText}>
                <Text style={[styles.loginFeatureTitle, { color: colors.text.primary }]}>
                  {t('all_complaints.feature_track')}
                </Text>
                <Text style={[styles.loginFeatureDesc, { color: colors.text.secondary }]}>
                  {t('all_complaints.feature_track_desc')}
                </Text>
              </View>
            </View>

            <View style={styles.loginFeature}>
              <View style={[styles.loginFeatureIcon, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50] }]}>
                <Text style={styles.loginFeatureIconText}>⚡</Text>
              </View>
              <View style={styles.loginFeatureText}>
                <Text style={[styles.loginFeatureTitle, { color: colors.text.primary }]}>
                  {t('all_complaints.feature_real_time')}
                </Text>
                <Text style={[styles.loginFeatureDesc, { color: colors.text.secondary }]}>
                  {t('all_complaints.feature_real_time_desc')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.loginDivider}>
            <View style={[styles.loginDividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.loginDividerText, { color: colors.text.muted }]}>
              {t('all_complaints.get_started')}
            </Text>
            <View style={[styles.loginDividerLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.loginButtonsContainer}>
            <TouchableOpacity
              style={[styles.loginPrimaryBtn, { backgroundColor: colors.primary[700] }]}
              onPress={() => router.push('/auth/login' as any)}
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={[colors.primary[600], colors.primary[800]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginPrimaryBtnGradient}
              >
                <Text style={styles.loginPrimaryBtnText}>
                  {t('all_complaints.login_button')} →
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginSecondaryBtn,
                {
                  backgroundColor: isDark ? 'transparent' : colors.primary[50],
                  borderColor: colors.primary[200],
                }
              ]}
              onPress={() => router.push('/auth/register' as any)}
              activeOpacity={0.82}
            >
              <Text style={[styles.loginSecondaryBtnText, { color: colors.primary[700] }]}>
                {t('all_complaints.register_button')}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.loginFooterText, { color: colors.text.muted }]}>
            {t('all_complaints.login_footer')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MyComplaintsScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // ── Derived header colours — identical pattern to complaint.tsx ─────────────
  const headerTextColor = isDark ? colors.primary[100] : '#fff';
  const headerSubColor = isDark ? colors.primary[200] : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor = isDark ? colors.primary[300] : 'rgba(255,255,255,0.6)';
  const backBtnBg = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];

  useEffect(() => {
    const checkLogin = async () => {
      const loggedInStatus = await isLoggedIn();
      setLoggedIn(loggedInStatus);
    };
    checkLogin();
  }, []);

  useEffect(() => {
    if (loggedIn) fetchMyComplaints();
  }, [selectedFilter, loggedIn]);

  useEffect(() => {
    setSearchQuery('');
  }, [selectedFilter]);

  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const filterObj = MY_FILTERS.find(f => f.id === selectedFilter);
      const response = await apiService.getMyComplaints();
      let filtered = response.complaints || response;
      if (filterObj?.status) {
        filtered = filtered.filter((c: any) => c.status === filterObj.status);
      }
      setMyComplaints(filtered);
    } catch {
      Alert.alert(t('common.error') || 'Error', t('my_complaints.load_error'));
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
    return <LoginPrompt colors={colors} isDark={isDark} t={t} />;
  }

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading && myComplaints.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          {t('my_complaints.loading')}
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
            <Text style={[styles.newBtnTxt, { color: headerTextColor }]}>{t('my_complaints.new_complaint')}</Text>
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View style={styles.headerTitleBlock}>
          <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>
            {t('my_complaints.citizen_portal')}
          </Text>
          <Text style={[styles.headerTitle, { color: headerTextColor }]}>
            {t('my_complaints.title')} 📋
          </Text>
          <View style={styles.headerBreadcrumb}>
            <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[styles.headerSub, { color: headerSubColor }]}>
              {t('my_complaints.subtitle')}
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
            {t('my_complaints.search_icon')}
          </Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder={t('my_complaints.search_placeholder')}
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
                { backgroundColor: isDark ? colors.neutral?.[700] : colors.neutral?.[200] },
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
                {t(`my_complaints.${f.key}`)}
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
          {processed.length !== 1 ? t('my_complaints.complaints_count') : t('my_complaints.complaint_count_singular')}
          {searchQuery.trim() ? `  ·  ${t('my_complaints.search_results_for')} "${searchQuery.trim()}"` : ''}
        </Text>
      </View>

      {/* ── List / Empty ── */}
      {processed.length === 0 ? (
        <EmptyState
          query={searchQuery}
          filter={selectedFilter}
          colors={colors}
          isDark={isDark}
          t={t}
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
              title={t('my_complaints.pull_to_refresh')}
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
  
  // Login Prompt Styles (from all-complaints.tsx)
  loginHeader: {
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 10,
  },
  loginBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  loginBackBtnTxt: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
  },
  loginHeaderContent: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  loginIconContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginIconText: {
    fontSize: 40,
  },
  loginHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginHeaderSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  loginContent: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  loginCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginFeatures: {
    gap: 20,
    marginBottom: 24,
  },
  loginFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  loginFeatureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginFeatureIconText: {
    fontSize: 24,
  },
  loginFeatureText: {
    flex: 1,
  },
  loginFeatureTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  loginFeatureDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  loginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  loginDividerLine: {
    flex: 1,
    height: 1,
  },
  loginDividerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginButtonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  loginPrimaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  loginPrimaryBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  loginSecondaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginFooterText: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
});