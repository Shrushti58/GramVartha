// components/LanguageSwitcher.tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const slideAnim = useRef(new Animated.Value(i18n.language === 'mr' ? 0 : 1)).current;

  const changeLanguage = (lng: string) => {
    Animated.spring(slideAnim, {
      toValue: lng === 'mr' ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
    i18n.changeLanguage(lng);
  };

  const sliderLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '50%'],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.pill, { left: sliderLeft }]} />
      <TouchableOpacity onPress={() => changeLanguage('mr')} activeOpacity={0.8} style={styles.option}>
        <Text style={[styles.label, i18n.language === 'mr' ? styles.active : styles.inactive]}>म</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changeLanguage('en')} activeOpacity={0.8} style={styles.option}>
        <Text style={[styles.label, i18n.language === 'en' ? styles.active : styles.inactive]}>EN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 100,
    padding: 3,
    width: 72,   // fixed narrow width — fits in any header
    height: 30,
    position: 'relative',
    alignItems: 'center',
  },
  pill: {
    position: 'absolute',
    width: '48%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  option: {
    flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  label:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  active:   { color: '#1A1A1A' },
  inactive: { color: '#ABABAB' },
});