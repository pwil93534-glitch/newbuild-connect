import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Badge, EmptyState, CommunityMap } from '../../src/components';
import { COMMUNITIES } from '../../src/constants/communities';
import { useBuyerStore } from '../../src/stores/buyer';
import { useAppStore } from '../../src/stores/app';
import { Buyer, Community } from '../../src/types';

const FILTERS = [
  { id: 'all', label: 'All Communities' },
  { id: 'va', label: 'VA Eligible' },
  { id: 'fha', label: 'FHA Eligible' },
  { id: 'senior', label: '55+' },
  { id: 'phoenix', label: 'Phoenix' },
  { id: 'tucson', label: 'Tucson' },
];

function getCommunityMatch(community: Community, buyer?: Partial<Buyer> | null) {
  let score = 56;
  const reasons: string[] = [];

  if (buyer?.budget_max && community.priceFrom <= buyer.budget_max) {
    score += 14;
    reasons.push('Fits your budget');
  }
  if (buyer?.budget_min && community.priceTo < buyer.budget_min) {
    score -= 8;
  }
  if (buyer?.buyer_type === 'veteran' && community.vaEligible) {
    score += 16;
    reasons.push('VA eligible');
  }
  if (buyer?.buyer_type === 'first_time' && community.fhaEligible) {
    score += 14;
    reasons.push('FHA friendly');
  }
  if (buyer?.buyer_type === 'senior' && community.seniorCommunity) {
    score += 20;
    reasons.push('55+ lifestyle fit');
  }
  if (buyer?.buyer_type === 'relocation') {
    score += community.amenities.length >= 4 ? 10 : 4;
    reasons.push('Easy to compare remotely');
  }
  if (buyer?.military_base && community.base === buyer.military_base) {
    score += 15;
    reasons.push('Near your base');
  }
  if (community.activeIncentives.length > 0) {
    score += 8;
    reasons.push('Active incentives');
  }

  return {
    score: Math.max(42, Math.min(98, score)),
    reasons: reasons.slice(0, 3),
  };
}

function getScoreColor(score: number) {
  if (score >= 85) return Colors.success;
  if (score >= 72) return Colors.primary;
  return Colors.accent;
}

function CommunityListCard({
  community,
  onPress,
  isSaved,
  onSave,
  buyer,
  isCompared,
  onCompare,
}: {
  community: Community;
  onPress: () => void;
  isSaved: boolean;
  onSave: () => void;
  buyer?: Partial<Buyer> | null;
  isCompared: boolean;
  onCompare: () => void;
}) {
  const match = getCommunityMatch(community, buyer);
  const scoreColor = getScoreColor(match.score);

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.9}>
      <View style={[styles.cardColorBar, { backgroundColor: community.color }]}>
        {community.activeIncentives.length > 0 && (
          <View style={styles.incentivePill}>
            <Ionicons name="flame" size={11} color={Colors.white} />
            <Text style={styles.incentivePillText}>{community.activeIncentives[0]}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{community.name}</Text>
            <Text style={styles.cardBuilder}>{community.builder}</Text>
            <Text style={styles.cardCity}>{community.city}, AZ</Text>
          </View>
          <View style={[styles.matchBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.matchScore, { color: scoreColor }]}>{match.score}%</Text>
            <Text style={styles.matchLabel}>Match</Text>
          </View>
          <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isSaved ? Colors.accent : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.cardPrice}>
          ${(community.priceFrom / 1000).toFixed(0)}K - ${(community.priceTo / 1000).toFixed(0)}K
        </Text>

        {match.reasons.length > 0 && (
          <View style={styles.matchReasons}>
            {match.reasons.map((reason) => (
              <View key={reason} style={styles.reasonChip}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {community.distanceFromBase && (
          <View style={styles.distanceRow}>
            <Ionicons name="shield-outline" size={13} color={Colors.primary} />
            <Text style={styles.distanceText}>{community.distanceFromBase} mi from base</Text>
          </View>
        )}

        <View style={styles.eligibility}>
          {community.vaEligible && <Badge label="VA Loan" variant="veteran" />}
          {community.fhaEligible && <Badge label="FHA" variant="info" />}
          {community.seniorCommunity && <Badge label="55+" variant="senior" />}
        </View>

        <View style={styles.amenities}>
          {community.amenities.slice(0, 3).map((amenity) => (
            <View key={amenity} style={styles.amenityChip}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.compareBtn, isCompared && styles.compareBtnActive]}
          onPress={onCompare}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isCompared ? 'checkmark-circle' : 'git-compare-outline'}
            size={16}
            color={isCompared ? Colors.white : Colors.primary}
          />
          <Text style={[styles.compareBtnText, isCompared && styles.compareBtnTextActive]}>
            {isCompared ? 'Added to Compare' : 'Compare'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function CompareTray({
  communities,
  onClear,
  onOpen,
  onCompareNow,
}: {
  communities: Community[];
  onClear: () => void;
  onOpen: (id: string) => void;
  onCompareNow: () => void;
}) {
  if (communities.length === 0) return null;

  return (
    <View style={styles.compareTray}>
      <View style={styles.compareTrayHeader}>
        <View>
          <Text style={styles.compareTrayTitle}>Compare Shortlist</Text>
          <Text style={styles.compareTraySub}>{communities.length} of 3 selected</Text>
        </View>
        <TouchableOpacity onPress={onClear} style={styles.clearCompareBtn}>
          <Text style={styles.clearCompareText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.compareItems}>
        {communities.map((community) => (
          <TouchableOpacity key={community.id} style={styles.compareItem} onPress={() => onOpen(community.id)}>
            <View style={[styles.compareColor, { backgroundColor: community.color }]} />
            <Text style={styles.compareName} numberOfLines={1}>{community.name}</Text>
            <Text style={styles.comparePrice}>${(community.priceFrom / 1000).toFixed(0)}K+</Text>
          </TouchableOpacity>
        ))}
      </View>
      {communities.length >= 2 && (
        <TouchableOpacity style={styles.compareNowBtn} onPress={onCompareNow} activeOpacity={0.85}>
          <Ionicons name="git-compare-outline" size={16} color={Colors.white} />
          <Text style={styles.compareNowText}>Compare Side-by-Side</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CommunitiesScreen() {
  const router = useRouter();
  const { buyer } = useBuyerStore();
  const {
    toggleSavedCommunity,
    isCommunitysaved,
    toggleCompareCommunity,
    clearCompare,
    isCommunityCompared,
    compareCommunityIds,
    showToast,
  } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filtered = useMemo(() => {
    return COMMUNITIES.filter((community) => {
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        community.name.toLowerCase().includes(term) ||
        community.builder.toLowerCase().includes(term) ||
        community.city.toLowerCase().includes(term);

      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'va' && community.vaEligible) ||
        (activeFilter === 'fha' && community.fhaEligible) ||
        (activeFilter === 'senior' && community.seniorCommunity) ||
        (activeFilter === 'phoenix' && community.area === 'phoenix') ||
        (activeFilter === 'tucson' && community.area === 'tucson');

      return matchesSearch && matchesFilter;
    }).sort((a, b) => getCommunityMatch(b, buyer).score - getCommunityMatch(a, buyer).score);
  }, [search, activeFilter, buyer]);

  const comparedCommunities = COMMUNITIES.filter((community) => compareCommunityIds.includes(community.id));
  const bestMatch = filtered[0] ? getCommunityMatch(filtered[0], buyer) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Communities</Text>
            <Text style={styles.subtitle}>{COMMUNITIES.length} Arizona communities</Text>
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? Colors.white : Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map-outline" size={18} color={viewMode === 'map' ? Colors.white : Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        {viewMode === 'list' && filtered[0] && bestMatch && (
          <View style={styles.bestMatchBanner}>
            <Ionicons name="sparkles" size={16} color={Colors.accent} />
            <Text style={styles.bestMatchText}>
              Top match: {filtered[0].name} ({bestMatch.score}%) based on your profile
            </Text>
          </View>
        )}
      </View>

      {viewMode === 'list' ? (
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, builder, city..."
                placeholderTextColor={Colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            horizontal
            data={FILTERS}
            keyExtractor={(filter) => filter.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === item.id && styles.filterChipActive]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text style={[styles.filterText, activeFilter === item.id && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          <FlatList
            data={filtered}
            keyExtractor={(community) => community.id}
            contentContainerStyle={[styles.list, comparedCommunities.length > 0 && styles.listWithTray]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="No communities found"
                description="Try adjusting your search or filters"
                actionLabel="Clear filters"
                onAction={() => { setSearch(''); setActiveFilter('all'); }}
              />
            }
            renderItem={({ item }) => (
              <CommunityListCard
                community={item}
                onPress={() => router.push(`/community/${item.id}`)}
                isSaved={isCommunitysaved(item.id)}
                onSave={() => {
                  const wasSaved = isCommunitysaved(item.id);
                  toggleSavedCommunity(item.id);
                  showToast(wasSaved ? 'Removed from saved communities.' : `${item.name} saved.`, wasSaved ? 'info' : 'success');
                }}
                buyer={buyer}
                isCompared={isCommunityCompared(item.id)}
                onCompare={() => toggleCompareCommunity(item.id)}
              />
            )}
          />

          <CompareTray
            communities={comparedCommunities}
            onClear={clearCompare}
            onOpen={(communityId) => router.push(`/community/${communityId}`)}
            onCompareNow={() => router.push('/compare' as any)}
          />
        </>
      ) : (
        <CommunityMap communities={filtered.length > 0 ? filtered : COMMUNITIES} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.backgroundPrimary,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleBtnActive: { backgroundColor: Colors.primary },
  bestMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.supportGoldLight,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  bestMatchText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: FontWeight.medium,
  },
  searchRow: { backgroundColor: Colors.backgroundPrimary, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  filterRow: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, gap: Spacing.sm, backgroundColor: Colors.backgroundPrimary },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  filterTextActive: { color: Colors.white, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.lg, paddingTop: Spacing.md },
  listWithTray: { paddingBottom: 220 },
  listCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardColorBar: { height: 8 },
  incentivePill: {
    position: 'absolute',
    bottom: -12,
    left: 12,
    right: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  incentivePillText: { flex: 1, fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white },
  cardContent: { padding: Spacing.lg, gap: Spacing.sm, paddingTop: Spacing.xl },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  cardName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cardBuilder: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  cardCity: { fontSize: FontSize.xs, color: Colors.textSecondary },
  saveBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  matchBadge: {
    minWidth: 58,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  matchScore: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  matchLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  cardPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  matchReasons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EAF7EF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  reasonText: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.medium },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  eligibility: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  amenityChip: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  amenityText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  compareBtn: {
    minHeight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  compareBtnActive: { backgroundColor: Colors.primary },
  compareBtnText: { color: Colors.primary, fontWeight: FontWeight.semibold, fontSize: FontSize.sm },
  compareBtnTextActive: { color: Colors.white },
  compareTray: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.lg,
  },
  compareTrayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareTrayTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  compareTraySub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  clearCompareBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  clearCompareText: { fontSize: FontSize.sm, color: Colors.danger, fontWeight: FontWeight.semibold },
  compareItems: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  compareItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: 3,
  },
  compareColor: { height: 5, borderRadius: BorderRadius.full },
  compareName: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  comparePrice: { fontSize: 10, color: Colors.textSecondary },
  compareNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  compareNowText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.white },
});
