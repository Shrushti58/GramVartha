// app/complaints/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  StatusBar, Dimensions, TouchableOpacity, Image, Alert,
  Animated, Modal, Platform, UIManager, LayoutAnimation,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Helper functions ─────────────────────────────────────────────────────
const getTypeStyles = (type: string) => {
  const typeStyles: Record<string, any> = {
    issue: { bg: '#FEE9E7', bgDark: '#3D1A17', fg: '#C0392B', label: 'Issue', icon: '⚠️' },
    complaint: { bg: '#E8F5E9', bgDark: '#1B3A1E', fg: '#2E7D32', label: 'Complaint', icon: '📋' },
    suggestion: { bg: '#E3F2FD', bgDark: '#0D2137', fg: '#1976D2', label: 'Suggestion', icon: '💡' },
  };
  return typeStyles[type] || typeStyles.issue;
};

const getStatusStyles = (status: string) => {
  const statusStyles: Record<string, any> = {
    pending: { bg: '#FEF9E7', bgDark: '#342A05', fg: '#B7950B', dot: '#F1C40F', icon: '⏳', label: 'Pending', next: 'in-progress' },
    'in-progress': { bg: '#E3F2FD', bgDark: '#0D2137', fg: '#1976D2', dot: '#2196F3', icon: '🔧', label: 'In Progress', next: 'resolved' },
    resolved: { bg: '#E8F5E9', bgDark: '#1B3A1E', fg: '#2E7D32', dot: '#4CAF50', icon: '✅', label: 'Resolved', next: null },
    rejected: { bg: '#FFEBEE', bgDark: '#3D1A1A', fg: '#C0392B', dot: '#F44336', icon: '❌', label: 'Rejected', next: null },
  };
  return statusStyles[status] || statusStyles.pending;
};

// ─── Timeline component ───────────────────────────────────────────────────
const StatusTimeline = ({ status, colors, isDark }: any) => {
  const statuses = ['pending', 'in-progress', 'resolved'];
  const currentIndex = statuses.indexOf(status);

  return (
    <View style={styles.timelineContainer}>
      {statuses.map((s, idx) => {
        const isActive = idx <= currentIndex;
        const sta = getStatusStyles(s);
        return (
          <View key={s} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: isActive ? sta.dot : isDark ? colors.neutral[700] : colors.neutral[200],
                  borderColor: isActive ? sta.dot : colors.border,
                },
              ]}
            >
              {isActive && (
                <Ionicons name="checkmark" size={12} color="#fff" />
              )}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                {
                  color: isActive ? colors.text.primary : colors.text.muted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
            {idx < statuses.length - 1 && (
              <View
                style={[
                  styles.timelineConnector,
                  { backgroundColor: isActive ? sta.dot : colors.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

// ─── Detail row component ─────────────────────────────────────────────────
const DetailRow = ({ label, value, icon, colors, isDark }: any) => (
  <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
    <View style={styles.detailLabel}>
      {icon && <Ionicons name={icon} size={18} color={colors.text.secondary} style={{ marginRight: 10 }} />}
      <Text style={[styles.labelText, { color: colors.text.secondary }]}>{label}</Text>
    </View>
    <Text style={[styles.valueText, { color: colors.text.primary }]} numberOfLines={3}>
      {value || '—'}
    </Text>
  </View>
);

// ─── Info Card component ──────────────────────────────────────────────────
const InfoCard = ({ title, children, colors, isDark }: any) => (
  <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Text style={[styles.infoCardTitle, { color: colors.text.primary }]}>{title}</Text>
    <View style={styles.infoCardContent}>
      {children}
    </View>
  </View>
);

// ─── Image modal ──────────────────────────────────────────────────────────
const ImageViewer = ({ visible, imageUrl, onClose, colors }: any) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
        </Animated.View>
        <TouchableOpacity
          style={styles.closeImageBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ─── Main component ───────────────────────────────────────────────────────
export default function ComplaintDetailScreen() {
  const { colors, isDark } = useTheme();
  const params = useLocalSearchParams();
  const complaintId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewingImage, setViewingImage] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  useEffect(() => {
    if (complaint) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [complaint]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getComplaintDetails(complaintId);
      setComplaint(data);
    } catch (err) {
      console.error('Fetch complaint details error:', err);
      Alert.alert('Error', 'Failed to load complaint details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleViewImage = (imageUrl: string) => {
    setViewingImage(imageUrl);
    setImageViewerVisible(true);
  };

  // Header colors
  const headerBg = isDark ? colors.primary[900] : colors.primary[700];
  const headerTextColor = isDark ? colors.primary[100] : '#fff';
  const headerSubColor = isDark ? colors.primary[200] : 'rgba(255,255,255,0.8)';
  const headerEyebrowColor = isDark ? colors.primary[300] : 'rgba(255,255,255,0.6)';
  const backBtnBg = isDark ? `${colors.primary[500]}40` : 'rgba(255,255,255,0.15)';

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={headerBg} />
        <LinearGradient
          colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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
            <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>COMPLAINT DETAILS</Text>
            <Text style={[styles.headerTitle, { color: headerTextColor }]}>Loading...</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading complaint details...</Text>
        </View>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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
            <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>COMPLAINT DETAILS</Text>
            <Text style={[styles.headerTitle, { color: headerTextColor }]}>Not Found</Text>
          </View>
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconBox, { backgroundColor: isDark ? `${colors.primary[500]}15` : colors.primary[50], borderColor: isDark ? `${colors.primary[500]}30` : colors.primary[200] }]}>
            <Text style={styles.emptyGlyph}>🔍</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>Complaint Not Found</Text>
          <Text style={[styles.emptyDesc, { color: colors.text.secondary }]}>
            The complaint you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </View>
    );
  }

  const typ = getTypeStyles(complaint.type);
  const sta = getStatusStyles(complaint.status);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={headerBg} />

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        imageUrl={viewingImage}
        onClose={() => setImageViewerVisible(false)}
        colors={colors}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
      >
        {/* Header */}
        <LinearGradient
          colors={isDark ? [colors.primary[800], colors.primary[900]] : [colors.primary[600], colors.primary[700]]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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
            <Text style={[styles.headerEyebrow, { color: headerEyebrowColor }]}>COMPLAINT DETAILS</Text>
            <Text style={[styles.headerTitle, { color: headerTextColor }]} numberOfLines={2}>
              {complaint.title}
            </Text>
            <View style={styles.headerBreadcrumb}>
              <View style={[styles.headerBreadcrumbDot, { backgroundColor: headerSubColor }]} />
              <Text style={[styles.headerSub, { color: headerSubColor }]}>
                ID: #{complaint._id?.slice(-8).toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: isDark ? sta.bgDark : sta.bg, borderLeftColor: sta.dot }]}>
          <View style={styles.statusBannerContent}>
            <Text style={styles.statusBannerIcon}>{sta.icon}</Text>
            <View style={styles.statusBannerText}>
              <Text style={[styles.statusBannerLabel, { color: sta.fg }]}>{sta.label}</Text>
              <Text style={[styles.statusBannerDate, { color: sta.fg + 'CC' }]}>{formatDate(complaint.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Type Pill */}
        <View style={styles.typePillContainer}>
          <View style={[styles.typePill, { backgroundColor: isDark ? typ.bgDark : typ.bg }]}>
            <Text style={[styles.typePillText, { color: typ.fg }]}>
              {typ.icon}  {typ.label}
            </Text>
          </View>
        </View>

        {/* Description Card */}
        <InfoCard title="Description" colors={colors} isDark={isDark}>
          <Text style={[styles.descriptionText, { color: colors.text.secondary }]}>
            {complaint.description}
          </Text>
          {complaint.location && (
            <View style={[styles.locationBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={16} color={colors.primary[600]} />
              <Text style={[styles.locationText, { color: colors.text.secondary }]}>
                {complaint.location.lat.toFixed(6)}, {complaint.location.lng.toFixed(6)}
              </Text>
            </View>
          )}
        </InfoCard>

        {/* Status Timeline Card */}
        <InfoCard title="Status Timeline" colors={colors} isDark={isDark}>
          <StatusTimeline status={complaint.status} colors={colors} isDark={isDark} />
        </InfoCard>

        {/* Evidence Section */}
        {(complaint.imageUrl || complaint.resolvedImageUrl) && (
          <InfoCard title="Evidence & Media" colors={colors} isDark={isDark}>
            {complaint.imageUrl && (
              <TouchableOpacity
                style={[styles.evidenceItem, { borderColor: colors.border }]}
                onPress={() => handleViewImage(complaint.imageUrl)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: complaint.imageUrl }} style={styles.evidenceImage} resizeMode="cover" />
                <View style={[styles.evidenceOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                  <View style={styles.evidenceBadge}>
                    <Ionicons name="camera-outline" size={14} color="#fff" />
                    <Text style={styles.evidenceBadgeText}>Original Report</Text>
                  </View>
                  <View style={styles.evidenceExpand}>
                    <Ionicons name="expand-outline" size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {complaint.resolvedImageUrl && (
              <TouchableOpacity
                style={[styles.evidenceItem, { borderColor: colors.border, marginTop: 12 }]}
                onPress={() => handleViewImage(complaint.resolvedImageUrl)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: complaint.resolvedImageUrl }} style={styles.evidenceImage} resizeMode="cover" />
                <View style={[styles.evidenceOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                  <View style={[styles.evidenceBadge, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#fff" />
                    <Text style={styles.evidenceBadgeText}>Resolution Proof</Text>
                  </View>
                  <View style={styles.evidenceExpand}>
                    <Ionicons name="expand-outline" size={20} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </InfoCard>
        )}

        {/* Resolution Verification */}
        {complaint.resolutionVerification && (
          <InfoCard title="Resolution Verification" colors={colors} isDark={isDark}>
            <View style={styles.scoreContainer}>
              <View style={[styles.scoreCircle, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                <Text style={[styles.scoreText, { color: colors.primary[700] }]}>
                  {complaint.resolutionVerification.score || 0}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.text.muted }]}>/100</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreRemarks, { color: colors.text.secondary }]}>
                  {complaint.resolutionVerification.remarks}
                </Text>
              </View>
            </View>
          </InfoCard>
        )}

        {/* AI Analysis */}
        {complaint.aiVerification && (
          <InfoCard title="AI Analysis" colors={colors} isDark={isDark}>
            <View style={styles.aiStats}>
              <View style={styles.aiStat}>
                <Text style={[styles.aiStatLabel, { color: colors.text.muted }]}>Issue Valid</Text>
                <View style={[styles.aiStatBadge, { backgroundColor: complaint.aiVerification.isValidIssue ? '#4CAF5020' : '#F4433620' }]}>
                  <Text style={[styles.aiStatValue, { color: complaint.aiVerification.isValidIssue ? '#4CAF50' : '#F44336' }]}>
                    {complaint.aiVerification.isValidIssue ? 'Yes ✓' : 'No ✗'}
                  </Text>
                </View>
              </View>
              <View style={styles.aiStat}>
                <Text style={[styles.aiStatLabel, { color: colors.text.muted }]}>Fraud Score</Text>
                <View style={[styles.aiStatBadge, { backgroundColor: colors.primary[50] }]}>
                  <Text style={[styles.aiStatValue, { color: colors.primary[700] }]}>
                    {complaint.aiVerification.fraudScore || 0}%
                  </Text>
                </View>
              </View>
            </View>
            <DetailRow
              label="Remarks"
              value={complaint.aiVerification.remarks}
              colors={colors}
              isDark={isDark}
            />
            {complaint.aiVerification.labels?.length > 0 && (
              <View style={styles.labelsContainer}>
                <Text style={[styles.labelsTitle, { color: colors.text.muted }]}>Detected Labels</Text>
                <View style={styles.labelsRow}>
                  {complaint.aiVerification.labels.map((label: string, idx: number) => (
                    <View key={idx} style={[styles.labelChip, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                      <Text style={[styles.labelChipText, { color: colors.primary[700] }]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </InfoCard>
        )}

        {/* Additional Information */}
        <InfoCard title="Additional Information" colors={colors} isDark={isDark}>
          <DetailRow
            label="Village"
            value={complaint.village?.name}
            icon="location-outline"
            colors={colors}
            isDark={isDark}
          />
          {complaint.citizen?.name && (
            <DetailRow
              label="Reported By"
              value={complaint.citizen.name}
              icon="person-outline"
              colors={colors}
              isDark={isDark}
            />
          )}
          <DetailRow
            label="Date Reported"
            value={formatDate(complaint.createdAt)}
            icon="calendar-outline"
            colors={colors}
            isDark={isDark}
          />
          <DetailRow
            label="Image Source"
            value={complaint.imageSource === 'camera' ? '📷 Camera' : '🖼️ Gallery'}
            icon="image-outline"
            colors={colors}
            isDark={isDark}
          />
        </InfoCard>

        {/* Duplicate Info */}
        {complaint.duplicateOf && (
          <View style={[styles.duplicateCard, { backgroundColor: isDark ? `${colors.primary[500]}10` : colors.primary[50], borderColor: colors.primary[200] }]}>
            <Ionicons name="duplicate-outline" size={22} color={colors.primary[600]} />
            <View style={styles.duplicateContent}>
              <Text style={[styles.duplicateTitle, { color: colors.primary[700] }]}>Duplicate Report</Text>
              <Text style={[styles.duplicateDesc, { color: colors.primary[600] }]}>
                This complaint is a duplicate of complaint #{complaint.duplicateOf.slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 30 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  scrollContent: { paddingBottom: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Header Styles
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
    flexDirection: 'row', alignItems: 'center',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnTxt: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headerTitleBlock: { paddingHorizontal: 18, gap: 4 },
  headerEyebrow: {
    fontSize: 10, fontWeight: '800',
    letterSpacing: 2.5, marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24, fontWeight: '800',
    letterSpacing: -0.5, lineHeight: 30,
  },
  headerBreadcrumb: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4,
  },
  headerBreadcrumbDot: { width: 5, height: 5, borderRadius: 3 },
  headerSub: { fontSize: 12, fontWeight: '500' },

  // Status Banner
  statusBanner: {
    marginHorizontal: 16,
    marginTop: -18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBannerIcon: { fontSize: 24 },
  statusBannerText: { flex: 1 },
  statusBannerLabel: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  statusBannerDate: { fontSize: 11, marginTop: 2 },

  // Type Pill
  typePillContainer: {
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typePillText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  // Info Card
  infoCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  infoCardContent: {
    gap: 8,
  },

  // Description
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Location
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  locationText: { fontSize: 12, flex: 1, fontWeight: '500' },

  // Timeline
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  timelineItem: { flex: 1, alignItems: 'center' },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLabel: { fontSize: 10, marginTop: 6, textAlign: 'center' },
  timelineConnector: {
    position: 'absolute',
    height: 2,
    width: '30%',
    left: '35%',
    top: 12,
    zIndex: 0,
  },

  // Evidence
  evidenceItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    height: 200,
  },
  evidenceImage: { width: '100%', height: '100%' },
  evidenceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  evidenceBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  evidenceExpand: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Detail Rows
  detailRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  detailLabel: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontSize: 12, fontWeight: '600' },
  valueText: { fontSize: 14, fontWeight: '500', flex: 1 },

  // Score Container
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: { fontSize: 24, fontWeight: '800' },
  scoreLabel: { fontSize: 10, fontWeight: '600', marginTop: -2 },
  scoreInfo: { flex: 1 },
  scoreRemarks: { fontSize: 13, lineHeight: 18, fontWeight: '500' },

  // AI Stats
  aiStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  aiStat: { flex: 1, gap: 6 },
  aiStatLabel: { fontSize: 11, fontWeight: '600' },
  aiStatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  aiStatValue: { fontSize: 14, fontWeight: '700' },

  // Labels
  labelsContainer: { marginTop: 8 },
  labelsTitle: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
  labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  labelChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1 },
  labelChipText: { fontSize: 11, fontWeight: '600' },

  // Duplicate Card
  duplicateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  duplicateContent: { flex: 1 },
  duplicateTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  duplicateDesc: { fontSize: 12, lineHeight: 16, fontWeight: '500' },

  // Empty State
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

  // Image Viewer Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: { width: width * 0.9, height: width * 0.9, borderRadius: 12 },
  closeImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});