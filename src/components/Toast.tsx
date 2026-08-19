import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadows } from '../design-system';
import { useAppStore } from '../stores/app';

const ICON_MAP = {
  success: { name: 'checkmark-circle' as const, color: Colors.success },
  error: { name: 'close-circle' as const, color: Colors.danger },
  warning: { name: 'warning' as const, color: Colors.accent },
  info: { name: 'information-circle' as const, color: Colors.primary },
};

function ToastItem({ id, message, type }: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const { dismissToast } = useAppStore();
  const icon = ICON_MAP[type];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Ionicons name={icon.name} size={20} color={icon.color} />
      <Text style={styles.message} numberOfLines={3}>{message}</Text>
      <TouchableOpacity onPress={() => dismissToast(id)}>
        <Ionicons name="close" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ToastContainer() {
  const { toasts } = useAppStore();
  if (toasts.length === 0) return null;
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    gap: Spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
});
