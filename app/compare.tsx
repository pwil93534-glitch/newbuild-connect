import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../src/design-system';
import { COMMUNITIES } from '../src/constants/communities';
import { useAppStore } from '../src/stores/app';
import { useBuyerStore } from '../src/stores/buyer';
import { Community, Buyer } from '../src/types';

const LABEL_WIDTH = 100;

function calcPI(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || annualRatePct <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function getMonthlyPayment(community: Community, buyer: Partial<Buyer> | null): number {
  const midPrice = (community.priceFrom + community.priceTo) / 2;
  const buyerType = buyer?.buyer_type ?? 'first_time';
  let downPct = 0.05;
  if (buyerType === 'veteran' && community.vaEligible) downPct = 0;
  else if (buyerType === 'first_time' && community.fhaEligible) downPct = 0.035;
  else if (buyerType === 'senior') downPct = 0.2;
  const principal = midPrice * (1 - downPct);
  const pi = calcPI(principal, 6.75, 30);
  const tax = (midPrice * 0.006) / 12;
  const ins = (midPrice * 0.005) / 12;
  const mip = buyerType === 'first_time' && community.fhaEligible ? (principal * 0.0085) / 12 : 0;
  return Math.round(pi + tax + ins + mip);
}

function getMatchScore(community: Community, buyer: Partial<Buyer> | null): number {
  let score = 56;
  if (buyer?.budget_max && community.priceFrom <= buyer.budget_max) score += 14;
  if (buyer?.budget_min && community.priceTo < buyer.budget_min) score -= 8;
  if (buyer?.buyer_type === 'veteran' && community.vaEligible) score += 16;
  if (buyer?.buyer_type === 'first_time' && community.fhaEligible) score += 14;
  if (buyer?.buyer_type === 'senior' && community.seniorCommunity) score += 20;
  if (buyer?.buyer_type === 'relocation') score += community.amenities.length >= 4 ? 10 : 4;
  if (buyer?.military_base && community.base === buyer.military_base) score += 15;
  if (community.activeIncentives.length > 0) score += 8;
  return Math.max(42, Math.min(98, score));
}

function scoreColor(score: number) {
  if (score >= 85) return Colors.success;
  if (score >= 72) return Colors.primary;
  return Colors.accent;
}

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <View style={styles.rowLabel}>
      <Text style={styles.rowLabelText}>{label}</Text>
      {sub ? <Text style={styles.rowLabelSub}>{sub}</Text> : null}
    </View>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <View style={styles.cell}>{children}</View>;
}

function CheckCell({ value }: { value: boolean }) {
  return (
    <Cell>
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle-outline'}
        size={22}
        color={value ? Colors.success : Colors.border}
      />
    </Cell>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function CompareScreen() {
  const router = useRouter();
  const { compareCommunityIds, clearCompare } = useAppStore();
  const { buyer } = useBuyerStore();

  const communities = COMMUNITIES.filter((c) => compareCommunityIds.includes(c.id));

  if (communities.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyWrap}>
          <Ionicons name="git-compare-outline" size={52} color={Colors.border} />
          <Text style={styles.emptyTitle}>No communities selected</Text>
          <Text style={styles.emptySub}>Go to Search and tap Compare on any community card</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
            <Text style={styles.emptyBtnText}>Browse Communities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scores = communities.map((c) => getMatchScore(c, buyer));
  const bestScore = Math.max(...scores);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Side-by-Side</Text>
        <TouchableOpacity
          onPress={() => { clearCompare(); router.back(); }}
          style={styles.clearHeaderBtn}
        >
          <Text style={styles.clearHeaderText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Community column headers */}
        <View style={styles.colHeaders}>
          <View style={{ width: LABEL_WIDTH }} />
          {communities.map((c, idx) => {
            const score = scores[idx];
            const isBest = score === bestScore && communities.length > 1;
            return (
              <View key={c.id} style={styles.colHeader}>
                {isBest ? (
                  <View style={styles.bestBadge}>
                    <Ionicons name="sparkles" size={10} color={Colors.white} />
                    <Text style={styles.bestBadgeText}>Best Match</Text>
                  </View>
                ) : (
                  <View style={{ height: 22 }} />
                )}
                <View style={[styles.colorBar, { backgroundColor: c.color }]} />
                <Text style={styles.colName} numberOfLines={2}>{c.name}</Text>
                <Text style={styles.colBuilder} numberOfLines={1}>{c.builder}</Text>
                <View style={[styles.scoreChip, { borderColor: scoreColor(score) }]}>
                  <Text style={[styles.scoreChipText, { color: scoreColor(score) }]}>{score}%</Text>
                  <Text style={styles.scoreChipLabel}>match</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Price range */}
          <View style={styles.row}>
            <RowLabel label="Price Range" />
            {communities.map((c) => (
              <Cell key={c.id}>
                <Text style={styles.cellPrimary}>${(c.priceFrom / 1000).toFixed(0)}K</Text>
                <Text style={styles.cellSub}>–${(c.priceTo / 1000).toFixed(0)}K</Text>
              </Cell>
            ))}
          </View>

          <Divider />

          {/* Monthly payment */}
          <View style={[styles.row, styles.rowHighlight]}>
            <RowLabel label="Est. Monthly" sub="PITI" />
            {communities.map((c) => {
              const pmt = getMonthlyPayment(c, buyer);
              return (
                <Cell key={c.id}>
                  <Text style={[styles.cellPrimary, { color: Colors.primary }]}>
                    ${pmt.toLocaleString()}
                  </Text>
                  <Text style={styles.cellSub}>/mo</Text>
                </Cell>
              );
            })}
          </View>

          <Divider />

          {/* City */}
          <View style={styles.row}>
            <RowLabel label="City" />
            {communities.map((c) => (
              <Cell key={c.id}>
                <Text style={styles.cellDefault}>{c.city}</Text>
              </Cell>
            ))}
          </View>

          <Divider />

          {/* VA eligible */}
          <View style={styles.row}>
            <RowLabel label="VA Loan" />
            {communities.map((c) => <CheckCell key={c.id} value={c.vaEligible} />)}
          </View>

          <Divider />

          {/* FHA eligible */}
          <View style={styles.row}>
            <RowLabel label="FHA" />
            {communities.map((c) => <CheckCell key={c.id} value={c.fhaEligible} />)}
          </View>

          <Divider />

          {/* 55+ */}
          <View style={styles.row}>
            <RowLabel label="55+ Living" />
            {communities.map((c) => <CheckCell key={c.id} value={c.seniorCommunity} />)}
          </View>

          <Divider />

          {/* Distance from base */}
          <View style={styles.row}>
            <RowLabel label="Base" sub="mi" />
            {communities.map((c) => (
              <Cell key={c.id}>
                {c.distanceFromBase ? (
                  <Text style={styles.cellDefault}>{c.distanceFromBase} mi</Text>
                ) : (
                  <Text style={styles.cellNa}>—</Text>
                )}
              </Cell>
            ))}
          </View>

          <Divider />

          {/* Incentives */}
          <View style={styles.row}>
            <RowLabel label="Incentives" />
            {communities.map((c) => (
              <Cell key={c.id}>
                {c.activeIncentives.length > 0 ? (
                  <>
                    <View style={styles.incentiveCount}>
                      <Ionicons name="flame" size={11} color={Colors.white} />
                      <Text style={styles.incentiveCountText}>{c.activeIncentives.length}</Text>
                    </View>
                    <Text style={styles.cellSub} numberOfLines={2}>
                      {c.activeIncentives[0]}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.cellNa}>None</Text>
                )}
              </Cell>
            ))}
          </View>

          <Divider />

          {/* Amenities */}
          <View style={[styles.row, { alignItems: 'flex-start' }]}>
            <View style={[styles.rowLabel, { paddingTop: 14 }]}>
              <Text style={styles.rowLabelText}>Amenities</Text>
            </View>
            {communities.map((c) => (
              <View key={c.id} style={[styles.cell, { alignItems: 'flex-start', gap: 4, paddingVertical: 12 }]}>
                {c.amenities.slice(0, 4).map((a) => (
                  <View key={a} style={styles.amenityTag}>
                    <Text style={styles.amenityTagText} numberOfLines={1}>{a}</Text>
                  </View>
                ))}
                {c.amenities.length > 4 ? (
                  <Text style={styles.moreText}>+{c.amenities.length - 4} more</Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        {/* View detail buttons */}
        <View style={styles.actions}>
          <Text style={styles.actionsLabel}>View full details</Text>
          <View style={styles.actionRow}>
            {communities.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.actionBtn, { borderColor: c.color }]}
                onPress={() => router.push(`/community/${c.id}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.actionDot, { backgroundColor: c.color }]} />
                <Text style={styles.actionBtnText} numberOfLines={1}>{c.name}</Text>
                <Ionicons name="arrow-forward-outline" size={14} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  clearHeaderBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  clearHeaderText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyBtnText: { color: Colors.white, fontWeight: FontWeight.semibold, fontSize: FontSize.md },

  colHeaders: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.backgroundPrimary,
    gap: Spacing.xs,
  },
  colHeader: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white },
  colorBar: { width: 40, height: 5, borderRadius: BorderRadius.full },
  colName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  colBuilder: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  scoreChip: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    alignItems: 'center',
  },
  scoreChipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  scoreChipLabel: { fontSize: 9, color: Colors.textSecondary },

  table: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  rowHighlight: { backgroundColor: Colors.backgroundSecondary },
  rowLabel: {
    width: LABEL_WIDTH,
    paddingRight: Spacing.sm,
  },
  rowLabelText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  rowLabelSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 1 },

  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  cellPrimary: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cellDefault: { fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'center' },
  cellSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  cellNa: { fontSize: FontSize.sm, color: Colors.border },

  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },

  incentiveCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  incentiveCountText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white },

  amenityTag: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    maxWidth: '100%',
  },
  amenityTagText: { fontSize: 10, color: Colors.textSecondary },
  moreText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.medium },

  actions: {
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  actionsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: { gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundCard,
  },
  actionDot: { width: 10, height: 10, borderRadius: 5 },
  actionBtnText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
});
