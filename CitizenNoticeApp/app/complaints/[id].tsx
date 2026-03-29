// app/complaints/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  StatusBar, Dimensions, TouchableOpacity, Image, Alert,
  Animated, Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { apiService } from '../../services/api';
import { formatDate } from '../../utils/format';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Helper functions ─────────────────────────────────────────────────────
const getTypeStyles = (type: string) => {
  const typeStyles: Record<string, any> = {
    issue: { bg: '#FEE9E7', fg: '#C0392B', label: 'Issue', icon: '⚠️' },
    complaint: { bg: '#E8F5E9', fg: '#2E7D32', label: 'Complaint', icon: '📋' },
  };
  return typeStyles[type] || typeStyles.issue;
};

const getStatusStyles = (status: string) => {
  const statusStyles: Record<string, any> = {
    pending: { bg: '#FEF9E7', fg: '#B7950B', dot: '#F1C40F', icon: '⏳', label: 'Pending', next: 'in-progress' },
    'in-progress': { bg: '#E3F2FD', fg: '#1976D2', dot: '#2196F3', icon: '🔧', label: 'In Progress', next: 'resolved' },
    resolved: { bg: '#E8F5E9', fg: '#2E7D32', dot: '#4CAF50', icon: '✅', label: 'Resolved', next: null },
    rejected: { bg: '#FFEBEE', fg: '#C0392B', dot: '#F44336', icon: '❌', label: 'Rejected', next: null },
  };
  return statusStyles[status] || statusStyles.pending;
};

// ─── Timeline component ───────────────────────────────────────────────────
const StatusTimeline = ({ status, colors }: any) => {
  const statuses = ['pending', 'in-progress', 'resolved'];
  const currentIndex = statuses.indexOf(status);

  return (
    <View style={styles.timeline}>
      {statuses.map((s, idx) => {
        const isActive = idx <= currentIndex;
        const sta = getStatusStyles(s);
        return (
          <View key={s} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: isActive ? sta.dot : colors.border,
                  borderColor: isActive ? sta.dot : colors.border,
                },
              ]}
            >
              {isActive && <Text style={styles.timelineDotCheck}>✓</Text>}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                {
                  color: isActive ? colors.text.primary : colors.text.muted,
                  fontWeight: isActive ? '600' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {s.replace('-', ' ')}
            </Text>
            {idx < statuses.length - 1 && (
              <View
                style={[
                  styles.timelineConnector,
                  { backgroundColor: isActive ? colors.primary[500] : colors.border },
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
const DetailRow = ({ label, value, icon, colors }: any) => (
  <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
    <View style={styles.detailLabel}>
      {icon && <Ionicons name={icon} size={18} color={colors.text.secondary} style={{ marginRight: 8 }} />}
      <Text style={[styles.labelText, { color: colors.text.secondary }]}>{label}</Text>
    </View>
    <Text style={[styles.valueText, { color: colors.text.primary }]} numberOfLines={3}>
      {value || '—'}
    </Text>
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
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Image source={{ uri: imageUrl }} style={styles.fullImage} />
      </Animated.View>
      <TouchableOpacity
        style={styles.closeImageBtn}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <Ionicons name="close-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

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

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[700]} />
        <View style={[styles.header, { backgroundColor: colors.primary[700] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnTxt}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading complaint…</Text>
        </View>
      </View>
    );
  }

  if (!complaint) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary[700] }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnTxt}>←</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Complaint not found</Text>
        </View>
      </View>
    );
  }

  const typ = getTypeStyles(complaint.type);
  const sta = getStatusStyles(complaint.status);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[700]} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary[700] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnTxt}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Complaint Details</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Image Viewer */}
      <ImageViewer
        visible={imageViewerVisible}
        imageUrl={viewingImage}
        onClose={() => setImageViewerVisible(false)}
        colors={colors}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: sta.bg, borderColor: sta.dot }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusIcon}>{sta.icon}</Text>
              <Text style={[styles.statusLabel, { color: sta.fg }]}>{sta.label}</Text>
            </View>
            <Text style={[styles.statusDate, { color: sta.fg }]}>{formatDate(complaint.createdAt)}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.pillRow}>
            <View style={[styles.pill, { backgroundColor: typ.bg }]}>
              <Text style={[styles.pillTxt, { color: typ.fg }]}>{typ.icon} {typ.label}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text.primary }]}>{complaint.title}</Text>
          <Text style={[styles.description, { color: colors.text.secondary }]}>{complaint.description}</Text>

          {complaint.location && (
            <View style={[styles.locationBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="location-outline" size={16} color={colors.primary[600]} style={{ marginRight: 6 }} />
              <Text style={[styles.locationText, { color: colors.text.secondary }]}>
                {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        {/* Status Timeline */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Status Timeline</Text>
          <StatusTimeline status={complaint.status} colors={colors} />
        </View>

        {/* Images Section */}
        {(complaint.imageUrl || complaint.resolvedImageUrl) && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Evidence</Text>

            {complaint.imageUrl && (
              <TouchableOpacity
                style={[styles.imageContainer, { borderColor: colors.border }]}
                onPress={() => handleViewImage(complaint.imageUrl)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: complaint.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageBadge}>
                  <Text style={styles.imageBadgeText}>Original Report</Text>
                </View>
                <View style={styles.imageOverlay}>
                  <Ionicons name="expand-outline" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            )}

            {complaint.resolvedImageUrl && (
              <TouchableOpacity
                style={[styles.imageContainer, { borderColor: colors.border, marginTop: 12 }]}
                onPress={() => handleViewImage(complaint.resolvedImageUrl)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: complaint.resolvedImageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={[styles.imageBadge, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.imageBadgeText}>Resolution Proof</Text>
                </View>
                <View style={styles.imageOverlay}>
                  <Ionicons name="expand-outline" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Resolution Verification */}
        {complaint.resolutionVerification && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Resolution Verification</Text>
            <DetailRow
              label="Verification Score"
              value={`${complaint.resolutionVerification.score || 0}/100`}
              icon="checkmark-circle-outline"
              colors={colors}
            />
            <DetailRow
              label="Remarks"
              value={complaint.resolutionVerification.remarks}
              colors={colors}
            />
          </View>
        )}

        {/* AI Verification */}
        {complaint.aiVerification && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>AI Analysis</Text>
            <DetailRow
              label="Issue Valid"
              value={complaint.aiVerification.isValidIssue ? 'Yes' : 'No'}
              colors={colors}
            />
            <DetailRow
              label="Fraud Score"
              value={`${complaint.aiVerification.fraudScore || 0}%`}
              colors={colors}
            />
            <DetailRow
              label="Remarks"
              value={complaint.aiVerification.remarks}
              colors={colors}
            />
            {complaint.aiVerification.labels?.length > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.labelText, { color: colors.text.secondary }]}>Detected Labels</Text>
                <View style={styles.labelsContainer}>
                  {complaint.aiVerification.labels.map((label: string, idx: number) => (
                    <View key={idx} style={[styles.label, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
                      <Text style={[styles.labelText, { color: colors.primary[700] }]}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Detailed Information */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Information</Text>
          <DetailRow
            label="Complaint ID"
            value={`#${complaint._id?.slice(-8).toUpperCase()}`}
            icon="document-outline"
            colors={colors}
          />
          <DetailRow
            label="Type"
            value={typ.label}
            colors={colors}
          />
          <DetailRow
            label="Village"
            value={complaint.village?.name}
            icon="location-outline"
            colors={colors}
          />
          {complaint.citizen?.name && (
            <DetailRow
              label="Reported By"
              value={complaint.citizen.name}
              icon="person-outline"
              colors={colors}
            />
          )}
          <DetailRow
            label="Date Reported"
            value={formatDate(complaint.createdAt)}
            icon="calendar-outline"
            colors={colors}
          />
          {complaint.timestamp && (
            <DetailRow
              label="Timestamp"
              value={new Date(complaint.timestamp).toLocaleString()}
              colors={colors}
            />
          )}
          <DetailRow
            label="Image Source"
            value={complaint.imageSource === 'camera' ? '📷 Camera' : '🖼️ Gallery'}
            colors={colors}
          />
        </View>

        {/* Duplicate Info */}
        {complaint.duplicateOf && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Duplicate Report</Text>
            <View style={[styles.duplicateBox, { backgroundColor: colors.primary[50], borderColor: colors.primary[200] }]}>
              <Ionicons name="duplicate-outline" size={20} color={colors.primary[600]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.duplicateTitle, { color: colors.primary[700] }]}>Similar Issue Found</Text>
                <Text style={[styles.duplicateDesc, { color: colors.primary[600] }]}>
                  This complaint is a duplicate of complaint #{complaint.duplicateOf.slice(-6).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', justifyContent: 'center', alignItems: 'center' },
  backBtnTxt: { color: '#fff', fontSize: 22, lineHeight: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.3, flex: 1, textAlign: 'center' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Status card
  statusCard: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusIcon: { fontSize: 20 },
  statusLabel: { fontSize: 15, fontWeight: '700' },
  statusDate: { fontSize: 12, fontWeight: '500' },

  // Sections
  section: { marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  pillTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Content
  title: { fontSize: 18, fontWeight: '700', lineHeight: 24, marginBottom: 8, letterSpacing: -0.2 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 10 },

  // Location box
  locationBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 1, marginTop: 8 },
  locationText: { fontSize: 12, flex: 1 },

  // Timeline
  timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  timelineItem: { flex: 1, alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  timelineDotCheck: { color: '#fff', fontWeight: '700', fontSize: 12 },
  timelineLabel: { fontSize: 11, marginTop: 6, textAlign: 'center' },
  timelineConnector: { position: 'absolute', height: 2, width: '16%', left: '42%', zIndex: 0 },

  // Images
  imageContainer: { position: 'relative', borderRadius: 10, borderWidth: 1, overflow: 'hidden', height: 220 },
  image: { width: '100%', height: '100%' },
  imageBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFA500', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  imageBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', opacity: 0 },

  // Detail rows
  detailRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  detailLabel: { flexDirection: 'row', alignItems: 'center' },
  labelText: { fontSize: 12, fontWeight: '600' },
  valueText: { fontSize: 14, fontWeight: '500', flex: 1 },

  // Labels
  labelsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  label: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },

  // Duplicate box
  duplicateBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, gap: 12 },
  duplicateTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  duplicateDesc: { fontSize: 12, lineHeight: 16 },

  // Image viewer modal
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  fullImage: { width: width * 0.9, height: width * 0.9, borderRadius: 12 },
  closeImageBtn: { position: 'absolute', top: 50, right: 20, width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
