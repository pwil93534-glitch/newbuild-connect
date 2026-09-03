import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/design-system';
import { Button, TextInput } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { supabase } from '../../src/services/supabase';
import { BRAND_LOGO, PRIVACY_POLICY_URL } from '../../src/constants/agent';

export default function SignInScreen() {
  const router = useRouter();
  const { setBuyer, setOnboarded } = useBuyerStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message.includes('Invalid login')) {
        setError('Email or password is incorrect. Please try again.');
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(signInError.message);
      }
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('buyers')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setBuyer({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          buyer_type: profile.buyer_type,
          military_base: profile.military_base,
          budget_min: profile.budget_min,
          budget_max: profile.budget_max,
          timeline: profile.timeline,
          loan_type: profile.loan_type,
        });
        setOnboarded(true);
      } else {
        setBuyer({ id: data.user.id, email: data.user.email ?? '' });
        setOnboarded(true);
      }
    }

    setLoading(false);
    router.replace('/(tabs)');
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Reset Password', 'Enter your email address above, then tap "Forgot password?" to receive a reset link.');
      return;
    }
    Alert.alert(
      'Reset Password',
      `We'll send a password reset link to ${email.trim()}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
            if (resetError) {
              Alert.alert('Error', resetError.message);
            } else {
              Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoMark}>
              <Image source={BRAND_LOGO} style={styles.brandLogo} contentFit="contain" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your home buying journey</Text>

            <View style={styles.form}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChangeText={(v) => { setEmail(v); setError(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <TextInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry
              />
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button title="Sign In" onPress={handleSignIn} loading={loading} fullWidth size="lg" />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>new here?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.newAccountBtn}
              onPress={() => router.replace('/(auth)/welcome')}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color={Colors.primary} />
              <Text style={styles.newAccountText}>Start your home buying journey</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in you agree to our{' '}
              <Text style={styles.footerLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.footerLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, gap: Spacing.lg },
  logoMark: {
    width: 120,
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  brandLogo: { width: 104, height: 44 },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary },
  form: { gap: Spacing.md },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotPasswordText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FEE2E2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: FontSize.sm, color: Colors.danger },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  newAccountBtn: {
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
  newAccountText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  footer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['2xl'], alignItems: 'center' },
  footerText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },
  footerLink: { color: Colors.primary, fontWeight: FontWeight.medium },
});
