import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../src/design-system';
import { useNotificationsStore, AlertItem, AlertType, NotificationPrefs } from '../src/stores/notifications';
import { useBuyerStore } from '../src/stores/buyer';
import { COMMUNITIES } from '../src/constants/communities';
import {
  requestNotificationPermissions,
  getPermissionStatus,
  scheduleBuilderAlerts,
  scheduleJourneyNudge,
  sendTestAlert,
  getExpoPushToken,
  cancelAllScheduled,
} from '../src/services/notifications';

const EAS_PROJECT_ID = 'edc41147-915b-4361-9f63-d30c37bed22c';

type PermStatus = 'granted' | 'denied' | 'undetermined' | 'checking';

const ALERT_META: Record<AlertType, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  incentive_deadline: { icon: 'flame', color: Colors.danger, label: 'Incentive Alert' },
  new_phase: { icon: 'home', color: Colors.success, label: 'New Phase' },
  price_drop: { icon: 'trending-down', color: Colors.primary, label: 'Price Drop' },
  journey_nudge: { icon: 'map', color: '#7B2FBE', label: 'Journey' },
  market_update: { icon: 'trending-up', color: Colors.accent, label: 'Market' },
  agent_checkin: { icon: 'person', color: Colors.primary, label: 'Agent' },
};

const PREF_CONFIG: { key: keyof NotificationPrefs; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'deadline_warnings', label: 'Deadline Warnings', sub: 'Alert when incentives are expiring soon', icon: 'time' },
  { key: 'incentive_alerts', label: 'Incentive Alerts', sub: 'New builder incentives and bonuses', icon: 'pricetag' },
  { key: 'community_alerts', label: 'Community Updates', sub: 'New phases, lot releases, price changes', icon: 'business' },
  { key: 'journey_nudges', label: 'Journey Nudges', sub: 'Reminders for your next home-buying step', icon: 'map' },
  { key: 'market_updates', label: 'Market Updates', sub: 'AZ real estate trends and BAH changes', icon: 'trending-up' },
  { key: 'agent_checkins', label: 'Agent Check-ins', sub: 'Personal messages from Phillip', icon: 'chatbubble' },
];

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(diff / 86400000);
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function AlertCard({ alert, onPress }: { alert: AlertItem; onPress: () => void }) {
  const meta = ALERT_META[alert.type];
  return (
    <TouchableOpacity
      style={[styles.alertCard, !alert.read && styles.alertCardUnread]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {!alert.read && <View style={styles.unreadDot} />}
      <View style={[styles.alertIconWrap, { backgroundColor: meta.color + '18' }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.alertContent}>
        <View style={styles.alertTop}>
          <Text style={[styles.alertTitle, !alert.read && styles.alertTitleUnread]} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.alertTime}>{formatRelativeTime(alert.createdAt)}</Text>
        </View>
        <Text style={styles.alertBody} numberOfLines={2}>{alert.body}</Text>
        {alert.communityId && (() => {
          const community = COMMUNITIES.find((c) => c.id === alert.communityId);
          return community ? (
            <View style={[styles.communityTag, { backgroundColor: community.color + '30' }]}>
              <View style={[styles.communityDot, { backgroundColor: community.color }]} />
              <Text style={styles.communityTagText}>{community.name}</Text>
            </View>
          ) : null;
        })()}
      </View>
    </TouchableOpacity>
  );
}

function WatchedCommunityPill({
  communityId,
  onRemove,
  onPress,
}: { communityId: string; onRemove: () => void; onPress: () => void }) {
  const community = COMMUNITIES.find((c) => c.id === communityId);
  if (!community) return null;
  return (
    <View style={[styles.watchPill, { borderColor: community.color }]}>
      <View style={[styles.watchDot, { backgroundColor: community.color }]} />
      <TouchableOpacity onPress={onPress} style={{ flex: 1 }}>
        <Text style={styles.watchName} numberOfLines={1}>{community.name}</Text>
        <Text style={styles.watchBuilder} numberOfLines={1}>{community.builder}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onRemove} style={styles.watchRemoveBtn}>
        <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

export default function AlertsScreen() {
  const router = useRouter();
  const { buyer } = useBuyerStore();
  const {
    prefs,
    watchedCommunityIds,
    inbox,
    togglePref,
    toggleWatch,
    isWatched,
    markRead,
    markAllRead,
    unreadCount,
    addAlert,
  } = useNotificationsStore();

  const [permStatus, setPermStatus] = useState<PermStatus>('checking');
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [showWatchPicker, setShowWatchPicker] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    getPermissionStatus().then(setPermStatus);
    getExpoPushToken(EAS_PROJECT_ID).then(setPushToken);
  }, []);

  const unread = unreadCount();

  async function handleEnableNotifications() {
    const granted = await requestNotificationPermissions();
    setPermStatus(granted ? 'granted' : 'denied');
    if (granted) {
      const token = await getExpoPushToken(EAS_PROJECT_ID);
      setPushToken(token);
    }
  }

  async function handleScheduleAlerts() {
    if (permStatus !== 'granted') {
      await handleEnableNotifications();
      return;
    }
    setScheduling(true);
    try {
      await cancelAllScheduled();
      for (const id of watchedCommunityIds) {
        const community = COMMUNITIES.find((c) => c.id === id);
        if (community) await scheduleBuilderAlerts(community);
      }
      if (prefs.journey_nudges && buyer?.current_stage) {
        const stage = buyer.current_stage;
        const stageNames = ['Profile', 'Pre-Approval', 'Community Search', 'Lot Reserved', 'Contract', 'Build Phase', 'Close'];
        await scheduleJourneyNudge(stageNames[stage - 1] ?? 'Next Step', buyer.name?.split(' ')[0] ?? '');
      }
      Alert.alert('Alerts Scheduled', `${watchedCommunityIds.length} community watch${watchedCommunityIds.length !== 1 ? 'es' : ''} and journey reminders are set.`);
    } finally {
      setScheduling(false);
    }
  }

  async function handleWatchToggle(communityId: string) {
    const wasWatched = isWatched(communityId);
    toggleWatch(communityId);

    if (!wasWatched) {
      const community = COMMUNITIES.find((c) => c.id === communityId);
      if (community) {
        addAlert({
          type: 'new_phase',
          title: `Now Watching ${community.name}`,
          body: `You'll receive deadline and incentive alerts for ${community.name} by ${community.builder}.`,
          communityId: community.id,
        });
        if (permStatus === 'granted') await scheduleBuilderAlerts(community);
      }
    }
  }

  async function handleTestAlert() {
    if (permStatus !== 'granted') {
      await handleEnableNotifications();
      return;
    }
    await sendTestAlert(buyer?.name?.split(' ')[0]);
    Alert.alert('Test Sent', 'A test notification will appear in ~3 seconds. Background the app to see it.');
  }

  // Suggested communities for the buyer type (not already watched)
  const suggested = COMMUNITIES.filter((c) => {
    if (watchedCommunityIds.includes(c.id)) return false;
    if (buyer?.buyer_type === 'veteran') return c.vaEligible;
    if (buyer?.buyer_type === 'first_time') return c.fhaEligible;
    if (buyer?.buyer_type === 'senior') return c.seniorCommunity;
    return true;
  }).slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Alerts</Text>
          {unread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unread}</Text>
            </View>
          )}
        </View>
        {unread > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
            <Text style={styles.markReadText}>Mark All Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Push permissions status */}
        {permStatus !== 'granted' && permStatus !== 'checking' && (
          <TouchableOpacity style={styles.permBanner} onPress={handleEnableNotifications}>
            <View style={styles.permBannerIcon}>
              <Ionicons name="notifications-off-outline" size={22} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.permBannerTitle}>Notifications Off</Text>
              <Text style={styles.permBannerSub}>Tap to enable so you never miss an incentive deadline.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
          </TouchableOpacity>
        )}

        {permStatus === 'granted' && (
          <View style={styles.permGranted}>
            <Ionicons name="notifications" size={16} color={Colors.success} />
            <Text style={styles.permGrantedText}>Push notifications active</Text>
          </View>
        )}

        {/* Inbox */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>INBOX</Text>
            {unread > 0 && <Text style={styles.sectionCount}>{unread} unread</Text>}
          </View>
          {inbox.length === 0 ? (
            <View style={styles.emptyInbox}>
              <Ionicons name="notifications-outline" size={32} color={Colors.border} />
              <Text style={styles.emptyInboxText}>No alerts yet</Text>
            </View>
          ) : (
            <View style={styles.alertList}>
              {inbox.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={() => {
                    markRead(alert.id);
                    if (alert.communityId) router.push(`/community/${alert.communityId}`);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Builder Priority Alerts — Watched Communities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BUILDER PRIORITY ALERTS</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Watch communities to get notified the moment incentives change, new lots drop, or deadlines approach.
          </Text>

          {watchedCommunityIds.length > 0 && (
            <View style={styles.watchList}>
              {watchedCommunityIds.map((id) => (
                <WatchedCommunityPill
                  key={id}
                  communityId={id}
                  onRemove={() => toggleWatch(id)}
                  onPress={() => router.push(`/community/${id}`)}
                />
              ))}
            </View>
          )}

          {/* Suggested to watch */}
          {suggested.length > 0 && (
            <>
              <Text style={styles.suggestLabel}>
                {watchedCommunityIds.length === 0 ? 'Suggested for you' : 'Add more'}
              </Text>
              <View style={styles.suggestGrid}>
                {suggested.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.suggestCard}
                    onPress={() => handleWatchToggle(c.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.suggestColor, { backgroundColor: c.color }]} />
                    <Text style={styles.suggestName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.suggestBuilder} numberOfLines={1}>{c.builder}</Text>
                    {c.activeIncentives.length > 0 && (
                      <View style={styles.suggestIncentivePill}>
                        <Ionicons name="flame" size={10} color={Colors.white} />
                        <Text style={styles.suggestIncentiveText}>{c.activeIncentives.length} active</Text>
                      </View>
                    )}
                    <View style={styles.suggestWatchRow}>
                      <Ionicons name="add-circle-outline" size={14} color={Colors.primary} />
                      <Text style={styles.suggestWatchText}>Watch</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {watchedCommunityIds.length > 0 && (
            <TouchableOpacity
              style={[styles.scheduleBtn, scheduling && styles.scheduleBtnDisabled]}
              onPress={handleScheduleAlerts}
              disabled={scheduling}
            >
              <Ionicons name="alarm" size={18} color={Colors.white} />
              <Text style={styles.scheduleBtnText}>
                {scheduling ? 'Scheduling…' : 'Schedule All Alerts'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>NOTIFICATION PREFERENCES</Text>
          </View>
          <View style={styles.prefList}>
            {PREF_CONFIG.map((pref) => (
              <View key={pref.key} style={styles.prefRow}>
                <View style={[styles.prefIconWrap, { backgroundColor: Colors.backgroundSecondary }]}>
                  <Ionicons name={pref.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.prefText}>
                  <Text style={styles.prefLabel}>{pref.label}</Text>
                  <Text style={styles.prefSub}>{pref.sub}</Text>
                </View>
                <Switch
                  value={prefs[pref.key]}
                  onValueChange={() => togglePref(pref.key)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                  thumbColor={prefs[pref.key] ? Colors.primary : Colors.backgroundSecondary}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Push Setup & Test */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PUSH SETUP</Text>
          </View>
          {pushToken && (
            <View style={styles.tokenCard}>
              <Ionicons name="key-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.tokenText} numberOfLines={1} ellipsizeMode="middle">
                {pushToken}
              </Text>
            </View>
          )}
          <TouchableOpacity style={styles.testBtn} onPress={handleTestAlert}>
            <Ionicons name="paper-plane-outline" size={16} color={Colors.primary} />
            <Text style={styles.testBtnText}>Send Test Notification</Text>
          </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerBadge: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white },
  markReadBtn: { paddingHorizontal: Spacing.sm },
  markReadText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },

  scroll: { paddingBottom: Spacing['4xl'] },

  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: '#FFF0F0',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.danger + '40',
  },
  permBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permBannerTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.danger },
  permBannerSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  permGranted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#EAF7EF',
    borderRadius: BorderRadius.md,
  },
  permGrantedText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.medium },

  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionCount: { fontSize: FontSize.xs, color: Colors.danger, fontWeight: FontWeight.bold },
  sectionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },

  alertList: { gap: Spacing.sm },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundSecondary,
    position: 'relative',
  },
  alertCardUnread: { backgroundColor: Colors.supportMilitaryBlue + '60' },
  unreadDot: {
    position: 'absolute',
    top: 14,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: { flex: 1 },
  alertTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.xs },
  alertTitle: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  alertTitleUnread: { fontWeight: FontWeight.bold },
  alertTime: { fontSize: 11, color: Colors.textSecondary, flexShrink: 0 },
  alertBody: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18, marginTop: 3 },
  communityTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, alignSelf: 'flex-start', borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 3 },
  communityDot: { width: 6, height: 6, borderRadius: 3 },
  communityTagText: { fontSize: 10, fontWeight: FontWeight.semibold, color: Colors.textPrimary },

  emptyInbox: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  emptyInboxText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  watchList: { gap: Spacing.sm, marginBottom: Spacing.md },
  watchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  watchDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  watchName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  watchBuilder: { fontSize: FontSize.xs, color: Colors.textSecondary },
  watchRemoveBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  suggestLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: Spacing.sm },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  suggestCard: {
    width: '47%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
    overflow: 'hidden',
    padding: Spacing.sm,
    gap: 3,
  },
  suggestColor: { height: 4, borderRadius: BorderRadius.full, marginBottom: 4 },
  suggestName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  suggestBuilder: { fontSize: FontSize.xs, color: Colors.textSecondary },
  suggestIncentivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  suggestIncentiveText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white },
  suggestWatchRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  suggestWatchText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },

  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  scheduleBtnDisabled: { opacity: 0.5 },
  scheduleBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },

  prefList: { gap: 0 },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prefIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  prefText: { flex: 1 },
  prefLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  prefSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tokenText: { flex: 1, fontSize: 10, color: Colors.textSecondary, fontFamily: 'Courier' },

  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  testBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.primary },
});
