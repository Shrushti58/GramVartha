/**
 * QR Notices Screen — Improved Header + Notice Cards with File Preview
 * Supports: jpg, png, pdf, doc, docx (Cloudinary-hosted)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, ScrollView, Alert,
  Animated, StatusBar, TextInput, Keyboard, Image,
  LayoutAnimation, Platform, UIManager, Modal,
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
type FileType  = 'jpg' | 'png' | 'pdf' | 'doc' | 'docx' | 'unknown';

// ─── Data maps ────────────────────────────────────────────────────────────────
const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const CAT_MAP: Record<string, { accent: string; bg: string; fg: string }> = {
  urgent:         { accent: '#C0392B', bg: '#FEE9E7', fg: '#922B21' },
  development:    { accent: Colors.primary[600], bg: `${Colors.primary[500]}14`, fg: Colors.primary[700] },
  health:         { accent: '#1976D2', bg: '#E3F2FD', fg: '#0D47A1' },
  education:      { accent: '#7B1FA2', bg: '#F3E5F5', fg: '#4A148C' },
  agriculture:    { accent: '#2E7D32', bg: '#E8F5E9', fg: '#1B5E20' },
  employment:     { accent: '#00838F', bg: '#E0F7FA', fg: '#006064' },
  social_welfare: { accent: '#AD1457', bg: '#FCE4EC', fg: '#880E4F' },
  tax_billing:    { accent: '#E65100', bg: '#FBE9E7', fg: '#BF360C' },
  election:       { accent: '#283593', bg: '#E8EAF6', fg: '#1A237E' },
  general:        { accent: '#546E7A', bg: '#ECEFF1', fg: '#37474F' },
};
const getCat = (c: string) => CAT_MAP[c] || CAT_MAP.general;

const PRI_MAP: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  high:   { bg: '#FEE9E7', fg: '#C0392B', dot: '#E74C3C', label: 'High'   },
  medium: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', label: 'Medium' },
  low:    { bg: '#EAF4FB', fg: '#1A5276', dot: '#2E86C1', label: 'Low'    },
};
const getPri = (p: string) => PRI_MAP[p] || PRI_MAP.low;

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

/**
 * Detect file type from Cloudinary URL or filename.
 * Cloudinary URLs typically end in /v1234567890/filename.ext
 */
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

/**
 * Build a Cloudinary thumbnail URL for images.
 * Transforms: /upload/ → /upload/c_fill,w_600,h_280,q_auto,f_auto/
 */
const buildCloudinaryThumb = (url: string, width = 600, height = 280): string => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace(
    '/upload/',
    `/upload/c_fill,w_${width},h_${height},q_auto,f_auto/`
  );
};

/**
 * For PDFs on Cloudinary, we can render the first page as an image
 * by changing the extension to .jpg and adding pg_1 transform.
 */
const buildCloudinaryPdfThumb = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';
  const base = url.replace(/\.[^/.]+$/, '');
  return base.replace('/upload/', '/upload/pg_1,w_600,h_280,c_fill,q_auto,f_jpg/') + '.jpg';
};

// ─── File type config ─────────────────────────────────────────────────────────
const FILE_CONFIG: Record<FileType, { color: string; bg: string; icon: string; label: string }> = {
  jpg:     { color: '#1976D2', bg: '#E3F2FD', icon: '🖼',  label: 'JPG'  },
  png:     { color: '#7B1FA2', bg: '#F3E5F5', icon: '🖼',  label: 'PNG'  },
  pdf:     { color: '#C0392B', bg: '#FEE9E7', icon: '📄',  label: 'PDF'  },
  doc:     { color: '#1565C0', bg: '#E8EAF6', icon: '📝',  label: 'DOC'  },
  docx:    { color: '#1565C0', bg: '#E8EAF6', icon: '📝',  label: 'DOCX' },
  unknown: { color: '#546E7A', bg: '#ECEFF1', icon: '📎',  label: 'FILE' },
};

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

// ─── File Preview Component ───────────────────────────────────────────────────
const FilePreview = ({
  fileUrl,
  fileName,
  catAccent,
}: {
  fileUrl: string;
  fileName?: string;
  catAccent: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const fileType = getFileType(fileUrl, fileName);
  const cfg      = FILE_CONFIG[fileType];

  // Image types → show actual thumbnail
  if ((fileType === 'jpg' || fileType === 'png') && !imgError) {
    const thumbUrl = buildCloudinaryThumb(fileUrl, 600, 200);
    return (
      <View style={S.previewContainer}>
        <Image
          source={{ uri: thumbUrl }}
          style={S.previewImage}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        <View style={[S.previewTypeBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[S.previewTypeBadgeTxt, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    );
  }

  // PDF → render first page thumbnail via Cloudinary
  if (fileType === 'pdf' && !imgError) {
    const pdfThumb = buildCloudinaryPdfThumb(fileUrl);
    if (pdfThumb) {
      return (
        <View style={S.previewContainer}>
          <Image
            source={{ uri: pdfThumb }}
            style={S.previewImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
          {/* PDF overlay strip */}
          <View style={S.pdfOverlay}>
            <View style={S.pdfOverlayLeft}>
              <Text style={S.pdfOverlayIcon}>📄</Text>
              <View>
                <Text style={S.pdfOverlayLabel}>PDF Document</Text>
                <Text style={S.pdfOverlayName} numberOfLines={1}>{fileName || 'Document.pdf'}</Text>
              </View>
            </View>
            <View style={[S.pdfViewBtn, { backgroundColor: cfg.color }]}>
              <Text style={S.pdfViewBtnTxt}>View</Text>
            </View>
          </View>
        </View>
      );
    }
  }

  // DOC / DOCX / fallback → rich tile with icon + metadata
  const displayName = fileName || fileUrl.split('/').pop() || 'Document';
  return (
    <View style={[S.docPreview, { borderLeftColor: cfg.color, backgroundColor: cfg.bg }]}>
      <View style={[S.docIconWrap, { backgroundColor: cfg.color }]}>
        <Text style={S.docIconTxt}>{cfg.icon}</Text>
      </View>
      <View style={S.docMeta}>
        <Text style={[S.docTypeLbl, { color: cfg.color }]}>{cfg.label} Document</Text>
        <Text style={S.docFileName} numberOfLines={1}>{displayName}</Text>
      </View>
      <View style={[S.docBadge, { backgroundColor: cfg.color }]}>
        <Text style={S.docBadgeTxt}>{cfg.label}</Text>
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

        {/* File preview (if exists) */}
        {item.fileUrl && (
          <FilePreview
            fileUrl={item.fileUrl}
            fileName={item.fileName}
            catAccent={cat.accent}
          />
        )}

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
                <Text style={S.pinnedBadgeTxt}>📌 PINNED</Text>
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
      <View style={S.pinnedStripHeader}>
        <Text style={S.pinnedStripLbl}>📌 PINNED NOTICES</Text>
        <View style={S.pinnedCount}><Text style={S.pinnedCountTxt}>{notices.length}</Text></View>
      </View>
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
  const [searchFocused,      setSearchFocused]      = useState(false);



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
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[800]} />

      {/* ══════════════════════════════════════════════════
          HEADER — Bold & Modern
      ══════════════════════════════════════════════════ */}
      <View style={S.headerShell}>
        {/* Decorative circle — top-right geometric accent */}
        <View style={S.headerAccentCircle} />
        <View style={S.headerAccentCircle2} />

        {/* Nav row */}
        <View style={S.headerNavRow}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn} activeOpacity={0.7}>
            <Text style={S.backBtnTxt}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleScanAnother} style={S.scanBtn} activeOpacity={0.75}>
            <Text style={S.scanBtnTxt}>⬚  Scan New</Text>
          </TouchableOpacity>
        </View>

        {/* Title block */}
        <View style={S.headerTitleBlock}>
          <Text style={S.headerEyebrow}>VILLAGE NOTICES</Text>
          <Text style={S.headerTitle} numberOfLines={1}>
            {village?.name || 'Notice Board'}
          </Text>
          {(village?.district || village?.state) && (
            <View style={S.headerBreadcrumb}>
              <View style={S.headerBreadcrumbDot} />
              <Text style={S.headerSub}>
                {[village?.district, village?.state].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Saved banner ── */}
      {scannedVillageInfo && (
        <View style={S.banner}>
          <View style={S.bannerDot} />
          <Text style={S.bannerTxt}>Village saved to your device</Text>
        </View>
      )}

      {/* ── Search — clean bar below header ── */}
      <View style={S.searchWrap}>
        <View style={[S.searchInner, searchFocused && S.searchInnerFocused]}>
          <Text style={S.searchIcon}>⌕</Text>
          <TextInput
            style={S.searchInput}
            placeholder="Search by title, description, author…"
            placeholderTextColor={Colors.textSecondary}
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

  // ── Improved Header ──────────────────────────────────────────────────────
  // ── Bold Modern Header ────────────────────────────────────────────────────
  headerShell: {
    backgroundColor: Colors.primary[700],
    paddingBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },

  // Large decorative circles — pure geometry, no texture
  headerAccentCircle: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.055)',
    top: -80,
    right: -50,
  },
  headerAccentCircle2: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -30,
    left: 30,
  },

  // Back + scan row — sits at the very top
  headerNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.13)',
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnTxt: { color: '#fff', fontSize: 20, lineHeight: 24, fontWeight: '600' },

  scanBtn: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
  },
  scanBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },

  // Big title block — the visual anchor of the header
  headerTitleBlock: {
    paddingHorizontal: 18,
    gap: 4,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.50)',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  headerBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  headerBreadcrumbDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },

  // ── Search bar — outside header ────────────────────────────────────────────
  searchWrap: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12, height: 44, gap: 8,
  },
  searchInnerFocused: {
    borderColor: Colors.primary[500],
    backgroundColor: `${Colors.primary[500]}08`,
  },
  searchIcon:     { fontSize: 18, color: Colors.textSecondary, lineHeight: 22 },
  searchInput:    { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500', paddingVertical: 0 },
  searchClear:    { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  searchClearTxt: { fontSize: 10, color: Colors.textSecondary, fontWeight: '700' },

  // Banner
  banner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#C8E6C9', gap: 8 },
  bannerDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E7D32' },
  bannerTxt: { fontSize: 12, color: '#1B5E20', fontWeight: '600' },

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
  sortGroup:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortLbl:          { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  sortBtn:          { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  sortBtnActive:    { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  sortBtnTxt:       { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  sortBtnTxtActive: { color: '#fff' },

  // ── Improved Notice Cards ───────────────────────────────────────────────
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    // Subtle card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accentBar: { height: 4, width: '100%' },
  cardBody:  { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 7 },

  // ── File preview styles ─────────────────────────────────────────────────

  // Shared preview container (images + PDF thumb)
  previewContainer: {
    width: '100%',
    height: 170,
    position: 'relative',
    backgroundColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // Small type badge top-right on image preview
  previewTypeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewTypeBadgeTxt: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // PDF overlay strip at bottom of pdf thumb
  pdfOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.60)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  pdfOverlayLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  pdfOverlayIcon:   { fontSize: 18, lineHeight: 22 },
  pdfOverlayLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  pdfOverlayName:   { fontSize: 12, color: '#fff', fontWeight: '700' },
  pdfViewBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  pdfViewBtnTxt:    { fontSize: 11, color: '#fff', fontWeight: '800' },

  // DOC / DOCX tile
  docPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 12,
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  docIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  docIconTxt:  { fontSize: 20 },
  docMeta:     { flex: 1, gap: 2 },
  docTypeLbl:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  docFileName: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
  docBadge:    { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, flexShrink: 0 },
  docBadgeTxt: { fontSize: 10, color: '#fff', fontWeight: '800', letterSpacing: 0.4 },

  // Pill badges
  pillRow:       { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  catBadge:      { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  catBadgeTxt:   { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  priBadge:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 5 },
  priDot:        { width: 6, height: 6, borderRadius: 3 },
  priBadgeTxt:   { fontSize: 10, fontWeight: '700' },
  pinnedBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#FFF3E0' },
  pinnedBadgeTxt:{ fontSize: 10, fontWeight: '800', color: '#E65100', letterSpacing: 0.4 },
  draftBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#ECEFF1' },
  draftBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#546E7A', letterSpacing: 0.4 },

  // Card content
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 21, letterSpacing: -0.3 },
  cardDesc:  { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  // Card footer tray
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background, marginTop: 8,
  },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  footerRight:{ flexDirection: 'row', alignItems: 'center', gap: 5 },
  avatar:     { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTxt:  { fontSize: 11, fontWeight: '800' },
  authorName: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', flex: 1 },
  metaTxt:    { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaSep:    { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.border },

  // Search highlight
  highlight: { backgroundColor: '#FFF176', color: '#222', borderRadius: 2 },

  // Pinned strip
  pinnedStrip:       { paddingTop: 14, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 4 },
  pinnedStripHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  pinnedStripLbl:    { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2 },
  pinnedCount:       { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.primary[600], justifyContent: 'center', alignItems: 'center' },
  pinnedCountTxt:    { fontSize: 10, color: '#fff', fontWeight: '800' },
  pinnedScroll:      { paddingHorizontal: 16, gap: 10 },
  pinnedCard:        { width: 180, padding: 12, backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 3, gap: 5 },
  pinnedCatDot:      { width: 6, height: 6, borderRadius: 3 },
  pinnedCatTxt:      { fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  pinnedCardTitle:   { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, lineHeight: 18 },

  // Empty state
  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, gap: 10 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary[500]}12`, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyGlyph:  { fontSize: 28, color: Colors.primary[500] },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  emptyDesc:   { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Pagination
  pagination:       { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, paddingVertical: 20 },
  pageBtn:          { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
  pageBtnActive:    { backgroundColor: Colors.primary[600], borderColor: Colors.primary[600] },
  pageBtnTxt:       { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  pageBtnTxtActive: { color: '#fff' },
});