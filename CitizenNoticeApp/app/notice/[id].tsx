/**
 * Notice Details Screen
 * Displays full details of a single notice
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiService } from '../../services/api';
import { getBookmarks, toggleBookmark as toggleBookmarkStorage } from '../../utils/storage';
import { formatViews, formatLongDate, isImage, getFileExtensionDisplay } from '../../utils/format';
import { Notice, CategoryInfo } from '../../types/Notice';
import { Colors } from '../../constants/colors';

const CATEGORIES: Record<string, CategoryInfo> = {
  development: { id: 'development', name: 'Development', emoji: '🏗️', color: Colors.categories.development },
  health: { id: 'health', name: 'Health', emoji: '❤️', color: Colors.categories.health },
  education: { id: 'education', name: 'Education', emoji: '🎓', color: Colors.categories.education },
  agriculture: { id: 'agriculture', name: 'Agriculture', emoji: '🚜', color: Colors.categories.agriculture },
  employment: { id: 'employment', name: 'Employment', emoji: '💼', color: Colors.categories.employment },
  social_welfare: { id: 'social_welfare', name: 'Social Welfare', emoji: '👥', color: Colors.categories.social_welfare },
  tax_billing: { id: 'tax_billing', name: 'Tax & Billing', emoji: '💰', color: Colors.categories.tax_billing },
  election: { id: 'election', name: 'Election', emoji: '🗳️', color: Colors.categories.election },
  meeting: { id: 'meeting', name: 'Meetings', emoji: '👔', color: Colors.categories.meeting },
  general: { id: 'general', name: 'General', emoji: '📄', color: Colors.categories.general },
};

export default function NoticeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNoticeDetails();
      checkBookmark();
    }
  }, [id]);

  const fetchNoticeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchNoticeById(id as string);
      setNotice(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load notice details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    const bookmarks = await getBookmarks();
    setIsBookmarked(bookmarks.has(id as string));
  };

  const handleToggleBookmark = async () => {
    const newBookmarkState = await toggleBookmarkStorage(id as string);
    setIsBookmarked(newBookmarkState);
  };

  const handleShare = async () => {
    if (!notice) return;
    try {
      await Share.share({
        title: notice.title,
        message: `${notice.title}\n\n${notice.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const getCategoryInfo = (categoryId: string): CategoryInfo => {
    return CATEGORIES[categoryId] || CATEGORIES.general;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading Details...</Text>
      </View>
    );
  }

  if (error || !notice) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error || 'Notice not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNoticeDetails}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryInfo = getCategoryInfo(notice.category);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {notice.fileUrl && isImage(notice.fileUrl) ? (
          <Image 
            source={{ uri: notice.fileUrl }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImageHeader}>
            <Text style={styles.noImageEmoji}>📄</Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>

          <Text style={styles.title}>{notice.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>{formatLongDate(notice.createdAt)}</Text>
            </View>
            
            {notice.createdBy?.name && (
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>👤</Text>
                <Text style={styles.metaText}>{notice.createdBy.name}</Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>👁</Text>
              <Text style={styles.metaText}>{formatViews(notice.views)} views</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{notice.description}</Text>
          </View>

          {notice.fileUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attachment</Text>
              <TouchableOpacity
                style={styles.fileCard}
                onPress={() => handleDownload(notice.fileUrl!)}
              >
                <View style={styles.fileIcon}>
                  <Text style={styles.fileIconText}>
                    {isImage(notice.fileUrl) ? '🖼️' : '📎'}
                  </Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {notice.fileName || notice.title}
                  </Text>
                  <Text style={styles.fileType}>
                    {getFileExtensionDisplay(notice.fileUrl)} File
                  </Text>
                </View>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            </View>
          )}

          {notice.createdBy?.department && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Issued By</Text>
              <Text style={styles.infoText}>{notice.createdBy.department}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleBookmark}
        >
          <Text style={styles.actionIcon}>{isBookmarked ? '🔖' : '📌'}</Text>
          <Text style={styles.actionText}>
            {isBookmarked ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={[styles.actionText, styles.shareText]}>Share</Text>
        </TouchableOpacity>

        {notice.fileUrl && (
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={() => handleDownload(notice.fileUrl!)}
          >
            <Text style={styles.actionIcon}>⬇️</Text>
            <Text style={[styles.actionText, styles.downloadText]}>Download</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerImage: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.neutral[200],
  },
  noImageHeader: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageEmoji: {
    fontSize: 80,
  },
  contentContainer: {
    padding: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
    lineHeight: 36,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fileType: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  downloadIcon: {
    fontSize: 24,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    marginHorizontal: 4,
  },
  shareButton: {
    backgroundColor: Colors.primary[500],
  },
  downloadButton: {
    backgroundColor: Colors.success,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  shareText: {
    color: Colors.textInverse,
  },
  downloadText: {
    color: Colors.textInverse,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
});