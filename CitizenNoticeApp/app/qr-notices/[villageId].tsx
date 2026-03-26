// app/qr-notices/[villageId].tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
  Animated, StatusBar, TextInput, Keyboard, Image,
  LayoutAnimation, Platform, UIManager, Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate, formatViews } from '../../utils/format';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'date' | 'priority';
type SortDir   = 'asc'  | 'desc';
interface SortState { field: SortField; dir: SortDir }
type FileType  = 'jpg' | 'png' | 'pdf' | 'doc' | 'docx' | 'unknown';

// ─── Data maps with theme support ────────────────────────────────────────────
const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const getCategoryStyles = (category: string, colors: any) => {
  const catMap: Record<string, { accent: string; bg: string; fg: string }> = {
    urgent:         { accent: '#C0392B', bg: '#FEE9E7', fg: '#922B21' },
    development:    { accent: colors.primary[600], bg: `${colors.primary[500]}14`, fg: colors.primary[700] },
    health:         { accent: '#1976D2', bg: '#E3F2FD', fg: '#0D47A1' },
    education:      { accent: '#7B1FA2', bg: '#F3E5F5', fg: '#4A148C' },
    agriculture:    { accent: '#2E7D32', bg: '#E8F5E9', fg: '#1B5E20' },
    employment:     { accent: '#00838F', bg: '#E0F7FA', fg: '#006064' },
    social_welfare: { accent: '#AD1457', bg: '#FCE4EC', fg: '#880E4F' },
    tax_billing:    { accent: '#E65100', bg: '#FBE9E7', fg: '#BF360C' },
    election:       { accent: '#283593', bg: '#E8EAF6', fg: '#1A237E' },
    general:        { accent: '#546E7A', bg: '#ECEFF1', fg: '#37474F' },
  };
  return catMap[category] || catMap.general;
};

const getPriorityStyles = (priority: string) => {
  const priMap: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
    high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High'   },
    medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium' },
    low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low'    },
  };
  return priMap[priority] || priMap.low;
};

const CATEGORIES = [
  { id: 'all',            label: 'All'           },
  { id: 'urgent',         label: 'Urgent'        },
  { id: 'development',    label: 'Development'   },
  { id: 'health',         label: 'Health'        },
  { id: 'education',      label: 'Education'     },
  { id: 'agriculture',    label: 'Agriculture'   },
  { id: 'employment',     label: 'Employment'    },
  { id: 'social_welfare', label: 'Welfare'       },
  { id: 'tax_billing',    label: 'Tax & Billing' },
  { id: 'election',       label: 'Election'      },
  { id: 'general',        label: 'General'       },
];

// ─── File type helpers ────────────────────────────────────────────────────────
const getFileType = (url: string, fileName?: string): FileType => {
  const source = fileName || url || '';
  const ext = source.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg'].includes(ext)) return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  return 'unknown';
};

const buildCloudinaryThumb = (url: string, width = 600, height = 280): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`);
};

const buildCloudinaryPdfThumb = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  const base = url.replace(/\.[^/.]+$/, '');
  return base.replace('/upload/', '/upload/pg_1,w_600,h_280,c_fill,q_auto,f_jpg/') + '.jpg';
};

const getFileConfig = (ft: FileType, colors: any) => {
  const fileCfg: Record<FileType, { color: string; bg: string; icon: string; label: string }> = {
    jpg:     { color: '#1976D2', bg: '#E3F2FD', icon: '🖼',  label: 'JPG'  },
    png:     { color: '#7B1FA2', bg: '#F3E5F5', icon: '🖼',  label: 'PNG'  },
    pdf:     { color: '#C0392B', bg: '#FEE9E7', icon: '📄',  label: 'PDF'  },
    doc:     { color: '#1565C0', bg: '#E8EAF6', icon: '📝',  label: 'DOC'  },
    docx:    { color: '#1565C0', bg: '#E8EAF6', icon: '📝',  label: 'DOCX' },
    unknown: { color: '#546E7A', bg: '#ECEFF1', icon: '📎',  label: 'FILE' },
  };
  return fileCfg[ft];
};

// ─── HText — inline search highlight ─────────────────────────────────────────
const HText = ({
  text = '',
  query,
  style,
  lines,
  colors,
}: {
  text: string;
  query: string;
  style: any;
  lines?: number;
  colors: any;
}) => {
  if (!query.trim()) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const esc   = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${esc})`, 'gi'));
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

// ─── File Preview Component ───────────────────────────────────────────────────
const FilePreview = ({
  fileUrl,
  fileName,
  catAccent,
  colors,
}: {
  fileUrl: string;
  fileName?: string;
  catAccent: string;
  colors: any;
}) => {
  const [imgError, setImgError] = useState(false);
  const fileType = getFileType(fileUrl, fileName);
  const cfg = getFileConfig(fileType, colors);

  if ((fileType === 'jpg' || fileType === 'png') && !imgError) {
    const thumbUrl = buildCloudinaryThumb(fileUrl, 600, 200);
    return (
      <View style={styles.previewContainer}>
        <Image
          source={{ uri: thumbUrl }}
          style={styles.previewImage}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        <View style={[styles.previewTypeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.previewTypeBadgeTxt, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    );
  }

  if (fileType === 'pdf' && !imgError) {
    const pdfThumb = buildCloudinaryPdfThumb(fileUrl);
    if (pdfThumb) {
      return (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: pdfThumb }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
          <View style={styles.pdfOverlay}>
            <View style={styles.pdfOverlayLeft}>
              <Text style={styles.pdfOverlayIcon}>📄</Text>
              <View>
                <Text style={styles.pdfOverlayLabel}>PDF Document</Text>
                <Text style={[styles.pdfOverlayName, { color: '#fff' }]} numberOfLines={1}>{fileName || 'Document.pdf'}</Text>
              </View>
            </View>
            <View style={[styles.pdfViewBtn, { backgroundColor: cfg.color }]}>
              <Text style={styles.pdfViewBtnTxt}>View</Text>
            </View>
          </View>
        </View>
      );
    }
  }

  const displayName = fileName || fileUrl.split('/').pop() || 'Document';
  return (
    <View style={[styles.docPreview, { borderLeftColor: cfg.color, backgroundColor: cfg.bg }]}>
      <View style={[styles.docIconWrap, { backgroundColor: cfg.color }]}>
        <Text style={styles.docIconTxt}>{cfg.icon}</Text>
      </View>
      <View style={styles.docMeta}>
        <Text style={[styles.docTypeLbl, { color: cfg.color }]}>{cfg.label} Document</Text>
        <Text style={[styles.docFileName, { color: colors.text.primary }]} numberOfLines={1}>{displayName}</Text>
      </View>
      <View style={[styles.docBadge, { backgroundColor: cfg.color }]}>
        <Text style={styles.docBadgeTxt}>{cfg.label}</Text>
      </View>
    </View>
  );
};

// ─── Notice Card ──────────────────────────────────────────────────────────────
const NoticeCard = ({
  item,
  onPress,
  index,
  query = '',
  colors,
}: {
  item: any;
  onPress: () => void;
  index: number;
  query?: string;
  colors: any;
}) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 300, delay: index * 45, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, delay: index * 45, useNativeDriver: true }),
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
          item.isPinned && { borderColor: `${cat.accent}44` }
        ]}
        onPress={onPress}
        activeOpacity={0.76}
      >
        <View style={[styles.accentBar, { backgroundColor: cat.accent }]} />

        {item.fileUrl && (
          <FilePreview
            fileUrl={item.fileUrl}
            fileName={item.fileName}
            catAccent={cat.accent}
            colors={colors}
          />
        )}

        <View style={styles.cardBody}>
          <View style={styles.pillRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={[styles.catBadgeTxt, { color: cat.fg }]}>
                {item.category?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            <View style={[styles.priBadge, { backgroundColor: pri.bg }]}>
              <View style={[styles.priDot, { backgroundColor: pri.dot }]} />
              <Text style={[styles.priBadgeTxt, { color: pri.fg }]}>{pri.label}</Text>
            </View>

            {item.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedBadgeTxt}>📌 PINNED</Text>
              </View>
            )}

            {item.status && item.status !== 'published' && (
              <View style={styles.draftBadge}>
                <Text style={styles.draftBadgeTxt}>{item.status.toUpperCase()}</Text>
              </View>
            )}
          </View>

          <HText text={item.title} query={query} style={[styles.cardTitle, { color: colors.text.primary }]} lines={2} colors={colors} />
          <HText text={item.description} query={query} style={[styles.cardDesc, { color: colors.text.secondary }]} lines={2} colors={colors} />
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.footerLeft}>
            <View style={[styles.avatar, { backgroundColor: `${cat.accent}20` }]}>
              <Text style={[styles.avatarTxt, { color: cat.accent }]}>
                {(item.createdBy?.name || 'O')[0].toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.authorName, { color: colors.text.secondary }]} numberOfLines={1}>
              {item.createdBy?.name || 'Official'}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>{formatDate(item.createdAt)}</Text>
            <View style={[styles.metaSep, { backgroundColor: colors.border }]} />
            <Text style={[styles.metaTxt, { color: colors.text.secondary }]}>{formatViews(item.views || 0)} views</Text>
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
  colors,
}: {
  notices: any[];
  onPress: (id: string) => void;
  colors: any;
}) => {
  if (!notices.length) return null;
  return (
    <View style={[styles.pinnedStrip, { borderBottomColor: colors.border }]}>
      <View style={styles.pinnedStripHeader}>
        <Text style={[styles.pinnedStripLbl, { color: colors.text.secondary }]}>📌 PINNED NOTICES</Text>
        <View style={[styles.pinnedCount, { backgroundColor: colors.primary[600] }]}>
          <Text style={styles.pinnedCountTxt}>{notices.length}</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pinnedScroll}
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
                  borderTopColor: cat.accent
                }
              ]}
              onPress={() => onPress(n._id)}
              activeOpacity={0.75}
            >
              <View style={[styles.pinnedCatDot, { backgroundColor: cat.accent }]} />
              <Text style={[styles.pinnedCatTxt, { color: cat.fg }]}>
                {n.category?.replace('_', ' ').toUpperCase()}
              </Text>
              <Text numberOfLines={2} style={[styles.pinnedCardTitle, { color: colors.text.primary }]}>{n.title}</Text>
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function QRNoticesScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId)
    ? params.villageId[0]
    : (params.villageId || '');

  const [allNotices, setAllNotices] = useState<any[]>([]);
  const [village, setVillage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scannedVillageInfo, setScannedVillageInfo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'date', dir: 'desc' });
  const [searchFocused, setSearchFocused] = useState(false);

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
    router.replace('/qr-scanner');
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

  const pinned = processed.filter((n) => n.isPinned);
  const regular = processed.filter((n) => !n.isPinned);

  if (loading && allNotices.length === 0) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[styles.loadingTxt, { color: colors.text.secondary }]}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[800]} />

      {/* HEADER */}
      <View style={[styles.headerShell, { backgroundColor: colors.primary[700] }]}>
        <View style={styles.headerAccentCircle} />
        <View style={styles.headerAccentCircle2} />

        <View style={styles.headerNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnTxt}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleScanAnother} style={styles.scanBtn} activeOpacity={0.75}>
            <Text style={styles.scanBtnTxt}>⬚  Scan New</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerEyebrow}>VILLAGE NOTICES</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {village?.name || 'Notice Board'}
          </Text>
          {(village?.district || village?.state) && (
            <View style={styles.headerBreadcrumb}>
              <View style={styles.headerBreadcrumbDot} />
              <Text style={styles.headerSub}>
                {[village?.district, village?.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {scannedVillageInfo && (
        <View style={[styles.banner, { backgroundColor: '#E8F5E9', borderBottomColor: '#C8E6C9' }]}>
          <View style={[styles.bannerDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={[styles.bannerTxt, { color: '#1B5E20' }]}>Village saved to your device</Text>
        </View>
      )}

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[
          styles.searchInner,
          { backgroundColor: colors.background, borderColor: colors.border },
          searchFocused && { borderColor: colors.primary[500], backgroundColor: `${colors.primary[500]}08` }
        ]}>
          <Text style={[styles.searchIcon, { color: colors.text.secondary }]}>⌕</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search by title, description, author…"
            placeholderTextColor={colors.text.secondary}
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
              style={[styles.searchClear, { backgroundColor: colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.searchClearTxt, { color: colors.text.secondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            const accent = c.id !== 'all' ? getCategoryStyles(c.id, colors).accent : colors.primary[600];
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => handleCategoryChange(c.id)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  active && { backgroundColor: accent, borderColor: accent }
                ]}
                activeOpacity={0.72}
              >
                <Text style={[styles.chipTxt, { color: colors.text.secondary }, active && styles.chipTxtActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.controlRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.countTxt, { color: colors.text.secondary }]} numberOfLines={1}>
          <Text style={[styles.countNum, { color: colors.text.primary }]}>{processed.length}</Text>
          {' '}{processed.length !== 1 ? 'notices' : 'notice'}
          {searchQuery.trim()
            ? ` · "${searchQuery.trim()}"`
            : selectedCategory !== 'all'
              ? ` · ${selectedCategory.replace('_', ' ')}`
              : ''}
        </Text>

        <View style={styles.sortGroup}>
          <Text style={[styles.sortLbl, { color: colors.text.secondary }]}>Sort:</Text>
          {(['date', 'priority'] as SortField[]).map((f) => {
            const active = sort.field === f;
            const arrow = active ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => handleSort(f)}
                style={[
                  styles.sortBtn,
                  { borderColor: colors.border, backgroundColor: colors.background },
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

      {processed.length === 0 ? (
        <EmptyState query={searchQuery} category={selectedCategory} colors={colors} />
      ) : (
        <FlatList
          data={regular}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <NoticeCard
              item={item}
              index={index}
              query={searchQuery}
              colors={colors}
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
            />
          }
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
                    key={p}
                    onPress={() => setPage(p)}
                    style={[
                      styles.pageBtn,
                      { borderColor: colors.border, backgroundColor: colors.surface },
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

// ─── Styles (moved theme colors to dynamic) ───────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingTxt: { fontSize: 14, fontWeight: '500' },
  headerShell: { paddingBottom: 22, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 10 },
  headerAccentCircle: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.055)', top: -80, right: -50 },
  headerAccentCircle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 30 },
  headerNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 54, paddingHorizontal: 16, paddingBottom: 18 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 20, lineHeight: 24, fontWeight: '600' },
  scanBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  scanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.50)', letterSpacing: 2.5, marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.8, lineHeight: 32 },
  headerBreadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  searchWrap: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  searchInner: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, height: 44, gap: 8 },
  searchIcon: { fontSize: 18, lineHeight: 22 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500', paddingVertical: 0 },
  searchClear: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  searchClearTxt: { fontSize: 10, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, gap: 8 },
  bannerDot: { width: 7, height: 7, borderRadius: 4 },
  bannerTxt: { fontSize: 12, fontWeight: '600' },
  filterBar: { borderBottomWidth: 1 },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 7 },
  chip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 12, fontWeight: '600' },
  chipTxtActive: { color: '#fff' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, gap: 8 },
  countTxt: { fontSize: 12, fontWeight: '500', flex: 1 },
  countNum: { fontSize: 12, fontWeight: '700' },
  sortGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLbl: { fontSize: 11, fontWeight: '600' },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  sortBtnActive: {},
  sortBtnTxt: { fontSize: 11, fontWeight: '700' },
  sortBtnTxtActive: {},
  highlight: { borderRadius: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  accentBar: { height: 4, width: '100%' },
  cardBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 7 },
  previewContainer: { width: '100%', height: 170, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  previewTypeBadge: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  previewTypeBadgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pdfOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.60)', paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  pdfOverlayLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pdfOverlayIcon: { fontSize: 18, lineHeight: 22 },
  pdfOverlayLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  pdfOverlayName: { fontSize: 12, fontWeight: '700' },
  pdfViewBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  pdfViewBtnTxt: { fontSize: 11, color: '#fff', fontWeight: '800' },
  docPreview: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: 10, marginBottom: 2, borderRadius: 12, borderLeftWidth: 4, paddingVertical: 12, paddingHorizontal: 12, gap: 10 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  docIconTxt: { fontSize: 20 },
  docMeta: { flex: 1, gap: 2 },
  docTypeLbl: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  docFileName: { fontSize: 12, fontWeight: '600' },
  docBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  docBadgeTxt: { fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  catBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  catBadgeTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  priBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 5 },
  priDot: { width: 6, height: 6, borderRadius: 3 },
  priBadgeTxt: { fontSize: 10, fontWeight: '700' },
  pinnedBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FFF3E0' },
  pinnedBadgeTxt: { fontSize: 10, fontWeight: '800', color: '#E65100', letterSpacing: 0.4 },
  draftBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#ECEFF1' },
  draftBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#546E7A', letterSpacing: 0.4 },
  cardTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21, letterSpacing: -0.3 },
  cardDesc: { fontSize: 12, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, marginTop: 8 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTxt: { fontSize: 11, fontWeight: '800' },
  authorName: { fontSize: 11, fontWeight: '600', flex: 1 },
  metaTxt: { fontSize: 11, fontWeight: '500' },
  metaSep: { width: 3, height: 3, borderRadius: 2 },
  pinnedStrip: { paddingTop: 14, paddingBottom: 6, borderBottomWidth: 1, marginBottom: 4 },
  pinnedStripHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  pinnedStripLbl: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  pinnedCount: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  pinnedCountTxt: { fontSize: 10, color: '#fff', fontWeight: '800' },
  pinnedScroll: { paddingHorizontal: 16, gap: 10 },
  pinnedCard: { width: 180, padding: 12, borderRadius: 12, borderWidth: 1, borderTopWidth: 3, gap: 5 },
  pinnedCatDot: { width: 6, height: 6, borderRadius: 3 },
  pinnedCatTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  pinnedCardTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph: { fontSize: 28 },
  emptyTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  pagination: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 20 },
  pageBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pageBtnActive: {},
  pageBtnTxt: { fontSize: 13, fontWeight: '600' },
  pageBtnTxtActive: {},
});