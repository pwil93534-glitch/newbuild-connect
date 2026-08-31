import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../design-system';
import { SignalQuality } from '../types';

const QUALITY_CONFIG: Record<SignalQuality, { bars: number; color: string; label: string }> = {
  excellent: { bars: 4, color: Colors.success, label: 'Excellent' },
  good: { bars: 3, color: Colors.success, label: 'Good' },
  fair: { bars: 2, color: Colors.accent, label: 'Fair' },
  poor: { bars: 1, color: Colors.danger, label: 'Poor' },
  none: { bars: 0, color: Colors.danger, label: 'No Signal' },
};

const BAR_HEIGHTS = [8, 13, 18, 23];

interface SignalMeterProps {
  quality: SignalQuality;
}

export function SignalMeter({ quality }: SignalMeterProps) {
  const config = QUALITY_CONFIG[quality];

  return (
    <View style={styles.row}>
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((height, i) => (
          <View
            key={height}
            style={[
              styles.bar,
              { height },
              i < config.bars ? { backgroundColor: config.color } : styles.barEmpty,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 6, borderRadius: BorderRadius.sm },
  barEmpty: { backgroundColor: Colors.border },
  label: { fontSize: FontSize.md, fontWeight: FontWeight.bold, marginLeft: Spacing.xs },
});
