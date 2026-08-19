import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../design-system';

interface MilestoneCheckmarkProps {
  size?: number;
  onComplete?: () => void;
}

export function MilestoneCheckmark({ size = 64, onComplete }: MilestoneCheckmarkProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, damping: 14, stiffness: 200, useNativeDriver: true }),
    ]).start(() => {
      if (onComplete) setTimeout(onComplete, 1000);
    });
  }, []);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          { transform: [{ scale }] },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
          <Ionicons name="checkmark" size={size * 0.55} color={Colors.white} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  circle: { backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center' },
});
