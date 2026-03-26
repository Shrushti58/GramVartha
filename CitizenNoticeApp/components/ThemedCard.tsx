// components/ThemedCard.tsx
import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedCardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  style?: StyleProp<ViewStyle>;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ 
  style, 
  variant = 'default',
  children,
  ...props 
}) => {
  const { colors, isDark } = useTheme();

  const getShadow = () => {
    if (variant === 'elevated') {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      };
    }
    return {
      shadowColor: 'transparent',
      elevation: 0,
    };
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        getShadow(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
});