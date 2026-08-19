import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';

import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/design-system';
import { AGENT_PERSONA, AGENT_PHOTO, BRAND_LOGO, BROKERED_BY_EXP_LOGO } from '../../src/constants/agent';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#001F40', Colors.primary, '#004080']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Gold accent circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Brand mark */}
          <View style={styles.logoMark}>
            <Image source={BRAND_LOGO} style={styles.brandLogo} contentFit="contain" />
          </View>

          {/* Agent avatar */}
          <View style={styles.agentSection}>
            <View style={styles.agentAvatar}>
              <Image source={AGENT_PHOTO} style={{ width: 120, height: 120 }} contentFit="cover" contentPosition="top" />
            </View>
            <View style={styles.agentBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
              <Text style={styles.agentBadgeText}>Verified Strategist</Text>
            </View>
          </View>

          {/* Main headline */}
          <View style={styles.headlines}>
            <Text style={styles.headline}>Your New Home{'\n'}Starts Here</Text>
            <Text style={styles.tagline}>{AGENT_PERSONA.tagline}</Text>
            <Text style={styles.subheadline}>
              {AGENT_PERSONA.name} · {AGENT_PERSONA.credential}
            </Text>
          </View>

          {/* Specialty chips */}
          <View style={styles.chips}>
            {['🎖️ Veterans', '🏠 First-Time', '📦 Relocation', '🌅 Seniors 55+'].map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Markets */}
          <View style={styles.markets}>
            <Ionicons name="location-outline" size={14} color={Colors.accent} />
            <Text style={styles.marketsText}>Phoenix Metro · Tucson Metro · AZ Military Markets</Text>
          </View>

          <View style={styles.brokerageRow}>
            <Text style={styles.brokerageLabel}>Brokerage</Text>
            <View style={styles.expLogoPill}>
              <Image source={BROKERED_BY_EXP_LOGO} style={styles.expLogo} contentFit="contain" />
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push('/(auth)/buyer-type-select')}
            activeOpacity={0.88}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.signIn}>Already have an account? <Text style={styles.signInLink}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, justifyContent: 'space-between' },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.accent,
    opacity: 0.06,
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
    opacity: 0.05,
    bottom: 100,
    left: -60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.xl,
  },
  logoMark: {
    width: 156,
    height: 70,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200,150,12,0.55)',
    paddingHorizontal: Spacing.sm,
  },
  brandLogo: { width: 138, height: 58 },
  agentSection: { alignItems: 'center', gap: Spacing.sm },
  agentAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
    overflow: 'hidden',
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  agentBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.white },
  headlines: { alignItems: 'center', gap: Spacing.sm },
  headline: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 42,
  },
  tagline: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  subheadline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.xs },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  chipText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.medium },
  markets: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  marketsText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)' },
  brokerageRow: { alignItems: 'center', gap: 5 },
  brokerageLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: FontWeight.semibold,
  },
  expLogoPill: {
    width: 116,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  expLogo: { width: 100, height: 30 },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    gap: Spacing.md,
    alignItems: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    width: '100%',
    minHeight: 54,
  },
  ctaText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  signIn: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)' },
  signInLink: { color: Colors.accent, fontWeight: FontWeight.semibold },
});
