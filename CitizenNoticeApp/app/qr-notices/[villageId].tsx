/**
 * QR Notices Screen - Display notices for scanned village
 * Shows notices from a specific village after QR scan
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { apiService } from '../../services/api';
import { formatDate, formatViews } from '../../utils/format';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '📋' },
  { id: 'development', name: 'Development', emoji: '🏗️' },
  { id: 'health', name: 'Health', emoji: '❤️' },
  { id: 'education', name: 'Education', emoji: '🎓' },
  { id: 'agriculture', name: 'Agriculture', emoji: '🚜' },
  { id: 'employment', name: 'Employment', emoji: '💼' },
  { id: 'social_welfare', name: 'Social Welfare', emoji: '👥' },
  { id: 'tax_billing', name: 'Tax & Billing', emoji: '💰' },
  { id: 'election', name: 'Election', emoji: '🗳️' },
  { id: 'general', name: 'General', emoji: '📄' },
];

export default function QRNoticesScreen() {
  const params = useLocalSearchParams();
  const villageId = Array.isArray(params.villageId) ? params.villageId[0] : (params.villageId || '');
  const [notices, setNotices] = useState([]);
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [scannedVillageInfo, setScannedVillageInfo] = useState(null);

  useEffect(() => {
    loadScannedVillageInfo();
    fetchNotices();
  }, [villageId, selectedCategory, page]);

  const loadScannedVillageInfo = async () => {
    try {
      const info = await AsyncStorage.getItem('scannedVillage');
      if (info) {
        setScannedVillageInfo(JSON.parse(info));
      }
    } catch (err) {
      console.error('Error loading scanned village info:', err);
    }
  };

  const fetchNotices = async () => {
    try {
      setLoading(true);

      const response = await apiService.getNoticesByVillage(
        villageId,
        page,
        10
      );

      setNotices(response.notices);
      setVillage(response.village);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching notices:', err);
      Alert.alert('Error', 'Failed to fetch notices. Please try again.');
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

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const handleNoticePress = (noticeId: string) => {
    router.push(`notice/${noticeId}` as any);
  };

  const renderNoticeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.noticeCard}
      onPress={() => handleNoticePress(item._id)}
      activeOpacity={0.7}
    >
      {/* Category Badge */}
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.categoryText}>{item.category?.toUpperCase()}</Text>
      </View>

      {/* Content */}
      <Text numberOfLines={2} style={styles.noticeTitle}>
        {item.title}
      </Text>
      <Text numberOfLines={2} style={styles.noticeDescription}>
        {item.description}
      </Text>

      {/* Priority Badge */}
      <View style={styles.priorityContainer}>
        <View
          style={[
            styles.priorityBadge,
            {
              backgroundColor:
                item.priority === 'high'
                  ? '#FFE5E5'
                  : item.priority === 'medium'
                  ? '#FFF5E5'
                  : '#E5F5FF',
            },
          ]}
        >
          <Text
            style={[
              styles.priorityText,
              {
                color:
                  item.priority === 'high'
                    ? '#D32F2F'
                    : item.priority === 'medium'
                    ? '#F57C00'
                    : '#0277BD',
              },
            ]}
          >
            {item.priority?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.author}>{item.createdBy?.name || 'Official'}</Text>
        <Text style={styles.views}>👁 {formatViews(item.views || 0)}</Text>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      development: '#FFE5E5',
      health: '#E8F5E9',
      education: '#E3F2FD',
      agriculture: '#FFF3E0',
      employment: '#F3E5F5',
      social_welfare: '#FCE4EC',
      tax_billing: '#FFFDE7',
      election: '#E0F2F1',
      general: '#F5F5F5',
    };
    return colors[category] || '#F5F5F5';
  };

  if (loading && notices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading notices...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{(village as any)?.name || 'Village'}</Text>
          <Text style={styles.headerSubtitle}>
            {(village as any)?.district}, {(village as any)?.state}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleScanAnother}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>📱</Text>
        </TouchableOpacity>
      </View>

      {/* Scanned Info Banner */}
      {scannedVillageInfo && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ✓ Village scanned and saved to your device!
          </Text>
        </View>
      )}

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleCategoryChange(cat.id)}
            style={[
              styles.categoryButton,
              selectedCategory === cat.id && styles.categoryButtonActive,
            ]}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === cat.id && styles.categoryButtonTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notices List */}
      {notices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Notices Found</Text>
          <Text style={styles.emptyText}>
            Try selecting a different category or check back later.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notices}
          renderItem={renderNoticeCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary[500]}
            />
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={styles.pagination}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPage(p)}
                    style={[
                      styles.pageButton,
                      page === p && styles.pageButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        page === p && styles.pageButtonTextActive,
                      ]}
                    >
                      {p}
                    </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.textInverse,
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scanButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scanButtonText: {
    fontSize: 20,
  },
  banner: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  bannerText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  categoryScroll: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  noticeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  noticeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  priorityContainer: {
    marginBottom: 8,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  author: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  views: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pageButtonTextActive: {
    color: Colors.textInverse,
  },
});
