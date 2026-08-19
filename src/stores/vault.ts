import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VaultCategory = 'financial' | 'identity' | 'military' | 'purchase' | 'other';

export interface VaultDoc {
  id: string;
  name: string;
  category: VaultCategory;
  localUri: string;
  mimeType: string;
  addedAt: string;
  sizeBytes?: number;
}

interface VaultStore {
  docs: VaultDoc[];
  addDoc: (doc: VaultDoc) => void;
  removeDoc: (id: string) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = 'vault_store_v1';

export const useVaultStore = create<VaultStore>((set, get) => ({
  docs: [],

  addDoc: (doc) => {
    set((state) => ({ docs: [doc, ...state.docs] }));
    get().saveToStorage();
  },

  removeDoc: (id) => {
    set((state) => ({ docs: state.docs.filter((d) => d.id !== id) }));
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      set({ docs: data.docs ?? [] });
    } catch {
      // Ignore local cache failures.
    }
  },

  saveToStorage: async () => {
    try {
      const { docs } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ docs }));
    } catch {
      // Ignore local cache failures.
    }
  },
}));
