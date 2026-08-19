import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Button } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { MilitaryBase } from '../../src/types';
import { MILITARY_BASES } from '../../src/constants/bases';

export default function BaseSelectScreen() {
  const router = useRouter();
  const { updateBuyer } = useBuyerStore();
  const [selected, setSelected] = useState<MilitaryBase | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateBuyer({ military_base: selected });
    router.push('/(auth)/profile-setup');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.white} />
          <Text style={styles.badgeText}>Military Buyer</Text>
        </View>
        <Text style={styles.title}>Which base are you{'\n'}associated with?</Text>
        <Text style={styles.subtitle}>We'll show you communities in the right area and calculate your BAH buying power.</Text>

        <View style={styles.bases}>
          {MILITARY_BASES.map((base) => (
            <TouchableOpacity
              key={base.id}
              style={[
                styles.baseCard,
                selected === base.id && styles.baseCardSelected,
              ]}
              onPress={() => setSelected(base.id)}
              activeOpacity={0.88}
            >
              <View style={styles.baseLeft}>
                <View style={[styles.baseDot, selected === base.id && styles.baseDotSelected]} />
                <View>
                  <Text style={[styles.baseName, selected === base.id && styles.baseNameSelected]}>
                    {base.shortName}
                  </Text>
                  <Text style={styles.baseCity}>{base.city}, {base.state}</Text>
                </View>
              </View>
              <View style={[styles.areaTag, { backgroundColor: base.area === 'phoenix' ? Colors.supportMilitaryBlue : Colors.supportGoldLight }]}>
                <Text style={[styles.areaTagText, { color: base.area === 'phoenix' ? Colors.primary : Colors.accent }]}>
                  {base.area === 'phoenix' ? 'Phoenix Metro' : 'Tucson Metro'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!selected} fullWidth size="lg" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: Spacing.xs, flex: 1, marginLeft: Spacing.sm },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['2xl'] },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.white },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing['2xl'] },
  bases: { gap: Spacing.md },
  baseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  baseCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.supportMilitaryBlue, ...Shadows.md },
  baseLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  baseDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border },
  baseDotSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  baseName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  baseNameSelected: { color: Colors.primary },
  baseCity: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  areaTag: { borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  areaTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
