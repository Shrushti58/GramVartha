import React, { useMemo } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const SchemeDetailScreen = () => {
  const params = useLocalSearchParams();

  const scheme = useMemo(() => {
    try {
      return params?.scheme ? JSON.parse(params.scheme) : {};
    } catch (_error) {
      return {};
    }
  }, [params?.scheme]);

  const cleanSourceUrl = useMemo(() => {
    const raw = (scheme?.sourceUrl || '').toString().trim();
    if (!raw) return '';
    const hashIndex = raw.indexOf('#');
    return hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  }, [scheme?.sourceUrl]);

  const openSource = async () => {
    const url = cleanSourceUrl;

    if (!url) {
      Alert.alert('Source not available');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Cannot open this source link');
      return;
    }

    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{scheme?.title || 'Scheme Details'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionBody}>{scheme?.description || 'No description available.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <Text style={styles.sectionBody}>{scheme?.benefits || 'Benefits information is not available.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility</Text>
          <Text style={styles.sectionBody}>{scheme?.eligibility || 'Eligibility details are not available.'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Category</Text>
          <Text style={styles.metaValue}>{scheme?.category || 'General'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>State</Text>
          <Text style={styles.metaValue}>{scheme?.state || 'N/A'}</Text>
        </View>

        <Pressable style={styles.linkButton} onPress={openSource}>
          <Text style={styles.linkButtonText}>Open Source Link</Text>
        </Pressable>

        {cleanSourceUrl ? <Text style={styles.linkText}>{cleanSourceUrl}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SchemeDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionBody: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaLabel: {
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    color: '#0F172A',
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 14,
    backgroundColor: '#0F766E',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  linkText: {
    marginTop: 10,
    color: '#0EA5E9',
    fontSize: 12,
  },
});
