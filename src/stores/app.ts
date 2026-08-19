import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppStore {
  toasts: Toast[];
  savedCommunityIds: string[];
  compareCommunityIds: string[];
  taskCompletions: Record<string, boolean>;
  journeyStageStatuses: Record<number, 'not_started' | 'in_progress' | 'complete' | 'needs_attention'>;

  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;

  toggleSavedCommunity: (communityId: string) => void;
  isCommunitysaved: (communityId: string) => boolean;
  toggleCompareCommunity: (communityId: string) => void;
  clearCompare: () => void;
  isCommunityCompared: (communityId: string) => boolean;

  toggleTask: (taskKey: string) => void;
  isTaskComplete: (taskKey: string) => boolean;

  updateStageStatus: (
    stage: number,
    status: 'not_started' | 'in_progress' | 'complete' | 'needs_attention'
  ) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = 'app_store_v1';

export const useAppStore = create<AppStore>((set, get) => ({
  toasts: [],
  savedCommunityIds: [],
  compareCommunityIds: [],
  taskCompletions: {},
  journeyStageStatuses: {},

  showToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().dismissToast(id), 3500);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleSavedCommunity: (communityId) => {
    set((state) => ({
      savedCommunityIds: state.savedCommunityIds.includes(communityId)
        ? state.savedCommunityIds.filter((id) => id !== communityId)
        : [...state.savedCommunityIds, communityId],
    }));
    get().saveToStorage();
  },

  isCommunitysaved: (communityId) => get().savedCommunityIds.includes(communityId),

  toggleCompareCommunity: (communityId) => {
    const isCompared = get().compareCommunityIds.includes(communityId);
    if (!isCompared && get().compareCommunityIds.length >= 3) {
      get().showToast('Compare up to 3 communities at a time.', 'warning');
      return;
    }

    set((state) => ({
      compareCommunityIds: isCompared
        ? state.compareCommunityIds.filter((id) => id !== communityId)
        : [...state.compareCommunityIds, communityId],
    }));
    get().saveToStorage();
  },

  clearCompare: () => {
    set({ compareCommunityIds: [] });
    get().saveToStorage();
  },

  isCommunityCompared: (communityId) => get().compareCommunityIds.includes(communityId),

  toggleTask: (taskKey) => {
    set((state) => ({
      taskCompletions: {
        ...state.taskCompletions,
        [taskKey]: !state.taskCompletions[taskKey],
      },
    }));
    get().saveToStorage();
  },

  isTaskComplete: (taskKey) => !!get().taskCompletions[taskKey],

  updateStageStatus: (stage, status) => {
    set((state) => ({
      journeyStageStatuses: { ...state.journeyStageStatuses, [stage]: status },
    }));
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({
        savedCommunityIds: data.savedCommunityIds ?? [],
        compareCommunityIds: data.compareCommunityIds ?? [],
        taskCompletions: data.taskCompletions ?? {},
        journeyStageStatuses: data.journeyStageStatuses ?? {},
      });
    } catch {
      // Keep defaults if local cache is unavailable.
    }
  },

  saveToStorage: async () => {
    try {
      const { savedCommunityIds, compareCommunityIds, taskCompletions, journeyStageStatuses } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ savedCommunityIds, compareCommunityIds, taskCompletions, journeyStageStatuses })
      );
    } catch {
      // Ignore local cache failures.
    }
  },
}));
