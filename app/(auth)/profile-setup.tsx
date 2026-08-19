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
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/design-system';
import { Button, TextInput } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { LoanType, Timeline } from '../../src/types';

const TIMELINES: { id: Timeline; label: string }[] = [
  { id: 'asap', label: 'ASAP' },
  { id: '1_3mo', label: '1–3 months' },
  { id: '3_6mo', label: '3–6 months' },
  { id: '6_12mo', label: '6–12 months' },
  { id: 'exploring', label: 'Just exploring' },
];

const LOAN_TYPES: { id: LoanType; label: string; description: string }[] = [
  { id: 'va', label: 'VA Loan', description: '$0 down, no PMI' },
  { id: 'fha', label: 'FHA Loan', description: '3.5% down, flexible credit' },
  { id: 'conventional', label: 'Conventional', description: '3-20% down, best rates' },
  { id: 'unsure', label: 'Not sure yet', description: "I'll figure it out with help" },
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { updateBuyer, buyer } = useBuyerStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [budgetMin, setBudgetMin] = useState(250000);
  const [budgetMax, setBudgetMax] = useState(450000);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loanType, setLoanType] = useState<LoanType | null>(
    buyer?.buyer_type === 'veteran' ? 'va' : null
  );

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  const isValid = name.trim().length > 0 && timeline !== null && loanType !== null;

  const handleContinue = () => {
    if (!isValid) return;
    updateBuyer({
      name: name.trim(),
      phone,
      email,
      budget_min: budgetMin,
      budget_max: budgetMax,
      timeline: timeline!,
      loan_type: loanType!,
    });
    router.push('/(auth)/meet-strategist');
  };

  const adjustBudget = (type: 'min' | 'max', delta: number) => {
    if (type === 'min') {
      const newVal = Math.max(150000, Math.min(budgetMin + delta, budgetMax - 50000));
      setBudgetMin(newVal);
    } else {
      const newVal = Math.min(900000, Math.max(budgetMax + delta, budgetMin + 50000));
      setBudgetMax(newVal);
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
            <View key={i} style={[styles.dot, i <= 3 && styles.dotActive]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Quick Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your experience. This only takes 2 minutes.</Text>

        {/* Name */}
        <View style={styles.section}>
          <TextInput
            label="Your first name *"
            placeholder="e.g. Marcus"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <TextInput
            label="Phone (optional)"
            placeholder="(555) 000-0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            label="Email (optional)"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Budget Range</Text>
          <View style={styles.budgetDisplay}>
            <Text style={styles.budgetValue}>{formatCurrency(budgetMin)}</Text>
            <Text style={styles.budgetSeparator}>—</Text>
            <Text style={styles.budgetValue}>{formatCurrency(budgetMax)}</Text>
          </View>
          <View style={styles.budgetControls}>
            <View style={styles.budgetSide}>
              <Text style={styles.budgetLabel}>Min</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepper} onPress={() => adjustBudget('min', -25000)}>
                  <Ionicons name="remove" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepper} onPress={() => adjustBudget('min', 25000)}>
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.budgetSide}>
              <Text style={styles.budgetLabel}>Max</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity style={styles.stepper} onPress={() => adjustBudget('max', -25000)}>
                  <Ionicons name="remove" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.stepper} onPress={() => adjustBudget('max', 25000)}>
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Timeline *</Text>
          <View style={styles.chips}>
            {TIMELINES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, timeline === t.id && styles.chipSelected]}
                onPress={() => setTimeline(t.id)}
              >
                <Text style={[styles.chipText, timeline === t.id && styles.chipTextSelected]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Loan Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Loan Type *</Text>
          <View style={styles.loanTypes}>
            {LOAN_TYPES.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.loanCard, loanType === l.id && styles.loanCardSelected]}
                onPress={() => setLoanType(l.id)}
              >
                <Text style={[styles.loanName, loanType === l.id && styles.loanNameSelected]}>{l.label}</Text>
                <Text style={styles.loanDesc}>{l.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleContinue} disabled={!isValid} fullWidth size="lg" />
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
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['4xl'] },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: Spacing.lg },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  section: { marginBottom: Spacing.xl, gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  budgetDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, justifyContent: 'center', paddingVertical: Spacing.md },
  budgetValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  budgetSeparator: { fontSize: FontSize.lg, color: Colors.textSecondary },
  budgetControls: { flexDirection: 'row', justifyContent: 'space-around' },
  budgetSide: { alignItems: 'center', gap: Spacing.sm },
  budgetLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  stepperRow: { flexDirection: 'row', gap: Spacing.sm },
  stepper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.supportMilitaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: Colors.supportMilitaryBlue },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  chipTextSelected: { color: Colors.primary, fontWeight: FontWeight.semibold },
  loanTypes: { gap: Spacing.sm },
  loanCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  loanCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.supportMilitaryBlue },
  loanName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  loanNameSelected: { color: Colors.primary },
  loanDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
