import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Button } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { BuyerType } from '../../src/types';

const BUYER_TYPES: {
  id: BuyerType;
  emoji: string;
  title: string;
  description: string;
  color: string;
  lightColor: string;
}[] = [
  {
    id: 'veteran',
    emoji: '🎖️',
    title: 'Veteran / Military',
    description: "I've served or am currently serving. I want to use my VA benefits.",
    color: Colors.primary,
    lightColor: Colors.supportMilitaryBlue,
  },
  {
    id: 'first_time',
    emoji: '🏠',
    title: 'First-Time Buyer',
    description: "This is my first home purchase. I need guidance every step of the way.",
    color: '#0D7377',
    lightColor: '#D1F0EF',
  },
  {
    id: 'relocation',
    emoji: '📦',
    title: 'Relocating to Arizona',
    description: "I'm moving to Arizona from another state or city. I need to learn the market fast.",
    color: '#B45309',
    lightColor: '#FEF3C7',
  },
  {
    id: 'senior',
    emoji: '🌅',
    title: 'Senior / 55+',
    description: "I'm looking for active adult living, low-maintenance, or retirement communities.",
    color: '#B45069',
    lightColor: '#FEE2E2',
  },
];

function BuyerTypeCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof BUYER_TYPES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const handlePress = () => {
    onSelect();
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.card,
          { borderColor: selected ? item.color : Colors.border },
          selected && { backgroundColor: item.lightColor, ...Shadows.md },
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={[styles.cardHeader, { backgroundColor: selected ? item.color : Colors.backgroundSecondary }]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          {selected && <Ionicons name="checkmark-circle" size={24} color={Colors.white} />}
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, selected && { color: item.color }]}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function BuyerTypeSelectScreen() {
  const router = useRouter();
  const { updateBuyer } = useBuyerStore();
  const [selected, setSelected] = useState<BuyerType | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    updateBuyer({ buyer_type: selected });
    if (selected === 'veteran') {
      router.push('/(auth)/base-select');
    } else {
      router.push('/(auth)/profile-setup');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tell us about{'\n'}your journey</Text>
        <Text style={styles.subtitle}>Select the option that best describes you. We'll personalize everything from here.</Text>

        <View style={styles.cards}>
          {BUYER_TYPES.map((item) => (
            <BuyerTypeCard
              key={item.id}
              item={item}
              selected={selected === item.id}
              onSelect={() => setSelected(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
          fullWidth
          size="lg"
        />
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
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flexDirection: 'row', gap: Spacing.xs, flex: 1 },
  dot: { width: 32, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['2xl'] },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing['2xl'],
  },
  cards: { gap: Spacing.md },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  emoji: { fontSize: 28 },
  cardBody: { padding: Spacing.md, paddingTop: Spacing.xs },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
