import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <ThemedView className="flex-row gap-2 p-2">
      <TouchableOpacity
        onPress={() => changeLanguage('mr')}
        className={`px-3 py-2 rounded-lg ${
          i18n.language === 'mr' ? 'bg-yellow-400' : 'bg-gray-200'
        }`}
      >
        <ThemedText className="text-sm font-medium">मराठी</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => changeLanguage('en')}
        className={`px-3 py-2 rounded-lg ${
          i18n.language === 'en' ? 'bg-yellow-400' : 'bg-gray-200'
        }`}
      >
        <ThemedText className="text-sm font-medium">English</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}