import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertType =
  | 'incentive_deadline'
  | 'new_phase'
  | 'price_drop'
  | 'journey_nudge'
  | 'market_update'
  | 'agent_checkin';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  communityId?: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationPrefs {
  incentive_alerts: boolean;
  journey_nudges: boolean;
  community_alerts: boolean;
  deadline_warnings: boolean;
  market_updates: boolean;
  agent_checkins: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  incentive_alerts: true,
  journey_nudges: true,
  community_alerts: true,
  deadline_warnings: true,
  market_updates: false,
  agent_checkins: true,
};

function createSeedAlerts(): AlertItem[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      type: 'incentive_deadline',
      title: 'Pulte Flex Cash Ending in 5 Days',
      body: 'The 3% Flex Cash incentive at Windrose (Surprise) expires soon. Lock in before it\'s gone.',
      communityId: 'windrose-pulte',
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'seed-2',
      type: 'new_phase',
      title: 'New Lots Released — Sun City Festival',
      body: '18 new lots just released near Davis-Monthan AFB. VA-eligible, priced from $389K.',
      communityId: 'sun-city-festival-dw',
      createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'seed-3',
      type: 'incentive_deadline',
      title: '$15K QMI Bonus — 4 Homes Left',
      body: 'Windrose has only 4 quick move-in homes eligible for the $15K bonus. First-come, first-served.',
      communityId: 'windrose-pulte',
      createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
    },
    {
      id: 'seed-4',
      type: 'market_update',
      title: '2026 BAH Rates Updated for AZ Bases',
      body: 'Luke AFB BAH increased to $2,100/mo. Your VA buying power just went up — see updated estimates in the Calculator.',
      createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'seed-5',
      type: 'agent_checkin',
      title: 'Phillip Checked In On You',
      body: 'Hey! Just wanted to see how your home search is going. Ready to tour Windrose or Sun City Festival?',
      createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ];
}

interface NotificationsStore {
  prefs: NotificationPrefs;
  watchedCommunityIds: string[];
  inbox: AlertItem[];
  seeded: boolean;

  togglePref: (key: keyof NotificationPrefs) => void;
  toggleWatch: (communityId: string) => void;
  isWatched: (communityId: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  addAlert: (alert: Omit<AlertItem, 'id' | 'createdAt' | 'read'>) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = 'notifications_store_v1';

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  prefs: DEFAULT_PREFS,
  watchedCommunityIds: [],
  inbox: [],
  seeded: false,

  togglePref: (key) => {
    set((state) => ({ prefs: { ...state.prefs, [key]: !state.prefs[key] } }));
    get().saveToStorage();
  },

  toggleWatch: (communityId) => {
    set((state) => ({
      watchedCommunityIds: state.watchedCommunityIds.includes(communityId)
        ? state.watchedCommunityIds.filter((id) => id !== communityId)
        : [...state.watchedCommunityIds, communityId],
    }));
    get().saveToStorage();
  },

  isWatched: (communityId) => get().watchedCommunityIds.includes(communityId),

  markRead: (id) => {
    set((state) => ({
      inbox: state.inbox.map((a) => (a.id === id ? { ...a, read: true } : a)),
    }));
    get().saveToStorage();
  },

  markAllRead: () => {
    set((state) => ({ inbox: state.inbox.map((a) => ({ ...a, read: true })) }));
    get().saveToStorage();
  },

  unreadCount: () => get().inbox.filter((a) => !a.read).length,

  addAlert: (alert) => {
    const item: AlertItem = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    set((state) => ({ inbox: [item, ...state.inbox] }));
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeds = createSeedAlerts();
        set({ inbox: seeds, seeded: true, prefs: DEFAULT_PREFS, watchedCommunityIds: [] });
        get().saveToStorage();
        return;
      }
      const data = JSON.parse(raw);
      set({
        prefs: { ...DEFAULT_PREFS, ...data.prefs },
        watchedCommunityIds: data.watchedCommunityIds ?? [],
        inbox: data.seeded ? (data.inbox ?? []) : createSeedAlerts(),
        seeded: true,
      });
    } catch {
      // Ignore cache failures.
    }
  },

  saveToStorage: async () => {
    try {
      const { prefs, watchedCommunityIds, inbox, seeded } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ prefs, watchedCommunityIds, inbox, seeded }));
    } catch {
      // Ignore cache failures.
    }
  },
}));
