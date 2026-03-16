/**
 * Notice Details Screen — app/notice/[id].tsx
 * Premium v3 — Deep brown hero, SVG wave cutout, frosted glass nav,
 * staggered entry animations, stat cards, rich attachment card,
 * bold action bar with arrow CTA.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  Image, Share, Animated, StatusBar, Platform,
  Modal, SafeAreaView, Dimensions, Pressable,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, router } from 'expo-router';
import { apiService } from '../../services/api';
import { formatLongDate } from '../../utils/format';
import { Notice } from '../../types/Notice';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

// ─── Palette ──────────────────────────────────────────────────────────────
const P = {
  heroDeep:  '#2c1810',
  heroBrown: '#3d2b24',
  surface:   '#ffffff',
  bg:        '#f5efe9',
  border:    '#e8ddd1',
  borderSoft:'#f0e8df',
  brown600:  '#8B6B61',
  brown700:  '#6D4C41',
  brown800:  '#5D4037',
  textPri:   '#1e293b',
  textSec:   '#64748b',
  textMuted: '#94a3b8',
  urgent:    '#dc2626',
  success:   '#10b981',
  pdfRed:    '#B71C1C',
};

// ─── Category config ──────────────────────────────────────────────────────
const CAT_MAP: Record<string, { name: string; color: string }> = {
  development:    { name: 'Development',    color: Colors.categories.development    },
  health:         { name: 'Health',         color: Colors.categories.health         },
  education:      { name: 'Education',      color: Colors.categories.education      },
  agriculture:    { name: 'Agriculture',    color: Colors.categories.agriculture    },
  employment:     { name: 'Employment',     color: Colors.categories.employment     },
  social_welfare: { name: 'Social Welfare', color: Colors.categories.social_welfare },
  tax_billing:    { name: 'Tax & Billing',  color: Colors.categories.tax_billing    },
  election:       { name: 'Election',       color: Colors.categories.election       },
  meeting:        { name: 'Meeting',        color: Colors.categories.meeting        },
  general:        { name: 'General',        color: Colors.categories.general        },
};
const getCat = (id: string) => CAT_MAP[id] ?? CAT_MAP.general;

const PRI_MAP: Record<string, { label: string }> = {
  high:   { label: 'High Priority' },
  medium: { label: 'Normal'        },
  low:    { label: 'General'       },
};
const getPri = (p: string) => PRI_MAP[p] ?? PRI_MAP.low;

// ─── File helpers ─────────────────────────────────────────────────────────
type FileType = 'jpg' | 'png' | 'pdf' | 'doc' | 'docx' | 'unknown';

const getFileType = (url = '', fileName = ''): FileType => {
  const ext = (fileName || url).split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg'].includes(ext)) return 'jpg';
  if (ext === 'png')  return 'png';
  if (ext === 'pdf')  return 'pdf';
  if (ext === 'doc')  return 'doc';
  if (ext === 'docx') return 'docx';
  return 'unknown';
};

const cloudThumb = (url: string, w = 1200, h = 700) =>
  url.includes('cloudinary.com')
    ? url.replace('/upload/', `/upload/c_fill,w_${w},h_${h},q_auto:good,f_auto/`)
    : url;

const cloudPdfThumb = (url: string): string => {
  if (!url.includes('cloudinary.com')) return '';
  return url
    .replace(/\.[^/.]+$/, '')
    .replace('/upload/', '/upload/pg_1,w_1200,h_700,c_fill,q_auto:good,f_jpg/') + '.jpg';
};

const FILE_CFG: Record<FileType, {
  color: string; bg: string; label: string; short: string;
  mimeType: string; UTI: string;
}> = {
  jpg:     { color: '#1565C0', bg: '#E3F2FD', label: 'Photo',    short: 'Photo',    mimeType: 'image/jpeg',         UTI: 'public.jpeg'    },
  png:     { color: '#1565C0', bg: '#E3F2FD', label: 'Photo',    short: 'Photo',    mimeType: 'image/png',          UTI: 'public.png'     },
  pdf:     { color: P.pdfRed,  bg: '#FFEBEE', label: 'Document', short: 'PDF',      mimeType: 'application/pdf',    UTI: 'com.adobe.pdf'  },
  doc:     { color: '#1A237E', bg: '#E8EAF6', label: 'Document', short: 'DOC',      mimeType: 'application/msword', UTI: 'public.data'    },
  docx:    { color: '#1A237E', bg: '#E8EAF6', label: 'Document', short: 'DOCX',     mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', UTI: 'public.data' },
  unknown: { color: '#37474F', bg: '#ECEFF1', label: 'File',     short: 'File',     mimeType: 'application/octet-stream', UTI: 'public.data' },
};

// ─── Download helpers ─────────────────────────────────────────────────────
async function downloadToCache(
  remoteUrl: string, fileName: string, onProgress: (p: number) => void,
): Promise<string> {
  const dest = FileSystem.cacheDirectory + fileName;
  const info = await FileSystem.getInfoAsync(dest);
  if (info.exists) { onProgress(1); return dest; }
  const task = FileSystem.createDownloadResumable(
    remoteUrl, dest, {},
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (totalBytesExpectedToWrite > 0)
        onProgress(totalBytesWritten / totalBytesExpectedToWrite);
    },
  );
  const result = await task.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');
  onProgress(1);
  return result.uri;
}

async function saveToDevice(localUri: string, ft: FileType): Promise<void> {
  if (ft === 'jpg' || ft === 'png') {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') throw new Error('Gallery permission denied');
    await MediaLibrary.saveToLibraryAsync(localUri);
  } else {
    const ok = await Sharing.isAvailableAsync();
    if (!ok) throw new Error('Sharing not available');
    await Sharing.shareAsync(localUri, {
      mimeType: FILE_CFG[ft].mimeType, dialogTitle: 'Save to Files', UTI: FILE_CFG[ft].UTI,
    });
  }
}

async function shareFile(
  localUri: string, ft: FileType, title: string, description: string,
): Promise<void> {
  const ok = await Sharing.isAvailableAsync();
  if (ok) {
    if (Platform.OS === 'android') {
      await Share.share({ title, message: `${title}\n\n${description}` });
      await Sharing.shareAsync(localUri, {
        mimeType: FILE_CFG[ft].mimeType, dialogTitle: title, UTI: FILE_CFG[ft].UTI,
      });
    } else {
      await Sharing.shareAsync(localUri, {
        mimeType: FILE_CFG[ft].mimeType, dialogTitle: title, UTI: FILE_CFG[ft].UTI,
      });
    }
  } else {
    await Share.share({ title, message: `${title}\n\n${description}` });
  }
}

// ─── Progress overlay ─────────────────────────────────────────────────────
type DlPhase = 'downloading' | 'saving' | 'done' | 'error';
interface DlState { active: boolean; progress: number; phase: DlPhase; message: string; }

const ProgressOverlay = ({
  state, accentColor, onDismiss,
}: { state: DlState; accentColor: string; onDismiss(): void }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: state.progress, duration: 260, useNativeDriver: false,
    }).start();
  }, [state.progress]);

  if (!state.active) return null;
  const pct   = Math.round(state.progress * 100);
  const isDone = state.phase === 'done';
  const isErr  = state.phase === 'error';

  return (
    <View style={OV.backdrop}>
      <View style={OV.card}>
        <View style={[OV.cardHead, {
          backgroundColor: isErr ? Colors.error : isDone ? Colors.success : accentColor,
        }]}>
          <Text style={OV.cardHeadTxt}>
            {isErr ? 'Something went wrong'
              : isDone ? 'All done!'
              : state.phase === 'saving' ? 'Saving…'
              : 'Downloading…'}
          </Text>
        </View>
        <View style={OV.cardBody}>
          <Text style={OV.msg} numberOfLines={3}>{state.message}</Text>
          {!isDone && !isErr && (
            <>
              <View style={OV.track}>
                <Animated.View style={[OV.fill, {
                  backgroundColor: accentColor,
                  width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]} />
              </View>
              <Text style={[OV.pct, { color: accentColor }]}>{pct}%</Text>
            </>
          )}
          {(isDone || isErr) && (
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                OV.btn,
                { backgroundColor: isErr ? Colors.error : Colors.success },
                pressed && { opacity: .8 },
              ]}>
              <Text style={OV.btnTxt}>{isDone ? 'OK' : 'Close'}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Viewer shell ─────────────────────────────────────────────────────────
const ViewerShell = ({
  visible, accentColor, title, fileLabel,
  onClose, onShare, onDownload, children,
}: {
  visible: boolean; accentColor: string; title: string; fileLabel: string;
  onClose(): void; onShare(): void; onDownload(): void; children: React.ReactNode;
}) => (
  <Modal visible={visible} animationType="slide" statusBarTranslucent>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor={accentColor} />
      <View style={[VM.header, { backgroundColor: accentColor }]}>
        <Pressable onPress={onClose} style={({ pressed }) => [VM.backBtn, pressed && { opacity: .6 }]}>
          <Text style={VM.backBtnTxt}>← Back</Text>
        </Pressable>
        <Text style={VM.fileLabel}>{fileLabel}</Text>
        <Text style={VM.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <View style={VM.footer}>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [VM.btn, VM.btnOutline, pressed && { opacity: .7 }]}>
          <Text style={VM.btnOutlineTxt}>Share</Text>
        </Pressable>
        <Pressable
          onPress={onDownload}
          style={({ pressed }) => [VM.btn, { backgroundColor: accentColor }, pressed && { opacity: .8 }]}>
          <Text style={VM.btnTxt}>Save to Device</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  </Modal>
);

const LoaderView = ({ color }: { color: string }) => (
  <View style={VM.loader}>
    <ActivityIndicator size="large" color={color} />
    <Text style={[VM.loaderTxt, { color }]}>Opening…</Text>
  </View>
);

const PdfViewer = ({ visible, url, title, onClose, onShare, onDownload }: {
  visible: boolean; url: string; title: string;
  onClose(): void; onShare(): void; onDownload(): void;
}) => (
  <ViewerShell visible={visible} accentColor={P.pdfRed} title={title} fileLabel="Document"
    onClose={onClose} onShare={onShare} onDownload={onDownload}>
    <WebView
      source={{ uri: `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true` }}
      style={{ flex: 1 }} startInLoadingState
      renderLoading={() => <LoaderView color={P.pdfRed} />}
    />
  </ViewerShell>
);

const DocViewer = ({ visible, url, fileName, noticeTitle, onClose, onShare, onDownload }: {
  visible: boolean; url: string; fileName: string; noticeTitle: string;
  onClose(): void; onShare(): void; onDownload(): void;
}) => {
  const ft  = getFileType(url, fileName);
  const cfg = FILE_CFG[ft];
  return (
    <ViewerShell visible={visible} accentColor={cfg.color} title={fileName || noticeTitle} fileLabel={cfg.label}
      onClose={onClose} onShare={onShare} onDownload={onDownload}>
      <WebView
        source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` }}
        style={{ flex: 1, backgroundColor: '#fff' }} startInLoadingState
        renderLoading={() => <LoaderView color={cfg.color} />}
      />
    </ViewerShell>
  );
};

const ImageViewer = ({ visible, url, title, onClose, onShare, onDownload }: {
  visible: boolean; url: string; title: string;
  onClose(): void; onShare(): void; onDownload(): void;
}) => {
  const cfg = FILE_CFG[getFileType(url)];
  return (
    <ViewerShell visible={visible} accentColor={cfg.color} title={title} fileLabel={cfg.label}
      onClose={onClose} onShare={onShare} onDownload={onDownload}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1, backgroundColor: '#000',
          justifyContent: 'center', alignItems: 'center', minHeight: height * 0.7,
        }}
        maximumZoomScale={4} minimumZoomScale={1} bouncesZoom>
        <Image
          source={{ uri: cloudThumb(url, 2400, 2400) }}
          style={{ width, height: width * 1.3 }}
          resizeMode="contain"
        />
      </ScrollView>
    </ViewerShell>
  );
};

// ─── Attachment card ──────────────────────────────────────────────────────
const AttachmentCard = ({ notice, onView }: { notice: Notice; onView(): void }) => {
  const [imgErr, setImgErr] = useState(false);
  if (!notice.fileUrl) return null;

  const ft  = getFileType(notice.fileUrl, notice.fileName ?? '');
  const cfg = FILE_CFG[ft];
  const isImg = ft === 'jpg' || ft === 'png';
  const isPdf = ft === 'pdf';

  if (isImg && !imgErr) {
    return (
      <Pressable onPress={onView} style={({ pressed }) => [AC.wrap, pressed && { opacity: .88 }]}>
        <Image
          source={{ uri: cloudThumb(notice.fileUrl!) }}
          style={AC.img} resizeMode="cover"
          onError={() => setImgErr(true)}
        />
        <View style={[AC.imgFooter, { backgroundColor: cfg.color }]}>
          <Text style={AC.imgFooterTxt}>Tap to view full photo</Text>
        </View>
      </Pressable>
    );
  }

  if (isPdf) {
    return (
      <Pressable onPress={onView} style={({ pressed }) => [AC.wrap, pressed && { opacity: .88 }]}>
        {/* Thumbnail zone */}
        <View style={[AC.thumbZone, { backgroundColor: '#fff5f5' }]}>
          {/* Stylised paper doc illustration */}
          <View style={AC.docIllust}>
            <View style={AC.docBody}>
              <View style={AC.docCorner} />
              <View style={{ gap: 5, paddingHorizontal: 10, paddingTop: 18 }}>
                <View style={[AC.docLine, { width: '70%' }]} />
                <View style={[AC.docLine, { width: '90%', opacity: .55 }]} />
                <View style={[AC.docLine, { width: '55%', opacity: .3  }]} />
                <View style={[AC.docLine, { width: '80%', opacity: .55 }]} />
                <View style={[AC.docLine, { width: '65%', opacity: .3  }]} />
              </View>
            </View>
            <View style={AC.pdfBadge}><Text style={AC.pdfBadgeTxt}>PDF</Text></View>
          </View>
          {/* File info */}
          <View style={AC.thumbInfo}>
            <Text style={AC.thumbName} numberOfLines={2}>{notice.fileName ?? 'Document.pdf'}</Text>
            <Text style={AC.thumbMeta}>Document · Tap to open</Text>
          </View>
        </View>
        {/* Action row */}
        <View style={AC.actionRow}>
          <View style={[AC.actionIconBox, { backgroundColor: '#fff0f0' }]}>
            <View style={{ width: 14, height: 16, borderWidth: 1.5, borderColor: P.pdfRed, borderRadius: 3 }}>
              <View style={{ position: 'absolute', top: 3, left: 2, right: 2, height: 1.5, backgroundColor: P.pdfRed }} />
              <View style={{ position: 'absolute', top: 6, left: 2, right: 4, height: 1.5, backgroundColor: P.pdfRed, opacity: .6 }} />
              <View style={{ position: 'absolute', top: 9, left: 2, right: 2, height: 1.5, backgroundColor: P.pdfRed, opacity: .35 }} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={AC.actionLabel}>Open document</Text>
            <Text style={AC.actionSub}>Tap to view PDF</Text>
          </View>
          <View style={[AC.chevronBox, { borderColor: P.border }]}>
            <Text style={{ fontSize: 14, color: P.pdfRed, fontWeight: '700' }}>›</Text>
          </View>
        </View>
      </Pressable>
    );
  }

  // DOC / other
  return (
    <Pressable onPress={onView} style={({ pressed }) => [AC.wrap, pressed && { opacity: .85 }]}>
      <View style={[AC.thumbZone, { backgroundColor: cfg.bg }]}>
        <View style={[AC.docTypeBox, { backgroundColor: cfg.color }]}>
          <Text style={AC.docTypeBoxTxt}>{cfg.short}</Text>
        </View>
        <View style={AC.thumbInfo}>
          <Text style={AC.thumbName} numberOfLines={2}>{notice.fileName ?? notice.title}</Text>
          <Text style={AC.thumbMeta}>{cfg.label} · Tap to open</Text>
        </View>
      </View>
      <View style={AC.actionRow}>
        <View style={{ flex: 1 }}>
          <Text style={AC.actionLabel}>Open {cfg.label.toLowerCase()}</Text>
          <Text style={AC.actionSub}>Tap to view</Text>
        </View>
        <View style={[AC.chevronBox, { borderColor: P.border }]}>
          <Text style={{ fontSize: 14, color: cfg.color, fontWeight: '700' }}>›</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────
export default function NoticeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice]   = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [pdfModal, setPdfModal] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const [imgModal, setImgModal] = useState(false);
  const [dl, setDl] = useState<DlState>({
    active: false, progress: 0, phase: 'downloading', message: '',
  });

  // Staggered entry animations
  const fade0  = useRef(new Animated.Value(0)).current;
  const fade1  = useRef(new Animated.Value(0)).current;
  const fade2  = useRef(new Animated.Value(0)).current;
  const slide0 = useRef(new Animated.Value(20)).current;
  const slide1 = useRef(new Animated.Value(20)).current;
  const slide2 = useRef(new Animated.Value(20)).current;

  useEffect(() => { if (id) fetchNotice(); }, [id]);

  const animIn = (fade: Animated.Value, slide: Animated.Value, delay: number) =>
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, delay, useNativeDriver: true }),
    ]);

  const fetchNotice = async () => {
    try {
      setLoading(true); setError(null);
      const data = await apiService.fetchNoticeById(id as string);
      setNotice(data);
      Animated.stagger(100, [
        animIn(fade0, slide0, 0),
        animIn(fade1, slide1, 0),
        animIn(fade2, slide2, 0),
      ]).start();
    } catch {
      setError('Could not load this notice. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSafeName = useCallback(() => {
    if (!notice) return 'file';
    const ft  = getFileType(notice.fileUrl ?? '', notice.fileName ?? '');
    const raw = notice.fileName ?? `notice_${(notice as any)._id ?? id}.${ft}`;
    return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
  }, [notice, id]);

  const handleDownload = useCallback(async () => {
    if (!notice?.fileUrl) return;
    const ft   = getFileType(notice.fileUrl, notice.fileName ?? '');
    const name = getSafeName();
    setDl({ active: true, progress: 0, phase: 'downloading', message: `Downloading: ${notice.fileName ?? 'file'}` });
    try {
      const local = await downloadToCache(notice.fileUrl, name, p =>
        setDl(prev => ({ ...prev, progress: p })));
      setDl(prev => ({ ...prev, phase: 'saving', message: 'Saving to your device…' }));
      await saveToDevice(local, ft);
      setDl(prev => ({
        ...prev, phase: 'done', progress: 1,
        message: ft === 'jpg' || ft === 'png'
          ? 'Photo saved to your Gallery'
          : 'Document saved. Check your Files app.',
      }));
    } catch (e: any) {
      setDl(prev => ({ ...prev, phase: 'error', message: e?.message ?? 'Download failed. Try again.' }));
    }
  }, [notice, getSafeName]);

  const handleShare = useCallback(async () => {
    if (!notice) return;
    if (!notice.fileUrl) {
      await Share.share({ title: notice.title, message: `${notice.title}\n\n${notice.description}` });
      return;
    }
    const ft   = getFileType(notice.fileUrl, notice.fileName ?? '');
    const name = getSafeName();
    setDl({ active: true, progress: 0, phase: 'downloading', message: 'Preparing to share…' });
    try {
      const local = await downloadToCache(notice.fileUrl, name, p =>
        setDl(prev => ({ ...prev, progress: p })));
      setDl(prev => ({ ...prev, active: false }));
      await shareFile(local, ft, notice.title, notice.description ?? '');
    } catch (e: any) {
      setDl(prev => ({ ...prev, phase: 'error', message: e?.message ?? 'Could not share. Try again.' }));
    }
  }, [notice, getSafeName]);

  const showFileModal = () => {
    if (!notice?.fileUrl) return;
    const ft = getFileType(notice.fileUrl, notice.fileName ?? '');
    if (ft === 'jpg' || ft === 'png') setImgModal(true);
    else if (ft === 'pdf') setPdfModal(true);
    else setDocModal(true);
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={S.center}>
        <StatusBar barStyle="dark-content" backgroundColor={P.bg} />
        <ActivityIndicator size="large" color={P.brown700} />
        <Text style={S.loadTxt}>Loading notice…</Text>
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error || !notice) {
    return (
      <View style={S.center}>
        <StatusBar barStyle="dark-content" backgroundColor={P.bg} />
        <View style={S.errCircle}><Text style={S.errCircleTxt}>!</Text></View>
        <Text style={S.errTitle}>Notice not found</Text>
        <Text style={S.errDesc}>{error ?? 'This notice could not be loaded.'}</Text>
        <Pressable
          onPress={fetchNotice}
          style={({ pressed }) => [S.retryBtn, pressed && { opacity: .8 }]}>
          <Text style={S.retryTxt}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  const cat      = getCat(notice.category);
  const pri      = getPri((notice as any).priority ?? 'low');
  const ft       = notice.fileUrl ? getFileType(notice.fileUrl, notice.fileName ?? '') : 'unknown';
  const cfg      = FILE_CFG[ft];
  const hasFile  = !!notice.fileUrl;
  const isPdf    = ft === 'pdf';
  const isDoc    = ft === 'doc' || ft === 'docx';
  const isImg    = ft === 'jpg' || ft === 'png';
  const isUrgent = (notice as any).priority === 'high';

  // Avatar initials
  const nameWords = (notice.createdBy?.name ?? '').trim().split(/\s+/);
  const initials  = nameWords.length >= 2
    ? `${nameWords[0][0]}${nameWords[nameWords.length - 1][0]}`.toUpperCase()
    : (nameWords[0]?.[0] ?? '?').toUpperCase();

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.heroDeep} />

      {/* Progress overlay */}
      <ProgressOverlay
        state={dl}
        accentColor={hasFile ? cfg.color : cat.color}
        onDismiss={() => setDl(prev => ({ ...prev, active: false }))}
      />

      {/* Viewers */}
      {isPdf && notice.fileUrl && (
        <PdfViewer visible={pdfModal} url={notice.fileUrl} title={notice.fileName ?? notice.title}
          onClose={() => setPdfModal(false)} onShare={handleShare} onDownload={handleDownload} />
      )}
      {isDoc && notice.fileUrl && (
        <DocViewer visible={docModal} url={notice.fileUrl}
          fileName={notice.fileName ?? ''} noticeTitle={notice.title}
          onClose={() => setDocModal(false)} onShare={handleShare} onDownload={handleDownload} />
      )}
      {isImg && notice.fileUrl && (
        <ImageViewer visible={imgModal} url={notice.fileUrl} title={notice.fileName ?? notice.title}
          onClose={() => setImgModal(false)} onShare={handleShare} onDownload={handleDownload} />
      )}

      {/* ═══════════ HERO ═══════════ */}
      <View style={S.hero}>
        {/* Decorative circles */}
        <View style={S.deco1} />
        <View style={S.deco2} />
        <View style={S.deco3} />

        {/* Nav bar */}
        <View style={[S.nav, { paddingTop: Platform.OS === 'ios' ? 52 : 36 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [S.navBack, pressed && { opacity: .65 }]}>
            <Text style={S.navBackTxt}>← Back</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={({ pressed }) => [S.navDots, pressed && { opacity: .65 }]}>
            <Text style={S.navDotsTxt}>•••</Text>
          </Pressable>
        </View>

        <Animated.View style={{ opacity: fade0, transform: [{ translateY: slide0 }] }}>
          {/* Urgent pill */}
          {isUrgent && (
            <View style={S.urgentPill}>
              <View style={S.urgentDot} />
              <Text style={S.urgentTxt}>Urgent — Immediate Action Required</Text>
            </View>
          )}

          {/* Chip row */}
          <View style={S.chips}>
            <View style={S.chip}>
              <Text style={S.chipTxt}>{cat.name}</Text>
            </View>
            <View style={[S.chip, S.chipGhost]}>
              <Text style={[S.chipTxt, { color: 'rgba(255,255,255,.75)' }]}>
                {formatLongDate(notice.createdAt)}
              </Text>
            </View>
            {isUrgent && (
              <View style={[S.chip, { backgroundColor: P.urgent }]}>
                <Text style={S.chipTxt}>High Priority</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={S.heroTitle}>{notice.title}</Text>

          {/* Author card inside hero */}
          {(notice.createdBy?.name || notice.createdBy?.department) && (
            <View style={S.heroAuthor}>
              <View style={S.heroAvatar}>
                <Text style={S.heroAvatarTxt}>{initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={S.heroAuthorLabel}>Posted by</Text>
                {notice.createdBy?.name && (
                  <Text style={S.heroAuthorName} numberOfLines={1}>{notice.createdBy.name}</Text>
                )}
                {notice.createdBy?.department && (
                  <Text style={S.heroAuthorDept}>{notice.createdBy.department}</Text>
                )}
              </View>
              <View style={S.activeDot} />
            </View>
          )}
        </Animated.View>

        {/* SVG wave cutout */}
        <View style={S.waveWrap} pointerEvents="none">
          <Svg
            width={width} height={40}
            viewBox={`0 0 ${width} 40`}
            preserveAspectRatio="none">
            <Path
              d={`M0 40 L0 24 Q${width * 0.13} 4 ${width * 0.28} 17 Q${width * 0.5} 32 ${width * 0.68} 13 Q${width * 0.86} 0 ${width} 16 L${width} 40 Z`}
              fill={P.bg}
            />
          </Svg>
        </View>
      </View>

      {/* ═══════════ SCROLL BODY ═══════════ */}
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}>

        <Animated.View style={{ opacity: fade1, transform: [{ translateY: slide1 }] }}>
          {/* Stat cards row */}
          <View style={S.statRow}>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Date</Text>
              <Text style={S.statVal}>{formatLongDate(notice.createdAt)}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Category</Text>
              <Text style={[S.statVal, { color: cat.color }]}>{cat.name}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statLabel}>Priority</Text>
              <Text style={[S.statVal, {
                color: isUrgent ? P.urgent : (notice as any).priority === 'medium' ? Colors.warning : Colors.success,
              }]}>{pri.label}</Text>
            </View>
          </View>

          {/* Description card */}
          <View style={S.card}>
            <View style={S.cardHeader}>
              <View style={S.cardAccent} />
              <Text style={S.cardHeaderTxt}>Notice Details</Text>
            </View>
            <Text style={S.descTxt}>{notice.description}</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade2, transform: [{ translateY: slide2 }] }}>
          {/* Attachment */}
          {hasFile && (
            <View style={S.attachSection}>
              <Text style={S.attachLabel}>Attached File</Text>
              <AttachmentCard notice={notice} onView={showFileModal} />
            </View>
          )}
          <View style={{ height: 16 }} />
        </Animated.View>

      </ScrollView>

      {/* ═══════════ ACTION BAR ═══════════ */}
      <View style={S.bar}>
        {/* Share */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [S.barSecBtn, pressed && { opacity: .7 }]}>
          <Text style={S.barSecIcon}>↗</Text>
          <Text style={S.barSecTxt}>Share</Text>
        </Pressable>

        {/* Download */}
        {hasFile && (
          <Pressable
            onPress={handleDownload}
            style={({ pressed }) => [S.barSecBtn, pressed && { opacity: .7 }]}>
            <Text style={S.barSecIcon}>↓</Text>
            <Text style={S.barSecTxt}>Save</Text>
          </Pressable>
        )}

        {/* Primary CTA */}
        {hasFile ? (
          <Pressable
            onPress={showFileModal}
            style={({ pressed }) => [
              S.barPriBtn,
              { backgroundColor: P.brown800 },
              pressed && { opacity: .85 },
            ]}>
            <Text style={S.barPriTxt}>{isImg ? 'View Photo' : 'Open File'}</Text>
            <View style={S.barPriArrow}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>›</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              S.barPriBtn,
              { backgroundColor: P.brown800 },
              pressed && { opacity: .85 },
            ]}>
            <Text style={S.barPriTxt}>Share Notice</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Progress overlay styles ──────────────────────────────────────────────
const OV = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,.55)', justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  card: {
    width: width - 40, backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden',
    elevation: 24, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: .22, shadowRadius: 20,
  },
  cardHead:    { paddingHorizontal: 22, paddingVertical: 16 },
  cardHeadTxt: { fontSize: 19, fontWeight: '800', color: '#fff' },
  cardBody:    { padding: 22, gap: 16 },
  msg:         { fontSize: 16, color: P.textPri, lineHeight: 26, fontWeight: '500' },
  track:       { height: 10, backgroundColor: P.border, borderRadius: 5, overflow: 'hidden' },
  fill:        { height: '100%', borderRadius: 5 },
  pct:         { fontSize: 30, fontWeight: '900', textAlign: 'right' },
  btn:         { paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnTxt:      { fontSize: 18, fontWeight: '800', color: '#fff' },
});

// ─── Viewer shell styles ──────────────────────────────────────────────────
const VM = StyleSheet.create({
  header:       { paddingHorizontal: 18, paddingVertical: 16 },
  backBtn:      { marginBottom: 6 },
  backBtnTxt:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  fileLabel:    { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: 1.2 },
  headerTitle:  { fontSize: 17, fontWeight: '800', color: '#fff', lineHeight: 24 },
  footer: {
    flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: P.border,
  },
  btn:          { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnOutline:   { borderWidth: 2, borderColor: P.brown600, backgroundColor: '#faf7f5' },
  btnOutlineTxt:{ fontSize: 16, fontWeight: '700', color: P.brown800 },
  btnTxt:       { fontSize: 16, fontWeight: '800', color: '#fff' },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', gap: 16,
  },
  loaderTxt: { fontSize: 16, fontWeight: '600', color: P.textSec },
});

// ─── Attachment card styles ───────────────────────────────────────────────
const AC = StyleSheet.create({
  wrap: {
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: P.border, backgroundColor: P.surface,
    elevation: 2, shadowColor: P.heroDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: .06, shadowRadius: 8,
  },
  img:        { width: '100%', height: 220 },
  imgFooter:  { paddingHorizontal: 18, paddingVertical: 15, alignItems: 'center' },
  imgFooterTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

  thumbZone: {
    height: 130, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 18, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: P.borderSoft,
  },
  docIllust: { position: 'relative', width: 52, flexShrink: 0 },
  docBody: {
    width: 52, height: 64, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#ffcdd2', borderRadius: 8, overflow: 'hidden',
  },
  docCorner: {
    position: 'absolute', top: 0, right: 0,
    width: 0, height: 0,
    borderLeftWidth: 14, borderLeftColor: 'transparent',
    borderTopWidth: 14, borderTopColor: '#ffcdd2',
  },
  docLine:    { height: 3, backgroundColor: '#ef9999', borderRadius: 2 },
  pdfBadge: {
    position: 'absolute', top: -8, right: -10,
    backgroundColor: P.pdfRed, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  pdfBadgeTxt: { fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: .5 },

  thumbInfo:  { flex: 1, gap: 3 },
  thumbName:  { fontSize: 14, fontWeight: '800', color: P.textPri, lineHeight: 20 },
  thumbMeta:  { fontSize: 12, color: P.textMuted },

  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  actionIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  actionLabel: { fontSize: 14, fontWeight: '700', color: P.textPri },
  actionSub:   { fontSize: 12, color: P.textMuted, marginTop: 1 },
  chevronBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#faf7f5', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  docTypeBox: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docTypeBoxTxt: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: .5 },
});

// ─── Main screen styles ───────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.bg },

  // Center states
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: P.bg, padding: 32, gap: 20,
  },
  loadTxt:      { fontSize: 17, fontWeight: '600', color: P.textSec },
  errCircle:    { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  errCircleTxt: { fontSize: 40, fontWeight: '900', color: '#fff' },
  errTitle:     { fontSize: 22, fontWeight: '800', color: P.textPri, textAlign: 'center' },
  errDesc:      { fontSize: 16, color: P.textSec, textAlign: 'center', lineHeight: 26 },
  retryBtn:     { backgroundColor: P.brown700, paddingHorizontal: 40, paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  retryTxt:     { fontSize: 18, fontWeight: '800', color: '#fff' },

  // Hero
  hero:  { backgroundColor: P.heroDeep, paddingBottom: 36, overflow: 'hidden', position: 'relative' },
  deco1: {
    position: 'absolute', right: -28, top: 10, width: 160, height: 160, borderRadius: 80,
    borderWidth: 28, borderColor: 'rgba(255,255,255,.04)',
  },
  deco2: {
    position: 'absolute', right: 30, top: 80, width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(192,160,127,.12)',
  },
  deco3: {
    position: 'absolute', left: -20, bottom: 20, width: 100, height: 100, borderRadius: 50,
    borderWidth: 18, borderColor: 'rgba(255,255,255,.03)',
  },

  // Nav
  nav: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 20 },
  navBack: {
    backgroundColor: 'rgba(255,255,255,.1)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.16)', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  navBackTxt:  { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,.92)' },
  navDots: {
    backgroundColor: 'rgba(255,255,255,.1)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.16)', borderRadius: 12,
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  navDotsTxt: { fontSize: 13, fontWeight: '900', color: 'rgba(255,255,255,.85)', letterSpacing: 2 },

  // Urgent
  urgentPill: {
    marginHorizontal: 18, marginBottom: 14,
    backgroundColor: P.urgent, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  urgentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', flexShrink: 0 },
  urgentTxt: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: .4, flex: 1 },

  // Chips
  chips:    { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 18, marginBottom: 14 },
  chip:     { backgroundColor: 'rgba(192,160,127,.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  chipGhost:{ backgroundColor: 'rgba(255,255,255,.1)', borderColor: 'rgba(255,255,255,.12)' },
  chipTxt:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,.92)', letterSpacing: .3 },

  // Hero title
  heroTitle: {
    fontSize: 21, fontWeight: '900', color: '#fff',
    lineHeight: 30, letterSpacing: -.2,
    paddingHorizontal: 18, marginBottom: 18,
  },

  // Hero author
  heroAuthor: {
    marginHorizontal: 18, backgroundColor: 'rgba(255,255,255,.09)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,.13)',
    borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  heroAvatar:      { width: 42, height: 42, borderRadius: 12, backgroundColor: P.brown600, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroAvatarTxt:   { fontSize: 16, fontWeight: '800', color: '#fff' },
  heroAuthorLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: .6, marginBottom: 2 },
  heroAuthorName:  { fontSize: 15, fontWeight: '800', color: '#fff' },
  heroAuthorDept:  { fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 1 },
  activeDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: P.success, flexShrink: 0 },

  // Wave
  waveWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 130 },

  // Stat cards
  statRow:  { flexDirection: 'row', gap: 9, marginBottom: 13 },
  statCard: { flex: 1, backgroundColor: P.surface, borderRadius: 16, borderWidth: 1.5, borderColor: P.border, padding: 13 },
  statLabel:{ fontSize: 10, fontWeight: '700', color: P.brown600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 5 },
  statVal:  { fontSize: 13, fontWeight: '800', color: P.textPri, lineHeight: 18 },

  // Content card
  card: {
    backgroundColor: P.surface, borderRadius: 20,
    borderWidth: 1.5, borderColor: P.border,
    marginBottom: 13, overflow: 'hidden',
    elevation: 2, shadowColor: P.heroDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: .06, shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: P.borderSoft,
  },
  cardAccent:    { width: 3, height: 18, backgroundColor: P.brown600, borderRadius: 2 },
  cardHeaderTxt: { fontSize: 14, fontWeight: '800', color: P.textPri },
  descTxt: { fontSize: 17, color: P.textPri, lineHeight: 30, fontWeight: '400', padding: 18 },

  // Attachment
  attachSection: { marginBottom: 13 },
  attachLabel:   { fontSize: 14, fontWeight: '800', color: P.textPri, marginBottom: 10 },

  // Action bar
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: P.surface, paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1.5, borderTopColor: P.border,
    gap: 10,
    elevation: 20, shadowColor: P.heroDeep,
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: .1, shadowRadius: 14,
  },
  barSecBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: P.border,
    backgroundColor: '#faf7f5', gap: 4,
  },
  barSecIcon: { fontSize: 18, color: P.brown700 },
  barSecTxt:  { fontSize: 11, fontWeight: '800', color: P.brown700 },
  barPriBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 16,
    elevation: 4, shadowColor: P.heroDeep,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: .2, shadowRadius: 8,
  },
  barPriTxt:   { fontSize: 15, fontWeight: '900', color: '#fff' },
  barPriArrow: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,.18)',
    alignItems: 'center', justifyContent: 'center',
  },
});