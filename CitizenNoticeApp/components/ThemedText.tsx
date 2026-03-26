// components/ThemedText.tsx
import React from 'react';
import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'disabled';
  style?: StyleProp<TextStyle>;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  style, 
  variant = 'primary',
  ...props 
}) => {
  const { colors } = useTheme();

  const getColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.text?.secondary || '#64748b';
      case 'muted':
        return colors.text?.muted || '#94a3b8';
      case 'inverse':
        return colors.text?.inverse || '#ffffff';
      case 'disabled':
        return colors.text?.disabled || '#cbd5e1';
      default:
        return colors.text?.primary || '#1e293b';
    }
  };

  return (
    <Text
      style={[
        { color: getColor() },
        style,
      ]}
      {...props}
    />
  );
};