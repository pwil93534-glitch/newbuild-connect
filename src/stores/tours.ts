import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TourType = 'in_person' | 'virtual';
export type TourStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface ScheduledTour {
  id: string;
  communityId: string;
  communityName: string;
  builder: string;
  city: string;
  date: string;      // YYYY-MM-DD
  time: string;      // e.g. "10:00 AM"
  tourType: TourType;
  notes: string;
  status: TourStatus;
  scheduledAt: string;
}

interface ToursStore {
  tours: ScheduledTour[];
  addTour: (tour: ScheduledTour) => void;
  cancelTour: (id: string) => void;
  upcomingTours: () => ScheduledTour[];
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = 'tours_store_v1';

export const useToursStore = create<ToursStore>((set, get) => ({
  tours: [],

  addTour: (tour) => {
    set((state) => ({ tours: [tour, ...state.tours] }));
    get().saveToStorage();
  },

  cancelTour: (id) => {
    set((state) => ({
      tours: state.tours.map((t) => (t.id === id ? { ...t, status: 'cancelled' } : t)),
    }));
    get().saveToStorage();
  },

  upcomingTours: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().tours.filter((t) => t.status !== 'cancelled' && t.date >= today);
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({ tours: data.tours ?? [] });
    } catch {
      // Ignore cache failures.
    }
  },

  saveToStorage: async () => {
    try {
      const { tours } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tours }));
    } catch {
      // Ignore cache failures.
    }
  },
}));
