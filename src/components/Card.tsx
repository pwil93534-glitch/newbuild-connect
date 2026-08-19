import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '../design-system';

type CardVariant = 'standard' | 'featured' | 'interactive';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, variant = 'standard', onPress, style, padding }: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'featured' && styles.featured,
    { padding: padding ?? Spacing.lg },
    style,
  ];

  if (onPress || variant === 'interactive') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.92}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  featured: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
    ...Shadows.lg,
  },
});
