// components/ThemedView.tsx
import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'surface' | 'surfaceHover' | 'transparent';
  style?: StyleProp<ViewStyle>;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  style, 
  variant = 'primary',
  ...props 
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'surface':
        return colors.surface;
      case 'surfaceHover':
        return colors.surfaceHover || colors.surface;
      case 'transparent':
        return 'transparent';
      default:
        return colors.background;
    }
  };

  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
      {...props}
    />
  );
};