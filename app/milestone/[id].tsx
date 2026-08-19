import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/design-system';
import { MilestoneCheckmark, Button } from '../../src/components';
import { useAppStore } from '../../src/stores/app';

export default function MilestoneScreen() {
  const { id, title, stage } = useLocalSearchParams<{ id: string; title?: string; stage?: string }>();
  const router = useRouter();
  const { showToast } = useAppStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ConfettiCannon
        count={180}
        origin={{ x: -10, y: 0 }}
        colors={[Colors.primary, Colors.accent, Colors.success, '#FFFFFF', Colors.supportMilitaryBlue]}
        autoStart
        fadeOut
      />

      <View style={styles.content}>
        <MilestoneCheckmark size={80} />

        <View style={styles.textSection}>
          <Text style={styles.congratulations}>Congratulations! 🎉</Text>
          <Text style={styles.milestoneTitle}>{title ?? 'Milestone Achieved!'}</Text>
          {stage && (
            <Text style={styles.stageText}>Stage {stage} Complete</Text>
          )}
          <Text style={styles.description}>
            You're one big step closer to your new home. Every milestone is a victory — celebrate this one!
          </Text>
        </View>

        <View style={styles.sharingSection}>
          <Text style={styles.shareTitle}>Share your progress</Text>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => showToast('Share link ready!', 'success')}
          >
            <Ionicons name="share-social-outline" size={20} color={Colors.primary} />
            <Text style={styles.shareBtnText}>Share with family & friends</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Continue My Journey →"
          onPress={() => router.back()}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.xl,
  },
  textSection: { alignItems: 'center', gap: Spacing.sm },
  congratulations: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.success,
    textAlign: 'center',
  },
  milestoneTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stageText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
  },
  description: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  sharingSection: { alignItems: 'center', gap: Spacing.sm },
  shareTitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  shareBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
});
