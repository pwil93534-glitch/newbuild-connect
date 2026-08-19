import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Community } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'NewBuild Connect',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#003366',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  seconds = 1
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { seconds, type: 'timeInterval' } as any,
  });
}

export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleBuilderAlerts(community: Community): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  for (const incentive of community.activeIncentives) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${community.builder} — Incentive Reminder`,
        body: `"${incentive}" is available at ${community.name} in ${community.city}. Tap to learn more.`,
        sound: true,
        data: { communityId: community.id, type: 'incentive_deadline' },
      },
      trigger: { seconds: 7 * 24 * 60 * 60, type: 'timeInterval' } as any,
    });
  }

  // Deadline warning at 24h interval
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⏰ Watching ${community.name}`,
      body: `Builder incentives at ${community.name} may expire soon. Book a tour to lock in your price.`,
      sound: true,
      data: { communityId: community.id, type: 'deadline_warning' },
    },
    trigger: { seconds: 3 * 24 * 60 * 60, type: 'timeInterval' } as any,
  });
}

export async function scheduleJourneyNudge(
  stageName: string,
  buyerName: string
): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📍 Journey Reminder${buyerName ? `, ${buyerName}` : ''}`,
      body: `Your next step: "${stageName}". Tap to see your checklist and keep momentum going!`,
      sound: true,
      data: { type: 'journey_nudge' },
    },
    trigger: { seconds: 24 * 60 * 60, type: 'timeInterval' } as any,
  });
}

export async function sendTestAlert(buyerName?: string): Promise<void> {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏠 NewBuild Connect',
      body: `Hi${buyerName ? ` ${buyerName}` : ''}! Pulte extended Flex Cash through month-end. Ready to lock in your rate?`,
      sound: true,
      data: { type: 'test' },
    },
    trigger: { seconds: 3, type: 'timeInterval' } as any,
  });
}

export async function getExpoPushToken(projectId: string): Promise<string | null> {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export function addNotificationListener(
  handler: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
