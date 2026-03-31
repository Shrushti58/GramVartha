// app/notice/[id].tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  Image, Share, Animated, StatusBar, Platform,
  Modal, SafeAreaView, Dimensions, Pressable, TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatLongDate } from '../../utils/format';
import { Notice } from '../../types/Notice';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// ─── Category config ──────────────────────────────────────────────────────────
const getCategoryStyles = (category: string, colors: any, t: any) => {
  const catMap: Record<string, { name: string; color: string; bg: string; bgDark: string }> = {
    development:    { name: t('development_category'),    color: '#1976D2', bg: '#E3F2FD', bgDark: '#0D2137' },
    health:         { name: t('health_category'),         color: '#C0392B', bg: '#FEE9E7', bgDark: '#3D1A17' },
    education:      { name: t('education_category'),      color: '#7B1FA2', bg: '#F3E5F5', bgDark: '#2A0D36' },
    agriculture:    { name: t('agriculture_category'),    color: '#2E7D32', bg: '#E8F5E9', bgDark: '#1B3A1E' },
    employment:     { name: t('employment_category'),     color: '#E65100', bg: '#FFF3E0', bgDark: '#3A1A00' },
    social_welfare: { name: t('social_welfare_category'), color: '#C2185B', bg: '#FCE4EC', bgDark: '#3D1025' },
    tax_billing:    { name: t('tax_billing_category'),    color: '#00796B', bg: '#E0F2F1', bgDark: '#003D36' },
    election:       { name: t('election_category'),       color: '#E64A19', bg: '#FBE9E7', bgDark: '#3D1A10' },
    meeting:        { name: t('meeting_category'),        color: '#303F9F', bg: '#E8EAF6', bgDark: '#0D1229' },
    general:        { name: t('general_category'),        color: '#455A64', bg: '#ECEFF1', bgDark: '#151C1F' },
  };
  return catMap[category] ?? catMap.general;
};

const getPriorityStyles = (priority: string, t: any) => {
  const priMap: Record<string, { label: string; dot: string; bg: string; bgDark: string; fg: string; fgDark: string }> = {
    high:   { label: t('high_priority'),    dot: '#F44336', bg: '#FFEBEE', bgDark: '#3D1A1A', fg: '#C0392B', fgDark: '#EF5350' },
    medium: { label: t('normal_priority'),  dot: '#2196F3', bg: '#E3F2FD', bgDark: '#0D2137', fg: '#1976D2', fgDark: '#64B5F6' },
    low:    { label: t('general_priority'), dot: '#4CAF50', bg: '#E8F5E9', bgDark: '#1B3A1E', fg: '#2E7D32', fgDark: '#81C784' },
  };
  return priMap[priority] ?? priMap.low;
};

// ─── File helpers ─────────────────────────────────────────────────────────────
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

const FILE_CONFIGS: Record<FileType, {
  colorLight: string; colorDark: string;
  bg: string; bgDark: string;
  label: string; short: string;
  mimeType: string; UTI: string;
}> = {
  jpg:     { colorLight: '#1565C0', colorDark: '#64B5F6', bg: '#E3F2FD', bgDark: '#0D2137', label: 'Photo',    short: 'Photo', mimeType: 'image/jpeg',         UTI: 'public.jpeg'   },
  png:     { colorLight: '#1565C0', colorDark: '#64B5F6', bg: '#E3F2FD', bgDark: '#0D2137', label: 'Photo',    short: 'Photo', mimeType: 'image/png',          UTI: 'public.png'    },
  pdf:     { colorLight: '#B71C1C', colorDark: '#EF5350', bg: '#FFEBEE', bgDark: '#3D1A1A', label: 'Document', short: 'PDF',   mimeType: 'application/pdf',    UTI: 'com.adobe.pdf' },
  doc:     { colorLight: '#1A237E', colorDark: '#7986CB', bg: '#E8EAF6', bgDark: '#0D1229', label: 'Document', short: 'DOC',   mimeType: 'application/msword', UTI: 'public.data'   },
  docx:    { colorLight: '#1A237E', colorDark: '#7986CB', bg: '#E8EAF6', bgDark: '#0D1229', label: 'Document', short: 'DOCX',  mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', UTI: 'public.data' },
  unknown: { colorLight: '#37474F', colorDark: '#78909C', bg: '#ECEFF1', bgDark: '#151C1F', label: 'File',     short: 'File',  mimeType: 'application/octet-stream', UTI: 'public.data' },
};

const getFileCfg = (ft: FileType, isDark: boolean) => {
  const c = FILE_CONFIGS[ft];
  return { ...c, color: isDark ? c.colorDark : c.colorLight, activeBg: isDark ? c.bgDark : c.bg };
};

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Format speed for display
const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ─── Download helpers with progress using legacy API ─────────────────────────
async function downloadToCache(
  remoteUrl: string, 
  fileName: string, 
  onProgress: (progress: number, downloadedBytes?: number, totalBytes?: number, speed?: number) => void
): Promise<string> {
  const dest = FileSystemLegacy.cacheDirectory + fileName;
  const info = await FileSystemLegacy.getInfoAsync(dest);
  
  // Type-safe check for existing file
  if (info.exists) {
    // Only access size if the file exists and has the size property
    const fileSize = info.exists && 'size' in info ? (info as any).size : 0;
    onProgress(1, fileSize, fileSize, 0); 
    return dest; 
  }
  
  let startTime = Date.now();
  let lastBytes = 0;
  
  const callback = (downloadProgress: FileSystemLegacy.DownloadProgressData) => {
    const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
    if (totalBytesExpectedToWrite > 0) {
      const progress = totalBytesWritten / totalBytesExpectedToWrite;
      const now = Date.now();
      const timeElapsed = (now - startTime) / 1000;
      const bytesDownloaded = totalBytesWritten - lastBytes;
      const speed = timeElapsed > 0 ? bytesDownloaded / timeElapsed : 0;
      
      onProgress(progress, totalBytesWritten, totalBytesExpectedToWrite, speed);
      
      // Reset for next calculation
      startTime = now;
      lastBytes = totalBytesWritten;
    }
  };
  
  const downloadResumable = FileSystemLegacy.createDownloadResumable(
    remoteUrl,
    dest,
    {},
    callback
  );
  
  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');
  
  const finalInfo = await FileSystemLegacy.getInfoAsync(dest);
  // Type-safe access to size property
  const finalSize = finalInfo.exists && 'size' in finalInfo ? (finalInfo as any).size : 0;
  onProgress(1, finalSize, finalSize, 0);
  return result.uri;
}

async function saveToDevice(localUri: string, ft: FileType, cfg: any): Promise<void> {
  if (ft === 'jpg' || ft === 'png') {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') throw new Error('Gallery permission denied');
    await MediaLibrary.saveToLibraryAsync(localUri);
  } else {
    const ok = await Sharing.isAvailableAsync();
    if (!ok) throw new Error('Sharing not available');
    await Sharing.shareAsync(localUri, { mimeType: cfg.mimeType, dialogTitle: 'Save to Files', UTI: cfg.UTI });
  }
}

// Enhanced share function with notice content
async function shareFileWithNotice(localUri: string, ft: FileType, notice: Notice, cfg: any, t: any) {
  const shareTitle = `📢 ${notice.title}`;
  const shareMessage = `${notice.description || 'No description provided'}\n\n` +
    `📅 ${formatLongDate(notice.createdAt)}\n` +
    `🏷️ Category: ${notice.category}\n` +
    `📎 Attached: ${notice.fileName || 'Document'}\n\n` +
    `View full notice for more details.`;

  const ok = await Sharing.isAvailableAsync();
  
  if (ok) {
    if (Platform.OS === 'android') {
      await Share.share({ title: shareTitle, message: shareMessage });
      await Sharing.shareAsync(localUri, { 
        mimeType: cfg.mimeType, 
        dialogTitle: notice.fileName || notice.title, 
        UTI: cfg.UTI 
      });
    } else {
      await Sharing.shareAsync(localUri, { 
        mimeType: cfg.mimeType, 
        dialogTitle: notice.fileName || notice.title, 
        UTI: cfg.UTI 
      });
      await Share.share({ title: shareTitle, message: shareMessage });
    }
  } else {
    await Share.share({ title: shareTitle, message: shareMessage });
  }
}

// ─── Progress overlay with detailed feedback ─────────────────────────────────────────
type DlPhase = 'downloading' | 'saving' | 'done' | 'error' | 'preparing';
interface DlState { 
  active: boolean; 
  progress: number; 
  phase: DlPhase; 
  message: string;
  fileName?: string;
  downloadedBytes?: number;
  totalBytes?: number;
  speed?: number;
}

const ProgressOverlay = ({ state, accentColor, onDismiss, colors, isDark }: {
  state: DlState; accentColor: string; onDismiss(): void; colors: any; isDark: boolean;
}) => {
  const barAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state.active) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      // Reset animations when hidden
      scaleAnim.setValue(0.93);
      fadeAnim.setValue(0);
    }
  }, [state.active]);

  useEffect(() => {
    Animated.timing(barAnim, { toValue: state.progress, duration: 260, useNativeDriver: false }).start();
  }, [state.progress]);

  if (!state.active) return null;

  const isDone = state.phase === 'done';
  const isErr  = state.phase === 'error';
  const isSave = state.phase === 'saving';
  const isPrep = state.phase === 'preparing';
  const pct    = Math.round(state.progress * 100);
  
  // Format file size info
  const sizeInfo = state.downloadedBytes && state.totalBytes 
    ? `${formatFileSize(state.downloadedBytes)} / ${formatFileSize(state.totalBytes)}`
    : '';
  const speedInfo = state.speed ? formatSpeed(state.speed) : '';

  const cardBg  = isDark ? colors.surface || '#1e2535' : '#fff';
  const headBg  = isErr
    ? (isDark ? '#3D1A1A'                     : '#FFEBEE')
    : isDone
    ? (isDark ? '#1B3A1E'                     : '#E8F5E9')
    : (isDark ? `${colors.primary[500]}15`    : colors.primary[50]);
  const headClr = isErr ? (isDark ? '#EF5350' : '#C0392B') : isDone ? (isDark ? '#81C784' : '#2E7D32') : (isDark ? colors.primary[300] : colors.primary[700]);
  const iconBg  = isErr ? '#EF5350' : isDone ? '#4CAF50' : accentColor;
  const trackBg = isDark ? `${colors.primary[500]}20` : colors.primary[100];
  const textClr = isDark ? colors.primary[300] : colors.text?.secondary || '#475569';
  const msgClr  = isDark ? colors.primary[100] : colors.text?.primary   || '#1e293b';
  const borderC = isDark ? `${colors.primary[500]}25` : 'rgba(0,0,0,0.06)';

  return (
    <Modal transparent visible={state.active} animationType="none" statusBarTranslucent>
      <Animated.View style={[OV.backdrop, { opacity: fadeAnim, backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.65)' }]}>
        <Animated.View style={[
          OV.card,
          { backgroundColor: cardBg, borderColor: borderC, borderWidth: 1, transform: [{ scale: scaleAnim }], shadowColor: isDark ? colors.primary[900] : '#000' },
        ]}>
          <View style={[OV.cardHead, { backgroundColor: headBg }]}>
            <View style={[OV.headIcon, { backgroundColor: iconBg }]}>
              <Text style={OV.headIconTxt}>
                {isErr ? '✕' : isDone ? '✓' : isPrep ? '⏳' : isSave ? '💾' : '↓'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[OV.headTitle, { color: headClr }]}>
                {isErr ? 'Something went wrong' : 
                 isDone ? 'All done!' : 
                 isPrep ? 'Preparing...' : 
                 isSave ? 'Saving to device…' : 
                 'Downloading file…'}
              </Text>
              {!isDone && !isErr && !isPrep && (
                <Text style={[OV.headSub, { color: textClr }]}>{pct}% complete</Text>
              )}
            </View>
          </View>

          <View style={OV.cardBody}>
            <Text style={[OV.msg, { color: msgClr }]} numberOfLines={3}>{state.message}</Text>
            
            {!isDone && !isErr && !isPrep && (
              <View style={{ gap: 12 }}>
                {/* Progress bar */}
                <View style={[OV.track, { backgroundColor: trackBg }]}>
                  <Animated.View style={[OV.fill, {
                    backgroundColor: accentColor,
                    width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  }]} />
                </View>
                
                {/* Download details */}
                <View style={OV.detailsRow}>
                  <View style={OV.detailItem}>
                    <Text style={[OV.detailLabel, { color: textClr }]}>Progress</Text>
                    <Text style={[OV.detailValue, { color: accentColor }]}>{pct}%</Text>
                  </View>
                  {sizeInfo && (
                    <View style={OV.detailItem}>
                      <Text style={[OV.detailLabel, { color: textClr }]}>File Size</Text>
                      <Text style={[OV.detailValue, { color: msgClr }]} numberOfLines={1}>{sizeInfo}</Text>
                    </View>
                  )}
                  {speedInfo && (
                    <View style={OV.detailItem}>
                      <Text style={[OV.detailLabel, { color: textClr }]}>Speed</Text>
                      <Text style={[OV.detailValue, { color: msgClr }]}>{speedInfo}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {isPrep && (
              <View style={OV.prepareContainer}>
                <ActivityIndicator size="large" color={accentColor} />
                <Text style={[OV.prepareText, { color: textClr }]}>This may take a moment...</Text>
              </View>
            )}
            
            {(isDone || isErr) && (
              <TouchableOpacity onPress={onDismiss} style={[OV.btn, { backgroundColor: isErr ? '#EF5350' : '#4CAF50' }]} activeOpacity={0.8}>
                <Text style={OV.btnTxt}>{isDone ? 'Great, thanks!' : 'Close'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Action sheet ─────────────────────────────────────────────────────────────
const ViewerActionSheet = ({
  visible, onClose, onShare, onDownload, colors, isDark, accentColor, fileName,
}: {
  visible: boolean; onClose(): void; onShare(): void; onDownload(): void;
  colors: any; isDark: boolean; accentColor: string; fileName: string;
}) => {
  const slideAnim    = useRef(new Animated.Value(320)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim,    { toValue: 0,   tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,    { toValue: 320, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const sheetBg  = isDark ? colors.surface || '#1e2535' : '#fff';
  const borderC  = isDark ? `${colors.primary[500]}25`  : colors.border;
  const handleC  = isDark ? `${colors.primary[500]}30`  : 'rgba(0,0,0,0.12)';
  const titleClr = isDark ? colors.primary[100] : colors.text?.primary   || '#1e293b';
  const subClr   = isDark ? colors.primary[300] : colors.text?.secondary  || '#64748b';

  const Row = ({ icon, iconBg, label, sub, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={AS.row} activeOpacity={0.72}>
      <View style={[AS.rowIcon, { backgroundColor: iconBg }]}>
        <Text style={AS.rowIconTxt}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[AS.rowLabel, { color: titleClr }]}>{label}</Text>
        <Text style={[AS.rowSub,   { color: subClr   }]}>{sub}</Text>
      </View>
      <Text style={[AS.rowChev, { color: subClr }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={AS.root} pointerEvents="box-none">
        <Animated.View style={[AS.backdrop, { opacity: backdropAnim, backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)' }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[AS.sheet, { backgroundColor: sheetBg, borderColor: borderC, borderWidth: 1, transform: [{ translateY: slideAnim }] }]}>
          <View style={[AS.handle, { backgroundColor: handleC }]} />
          <Text style={[AS.sheetTitle, { color: titleClr }]} numberOfLines={1}>{fileName}</Text>
          <Text style={[AS.sheetSub,   { color: subClr   }]}>What would you like to do?</Text>
          <View style={[AS.divider, { backgroundColor: borderC }]} />
          <Row
            icon="↗" label="Share File" sub="Send via Messages, Mail, or other apps"
            iconBg={isDark ? `${colors.primary[500]}20` : colors.primary[50]}
            onPress={() => { onClose(); setTimeout(onShare, 300); }}
          />
          <Row
            icon="↓" label="Save to Device" sub="Save to your Gallery or Files app"
            iconBg={isDark ? `${accentColor}22` : `${accentColor}18`}
            onPress={() => { onClose(); setTimeout(onDownload, 300); }}
          />
          <View style={[AS.divider, { backgroundColor: borderC }]} />
          <TouchableOpacity
            onPress={onClose}
            style={[AS.cancelBtn, {
              backgroundColor: isDark ? `${colors.primary[500]}10` : colors.primary[50],
              borderColor:     isDark ? `${colors.primary[500]}25` : colors.primary[100],
            }]}
            activeOpacity={0.75}
          >
            <Text style={[AS.cancelTxt, { color: isDark ? colors.primary[300] : colors.primary[700] }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ height: Platform.OS === 'ios' ? 24 : 8 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Viewer shell ─────────────────────────────────────────────────────────────
const ViewerShell = ({
  visible, accentColor, title, fileLabel,
  onClose, onShare, onDownload, children, colors, isDark,
}: {
  visible: boolean; accentColor: string; title: string; fileLabel: string;
  onClose(): void; onShare(): void; onDownload(): void;
  children: React.ReactNode; colors: any; isDark: boolean;
}) => {
  const [actionSheet, setActionSheet] = useState(false);

  const gradColors: [string, string] = isDark
    ? [colors.primary[800], colors.primary[900]]
    : [colors.primary[600], colors.primary[700]];
  const headerTextColor = isDark ? colors.primary[100] : '#fff';
  const headerSubColor  = isDark ? colors.primary[200] : 'rgba(255,255,255,0.8)';
  const backBtnBg       = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';
  const bodyBg          = isDark ? colors.background || '#0d1117' : '#f8fafc';
  const footerBg        = isDark ? colors.surface    || '#1e2535' : '#fff';
  const borderC         = isDark ? `${colors.primary[500]}25`     : colors.border;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={{ flex: 1, backgroundColor: bodyBg }}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[VM.header, { shadowColor: isDark ? colors.primary[900] : '#000' }]}
        >
          <View style={[VM.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
          <View style={[VM.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />
          <View style={VM.headerRow}>
            <TouchableOpacity onPress={onClose} style={[VM.navBtn, { backgroundColor: backBtnBg }]} activeOpacity={0.7}>
              <Text style={[VM.navBtnTxt, { color: headerTextColor }]}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={[VM.fileLabel,   { color: headerSubColor  }]}>{fileLabel}</Text>
              <Text style={[VM.headerTitle, { color: headerTextColor }]} numberOfLines={1}>{title}</Text>
            </View>
            <TouchableOpacity onPress={() => setActionSheet(true)} style={[VM.navBtn, { backgroundColor: backBtnBg }]} activeOpacity={0.7}>
              <Text style={[VM.navBtnTxt, { color: headerTextColor, letterSpacing: 2 }]}>•••</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ flex: 1, backgroundColor: bodyBg }}>{children}</View>

        <View style={[VM.footer, { backgroundColor: footerBg, borderTopColor: borderC }]}>
          <TouchableOpacity
            onPress={onShare}
            style={[VM.btn, VM.btnOutline, {
              borderColor:     isDark ? `${colors.primary[500]}40` : colors.primary[200],
              backgroundColor: isDark ? `${colors.primary[500]}10` : colors.primary[50],
            }]}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: 14, marginRight: 5 }}>↗</Text>
            <Text style={[VM.btnOutlineTxt, { color: isDark ? colors.primary[300] : colors.primary[700] }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDownload}
            style={[VM.btn, {
              backgroundColor: colors.primary[700],
              shadowColor: isDark ? colors.primary[900] : '#000',
              shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5,
            }]}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 14, color: '#fff', marginRight: 5 }}>↓</Text>
            <Text style={VM.btnTxt}>Save to Device</Text>
          </TouchableOpacity>
        </View>

        <ViewerActionSheet
          visible={actionSheet} onClose={() => setActionSheet(false)}
          onShare={onShare} onDownload={onDownload}
          colors={colors} isDark={isDark} accentColor={accentColor} fileName={title}
        />
      </SafeAreaView>
    </Modal>
  );
};

const LoaderView = ({ color, isDark, colors }: { color: string; isDark: boolean; colors: any }) => (
  <View style={[VM.loader, { backgroundColor: isDark ? colors.background || '#0d1117' : '#f8fafc' }]}>
    <ActivityIndicator size="large" color={color} />
    <Text style={[VM.loaderTxt, { color }]}>Opening…</Text>
  </View>
);

const PdfViewer = ({ visible, url, title, onClose, onShare, onDownload, colors, isDark }: {
  visible: boolean; url: string; title: string;
  onClose(): void; onShare(): void; onDownload(): void; colors: any; isDark: boolean;
}) => {
  const cfg = getFileCfg('pdf', isDark);
  return (
    <ViewerShell visible={visible} accentColor={cfg.color} title={title} fileLabel="PDF Document"
      onClose={onClose} onShare={onShare} onDownload={onDownload} colors={colors} isDark={isDark}>
      <WebView
        source={{ uri: `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true` }}
        style={{ flex: 1, backgroundColor: isDark ? '#0d1117' : '#fff' }}
        startInLoadingState renderLoading={() => <LoaderView color={cfg.color} isDark={isDark} colors={colors} />}
      />
    </ViewerShell>
  );
};

const DocViewer = ({ visible, url, fileName, noticeTitle, onClose, onShare, onDownload, colors, isDark }: {
  visible: boolean; url: string; fileName: string; noticeTitle: string;
  onClose(): void; onShare(): void; onDownload(): void; colors: any; isDark: boolean;
}) => {
  const ft  = getFileType(url, fileName);
  const cfg = getFileCfg(ft, isDark);
  return (
    <ViewerShell visible={visible} accentColor={cfg.color} title={fileName || noticeTitle} fileLabel={cfg.label}
      onClose={onClose} onShare={onShare} onDownload={onDownload} colors={colors} isDark={isDark}>
      <WebView
        source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` }}
        style={{ flex: 1, backgroundColor: isDark ? '#0d1117' : '#fff' }}
        startInLoadingState renderLoading={() => <LoaderView color={cfg.color} isDark={isDark} colors={colors} />}
      />
    </ViewerShell>
  );
};

const ImageViewer = ({ visible, url, title, onClose, onShare, onDownload, colors, isDark }: {
  visible: boolean; url: string; title: string;
  onClose(): void; onShare(): void; onDownload(): void; colors: any; isDark: boolean;
}) => {
  const cfg = getFileCfg('jpg', isDark);
  return (
    <ViewerShell visible={visible} accentColor={cfg.color} title={title} fileLabel="Image"
      onClose={onClose} onShare={onShare} onDownload={onDownload} colors={colors} isDark={isDark}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', minHeight: height * 0.7 }}
        maximumZoomScale={4} minimumZoomScale={1} bouncesZoom
      >
        <Image source={{ uri: cloudThumb(url, 2400, 2400) }} style={{ width, height: width * 1.3 }} resizeMode="contain" />
      </ScrollView>
    </ViewerShell>
  );
};

// ─── Attachment card ──────────────────────────────────────────────────────────
const AttachmentCard = ({ notice, onView, colors, isDark }: {
  notice: Notice; onView(): void; colors: any; isDark: boolean;
}) => {
  const [imgErr, setImgErr] = useState(false);
  if (!notice.fileUrl) return null;

  const ft   = getFileType(notice.fileUrl, notice.fileName ?? '');
  const cfg  = getFileCfg(ft, isDark);
  const isImg= ft === 'jpg' || ft === 'png';
  const isPdf= ft === 'pdf';

  const cardBg  = isDark ? colors.surface || '#1e2535' : '#fff';
  const borderC = isDark ? `${colors.primary[500]}25` : colors.border;
  const thumbBg = cfg.activeBg;
  const textPri = isDark ? colors.primary[100] : colors.text?.primary   || '#1e293b';
  const textSec = isDark ? colors.primary[300] : colors.text?.secondary  || '#64748b';
  const chevBg  = isDark ? `${colors.primary[500]}10` : colors.primary[50];

  if (isImg && !imgErr) {
    return (
      <TouchableOpacity onPress={onView} style={[AC.wrap, { borderColor: borderC, backgroundColor: cardBg }]} activeOpacity={0.85}>
        <Image source={{ uri: cloudThumb(notice.fileUrl!) }} style={AC.img} resizeMode="cover" onError={() => setImgErr(true)} />
        <View style={[AC.imgFooter, { backgroundColor: isDark ? 'rgba(0,0,0,0.65)' : cfg.color }]}>
          <Text style={[AC.imgFooterTxt, { color: isDark ? cfg.color : '#fff' }]}>Tap to view full photo</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (isPdf) {
    return (
      <TouchableOpacity onPress={onView} style={[AC.wrap, { borderColor: borderC, backgroundColor: cardBg }]} activeOpacity={0.85}>
        <View style={[AC.thumbZone, { backgroundColor: thumbBg, borderBottomColor: borderC }]}>
          <View style={AC.docIllust}>
            <View style={[AC.docBody, { borderColor: isDark ? `${cfg.color}40` : '#ffcdd2', backgroundColor: isDark ? `${cfg.color}10` : '#fff' }]}>
              <View style={[AC.docCorner, { borderTopColor: isDark ? `${cfg.color}40` : '#ffcdd2' }]} />
              <View style={{ gap: 5, paddingHorizontal: 10, paddingTop: 18 }}>
                {[1, 0.55, 0.3, 0.55, 0.3].map((op, i) => (
                  <View key={i} style={[AC.docLine, { backgroundColor: cfg.color, opacity: op }]} />
                ))}
              </View>
            </View>
            <View style={[AC.pdfBadge, { backgroundColor: cfg.color }]}>
              <Text style={AC.pdfBadgeTxt}>PDF</Text>
            </View>
          </View>
          <View style={AC.thumbInfo}>
            <Text style={[AC.thumbName, { color: textPri }]} numberOfLines={2}>{notice.fileName ?? 'Document.pdf'}</Text>
            <Text style={[AC.thumbMeta, { color: textSec }]}>PDF Document · Tap to open</Text>
          </View>
        </View>
        <View style={[AC.actionRow, { borderTopColor: borderC }]}>
          <View style={[AC.actionIconBox, { backgroundColor: isDark ? `${cfg.color}15` : '#fff0f0' }]}>
            <View style={{ width: 14, height: 16, borderWidth: 1.5, borderColor: cfg.color, borderRadius: 3 }}>
              {[3, 6, 9].map((top, i) => (
                <View key={i} style={{ position: 'absolute', top, left: 2, right: i === 1 ? 4 : 2, height: 1.5, backgroundColor: cfg.color, opacity: [1, 0.6, 0.35][i] }} />
              ))}
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[AC.actionLabel, { color: textPri }]}>Open document</Text>
            <Text style={[AC.actionSub,   { color: textSec }]}>Tap to view PDF</Text>
          </View>
          <View style={[AC.chevronBox, { borderColor: borderC, backgroundColor: chevBg }]}>
            <Text style={{ fontSize: 14, color: cfg.color, fontWeight: '700' }}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onView} style={[AC.wrap, { borderColor: borderC, backgroundColor: cardBg }]} activeOpacity={0.85}>
      <View style={[AC.thumbZone, { backgroundColor: thumbBg, borderBottomColor: borderC }]}>
        <View style={[AC.docTypeBox, { backgroundColor: cfg.color }]}>
          <Text style={AC.docTypeBoxTxt}>{cfg.short}</Text>
        </View>
        <View style={AC.thumbInfo}>
          <Text style={[AC.thumbName, { color: textPri }]} numberOfLines={2}>{notice.fileName ?? notice.title}</Text>
          <Text style={[AC.thumbMeta, { color: textSec }]}>{cfg.label} · Tap to open</Text>
        </View>
      </View>
      <View style={[AC.actionRow, { borderTopColor: borderC }]}>
        <View style={{ flex: 1 }}>
          <Text style={[AC.actionLabel, { color: textPri }]}>Open {cfg.label.toLowerCase()}</Text>
          <Text style={[AC.actionSub,   { color: textSec }]}>Tap to view</Text>
        </View>
        <View style={[AC.chevronBox, { borderColor: borderC, backgroundColor: chevBg }]}>
          <Text style={{ fontSize: 14, color: cfg.color, fontWeight: '700' }}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NoticeDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { t }              = useTranslation();
  const { id }             = useLocalSearchParams<{ id: string }>();

  const [notice,   setNotice]   = useState<Notice | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [pdfModal, setPdfModal] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const [imgModal, setImgModal] = useState(false);
  const [dl, setDl]             = useState<DlState>({ active: false, progress: 0, phase: 'downloading', message: '' });

  const fade0  = useRef(new Animated.Value(0)).current;
  const fade1  = useRef(new Animated.Value(0)).current;
  const fade2  = useRef(new Animated.Value(0)).current;
  const slide0 = useRef(new Animated.Value(18)).current;
  const slide1 = useRef(new Animated.Value(18)).current;
  const slide2 = useRef(new Animated.Value(18)).current;

  useEffect(() => { if (id) fetchNotice(); }, [id]);

  const animIn = (fade: Animated.Value, slide: Animated.Value, delay: number) =>
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 360, delay, useNativeDriver: true }),
    ]);

  const fetchNotice = async () => {
    try {
      setLoading(true); setError(null);
      const data = await apiService.fetchNoticeById(id as string);
      setNotice(data);
      Animated.stagger(90, [animIn(fade0, slide0, 0), animIn(fade1, slide1, 0), animIn(fade2, slide2, 0)]).start();
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
    const cfg  = getFileCfg(ft, isDark);
    const name = getSafeName();
    
    setDl({ 
      active: true, 
      progress: 0, 
      phase: 'preparing', 
      message: `Preparing to download ${notice.fileName ?? 'file'}...`,
      fileName: notice.fileName ?? 'file'
    });
    
    // Small delay to show preparing state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDl(prev => ({ 
      ...prev, 
      phase: 'downloading', 
      message: `Downloading: ${notice.fileName ?? 'file'}` 
    }));
    
    try {
      const local = await downloadToCache(
        notice.fileUrl, 
        name, 
        (progress, downloadedBytes, totalBytes, speed) => 
          setDl(prev => ({ 
            ...prev, 
            progress, 
            downloadedBytes, 
            totalBytes, 
            speed,
            message: `Downloading: ${Math.round(progress * 100)}% complete`
          }))
      );
      
      setDl(prev => ({ 
        ...prev, 
        phase: 'saving', 
        message: 'Saving to your device…' 
      }));
      
      await saveToDevice(local, ft, cfg);
      
      setDl(prev => ({ 
        ...prev, 
        phase: 'done', 
        progress: 1, 
        message: ft === 'jpg' || ft === 'png' 
          ? '✓ Photo saved to your Gallery' 
          : '✓ Document saved. Check your Files app.' 
      }));
    } catch (e: any) {
      setDl(prev => ({ 
        ...prev, 
        phase: 'error', 
        message: e?.message ?? 'Download failed. Please check your connection and try again.' 
      }));
    }
  }, [notice, getSafeName, isDark]);

  const handleShare = useCallback(async () => {
    if (!notice) return;
    
    // If no file attached, just share the notice content
    if (!notice.fileUrl) {
      const shareTitle = `📢 ${notice.title}`;
      const shareMessage = `${notice.description || 'No description provided'}\n\n` +
        `📅 ${formatLongDate(notice.createdAt)}\n` +
        `🏷️ Category: ${notice.category}\n` +
        `👤 Posted by: ${notice.createdBy?.name || 'Village Administration'}\n` +
        `🏢 Department: ${notice.createdBy?.department || 'Village Notice Board'}`;
      
      await Share.share({
        title: shareTitle,
        message: shareMessage,
      });
      return;
    }
    
    // For notices with files
    const ft = getFileType(notice.fileUrl, notice.fileName ?? '');
    const cfg = getFileCfg(ft, isDark);
    const name = getSafeName();
    
    setDl({ 
      active: true, 
      progress: 0, 
      phase: 'preparing', 
      message: 'Preparing file for sharing…',
      fileName: notice.fileName ?? 'file'
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDl(prev => ({ 
      ...prev, 
      phase: 'downloading', 
      message: `Preparing ${notice.fileName ?? 'file'} for sharing...` 
    }));
    
    try {
      const local = await downloadToCache(
        notice.fileUrl, 
        name, 
        (progress, downloadedBytes, totalBytes, speed) => 
          setDl(prev => ({ 
            ...prev, 
            progress, 
            downloadedBytes, 
            totalBytes, 
            speed,
            message: `Preparing: ${Math.round(progress * 100)}%`
          }))
      );
      
      setDl(prev => ({ ...prev, active: false }));
      await shareFileWithNotice(local, ft, notice, cfg, t);
    } catch (e: any) {
      setDl(prev => ({ 
        ...prev, 
        phase: 'error', 
        message: e?.message ?? 'Could not share. Please try again.' 
      }));
    }
  }, [notice, getSafeName, isDark, t]);

  const showFileModal = () => {
    if (!notice?.fileUrl) return;
    // Close any active download modal first
    if (dl.active) {
      setDl(prev => ({ ...prev, active: false }));
    }
    const ft = getFileType(notice.fileUrl, notice.fileName ?? '');
    if (ft === 'jpg' || ft === 'png') setImgModal(true);
    else if (ft === 'pdf') setPdfModal(true);
    else setDocModal(true);
  };

  // ── Derived header colours ──────────────────────────────────────────────
  const headerBg        = isDark ? colors.primary[900]  : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100]  : '#fff';
  const headerSubColor  = isDark ? colors.primary[200]  : 'rgba(255,255,255,0.8)';
  const headerEyeColor  = isDark ? colors.primary[300]  : 'rgba(255,255,255,0.6)';
  const backBtnBg       = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  // ── Surface tokens ────────────────────────────────────────────────────────
  const bg       = colors.background;
  const surface  = isDark ? colors.surface || '#1e2535' : '#fff';
  const borderC  = isDark ? `${colors.primary[500]}25`  : colors.border;
  const textPri  = isDark ? colors.primary[100] : colors.text?.primary   || '#1e293b';
  const textSec  = isDark ? colors.primary[300] : colors.text?.secondary  || '#64748b';

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[S.loadingWrap, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={[S.loadingText, { color: textSec }]}>Loading notice…</Text>
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !notice) {
    return (
      <View style={[S.root, { backgroundColor: bg }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />
        <View style={S.emptyWrap}>
          <View style={[S.emptyIconBox, {
            backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50],
            borderColor:     isDark ? `${colors.primary[500]}30` : colors.primary[200],
          }]}>
            <Text style={S.emptyGlyph}>⚠️</Text>
          </View>
          <Text style={[S.emptyTitle, { color: textPri }]}>Notice not found</Text>
          <Text style={[S.emptyDesc,  { color: textSec }]}>{error ?? 'This notice could not be loaded.'}</Text>
          <TouchableOpacity onPress={fetchNotice} style={[S.emptyBtn, { backgroundColor: colors.primary[700] }]} activeOpacity={0.82}>
            <Text style={S.emptyBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const cat      = getCategoryStyles(notice.category, colors, t);
  const pri      = getPriorityStyles((notice as any).priority ?? 'low', t);
  const ft       = notice.fileUrl ? getFileType(notice.fileUrl, notice.fileName ?? '') : 'unknown';
  const cfg      = getFileCfg(ft, isDark);
  const hasFile  = !!notice.fileUrl;
  const isPdf    = ft === 'pdf';
  const isDoc    = ft === 'doc' || ft === 'docx';
  const isImg    = ft === 'jpg' || ft === 'png';
  const isUrgent = (notice as any).priority === 'high';

  const nameWords = (notice.createdBy?.name ?? '').trim().split(/\s+/);
  const initials  = nameWords.length >= 2
    ? `${nameWords[0][0]}${nameWords[nameWords.length - 1][0]}`.toUpperCase()
    : (nameWords[0]?.[0] ?? '?').toUpperCase();

  const avatarBg = isDark ? `${colors.primary[500]}20` : colors.primary[50];
  const avatarFg = isDark ? colors.primary[200]         : colors.primary[700];

  return (
    <View style={[S.root, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* Progress overlay - rendered at root level so it appears above everything */}
      <ProgressOverlay state={dl} accentColor={hasFile ? cfg.color : cat.color}
        onDismiss={() => setDl(prev => ({ ...prev, active: false }))} colors={colors} isDark={isDark} />

      {/* Viewers */}
      {isPdf && notice.fileUrl && (
        <PdfViewer visible={pdfModal} url={notice.fileUrl} title={notice.fileName ?? notice.title}
          onClose={() => setPdfModal(false)} onShare={handleShare} onDownload={handleDownload} colors={colors} isDark={isDark} />
      )}
      {isDoc && notice.fileUrl && (
        <DocViewer visible={docModal} url={notice.fileUrl} fileName={notice.fileName ?? ''} noticeTitle={notice.title}
          onClose={() => setDocModal(false)} onShare={handleShare} onDownload={handleDownload} colors={colors} isDark={isDark} />
      )}
      {isImg && notice.fileUrl && (
        <ImageViewer visible={imgModal} url={notice.fileUrl} title={notice.fileName ?? notice.title}
          onClose={() => setImgModal(false)} onShare={handleShare} onDownload={handleDownload} colors={colors} isDark={isDark} />
      )}

      {/* HERO — LinearGradient */}
      <LinearGradient
        colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={S.headerShell}
      >
        <View style={[S.accentCircle1, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)' }]} />
        <View style={[S.accentCircle2, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)' }]} />

        {/* Nav */}
        <View style={[S.headerNavRow, { paddingTop: Platform.OS === 'ios' ? 54 : 36 }]}>
          <TouchableOpacity onPress={() => router.back()} style={[S.backBtn, { backgroundColor: backBtnBg }]} activeOpacity={0.7}>
            <Text style={[S.backBtnTxt, { color: headerTextColor }]}>←</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[S.headerTitleBlock, { opacity: fade0, transform: [{ translateY: slide0 }] }]}>
          <Text style={[S.headerEyebrow, { color: headerEyeColor }]}>VILLAGE NOTICES</Text>

          {/* Urgent pill */}
          {isUrgent && (
            <View style={[S.urgentPill, { backgroundColor: isDark ? '#3D1A1A' : '#B71C1C' }]}>
              <View style={[S.urgentDot, { backgroundColor: isDark ? '#EF5350' : '#fff' }]} />
              <Text style={[S.urgentTxt, { color: isDark ? '#EF5350' : '#fff' }]}>Urgent — Immediate Action Required</Text>
            </View>
          )}

          {/* Pills row */}
          <View style={S.pillRow}>
            <View style={[S.heroPill, { backgroundColor: isDark ? `${colors.primary[500]}25` : 'rgba(255,255,255,0.18)', borderColor: isDark ? `${colors.primary[400]}30` : 'rgba(255,255,255,0.3)' }]}>
              <Text style={[S.heroPillTxt, { color: headerTextColor }]}>{cat.name}</Text>
            </View>
            <View style={[S.heroPill, { backgroundColor: isDark ? `${colors.primary[500]}15` : 'rgba(255,255,255,0.12)', borderColor: isDark ? `${colors.primary[400]}20` : 'rgba(255,255,255,0.2)' }]}>
              <Text style={[S.heroPillTxt, { color: headerSubColor }]}>{formatLongDate(notice.createdAt)}</Text>
            </View>
            {isUrgent && (
              <View style={[S.heroPill, { backgroundColor: isDark ? '#3D1A1A' : '#B71C1C', borderColor: 'transparent' }]}>
                <Text style={[S.heroPillTxt, { color: isDark ? '#EF5350' : '#fff' }]}>High Priority</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={[S.headerTitle, { color: headerTextColor }]}>{notice.title}</Text>

          {/* Breadcrumb */}
          <View style={S.headerBreadcrumb}>
            <View style={[S.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
            <Text style={[S.headerSub, { color: headerSubColor }]}>
              {notice.createdBy?.department || 'Village Notice Board'}
            </Text>
          </View>

          {/* Author card */}
          {(notice.createdBy?.name || notice.createdBy?.department) && (
            <View style={[S.heroAuthor, {
              backgroundColor: isDark ? `${colors.primary[500]}15` : 'rgba(255,255,255,0.12)',
              borderColor:     isDark ? `${colors.primary[400]}20` : 'rgba(255,255,255,0.2)',
            }]}>
              <View style={[S.heroAvatar, { backgroundColor: avatarBg }]}>
                <Text style={[S.heroAvatarTxt, { color: avatarFg }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[S.heroAuthorLabel, { color: headerEyeColor }]}>Posted by</Text>
                {notice.createdBy?.name && (
                  <Text style={[S.heroAuthorName, { color: headerTextColor }]} numberOfLines={1}>{notice.createdBy.name}</Text>
                )}
                {notice.createdBy?.department && (
                  <Text style={[S.heroAuthorDept, { color: headerSubColor }]}>{notice.createdBy.department}</Text>
                )}
              </View>
              <View style={[S.activeDot, { backgroundColor: isDark ? colors.primary[300] : '#A5D6A7' }]} />
            </View>
          )}
        </Animated.View>

        {/* Wave */}
        <View style={S.waveWrap} pointerEvents="none">
          <Svg width={width} height={40} viewBox={`0 0 ${width} 40`} preserveAspectRatio="none">
            <Path
              d={`M0 40 L0 24 Q${width * 0.13} 4 ${width * 0.28} 17 Q${width * 0.5} 32 ${width * 0.68} 13 Q${width * 0.86} 0 ${width} 16 L${width} 40 Z`}
              fill={bg}
            />
          </Svg>
        </View>
      </LinearGradient>

      {/* SCROLL BODY */}
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fade1, transform: [{ translateY: slide1 }] }}>
          
          {/* Stat row */}
          <View style={S.statRow}>
            {[
              {
                label: 'Date',
                value: formatLongDate(notice.createdAt),
                color: isDark ? '#EAEAEA' : colors.primary[700],
              },
              {
                label: 'Category',
                value: cat.name,
                color: isDark ? '#EAEAEA' : cat.color,
              },
              {
                label: 'Priority',
                value: pri.label,
                color: isUrgent
                  ? '#FF6B6B'
                  : (notice as any).priority === 'medium'
                  ? '#64B5F6'
                  : '#81C784',
              },
            ].map(({ label, value, color }) => (
              <View
                key={label}
                style={[
                  S.statCard,
                  { backgroundColor: surface, borderColor: borderC },
                ]}
              >
                <Text
                  style={[
                    S.statLabel,
                    { color: isDark ? '#A0A0A0' : colors.primary[600] },
                  ]}
                >
                  {label}
                </Text>

                <Text style={[S.statVal, { color }]}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Description card */}
          <View style={[S.card, { backgroundColor: surface, borderColor: borderC }]}>
            <View style={[S.cardHeader, { borderBottomColor: borderC }]}>
              <View
                style={[
                  S.cardAccent,
                  { backgroundColor: colors.primary[600] },
                ]}
              />
              <Text
                style={[
                  S.cardHeaderTxt,
                  { color: isDark ? '#FFFFFF' : textPri },
                ]}
              >
                Notice Details
              </Text>
            </View>

            <Text
              style={[
                S.descTxt,
                { color: isDark ? '#EAEAEA' : textPri },
              ]}
            >
              {notice.description}
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade2, transform: [{ translateY: slide2 }] }}>
          {hasFile && (
            <View style={S.attachSection}>
              <Text
                style={[
                  S.attachLabel,
                  { color: isDark ? '#EAEAEA' : textPri },
                ]}
              >
                Attached File
              </Text>

              <AttachmentCard
                notice={notice}
                onView={showFileModal}
                colors={colors}
                isDark={isDark}
              />
            </View>
          )}
          <View style={{ height: 16 }} />
        </Animated.View>
      </ScrollView>

      {/* ACTION BAR - Single share button for non-file notices */}
      <View
        style={[
          S.bar,
          {
            backgroundColor: isDark ? colors.surface || '#1e2535' : surface,
            borderTopColor: borderC,
          },
        ]}
      >
        {/* Share button - handles both file and non-file cases */}
        <TouchableOpacity
          onPress={handleShare}
          style={[
            S.barSecBtn,
            {
              borderColor: isDark ? `${colors.primary[500]}40` : colors.primary[200],
              backgroundColor: isDark ? `${colors.primary[500]}10` : colors.primary[50],
              flex: hasFile ? 1 : 2,
            },
          ]}
          activeOpacity={0.75}
        >
          <Text
            style={[
              S.barSecIcon,
              { color: isDark ? '#EAEAEA' : colors.primary[700] },
            ]}
          >
            ↗
          </Text>
          <Text
            style={[
              S.barSecTxt,
              { color: isDark ? '#EAEAEA' : colors.primary[700] },
            ]}
          >
            Share Notice
          </Text>
        </TouchableOpacity>

        {/* Save button - only show if file exists */}
        {hasFile && (
          <TouchableOpacity
            onPress={handleDownload}
            style={[
              S.barSecBtn,
              {
                borderColor: isDark ? `${colors.primary[500]}40` : colors.primary[200],
                backgroundColor: isDark ? `${colors.primary[500]}10` : colors.primary[50],
              },
            ]}
            activeOpacity={0.75}
          >
            <Text
              style={[
                S.barSecIcon,
                { color: isDark ? '#EAEAEA' : colors.primary[700] },
              ]}
            >
              ↓
            </Text>
            <Text
              style={[
                S.barSecTxt,
                { color: isDark ? '#EAEAEA' : colors.primary[700] },
              ]}
            >
              Save File
            </Text>
          </TouchableOpacity>
        )}

        {/* Primary CTA */}
        <TouchableOpacity
          onPress={hasFile ? showFileModal : handleShare}
          style={[
            S.barPriBtn,
            {
              backgroundColor: colors.primary[700],
              shadowColor: isDark ? colors.primary[900] : '#000',
              flex: hasFile ? 2 : 1.5,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[S.barPriTxt, { color: '#FFFFFF' }]}>
            {hasFile ? (isImg ? 'View Photo' : 'Open File') : 'Share Notice'}
          </Text>

          {hasFile && (
            <View
              style={[
                S.barPriArrow,
                {
                  backgroundColor: isDark
                    ? `${colors.primary[500]}40`
                    : 'rgba(255,255,255,0.2)',
                },
              ]}
            >
              <Text
                style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}
              >
                ›
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Overlay styles ───────────────────────────────────────────────────────────
const OV = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  card: {
    width: width - 40, borderRadius: 22, overflow: 'hidden',
    elevation: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20,
  },
  cardHead: { paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  headIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headIconTxt: { fontSize: 16, color: '#fff', fontWeight: '800' },
  headTitle: { fontSize: 16, fontWeight: '800' },
  headSub:   { fontSize: 12, marginTop: 2 },
  cardBody:  { padding: 20, gap: 14 },
  msg:       { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  track:     { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill:      { height: '100%', borderRadius: 4 },
  pct:       { fontSize: 26, fontWeight: '900', textAlign: 'right' },
  btn:       { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnTxt:    { fontSize: 15, fontWeight: '800', color: '#fff' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 11, fontWeight: '700' },
  prepareContainer: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  prepareSpinner: { width: 32, height: 32, borderWidth: 3, borderRadius: 16, borderColor: 'transparent', borderTopWidth: 3 },
  prepareText: { fontSize: 12, textAlign: 'center' },
});

// ─── Action sheet styles ──────────────────────────────────────────────────────
const AS = StyleSheet.create({
  root:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingTop: 14,
    elevation: 30, shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.18, shadowRadius: 24,
  },
  handle:     { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  sheetSub:   { fontSize: 12, marginBottom: 14 },
  divider:    { height: 1, marginVertical: 8 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12 },
  rowIcon:    { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowIconTxt: { fontSize: 18 },
  rowLabel:   { fontSize: 14, fontWeight: '700' },
  rowSub:     { fontSize: 11, marginTop: 2 },
  rowChev:    { fontSize: 20, fontWeight: '600' },
  cancelBtn:  { marginTop: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  cancelTxt:  { fontSize: 14, fontWeight: '700' },
});

// ─── Viewer shell styles ──────────────────────────────────────────────────────
const VM = StyleSheet.create({
  header: {
    paddingBottom: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 10,
  },
  accentCircle1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -60, right: -40 },
  accentCircle2: { position: 'absolute', width: 90,  height: 90,  borderRadius: 45, bottom: -20, left: 20 },
  headerRow: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 16, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  navBtn:      { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  navBtnTxt:   { fontSize: 18, fontWeight: '600' },
  fileLabel:   { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 2 },
  headerTitle: { fontSize: 14, fontWeight: '800', lineHeight: 20 },
  footer: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 18,
    borderTopWidth: 1,
  },
  btn:          { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 },
  btnOutline:   { borderWidth: 1.5 },
  btnOutlineTxt:{ fontSize: 13, fontWeight: '700' },
  btnTxt:       { fontSize: 13, fontWeight: '800', color: '#fff' },
  loader: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', gap: 14,
  },
  loaderTxt: { fontSize: 13, fontWeight: '600' },
});

// ─── Attachment card styles ───────────────────────────────────────────────────
const AC = StyleSheet.create({
  wrap: {
    borderRadius: 18, overflow: 'hidden', borderWidth: 1,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  img:          { width: '100%', height: 220 },
  imgFooter:    { paddingHorizontal: 18, paddingVertical: 14, alignItems: 'center' },
  imgFooterTxt: { fontSize: 13, fontWeight: '700' },
  thumbZone: {
    height: 126, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 16, paddingHorizontal: 20, borderBottomWidth: 1,
  },
  docIllust:    { position: 'relative', width: 50, flexShrink: 0 },
  docBody:      { width: 50, height: 62, borderWidth: 1.5, borderRadius: 8, overflow: 'hidden' },
  docCorner:    { position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderLeftWidth: 13, borderLeftColor: 'transparent', borderTopWidth: 13 },
  docLine:      { height: 3, borderRadius: 2 },
  pdfBadge:     { position: 'absolute', top: -8, right: -10, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  pdfBadgeTxt:  { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  thumbInfo:    { flex: 1, gap: 3 },
  thumbName:    { fontSize: 13, fontWeight: '800', lineHeight: 18 },
  thumbMeta:    { fontSize: 11 },
  actionRow:    { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  actionIconBox:{ width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel:  { fontSize: 13, fontWeight: '700' },
  actionSub:    { fontSize: 11, marginTop: 1 },
  chevronBox:   { width: 26, height: 26, borderRadius: 7, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  docTypeBox:   { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docTypeBoxTxt:{ fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
});

// ─── Main screen styles ─────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1 },

  // Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Empty / error
  emptyWrap:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36, gap: 10 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  emptyGlyph:   { fontSize: 30 },
  emptyTitle:   { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center' },
  emptyDesc:    { fontSize: 13, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
  emptyBtn: {
    marginTop: 8, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Header
  headerShell: {
    paddingBottom: 36, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 10,
  },
  accentCircle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -80,  right: -50 },
  accentCircle2: { position: 'absolute', width: 130, height: 130, borderRadius: 65,  bottom: -30, left: 30  },
  headerNavRow:  { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
  backBtn:       { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnTxt:    { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginBottom: 4 },
  headerTitle:   { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, lineHeight: 32 },
  headerBreadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3 },
  headerSub:     { fontSize: 12, fontWeight: '500' },

  urgentPill:  { marginTop: 10, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentDot:   { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  urgentTxt:   { fontSize: 11, fontWeight: '800', letterSpacing: 0.3, flex: 1 },

  pillRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  heroPill:    { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  heroPillTxt: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  heroAuthor: {
    marginTop: 14, borderWidth: 1, borderRadius: 14, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  heroAvatar:      { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroAvatarTxt:   { fontSize: 14, fontWeight: '800' },
  heroAuthorLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  heroAuthorName:  { fontSize: 13, fontWeight: '800' },
  heroAuthorDept:  { fontSize: 11, marginTop: 1 },
  activeDot:       { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },

  waveWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 14, paddingHorizontal: 14, paddingBottom: 130 },

  statRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  statCard:  { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12 },
  statLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  statVal:   { fontSize: 12, fontWeight: '800', lineHeight: 16 },

  card: {
    borderRadius: 18, borderWidth: 1, marginBottom: 10, overflow: 'hidden',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: 1,
  },
  cardAccent:    { width: 3, height: 16, borderRadius: 2 },
  cardHeaderTxt: { fontSize: 13, fontWeight: '800' },
  descTxt:       { fontSize: 15, lineHeight: 26, fontWeight: '400', padding: 15 },

  attachSection: { marginBottom: 10 },
  attachLabel:   { fontSize: 13, fontWeight: '800', marginBottom: 8 },

  // Action bar
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1, gap: 8,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 14,
  },
  barSecBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, gap: 3,
  },
  barSecIcon: { fontSize: 17 },
  barSecTxt:  { fontSize: 10, fontWeight: '800' },
  barPriBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    paddingVertical: 14, borderRadius: 12,
    elevation: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  barPriTxt:   { fontSize: 14, fontWeight: '900', color: '#fff' },
  barPriArrow: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
});