import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import SchemeCard from '../components/SchemeCard';
import { fetchSchemes } from '../services/api.js';

const TARGET_STATE = 'maharashtra';

const SchemesScreen = () => {
  const router = useRouter();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const loadSchemes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError('');
      const data = await fetchSchemes(TARGET_STATE);
      setSchemes(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to fetch schemes.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    schemes.forEach((scheme) => {
      if (scheme?.category) {
        set.add(String(scheme.category));
      }
    });
    return Array.from(set);
  }, [schemes]);

  const filteredSchemes = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return schemes.filter((scheme) => {
      const title = (scheme?.title || '').toLowerCase();
      const category = String(scheme?.category || '');

      const matchesSearch = !query || title.includes(query);
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [schemes, searchText, selectedCategory]);

  const onViewDetails = useCallback(
    (scheme) => {
      // Pass serialized object so detail screen can render without waiting for another API call.
      router.push({
        pathname: '/schemes/[id]',
        params: {
          id: scheme?._id || scheme?.title || Date.now().toString(),
          scheme: JSON.stringify(scheme || {}),
        },
      });
    },
    [router]
  );

  const keyExtractor = useCallback((item, index) => {
    return item?._id || `${item?.title || 'scheme'}-${item?.state || 'na'}-${index}`;
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      const isHighlighted = String(item?.state || '').toLowerCase() === TARGET_STATE;
      return <SchemeCard item={item} onViewDetails={onViewDetails} highlightState={isHighlighted} />;
    },
    [onViewDetails]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.helperText}>Loading schemes...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadSchemes()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.screenTitle}>Government Schemes</Text>
        <Text style={styles.screenSubtitle}>State: Maharashtra</Text>

        <View style={styles.filtersRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by scheme title"
            placeholderTextColor="#94A3B8"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
          />

          <Pressable style={styles.filterButton} onPress={() => setCategoryModalVisible(true)}>
            <Text style={styles.filterButtonText}>{selectedCategory} ?</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filteredSchemes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={filteredSchemes.length ? styles.listContent : styles.emptyListContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadSchemes(true)} tintColor="#0F766E" />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No schemes available</Text>
            <Text style={styles.emptyBody}>Try changing search text or category filter.</Text>
          </View>
        }
      />

      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((category) => (
              <Pressable
                key={category}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(category);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{category}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SchemesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
  },
  helperText: {
    marginTop: 10,
    color: '#334155',
    fontSize: 14,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filtersRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
  },
  filterButton: {
    minWidth: 110,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyBody: {
    marginTop: 6,
    color: '#64748B',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#B91C1C',
  },
  errorBody: {
    marginTop: 8,
    color: '#475569',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#0F766E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    maxHeight: 420,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalOptionText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '600',
  },
});
