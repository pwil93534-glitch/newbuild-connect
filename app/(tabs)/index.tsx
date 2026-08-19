import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Card, Badge, ProgressBar, AITypingBubble } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { useNotificationsStore } from '../../src/stores/notifications';
import { COMMUNITIES } from '../../src/constants/communities';
import { JOURNEY_BY_BUYER_TYPE } from '../../src/constants/journey-steps';
import { generateDailyInsight } from '../../src/services/anthropic';
import { AGENT_PERSONA, AGENT_PHOTO } from '../../src/constants/agent';
import { Community } from '../../src/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function CountUpNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(start);
    }, 50);
    return () => clearInterval(timer);
  }, [target]);
  return <Text style={styles.tileValue}>{prefix}{value}{suffix}</Text>;
}

function MetricTile({ label, value, numericValue, icon, color, prefix = '', suffix = '' }: {
  label: string; value?: string; numericValue?: number; icon: string; color: string; prefix?: string; suffix?: string;
}) {
  return (
    <View style={[styles.tile, { borderTopWidth: 3, borderTopColor: color }]}>
      <View style={[styles.tileIconBg, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      {numericValue !== undefined
        ? <CountUpNumber target={numericValue} prefix={prefix} suffix={suffix} />
        : <Text style={styles.tileValue}>{value}</Text>
      }
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function CommunityCard({ community, onPress }: { community: Community; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.commCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.commHeader, { backgroundColor: community.color }]}>
          <View style={styles.commHeaderOverlay}>
            <Text style={styles.commBuilderTag}>{community.builder}</Text>
            {community.activeIncentives.length > 0 && (
              <View style={styles.incentivePill}>
                <Ionicons name="flame" size={10} color={Colors.white} />
                <Text style={styles.incentivePillText}>Incentives Active</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.commBody}>
          <Text style={styles.commName}>{community.name}</Text>
          <Text style={styles.commCity}>{community.city}, AZ</Text>
          <Text style={styles.commPrice}>
            ${(community.priceFrom / 1000).toFixed(0)}K – ${(community.priceTo / 1000).toFixed(0)}K
          </Text>
          <View style={styles.commTags}>
            {community.vaEligible && (
              <View style={[styles.tag, { backgroundColor: Colors.supportMilitaryBlue }]}>
                <Text style={[styles.tagText, { color: Colors.primary }]}>VA ✓</Text>
              </View>
            )}
            {community.seniorCommunity && (
              <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.tagText, { color: Colors.danger }]}>55+</Text>
              </View>
            )}
            {community.distanceFromBase && (
              <View style={[styles.tag, { backgroundColor: Colors.backgroundSecondary }]}>
                <Text style={[styles.tagText, { color: Colors.textSecondary }]}>{community.distanceFromBase} mi</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const BUYER_LABEL: Record<string, string> = {
  veteran: 'Veteran',
  first_time: 'First-Time Buyer',
  relocation: 'Relocating',
  senior: 'Senior 55+',
};

const STAGE_LABELS = [
  'Profile', 'Pre-Approval', 'Community Search', 'Lot Reserved',
  'Contract', 'Build Phase', 'Close', 'Keys 🎉',
];

export default function DashboardScreen() {
  const router = useRouter();
  const { buyer } = useBuyerStore();
  const unreadAlerts = useNotificationsStore((s) => s.unreadCount)();
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentStage = buyer?.current_stage ?? 1;
  const journeyStages = buyer?.buyer_type ? JOURNEY_BY_BUYER_TYPE[buyer.buyer_type] : [];
  const totalStages = journeyStages.length || 8;
  const progress = currentStage / totalStages;

  const filteredCommunities = COMMUNITIES.filter((c) => {
    if (buyer?.buyer_type === 'senior') return c.seniorCommunity || c.vaEligible;
    if (buyer?.buyer_type === 'veteran') return c.vaEligible;
    if (buyer?.buyer_type === 'first_time') return c.fhaEligible;
    return true;
  }).slice(0, 8);

  const loadInsight = async () => {
    setInsightLoading(true);
    const msg = await generateDailyInsight(buyer ?? {});
    setInsight(msg);
    setInsightLoading(false);
  };

  useEffect(() => { loadInsight(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsight();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero Header */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>{getGreeting()}{buyer?.name ? `, ${buyer.name.split(' ')[0]}` : ''}!</Text>
            <Text style={styles.heroSubtitle}>Let's find your perfect Arizona home.</Text>
            {buyer?.buyer_type && (
              <Badge label={BUYER_LABEL[buyer.buyer_type]} variant={buyer.buyer_type} style={{ marginTop: Spacing.xs }} />
            )}
          </View>
          <View style={styles.heroRight}>
            <TouchableOpacity style={styles.agentAvatarBtn} onPress={() => router.push('/(tabs)/profile')}>
              <View style={styles.agentAvatarRing}>
                <Image source={AGENT_PHOTO} style={styles.agentAvatarImg} contentFit="cover" contentPosition="top" />
              </View>
              <View style={styles.onlineDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/alerts' as any)}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
              {unreadAlerts > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadAlerts > 9 ? '9+' : unreadAlerts}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Journey Progress Card */}
        <Card style={styles.journeyCard} padding={Spacing.lg}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/journey')} activeOpacity={0.88}>
            <View style={styles.journeyTop}>
              <View>
                <Text style={styles.journeyLabel}>YOUR JOURNEY</Text>
                <Text style={styles.journeyStage}>
                  Stage {currentStage} of {totalStages} · {journeyStages[currentStage - 1]?.name ?? 'Getting Started'}
                </Text>
              </View>
              <View style={styles.journeyPct}>
                <Text style={styles.journeyPctText}>{Math.round(progress * 100)}%</Text>
                <Text style={styles.journeyPctLabel}>Complete</Text>
              </View>
            </View>

            <ProgressBar progress={progress} height={10} style={{ marginVertical: Spacing.md }} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.stageRow}>
                {STAGE_LABELS.map((label, idx) => {
                  const stageNum = idx + 1;
                  const isComplete = stageNum < currentStage;
                  const isCurrent = stageNum === currentStage;
                  return (
                    <View key={label} style={styles.stageItem}>
                      <View style={[
                        styles.stageDot,
                        isComplete && styles.stageDotComplete,
                        isCurrent && styles.stageDotCurrent,
                      ]}>
                        {isComplete
                          ? <Ionicons name="checkmark" size={10} color={Colors.white} />
                          : <Text style={[styles.stageNum, isCurrent && { color: Colors.white }]}>{stageNum}</Text>
                        }
                      </View>
                      <Text style={[styles.stageLabel, isCurrent && styles.stageLabelCurrent]} numberOfLines={2}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.journeyCta}>
              <Text style={styles.journeyCtaText}>View next steps →</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* AI Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconRow}>
              <View style={styles.insightIcon}>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
              </View>
              <Text style={styles.insightTitle}>TODAY'S INSIGHT</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/advisor')}>
              <Text style={styles.insightAsk}>Ask more →</Text>
            </TouchableOpacity>
          </View>
          {insightLoading
            ? <AITypingBubble />
            : <Text style={styles.insightText}>{insight}</Text>
          }
        </View>

        {/* Metric Tiles */}
        <View style={styles.tilesGrid}>
          <MetricTile label="Communities" numericValue={filteredCommunities.length} icon="business-outline" color={Colors.primary} />
          <MetricTile label="Active Incentives" numericValue={11} icon="pricetag-outline" color={Colors.success} />
          <MetricTile label="Pulte Flex Cash" value="5 Days" icon="time-outline" color={Colors.danger} />
          <MetricTile label="Est. Savings" value="$20K+" icon="cash-outline" color={Colors.accent} />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/advisor')}>
            <Image source={AGENT_PHOTO} style={styles.quickActionPhoto} contentFit="cover" contentPosition="top" />
            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>Ask Phillip</Text>
              <Text style={styles.quickActionSub}>AI-powered answers, instantly</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.calcAction} onPress={() => router.push('/(tabs)/calculator')}>
            <View style={styles.calcIcon}>
              <Ionicons name="calculator" size={22} color={Colors.accent} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={[styles.quickActionTitle, { color: Colors.primary }]}>Payment Power Calculator</Text>
              <Text style={[styles.quickActionSub, { color: Colors.textSecondary }]}>VA · FHA · Relocation · 55+ payments</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.vaultAction} onPress={() => router.push('/vault' as any)}>
            <View style={styles.vaultIcon}>
              <Ionicons name="lock-closed" size={22} color={Colors.success} />
            </View>
            <View style={styles.quickActionText}>
              <Text style={[styles.quickActionTitle, { color: Colors.primary }]}>Document Vault</Text>
              <Text style={[styles.quickActionSub, { color: Colors.textSecondary }]}>Pre-approval · W-2 · COE · Contracts</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Featured Communities */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Communities For You</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/communities')}>
            <Text style={styles.seeAll}>See all {COMMUNITIES.length} →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commScroll}>
          {filteredCommunities.map((c) => (
            <CommunityCard key={c.id} community={c} onPress={() => router.push(`/community/${c.id}`)} />
          ))}
        </ScrollView>

        {/* Activity Feed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Market Updates</Text>
        </View>

        <View style={styles.activityFeed}>
          {[
            { icon: 'flame', color: Colors.danger, text: "Pulte added a $15K quick move-in bonus — 4 homes left near Luke AFB", time: '2h ago', tag: '🔥 Hot' },
            { icon: 'time', color: Colors.accent, text: "Pulte Flex Cash (3%) ends in 5 days — don't miss out", time: '1d ago', tag: '⏰ Urgent' },
            { icon: 'home', color: Colors.success, text: 'Sun City Grand opened new phase near Luke AFB — 18 lots available', time: '2d ago', tag: '🆕 New' },
            { icon: 'trending-up', color: Colors.primary, text: '2026 BAH rates updated — see your new buying power in the Advisor', time: '1w ago', tag: '📈 Update' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.activityItem} onPress={() => router.push('/(tabs)/advisor')}>
              <View style={[styles.activityDot, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={styles.activityContent}>
                <View style={styles.activityTagRow}>
                  <Text style={[styles.activityTag, { color: item.color }]}>{item.tag}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
                <Text style={styles.activityText}>{item.text}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={Colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Agent CTA */}
        <View style={styles.agentCta}>
          <Image source={AGENT_PHOTO} style={styles.agentCtaPhoto} contentFit="cover" contentPosition="top" />
          <View style={styles.agentCtaText}>
            <Text style={styles.agentCtaName}>{AGENT_PERSONA.name}</Text>
            <Text style={styles.agentCtaTagline}>Ready to serve you today</Text>
          </View>
          <View style={styles.agentCtaBtns}>
            <TouchableOpacity
              style={[styles.agentCtaBtn, { backgroundColor: Colors.primary }]}
              onPress={() => router.push('/(tabs)/advisor')}
            >
              <Ionicons name="chatbubbles" size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  scroll: { flex: 1 },
  content: { paddingBottom: Spacing['4xl'] },

  // Hero
  hero: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.backgroundPrimary,
  },
  heroLeft: { flex: 1 },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  heroSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  agentAvatarBtn: { position: 'relative' },
  agentAvatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Colors.accent,
    overflow: 'hidden',
  },
  agentAvatarImg: { width: 46, height: 46 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  bellBtn: { position: 'relative', padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  bellBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white },

  // Journey
  journeyCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
  journeyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  journeyLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  journeyStage: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 2 },
  journeyPct: { alignItems: 'center' },
  journeyPctText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  journeyPctLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  stageRow: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: Spacing.xs },
  stageItem: { alignItems: 'center', width: 64, gap: 4 },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotComplete: { backgroundColor: Colors.accent },
  stageDotCurrent: { backgroundColor: Colors.primary },
  stageNum: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  stageLabel: { fontSize: 9, color: Colors.textSecondary, textAlign: 'center', lineHeight: 12 },
  stageLabelCurrent: { color: Colors.primary, fontWeight: FontWeight.semibold },
  journeyCta: { marginTop: Spacing.sm, alignItems: 'flex-end' },
  journeyCtaText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },

  // Insight
  insightCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.supportGoldLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    ...Shadows.sm,
  },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  insightIconRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent, letterSpacing: 1 },
  insightAsk: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  insightText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 24 },

  // Tiles
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  tile: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 4,
    ...Shadows.sm,
  },
  tileIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tileValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  tileLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },

  // Quick Actions
  quickActions: { marginHorizontal: Spacing.lg, marginTop: Spacing.md },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  quickActionPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  calcAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent + '50',
    marginTop: Spacing.sm,
  },
  calcIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '50',
    marginTop: Spacing.sm,
  },
  vaultIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: { flex: 1 },
  quickActionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  quickActionSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },

  // Community cards
  commScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  commCard: {
    width: 200,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.backgroundCard,
    overflow: 'hidden',
    ...Shadows.md,
  },
  commHeader: { height: 90, justifyContent: 'space-between', padding: Spacing.sm },
  commHeaderOverlay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  commBuilderTag: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  incentivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  incentivePillText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white },
  commBody: { padding: Spacing.sm, gap: 2 },
  commName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  commCity: { fontSize: FontSize.xs, color: Colors.textSecondary },
  commPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 2 },
  commTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: { borderRadius: BorderRadius.full, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 9, fontWeight: FontWeight.bold },

  // Activity feed
  activityFeed: { marginHorizontal: Spacing.lg, gap: Spacing.sm },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  activityDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityContent: { flex: 1 },
  activityTagRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  activityTag: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  activityTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activityText: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 18 },

  // Agent CTA
  agentCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  agentCtaPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  agentCtaText: { flex: 1 },
  agentCtaName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  agentCtaTagline: { fontSize: FontSize.xs, color: Colors.success, marginTop: 2, fontWeight: FontWeight.medium },
  agentCtaBtns: { flexDirection: 'row', gap: Spacing.sm },
  agentCtaBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
