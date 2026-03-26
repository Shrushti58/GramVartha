// components/ThemeToggle.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface ThemeToggleProps {
  showLabel?: boolean;
  variant?: 'icon' | 'full' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = false, 
  variant = 'full' 
}) => {
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);

  const getIcon = (mode: string) => {
    switch (mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '📱';
      default:
        return '';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return '';
    }
  };

  // Helper function to get primary color as string
  const getPrimaryColor = () => {
    return colors.primary?.DEFAULT || colors.primary[600] || '#8B6B61';
  };

  // Helper function to get text color
  const getTextColor = (mode: 'primary' | 'secondary' | 'inverse') => {
    if (mode === 'inverse') return '#ffffff';
    if (mode === 'secondary') return colors.text?.secondary || '#64748b';
    return colors.text?.primary || '#1e293b';
  };

  if (variant === 'icon') {
    return (
      <>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.surfaceHover || colors.surface || '#f5efe9' }]}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.icon}>{getIcon(themeMode)}</Text>
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <ThemedView style={styles.modalContent}>
              <ThemedText variant="primary" style={styles.modalTitle}>
                Select Theme
              </ThemedText>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.modalOption,
                    {
                      backgroundColor: themeMode === mode ? getPrimaryColor() : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setThemeMode(mode);
                    setShowModal(false);
                  }}
                >
                  <Text style={styles.modalIcon}>{getIcon(mode)}</Text>
                  <ThemedText
                    variant={themeMode === mode ? 'inverse' : 'primary'}
                    style={styles.modalOptionText}
                  >
                    {getModeLabel(mode)}
                  </ThemedText>
                  {themeMode === mode && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: colors.surfaceHover || colors.surface || '#f5efe9' }]}
        onPress={() => {
          const modes: ThemeMode[] = ['light', 'dark', 'system'];
          const currentIndex = modes.indexOf(themeMode);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          setThemeMode(nextMode);
        }}
      >
        <Text style={styles.icon}>{getIcon(themeMode)}</Text>
        <ThemedText variant="secondary" style={styles.compactText}>
          {getModeLabel(themeMode)}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {showLabel && (
        <ThemedText variant="primary" style={styles.label}>
          Theme
        </ThemedText>
      )}
      <View style={styles.buttonGroup}>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.themeButton,
              {
                backgroundColor: themeMode === mode ? getPrimaryColor() : (colors.surfaceHover || colors.surface || '#f5efe9'),
                borderColor: colors.border || '#e8ddd1',
              },
            ]}
            onPress={() => setThemeMode(mode)}
          >
            <Text style={styles.icon}>{getIcon(mode)}</Text>
            <Text
              style={[
                styles.buttonText,
                {
                  color: themeMode === mode ? '#ffffff' : getTextColor('primary'),
                },
              ]}
            >
              {getModeLabel(mode)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  compactText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    fontSize: 18,
    color: '#10b981',
  },
});