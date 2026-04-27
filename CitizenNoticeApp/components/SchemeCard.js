import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const SchemeCard = ({ item, onViewDetails, highlightState = false }) => {
  return (
    <View style={[styles.card, highlightState && styles.highlightCard]}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Untitled Scheme'}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category || 'General'}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {item.description || 'No description available.'}
      </Text>

      <View style={styles.footerRow}>
        {highlightState ? <Text style={styles.highlightText}>In your state</Text> : <View />}
        <Pressable style={styles.button} onPress={() => onViewDetails(item)}>
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default memo(SchemeCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightCard: {
    borderColor: '#16A34A',
    borderWidth: 1.5,
    backgroundColor: '#F0FDF4',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 120,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0F766E',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
