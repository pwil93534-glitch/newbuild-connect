import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Button, TextInput } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { supabase } from '../../src/services/supabase';

export default function CreateAccountScreen() {
  const router = useRouter();
  const { buyer, updateBuyer } = useBuyerStore();
  const [email, setEmail] = useState(buyer?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const proceedToApp = () => router.replace('/(tabs)');

  const handleCreate = async () => {
    setError('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError) {
      setLoading(false);
      if (signUpError.message.includes('already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.user) {
      updateBuyer({ id: data.user.id, email: email.trim().toLowerCase() });

      await supabase.from('buyers').upsert({
        id: data.user.id,
        email: email.trim().toLowerCase(),
        name: buyer?.name ?? null,
        phone: buyer?.phone ?? null,
        buyer_type: buyer?.buyer_type ?? null,
        military_base: buyer?.military_base ?? null,
        budget_min: buyer?.budget_min ?? null,
        budget_max: buyer?.budget_max ?? null,
        timeline: buyer?.timeline ?? null,
        loan_type: buyer?.loan_type ?? null,
        is_onboarded: true,
      });
    }

    setLoading(false);
    proceedToApp();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-upload-outline" size={36} color={Colors.accent} />
          </View>

          <Text style={styles.title}>Save Your Progress</Text>
          <Text style={styles.subtitle}>
            Create a free account to sync your profile, saved communities, and journey across any device.
          </Text>

          {/* Benefits */}
          <View style={styles.benefits}>
            {[
              { icon: 'shield-checkmark-outline', text: 'Your data is private and secure' },
              { icon: 'bookmark-outline', text: 'Keep saved communities across devices' },
              { icon: 'trending-up-outline', text: 'Track your journey from anywhere' },
              { icon: 'chatbubble-ellipses-outline', text: 'Access your AI Advisor history' },
            ].map((b) => (
              <View key={b.text} style={styles.benefit}>
                <Ionicons name={b.icon as any} size={18} color={Colors.success} />
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              label="Create Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(''); }}
              secureTextEntry
            />
            <TextInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirm}
              onChangeText={(v) => { setConfirm(v); setError(''); }}
              secureTextEntry
            />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title="Create My Account"
            onPress={handleCreate}
            loading={loading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity style={styles.skipBtn} onPress={proceedToApp}>
            <Text style={styles.skipText}>Skip for now — I'll create an account later</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['4xl'],
    gap: Spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.supportGoldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
    ...Shadows.md,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  benefits: {
    width: '100%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  benefitText: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  form: { width: '100%', gap: Spacing.md },
  errorBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: Colors.danger },
  skipBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
