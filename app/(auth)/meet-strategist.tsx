import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Button, Badge, AITypingBubble } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { AGENT_PERSONA, AGENT_PHOTO, BRAND_LOGO, BROKERED_BY_EXP_LOGO } from '../../src/constants/agent';
import { requestNotificationPermissions } from '../../src/services/notifications';

export default function MeetStrategistScreen() {
  const router = useRouter();
  const { buyer, setOnboarded } = useBuyerStore();
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const buyerType = buyer?.buyer_type ?? 'first_time';
    const msg = AGENT_PERSONA.welcomeMessages[buyerType];

    let i = 0;
    const delay = 600;
    const timer = setTimeout(() => {
      setIsTyping(false);
      const interval = setInterval(() => {
        i++;
        setWelcomeMsg(msg.substring(0, i));
        if (i >= msg.length) clearInterval(interval);
      }, 18);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [buyer?.buyer_type]);

  const handleReady = async () => {
    await requestNotificationPermissions();
    setOnboarded(true);
    router.replace('/(auth)/create-account' as any);
  };

  const buyerTypeLabel: Record<string, string> = {
    veteran: 'Veteran',
    first_time: 'First-Time Buyer',
    relocation: 'Relocating',
    senior: 'Senior 55+',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header banner */}
        <LinearGradient
          colors={[Colors.primary, '#004080']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.brandLogoCard}>
              <Image source={BRAND_LOGO} style={styles.brandLogo} contentFit="contain" />
            </View>
            <View style={styles.agentAvatar}>
              <Image source={AGENT_PHOTO} style={{ width: 130, height: 130 }} contentFit="cover" contentPosition="top" />
            </View>
            <View style={styles.agentBadgeRow}>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.white} />
                <Text style={styles.verifiedText}>Verified Strategist</Text>
              </View>
            </View>
            <Text style={styles.agentName}>{AGENT_PERSONA.name}</Text>
            <Text style={styles.agentTitle}>{AGENT_PERSONA.title}</Text>
            <Text style={styles.agentTagline}>"{AGENT_PERSONA.tagline}"</Text>
            <View style={styles.expDisclosure}>
              <Image source={BROKERED_BY_EXP_LOGO} style={styles.expLogo} contentFit="contain" />
            </View>
          </View>
        </LinearGradient>

        {/* Mission */}
        <View style={[styles.section, { backgroundColor: Colors.supportGoldLight, borderLeftWidth: 3, borderLeftColor: Colors.accent }]}>
          <View style={styles.missionHeader}>
            <Ionicons name="heart" size={18} color={Colors.accent} />
            <Text style={styles.missionLabel}>My Mission</Text>
          </View>
          <Text style={styles.missionText}>{AGENT_PERSONA.missionStatement}</Text>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <View style={styles.badges}>
            {AGENT_PERSONA.specialties.map((s) => (
              <Badge key={s} label={s} variant="info" />
            ))}
          </View>
        </View>

        {/* Markets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Markets Covered</Text>
          <View style={styles.marketRow}>
            <View style={styles.marketItem}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.marketText}>Phoenix Metro</Text>
            </View>
            <View style={styles.marketItem}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.marketText}>Tucson Metro</Text>
            </View>
          </View>
          <View style={styles.basesRow}>
            {AGENT_PERSONA.bases.map((b) => (
              <View key={b} style={styles.baseItem}>
                <Ionicons name="shield" size={12} color={Colors.accent} />
                <Text style={styles.baseText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Personalized welcome */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Personalized Welcome</Text>
          <View style={styles.messageBubble}>
            {buyer?.buyer_type && (
              <Badge
                label={buyerTypeLabel[buyer.buyer_type]}
                variant={buyer.buyer_type}
                style={{ marginBottom: Spacing.sm }}
              />
            )}
            {isTyping ? (
              <AITypingBubble />
            ) : (
              <Text style={styles.welcomeText}>{welcomeMsg}</Text>
            )}
          </View>
        </View>

        {/* Contact buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reach Your Strategist</Text>
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: Colors.primary }]}
              onPress={() => Linking.openURL(`tel:${AGENT_PERSONA.phone.replace(/\D/g, '')}`)}
            >
              <Ionicons name="call" size={20} color={Colors.white} />
              <Text style={[styles.contactBtnText, { color: Colors.white }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: Colors.success }]}
              onPress={() => Linking.openURL(`sms:${AGENT_PERSONA.phone.replace(/\D/g, '')}`)}
            >
              <Ionicons name="chatbubble" size={20} color={Colors.white} />
              <Text style={[styles.contactBtnText, { color: Colors.white }]}>Text</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="I'm Ready to Find My Home! 🏠"
          onPress={handleReady}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { paddingBottom: Spacing['4xl'] },
  banner: {
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  bannerContent: { alignItems: 'center', gap: Spacing.sm },
  brandLogoCard: {
    width: 150,
    height: 68,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(200,150,12,0.55)',
  },
  brandLogo: { width: 132, height: 56 },
  agentAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  agentBadgeRow: { flexDirection: 'row', gap: Spacing.sm },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  verifiedText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.white },
  agentName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.white },
  agentTitle: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  agentTagline: { fontSize: FontSize.xs, color: Colors.accent, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: Spacing.lg, lineHeight: 18 },
  expDisclosure: {
    width: 120,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  expLogo: { width: 104, height: 30 },
  missionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  missionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  missionText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 24, fontStyle: 'italic' },
  section: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  marketRow: { flexDirection: 'row', gap: Spacing.md },
  marketItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  marketText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  basesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  baseItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  baseText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  messageBubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 80,
  },
  welcomeText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 24 },
  contactRow: { flexDirection: 'row', gap: Spacing.md },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 48,
  },
  contactBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
