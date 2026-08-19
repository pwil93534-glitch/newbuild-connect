import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../design-system';
import { BuyerType } from '../types';

type BadgeVariant = BuyerType | 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  veteran: { bg: Colors.supportMilitaryBlue, text: Colors.primary },
  first_time: { bg: '#D1F0EF', text: '#0D7377' },
  relocation: { bg: '#FEF3C7', text: '#B45309' },
  senior: { bg: '#FEE2E2', text: Colors.danger },
  success: { bg: '#D1FAE5', text: Colors.success },
  danger: { bg: '#FEE2E2', text: Colors.danger },
  warning: { bg: Colors.supportGoldLight, text: Colors.accent },
  info: { bg: Colors.supportMilitaryBlue, text: Colors.primary },
  neutral: { bg: Colors.backgroundSecondary, text: Colors.textSecondary },
};

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const colors = BADGE_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.3,
  },
});
