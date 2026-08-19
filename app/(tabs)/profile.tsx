import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { Card, Badge, Avatar, Button } from '../../src/components';
import { useBuyerStore } from '../../src/stores/buyer';
import { useAppStore } from '../../src/stores/app';
import { AGENT_PERSONA, AGENT_PHOTO, BRAND_LOGO, BROKERED_BY_EXP_LOGO } from '../../src/constants/agent';
import { COMMUNITIES } from '../../src/constants/communities';
import { LoanType, Timeline, BuyerType } from '../../src/types';
import { supabase } from '../../src/services/supabase';

const BUYER_TYPE_LABELS: Record<string, string> = {
  veteran: 'Veteran',
  first_time: 'First-Time Buyer',
  relocation: 'Relocating',
  senior: 'Senior 55+',
};

const LOAN_LABELS: Record<string, string> = {
  va: 'VA Loan',
  fha: 'FHA Loan',
  conventional: 'Conventional',
  unsure: 'Not sure yet',
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP',
  '1_3mo': '1–3 months',
  '3_6mo': '3–6 months',
  '6_12mo': '6–12 months',
  exploring: 'Just exploring',
};

function SettingRow({ icon, label, value, onPress, isSwitch, switchValue, onSwitchChange }: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={isSwitch || !onPress}>
      <Ionicons name={icon as any} size={20} color={Colors.primary} />
      <Text style={styles.settingLabel}>{label}</Text>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.border} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Edit Profile Modal
function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { buyer, updateBuyer } = useBuyerStore();
  const { showToast } = useAppStore();

  const [name, setName] = useState(buyer?.name ?? '');
  const [phone, setPhone] = useState(buyer?.phone ?? '');
  const [email, setEmail] = useState(buyer?.email ?? '');
  const [budgetMin, setBudgetMin] = useState(buyer?.budget_min ?? 250000);
  const [budgetMax, setBudgetMax] = useState(buyer?.budget_max ?? 450000);
  const [timeline, setTimeline] = useState<Timeline>(buyer?.timeline ?? 'exploring');
  const [loanType, setLoanType] = useState<LoanType>(buyer?.loan_type ?? 'unsure');

  const TIMELINES: { id: Timeline; label: string }[] = [
    { id: 'asap', label: 'ASAP' },
    { id: '1_3mo', label: '1–3 mo' },
    { id: '3_6mo', label: '3–6 mo' },
    { id: '6_12mo', label: '6–12 mo' },
    { id: 'exploring', label: 'Exploring' },
  ];

  const LOANS: { id: LoanType; label: string }[] = [
    { id: 'va', label: 'VA Loan' },
    { id: 'fha', label: 'FHA' },
    { id: 'conventional', label: 'Conventional' },
    { id: 'unsure', label: 'Not sure' },
  ];

  const handleSave = () => {
    updateBuyer({ name, phone, email, budget_min: budgetMin, budget_max: budgetMax, timeline, loan_type: loanType });
    showToast('Profile updated!', 'success');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.modalSave}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Name */}
          <Text style={styles.fieldLabel}>First Name</Text>
          <TextInput
            style={styles.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.textSecondary}
          />

          {/* Phone */}
          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.fieldInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 000-0000"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="phone-pad"
          />

          {/* Email */}
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.fieldInput}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Budget */}
          <Text style={styles.fieldLabel}>Budget Range</Text>
          <View style={styles.budgetRow}>
            <View style={styles.budgetBox}>
              <Text style={styles.budgetBoxLabel}>Min</Text>
              <Text style={styles.budgetBoxValue}>${(budgetMin / 1000).toFixed(0)}K</Text>
              <View style={styles.budgetBtns}>
                <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudgetMin(Math.max(150000, budgetMin - 25000))}>
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudgetMin(Math.min(budgetMax - 50000, budgetMin + 25000))}>
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.budgetDash}>—</Text>
            <View style={styles.budgetBox}>
              <Text style={styles.budgetBoxLabel}>Max</Text>
              <Text style={styles.budgetBoxValue}>${(budgetMax / 1000).toFixed(0)}K</Text>
              <View style={styles.budgetBtns}>
                <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudgetMax(Math.max(budgetMin + 50000, budgetMax - 25000))}>
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.budgetBtn} onPress={() => setBudgetMax(Math.min(900000, budgetMax + 25000))}>
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <Text style={styles.fieldLabel}>Timeline</Text>
          <View style={styles.chipRow}>
            {TIMELINES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.chip, timeline === t.id && styles.chipSelected]}
                onPress={() => setTimeline(t.id)}
              >
                <Text style={[styles.chipText, timeline === t.id && styles.chipTextSelected]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Loan Type */}
          <Text style={styles.fieldLabel}>Loan Type</Text>
          <View style={styles.chipRow}>
            {LOANS.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={[styles.chip, loanType === l.id && styles.chipSelected]}
                onPress={() => setLoanType(l.id)}
              >
                <Text style={[styles.chipText, loanType === l.id && styles.chipTextSelected]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Share app handler
async function handleShareApp() {
  try {
    await Share.share({
      title: 'NewBuild Connect — Arizona New Construction App',
      message:
        `🏠 Check out NewBuild Connect!\n\nI use this app to guide buyers through new construction in Phoenix & Tucson, AZ.\n\nPersonalized journeys for Veterans, First-Time Buyers, Seniors 55+, and Relocation buyers.\n\nContact Phillip Williams — New Construction Strategist:\n📞 (623)850-4232\n✉️ phillip.a.williams@exprealty.com`,
    });
  } catch {
    // user dismissed
  }
}

// Feedback Modal
function FeedbackModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setAnswers({ q1: '', q2: '', q3: '' });
      setComments('');
      onClose();
    }, 2500);
  };

  const Q1_OPTIONS = ['Very easy', 'Easy', 'Neutral', 'Difficult'];
  const Q2_OPTIONS = ['Very helpful', 'Helpful', 'Somewhat', 'Not yet'];
  const Q3_OPTIONS = ['Definitely', 'Probably', 'Not sure', 'No'];

  if (submitted) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.thankYouContainer}>
          <View style={styles.thankYouIcon}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
          </View>
          <Text style={styles.thankYouTitle}>Thank you for your feedback!</Text>
          <Text style={styles.thankYouDesc}>
            Your input helps make NewBuild Connect better for every buyer. We really appreciate it!
          </Text>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Send Feedback</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Star rating */}
          <Text style={styles.feedbackQuestion}>How would you rate your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? Colors.accent : Colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Q1 */}
          <Text style={styles.feedbackQuestion}>How easy is the app to use?</Text>
          <View style={styles.chipRow}>
            {Q1_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, answers.q1 === o && styles.chipSelected]}
                onPress={() => setAnswers({ ...answers, q1: o })}
              >
                <Text style={[styles.chipText, answers.q1 === o && styles.chipTextSelected]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Q2 */}
          <Text style={styles.feedbackQuestion}>How helpful is the AI Advisor?</Text>
          <View style={styles.chipRow}>
            {Q2_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, answers.q2 === o && styles.chipSelected]}
                onPress={() => setAnswers({ ...answers, q2: o })}
              >
                <Text style={[styles.chipText, answers.q2 === o && styles.chipTextSelected]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Q3 */}
          <Text style={styles.feedbackQuestion}>Would you recommend this app to a buyer?</Text>
          <View style={styles.chipRow}>
            {Q3_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, answers.q3 === o && styles.chipSelected]}
                onPress={() => setAnswers({ ...answers, q3: o })}
              >
                <Text style={[styles.chipText, answers.q3 === o && styles.chipTextSelected]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comments */}
          <Text style={styles.feedbackQuestion}>Any other comments or suggestions?</Text>
          <TextInput
            style={styles.commentsInput}
            value={comments}
            onChangeText={setComments}
            placeholder="Tell us what you think..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0}
          >
            <Text style={styles.submitBtnText}>Submit Feedback</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { buyer, reset } = useBuyerStore();
  const { savedCommunityIds, showToast } = useAppStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [notifJourney, setNotifJourney] = useState(true);
  const [notifIncentive, setNotifIncentive] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(true);
  const [notifDeadline, setNotifDeadline] = useState(true);

  const savedCommunities = COMMUNITIES.filter((c) => savedCommunityIds.includes(c.id));

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out? Your local progress will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut().catch(() => {});
          reset();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const hasAccount = !!buyer?.id && buyer.id !== 'local';
  const handleCreateAccount = () => router.push('/(auth)/create-account' as any);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Agent Card */}
        <View style={styles.agentSection}>
          <Card style={styles.agentCard} padding={Spacing.lg}>
            <View style={styles.agentRow}>
              <Avatar name={AGENT_PERSONA.name} size={60} imageSource={AGENT_PHOTO} />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{AGENT_PERSONA.name}</Text>
                <Text style={styles.agentTitle}>{AGENT_PERSONA.title}</Text>
                <Text style={styles.agentCredential}>{AGENT_PERSONA.credential}</Text>
                <Badge label="New Construction Expert" variant="info" style={{ marginTop: 4 }} />
              </View>
            </View>
            <View style={styles.brandDisclosure}>
              <View style={styles.profileBrandLogoBox}>
                <Image source={BRAND_LOGO} style={styles.profileBrandLogo} contentFit="contain" />
              </View>
              <View style={styles.profileExpLogoBox}>
                <Image source={BROKERED_BY_EXP_LOGO} style={styles.profileExpLogo} contentFit="contain" />
              </View>
            </View>
            <View style={styles.agentContacts}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: Colors.primary }]}
                onPress={() => Linking.openURL(`tel:${AGENT_PERSONA.phone.replace(/\D/g, '')}`)}
              >
                <Ionicons name="call" size={18} color={Colors.white} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: Colors.success }]}
                onPress={() => Linking.openURL(`sms:${AGENT_PERSONA.phone.replace(/\D/g, '')}`)}
              >
                <Ionicons name="chatbubble" size={18} color={Colors.white} />
                <Text style={styles.contactBtnText}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: Colors.border }]}
                onPress={() => Linking.openURL(`mailto:${AGENT_PERSONA.email}`)}
              >
                <Ionicons name="mail" size={18} color={Colors.textSecondary} />
                <Text style={[styles.contactBtnText, { color: Colors.textSecondary }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Buyer Profile */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => setEditModalVisible(true)}>
            <Text style={styles.editBtn}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.profileCard} padding={Spacing.lg}>
          <View style={styles.profileRow}>
            <Avatar name={buyer?.name ?? 'You'} size={56} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{buyer?.name ?? 'Your Name'}</Text>
              {buyer?.buyer_type && (
                <Badge label={BUYER_TYPE_LABELS[buyer.buyer_type]} variant={buyer.buyer_type} />
              )}
            </View>
          </View>

          <View style={styles.profileDetails}>
            {buyer?.budget_min && (
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  Budget: ${(buyer.budget_min / 1000).toFixed(0)}K – ${((buyer.budget_max ?? 500000) / 1000).toFixed(0)}K
                </Text>
              </View>
            )}
            {buyer?.timeline && (
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>Timeline: {TIMELINE_LABELS[buyer.timeline]}</Text>
              </View>
            )}
            {buyer?.loan_type && (
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>Loan: {LOAN_LABELS[buyer.loan_type]}</Text>
              </View>
            )}
            {buyer?.email && (
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{buyer.email}</Text>
              </View>
            )}
            {buyer?.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{buyer.phone}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Saved Communities */}
        {savedCommunities.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
              <Text style={styles.sectionTitle}>Saved Communities</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/communities')}>
                <Text style={styles.editBtn}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
              {savedCommunities.map((c) => (
                <TouchableOpacity key={c.id} style={styles.savedCard} onPress={() => router.push(`/community/${c.id}`)}>
                  <View style={[styles.savedColor, { backgroundColor: c.color }]} />
                  <View style={styles.savedBody}>
                    <Text style={styles.savedName}>{c.name}</Text>
                    <Text style={styles.savedBuilder}>{c.builder}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Notifications */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl }]}>
          Notifications
        </Text>
        <Card style={styles.settingsCard} padding={0}>
          <SettingRow icon="pricetag-outline" label="Incentive Alerts" isSwitch switchValue={notifIncentive} onSwitchChange={setNotifIncentive} />
          <SettingRow icon="map-outline" label="Journey Nudges" isSwitch switchValue={notifJourney} onSwitchChange={setNotifJourney} />
          <SettingRow icon="business-outline" label="New Community Alerts" isSwitch switchValue={notifCommunity} onSwitchChange={setNotifCommunity} />
          <SettingRow icon="time-outline" label="Deadline Warnings" isSwitch switchValue={notifDeadline} onSwitchChange={setNotifDeadline} />
        </Card>

        {/* Referral */}
        <Card style={styles.referralCard} padding={Spacing.lg}>
          <View style={styles.referralContent}>
            <Ionicons name="gift-outline" size={28} color={Colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.referralTitle}>Know someone buying?</Text>
              <Text style={styles.referralDesc}>Share the app and help a friend start their journey</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.referralBtn} onPress={handleShareApp}>
            <Ionicons name="share-outline" size={16} color={Colors.primary} />
            <Text style={styles.referralBtnText}>Share NewBuild Connect</Text>
          </TouchableOpacity>
        </Card>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl }]}>
          Settings
        </Text>
        <Card style={styles.settingsCard} padding={0}>
          <SettingRow icon="information-circle-outline" label="App Version" value="1.0.0" />
          <SettingRow icon="chatbox-outline" label="Send Feedback" onPress={() => setFeedbackModalVisible(true)} />
          {!hasAccount && (
            <SettingRow
              icon="cloud-upload-outline"
              label="Create Account"
              value="Save your progress"
              onPress={handleCreateAccount}
            />
          )}
          <SettingRow icon="log-out-outline" label="Sign Out" onPress={handleSignOut} />
        </Card>
      </ScrollView>

      {/* Edit Modal */}
      <EditProfileModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} />

      {/* Feedback Modal */}
      <FeedbackModal visible={feedbackModalVisible} onClose={() => setFeedbackModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  content: { paddingBottom: Spacing['4xl'] },
  agentSection: { padding: Spacing.lg },
  agentCard: {},
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  agentInfo: { flex: 1 },
  agentName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  agentTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  agentCredential: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.semibold, marginTop: 1 },
  brandDisclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  profileBrandLogoBox: {
    flex: 1.2,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  profileBrandLogo: { width: '100%', height: 40 },
  profileExpLogoBox: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  profileExpLogo: { width: '100%', height: 38 },
  agentContacts: { flexDirection: 'row', gap: Spacing.sm },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, minHeight: 40 },
  contactBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  editBtn: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  profileCard: { marginHorizontal: Spacing.lg },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  profileDetails: { gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  savedScroll: { paddingHorizontal: Spacing.lg, gap: Spacing.md },
  savedCard: { width: 140, borderRadius: BorderRadius.md, overflow: 'hidden', backgroundColor: Colors.backgroundCard, ...Shadows.sm },
  savedColor: { height: 60 },
  savedBody: { padding: Spacing.sm },
  savedName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  savedBuilder: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  settingsCard: { marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.backgroundCard, minHeight: 52 },
  settingLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  settingValue: { fontSize: FontSize.sm, color: Colors.textSecondary },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  referralCard: { marginHorizontal: Spacing.lg, marginTop: Spacing.md, gap: Spacing.md },
  referralContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  referralTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  referralDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  referralBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.primary, padding: Spacing.md, minHeight: 44 },
  referralBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  // Modal styles
  modalSafe: { flex: 1, backgroundColor: Colors.backgroundPrimary },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  modalCancel: { fontSize: FontSize.md, color: Colors.textSecondary },
  modalSave: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  modalContent: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing['4xl'] },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginTop: Spacing.md },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.backgroundPrimary, minHeight: 48 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, justifyContent: 'center', marginTop: Spacing.sm },
  budgetBox: { alignItems: 'center', gap: Spacing.xs },
  budgetBoxLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  budgetBoxValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  budgetBtns: { flexDirection: 'row', gap: Spacing.sm },
  budgetBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.supportMilitaryBlue, alignItems: 'center', justifyContent: 'center' },
  budgetDash: { fontSize: FontSize.xl, color: Colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.backgroundCard },
  chipSelected: { borderColor: Colors.primary, backgroundColor: Colors.supportMilitaryBlue },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextSelected: { color: Colors.primary, fontWeight: FontWeight.semibold },
  // Feedback styles
  feedbackQuestion: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginTop: Spacing.lg },
  starsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  commentsInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, backgroundColor: Colors.backgroundPrimary, minHeight: 100, textAlignVertical: 'top', marginTop: Spacing.xs },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xl, minHeight: 52 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  // Thank you screen
  thankYouContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'], gap: Spacing.lg, backgroundColor: Colors.backgroundPrimary },
  thankYouIcon: { marginBottom: Spacing.md },
  thankYouTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success, textAlign: 'center' },
  thankYouDesc: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
