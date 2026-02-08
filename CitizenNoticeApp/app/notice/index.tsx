/**
 * Home Screen - Notices List
 * Displays all public notices with search, filter, and sort functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { getBookmarks, toggleBookmark as toggleBookmarkStorage } from '../../utils/storage';
import { formatViews, formatDate, isImage } from '../../utils/format';
import { Notice, CategoryInfo, SortOption } from '../../types/Notice';
import { Colors } from '../../constants/colors';

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'All', emoji: '📋', color: Colors.primary[500] },
  { id: 'development', name: 'Development', emoji: '🏗️', color: Colors.categories.development },
  { id: 'health', name: 'Health', emoji: '❤️', color: Colors.categories.health },
  { id: 'education', name: 'Education', emoji: '🎓', color: Colors.categories.education },
  { id: 'agriculture', name: 'Agriculture', emoji: '🚜', color: Colors.categories.agriculture },
  { id: 'employment', name: 'Employment', emoji: '💼', color: Colors.categories.employment },
  { id: 'social_welfare', name: 'Social Welfare', emoji: '👥', color: Colors.categories.social_welfare },
  { id: 'tax_billing', name: 'Tax & Billing', emoji: '💰', color: Colors.categories.tax_billing },
  { id: 'election', name: 'Election', emoji: '🗳️', color: Colors.categories.election },
  { id: 'meeting', name: 'Meetings', emoji: '👔', color: Colors.categories.meeting },
  { id: 'general', name: 'General', emoji: '📄', color: Colors.categories.general },
];

export default function HomeScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [bookmarkedNotices, setBookmarkedNotices] = useState<Set<string>>(new Set());
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetchNotices();
    loadBookmarks();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchNotices();
      setNotices(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  const loadBookmarks = async () => {
    const bookmarks = await getBookmarks();
    setBookmarkedNotices(bookmarks);
  };

  const handleToggleBookmark = async (noticeId: string) => {
    const isBookmarked = await toggleBookmarkStorage(noticeId);
    setBookmarkedNotices(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.add(noticeId);
      } else {
        newSet.delete(noticeId);
      }
      return newSet;
    });
  };

  const handleShare = async (notice: Notice) => {
    try {
      await Share.share({
        title: notice.title,
        message: `${notice.title}\n\n${notice.description}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNoticePress = async (notice: Notice) => {
    try {
      await apiService.trackView(notice._id);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
    router.push(`/notice/${notice._id}`);
  };

  const getCategoryInfo = (categoryId: string): CategoryInfo => {
    return CATEGORIES.find(cat => cat.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const sortedAndFilteredNotices = useMemo(() => {
    let filtered = notices.filter((notice) => {
      const matchesSearch =
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [notices, searchTerm, selectedCategory, sortBy]);

  const renderNoticeCard = ({ item: notice }: { item: Notice }) => {
    const categoryInfo = getCategoryInfo(notice.category);
    const isBookmarked = bookmarkedNotices.has(notice._id);

    return (
      <TouchableOpacity
        style={styles.noticeCard}
        onPress={() => handleNoticePress(notice)}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {notice.fileUrl && isImage(notice.fileUrl) ? (
            <Image 
              source={{ uri: notice.fileUrl }} 
              style={styles.noticeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageEmoji}>📄</Text>
              <Text style={styles.noImageText}>
                {notice.fileUrl ? 'File Attached' : 'Text Notice'}
              </Text>
            </View>
          )}
          
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text style={styles.categoryEmoji}>{categoryInfo.emoji}</Text>
            <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
              {categoryInfo.name}
            </Text>
          </View>

          <View style={styles.viewsBadge}>
            <Text style={styles.viewsText}>👁 {formatViews(notice.views)}</Text>
          </View>

          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => handleToggleBookmark(notice._id)}
          >
            <Text style={styles.bookmarkIcon}>{isBookmarked ? '🔖' : '📌'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.noticeTitle} numberOfLines={2}>
            {notice.title}
          </Text>
          
          <Text style={styles.noticeDescription} numberOfLines={3}>
            {notice.description}
          </Text>

          <View style={styles.metaContainer}>
            <Text style={styles.metaText}>📅 {formatDate(notice.createdAt)}</Text>
            {notice.createdBy?.name && (
              <Text style={styles.metaText} numberOfLines={1}>
                👤 {notice.createdBy.name}
              </Text>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => handleNoticePress(notice)}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShare(notice)}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={styles.loadingText}>Loading Notices...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Issue</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNotices}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notices..."
          placeholderTextColor={Colors.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'newest' && styles.sortButtonActive]}
            onPress={() => setSortBy('newest')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'newest' && styles.sortButtonTextActive]}>
              Newest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'oldest' && styles.sortButtonActive]}
            onPress={() => setSortBy('oldest')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'oldest' && styles.sortButtonTextActive]}>
              Oldest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'popular' && styles.sortButtonActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'popular' && styles.sortButtonTextActive]}>
              Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryToggleButton}
            onPress={() => setShowCategories(!showCategories)}
          >
            <Text style={styles.categoryToggleText}>
              {showCategories ? 'Hide' : 'Show'} Categories
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {showCategories && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryChipEmoji}>{category.emoji}</Text>
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.categoryChipTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {(searchTerm || selectedCategory !== 'all') && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Showing {sortedAndFilteredNotices.length} of {notices.length} notices
          </Text>
        </View>
      )}

      {sortedAndFilteredNotices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>No Notices Found</Text>
          <Text style={styles.emptyText}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter'
              : 'New announcements will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedAndFilteredNotices}
          renderItem={renderNoticeCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[Colors.primary[500]]}
            />
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary[500],
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: Colors.textInverse,
  },
  categoryToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  categoryToggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral[200],
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary[500],
  },
  categoryChipEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: Colors.textInverse,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  noticeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.neutral[200],
    position: 'relative',
  },
  noticeImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  noImageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewsText: {
    fontSize: 12,
    color: Colors.textInverse,
    fontWeight: '500',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    fontSize: 20,
  },
  contentContainer: {
    padding: 16,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  noticeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: Colors.primary[500],
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});