import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../src/design-system';
import { COMMUNITIES } from '../src/constants/communities';
import { AGENT_PERSONA } from '../src/constants/agent';
import { useBuyerStore } from '../src/stores/buyer';
import { useToursStore, TourType } from '../src/stores/tours';
import { scheduleLocalNotification } from '../src/services/notifications';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getAvailableDates(): Date[] {
  const dates: Date[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(d: Date): string {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export default function TourSchedulerScreen() {
  const router = useRouter();
  const { communityId } = useLocalSearchParams<{ communityId?: string }>();
  const { buyer } = useBuyerStore();
  const { addTour } = useToursStore();

  const community = COMMUNITIES.find((c) => c.id === communityId) ?? COMMUNITIES[0];
  const dates = getAvailableDates();

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [tourType, setTourType] = useState<TourType>('in_person');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleConfirm() {
    const tour = {
      id: Date.now().toString(),
      communityId: community.id,
      communityName: community.name,
      builder: community.builder,
      city: community.city,
      date: toISODate(selectedDate),
      time: selectedTime,
      tourType,
      notes,
      status: 'pending' as const,
      scheduledAt: new Date().toISOString(),
    };
    addTour(tour);

    // Schedule a reminder notification 24h from now (production would target 1 day before tour)
    await scheduleLocalNotification(
      `🏠 Tour Tomorrow — ${community.name}`,
      `Your ${tourType === 'virtual' ? 'virtual' : 'in-person'} tour at ${community.name} is at ${selectedTime}. Get ready!`,
      24 * 60 * 60
    );

    setSubmitted(true);
  }

  function openEmail() {
    const subject = encodeURIComponent(`Tour Request — ${community.name} in ${community.city}`);
    const buyerName = buyer?.name ?? 'A buyer';
    const buyerPhone = buyer?.phone ?? '';
    const buyerEmail = buyer?.email ?? '';
    const body = encodeURIComponent(
      `Hi ${AGENT_PERSONA.name},\n\n` +
      `I'd like to schedule a ${tourType === 'virtual' ? 'virtual' : 'in-person'} tour:\n\n` +
      `Community: ${community.name}\n` +
      `Builder: ${community.builder}\n` +
      `City: ${community.city}, AZ\n` +
      `Date: ${formatDisplayDate(selectedDate)}\n` +
      `Time: ${selectedTime}\n` +
      (notes ? `\nNotes: ${notes}\n` : '') +
      `\n— ${buyerName}` +
      (buyerPhone ? `\n${buyerPhone}` : '') +
      (buyerEmail ? `\n${buyerEmail}` : '')
    );
    Linking.openURL(`mailto:${AGENT_PERSONA.email}?subject=${subject}&body=${body}`);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tour Requested</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>You're Booked!</Text>
          <Text style={styles.successSub}>
            Your tour request has been saved. Tap below to notify Phillip via email — he'll confirm within 24 hours.
          </Text>

          <View style={[styles.confirmCard, { borderLeftColor: community.color }]}>
            <View style={[styles.confirmColorBar, { backgroundColor: community.color }]} />
            <View style={styles.confirmDetails}>
              <Text style={styles.confirmCommunity}>{community.name}</Text>
              <Text style={styles.confirmBuilder}>{community.builder} · {community.city}, AZ</Text>
              <View style={styles.confirmRow}>
                <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                <Text style={styles.confirmValue}>{formatDisplayDate(selectedDate)}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.confirmValue}>{selectedTime}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Ionicons name={tourType === 'virtual' ? 'videocam-outline' : 'walk-outline'} size={14} color={Colors.primary} />
                <Text style={styles.confirmValue}>{tourType === 'virtual' ? 'Virtual Tour' : 'In-Person Tour'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.emailBtn} onPress={openEmail}>
            <Ionicons name="mail" size={20} color={Colors.white} />
            <Text style={styles.emailBtnText}>Send to Phillip via Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToCommunityBtn} onPress={() => router.back()}>
            <Text style={styles.backToCommunityText}>Back to {community.name}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule a Tour</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Community card */}
        <View style={[styles.communityCard, { borderLeftColor: community.color }]}>
          <View style={[styles.commColorDot, { backgroundColor: community.color }]} />
          <View style={styles.commCardText}>
            <Text style={styles.commCardName}>{community.name}</Text>
            <Text style={styles.commCardBuilder}>{community.builder} · {community.city}, AZ</Text>
            <Text style={styles.commCardPrice}>
              ${(community.priceFrom / 1000).toFixed(0)}K – ${(community.priceTo / 1000).toFixed(0)}K
            </Text>
          </View>
          {community.vaEligible && (
            <View style={styles.vaTag}>
              <Text style={styles.vaTagText}>VA ✓</Text>
            </View>
          )}
        </View>

        {/* Tour type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TOUR TYPE</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, tourType === 'in_person' && styles.typeBtnActive]}
              onPress={() => setTourType('in_person')}
            >
              <Ionicons name="walk-outline" size={20} color={tourType === 'in_person' ? Colors.white : Colors.primary} />
              <Text style={[styles.typeBtnText, tourType === 'in_person' && styles.typeBtnTextActive]}>In-Person</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, tourType === 'virtual' && styles.typeBtnActive]}
              onPress={() => setTourType('virtual')}
            >
              <Ionicons name="videocam-outline" size={20} color={tourType === 'virtual' ? Colors.white : Colors.primary} />
              <Text style={[styles.typeBtnText, tourType === 'virtual' && styles.typeBtnTextActive]}>Virtual</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT DATE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
            {dates.map((d) => {
              const isSelected = toISODate(d) === toISODate(selectedDate);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return (
                <TouchableOpacity
                  key={d.toISOString()}
                  style={[styles.dateCard, isSelected && styles.dateCardSelected, isWeekend && styles.dateCardWeekend]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.dateDow, isSelected && styles.dateSelectedText, isWeekend && !isSelected && styles.dateWeekendText]}>
                    {DAY_NAMES[d.getDay()]}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && styles.dateSelectedText, isWeekend && !isSelected && styles.dateWeekendText]}>
                    {d.getDate()}
                  </Text>
                  <Text style={[styles.dateMon, isSelected && styles.dateSelectedText]}>
                    {MONTH_NAMES[d.getMonth()]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={styles.selectedDateDisplay}>
            Selected: {formatDisplayDate(selectedDate)}
          </Text>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT TIME</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = slot === selectedTime;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.timeSlot, isSelected && styles.timeSlotSelected]}
                  onPress={() => setSelectedTime(slot)}
                >
                  <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextSelected]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUESTIONS / NOTES</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. We're interested in the Elara floor plan. What lots are available near the park?"
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.notesHint}>Phillip reviews all notes before your tour</Text>
        </View>

        {/* Agent note */}
        <View style={styles.agentNote}>
          <Ionicons name="person-circle-outline" size={36} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.agentNoteTitle}>{AGENT_PERSONA.name} will confirm within 24 hours</Text>
            <Text style={styles.agentNoteSub}>A confirmation and tour prep guide will be sent to your email.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Ionicons name="calendar" size={20} color={Colors.white} />
          <Text style={styles.confirmBtnText}>Confirm Tour Request</Text>
        </TouchableOpacity>

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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },

  scroll: { padding: Spacing.lg },

  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 5,
    padding: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  commColorDot: { width: 14, height: 14, borderRadius: 7, flexShrink: 0 },
  commCardText: { flex: 1 },
  commCardName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  commCardBuilder: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  commCardPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: 4 },
  vaTag: {
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  vaTagText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },

  section: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.md,
  },

  typeRow: { flexDirection: 'row', gap: Spacing.md },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  typeBtnActive: { backgroundColor: Colors.primary },
  typeBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
  typeBtnTextActive: { color: Colors.white },

  dateScroll: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  dateCard: {
    width: 64,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
    gap: 3,
  },
  dateCardSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateCardWeekend: { borderColor: Colors.accent + '60', backgroundColor: Colors.supportGoldLight },
  dateDow: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  dateNum: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  dateMon: { fontSize: 10, color: Colors.textSecondary },
  dateSelectedText: { color: Colors.white },
  dateWeekendText: { color: Colors.accent },
  selectedDateDisplay: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
  },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  timeSlot: {
    width: '30%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  timeSlotSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timeSlotText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  timeSlotTextSelected: { color: Colors.white },

  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundSecondary,
    minHeight: 100,
  },
  notesHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },

  agentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.supportMilitaryBlue,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  agentNoteTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  agentNoteSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  confirmBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },

  // Success state
  successScroll: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.lg },
  successIcon: { marginTop: Spacing['2xl'] },
  successTitle: { fontSize: FontSize['2xl'] ?? 28, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  successSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },

  confirmCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 5,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  confirmColorBar: { width: 6 },
  confirmDetails: { flex: 1, padding: Spacing.lg, gap: Spacing.sm },
  confirmCommunity: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  confirmBuilder: { fontSize: FontSize.sm, color: Colors.textSecondary },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  confirmValue: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },

  emailBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    ...Shadows.md,
  },
  emailBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },

  backToCommunityBtn: {
    paddingVertical: Spacing.md,
  },
  backToCommunityText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});
