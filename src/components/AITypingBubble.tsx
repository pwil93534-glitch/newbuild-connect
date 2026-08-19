import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../design-system';

function Dot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });

  return (
    <Animated.View style={[styles.dot, { opacity, transform: [{ translateY }] }]} />
  );
}

export function AITypingBubble() {
  return (
    <View style={styles.bubble}>
      <View style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={160} />
        <Dot delay={320} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: 4,
    padding: Spacing.md,
    alignSelf: 'flex-start',
    marginLeft: Spacing.sm,
  },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center', height: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});
