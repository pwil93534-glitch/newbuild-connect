import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Badge, Card, Button } from '../../src/components';
import { COMMUNITIES } from '../../src/constants/communities';
import { INCENTIVES } from '../../src/constants/incentives';
import { AGENT_PERSONA } from '../../src/constants/agent';
import { useAppStore } from '../../src/stores/app';
import { useBuyerStore } from '../../src/stores/buyer';

const AMENITY_ICONS: Record<string, string> = {
  'Pool': 'water-outline',
  'Clubhouse': 'business-outline',
  'Golf': 'golf-outline',
  'Tennis': 'tennisball-outline',
  'Pickleball': 'tennisball-outline',
  'Fitness center': 'barbell-outline',
  'Park': 'leaf-outline',
  'Walking trails': 'footsteps-outline',
  'Playground': 'balloon-outline',
  'Restaurant': 'restaurant-outline',
  'Gym': 'barbell-outline',
};

const TABS = ['Overview', 'Incentives', 'Location', 'Ask AI'];

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleSavedCommunity, isCommunitysaved, showToast } = useAppStore();
  const { buyer } = useBuyerStore();
  const [activeTab, setActiveTab] = useState('Overview');

  const community = COMMUNITIES.find((c) => c.id === id);

  if (!community) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Community not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const isSaved = isCommunitysaved(community.id);

  const relevantIncentives = INCENTIVES.filter((inc) => {
    if (!buyer?.buyer_type) return true;
    if (!inc.eligibility.includes(buyer.buyer_type)) return false;
    if (inc.builderSpecific) {
      return community.builder.toLowerCase().includes(inc.builderSpecific.toLowerCase());
    }
    return true;
  }).slice(0, 5);

  const daysUntilExpiry = (expiry: string | null) => {
    if (!expiry) return null;
    const diff = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const openAdvisorContact = () => {
    const cleanPhone = AGENT_PERSONA.phone.replace(/[^\d+]/g, '');
    Alert.alert(
      `Contact ${AGENT_PERSONA.name}`,
      `Ask about ${community.name} or send this community to your strategist.`,
      [
        { text: 'Call', onPress: () => Linking.openURL(`tel:${cleanPhone}`) },
        { text: 'Text', onPress: () => Linking.openURL(`sms:${cleanPhone}?body=Hi ${AGENT_PERSONA.name}, I want to ask about ${community.name} in ${community.city}.`) },
        { text: 'Email', onPress: () => Linking.openURL(`mailto:${AGENT_PERSONA.email}?subject=${encodeURIComponent(`Question about ${community.name}`)}&body=${encodeURIComponent(`Hi ${AGENT_PERSONA.name},\n\nI am looking at ${community.name} by ${community.builder} in the NewBuild Connect app and would like your guidance.\n\nThank you!`)}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const requestTour = () => {
    router.push(`/tour?communityId=${community.id}` as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Color header */}
      <View style={[styles.colorHeader, { backgroundColor: community.color }]}>
        <View style={styles.colorHeaderOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              toggleSavedCommunity(community.id);
              showToast(isSaved ? 'Removed from saved' : 'Community saved!', isSaved ? 'info' : 'success');
            }}
            style={styles.saveBtn}
          >
            <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.builderBadge}>
            <Text style={styles.builderBadgeText}>{community.builder}</Text>
          </View>
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityCity}>{community.city}, Arizona</Text>
          <Text style={styles.communityPrice}>
            ${(community.priceFrom / 1000).toFixed(0)}K – ${(community.priceTo / 1000).toFixed(0)}K
          </Text>
        </View>
      </View>

      {/* Eligibility badges */}
      <View style={styles.eligibilityRow}>
        {community.vaEligible && <Badge label="VA Loan ✓" variant="veteran" />}
        {community.fhaEligible && <Badge label="FHA ✓" variant="info" />}
        {community.seniorCommunity && <Badge label="55+ Community" variant="senior" />}
        {community.distanceFromBase && (
          <Badge label={`${community.distanceFromBase} mi from base`} variant="neutral" />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              if (tab === 'Ask AI') {
                router.push({
                  pathname: '/(tabs)/advisor',
                  params: { prompt: `Tell me everything about ${community.name} for a ${buyer?.buyer_type ?? 'buyer'}` },
                });
              } else {
                setActiveTab(tab);
              }
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {community.name}</Text>
            <Text style={styles.bodyText}>
              {community.name} by {community.builder} is a new construction community in {community.city}, Arizona.
              {community.seniorCommunity
                ? ' This is an age-restricted 55+ active adult community designed for resort-style living.'
                : ' This community offers modern new construction homes with the latest designs and energy efficiency.'}
              {community.distanceFromBase
                ? ` Located just ${community.distanceFromBase} miles from the nearest military base — perfect for military families.`
                : ''}
            </Text>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Community Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {community.amenities.map((a) => (
                <View key={a} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <Ionicons
                      name={(AMENITY_ICONS[a] ?? 'star-outline') as any}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Tags</Text>
            <View style={styles.tagsRow}>
              {community.tags.map((t) => (
                <View key={t} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>{t}</Text>
                </View>
              ))}
            </View>

            <View style={styles.ctaSection}>
              <Button
                title="Ask About This Community"
                onPress={() => router.push('/(tabs)/advisor')}
                fullWidth
              />
            </View>
          </View>
        )}

        {activeTab === 'Incentives' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Incentives</Text>
            <Text style={styles.bodyText}>
              {relevantIncentives.length > 0
                ? `${relevantIncentives.length} incentives available for your buyer profile. These can often be stacked.`
                : 'Contact your strategist for current incentive information.'}
            </Text>

            {community.activeIncentives.map((inc, idx) => (
              <Card key={idx} style={styles.incentiveCard} padding={Spacing.md}>
                <View style={styles.incentiveHeader}>
                  <Ionicons name="pricetag" size={16} color={Colors.accent} />
                  <Text style={styles.incentiveName}>{inc}</Text>
                </View>
              </Card>
            ))}

            {relevantIncentives.map((inc) => {
              const days = daysUntilExpiry(inc.expiration);
              return (
                <Card key={inc.id} style={styles.incentiveCard} padding={Spacing.md}>
                  <View style={styles.incentiveHeader}>
                    <View style={styles.incentiveIconBg}>
                      <Ionicons name="cash-outline" size={16} color={Colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.incentiveName}>{inc.name}</Text>
                      <Text style={styles.incentiveValue}>{inc.value}</Text>
                    </View>
                    {inc.stackable && <Badge label="Stackable" variant="success" />}
                  </View>
                  <Text style={styles.incentiveDesc}>{inc.description}</Text>
                  <View style={styles.incentiveFooter}>
                    <Text style={styles.incentiveSource}>{inc.source}</Text>
                    {days !== null && (
                      <View style={[styles.expiryBadge, days <= 7 && styles.expiryBadgeUrgent]}>
                        <Ionicons name="time-outline" size={12} color={days <= 7 ? Colors.danger : Colors.textSecondary} />
                        <Text style={[styles.expiryText, days <= 7 && styles.expiryTextUrgent]}>
                          {days <= 0 ? 'Expired' : `${days} days left`}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {activeTab === 'Location' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Details</Text>

            <Card style={styles.locationCard} padding={Spacing.md}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <View>
                  <Text style={styles.locationCity}>{community.city}, Arizona</Text>
                  <Text style={styles.locationArea}>
                    {community.area === 'phoenix' ? 'Phoenix Metro Area' : 'Tucson Metro Area'}
                  </Text>
                </View>
              </View>
            </Card>

            {community.distanceFromBase && (
              <Card style={styles.baseCard} padding={Spacing.md}>
                <View style={styles.baseCardHeader}>
                  <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                  <Text style={styles.baseCardTitle}>Military Base Proximity</Text>
                </View>
                <Text style={styles.baseDistance}>{community.distanceFromBase} miles to nearest base</Text>
                <Text style={styles.baseDesc}>
                  Approximately {Math.round(community.distanceFromBase * 2.5)}–{Math.round(community.distanceFromBase * 3.5)} minute commute
                </Text>
              </Card>
            )}

            <TouchableOpacity
              style={styles.mapPlaceholder}
              onPress={() => router.push('/(tabs)/communities' as any)}
            >
              <Ionicons name="map-outline" size={36} color={Colors.primary} />
              <Text style={styles.mapPlaceholderText}>View on Map</Text>
              <Text style={styles.mapPlaceholderSub}>Open Communities Map to see this location</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky contact CTA */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity style={styles.stickyContact} onPress={openAdvisorContact}>
          <Ionicons name="call" size={18} color={Colors.white} />
          <Text style={styles.stickyContactText}>Contact Strategist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stickySchedule} onPress={requestTour}>
          <Text style={styles.stickyScheduleText}>Schedule Tour</Text>
          <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  colorHeader: { paddingBottom: Spacing['2xl'] },
  colorHeaderOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 4 },
  builderBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  builderBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.white },
  communityName: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white },
  communityCity: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)' },
  communityPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white, marginTop: 2 },
  eligibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  tabContent: { padding: Spacing.lg, paddingBottom: 100 },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  bodyText: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  amenityItem: { alignItems: 'center', gap: Spacing.xs, width: '28%' },
  amenityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.supportMilitaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  tagPill: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagPillText: { fontSize: FontSize.sm, color: Colors.textPrimary },
  ctaSection: { marginTop: Spacing.lg },
  incentiveCard: { borderLeftWidth: 3, borderLeftColor: Colors.accent },
  incentiveHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  incentiveIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incentiveName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  incentiveValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.accent, marginTop: 2 },
  incentiveDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  incentiveFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  incentiveSource: { fontSize: FontSize.xs, color: Colors.textSecondary },
  expiryBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  expiryBadgeUrgent: {},
  expiryText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  expiryTextUrgent: { color: Colors.danger, fontWeight: FontWeight.bold },
  locationCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  locationCity: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  locationArea: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  baseCard: { borderLeftWidth: 3, borderLeftColor: Colors.success },
  baseCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  baseCardTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  baseDistance: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  baseDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  mapPlaceholder: {
    height: 180,
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  mapPlaceholderText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  mapPlaceholderSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  stickyContact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 48,
  },
  stickyContactText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  stickySchedule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 48,
  },
  stickyScheduleText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
});
