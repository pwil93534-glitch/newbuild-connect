import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buyer, BuyerType, MilitaryBase, LoanType, Timeline, AIMessage } from '../types';

interface BuyerStore {
  buyer: Partial<Buyer> | null;
  messages: AIMessage[];
  isOnboarded: boolean;
  setBuyer: (buyer: Partial<Buyer>) => void;
  updateBuyer: (updates: Partial<Buyer>) => void;
  setOnboarded: (val: boolean) => void;
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  reset: () => void;
}

const STORAGE_KEY = 'buyer_store_v1';

export const useBuyerStore = create<BuyerStore>((set, get) => ({
  buyer: null,
  messages: [],
  isOnboarded: false,

  setBuyer: (buyer) => {
    set({ buyer });
    get().saveToStorage();
  },

  updateBuyer: (updates) => {
    set((state) => ({ buyer: { ...state.buyer, ...updates } }));
    get().saveToStorage();
  },

  setOnboarded: (val) => {
    set({ isOnboarded: val });
    get().saveToStorage();
  },

  addMessage: (message) => {
    set((state) => {
      const messages = [...state.messages, message].slice(-50);
      return { messages };
    });
    get().saveToStorage();
  },

  clearMessages: () => {
    set({ messages: [] });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          buyer: data.buyer ?? null,
          messages: data.messages ?? [],
          isOnboarded: data.isOnboarded ?? false,
        });
      }
    } catch {
      // ignore
    }
  },

  saveToStorage: async () => {
    try {
      const { buyer, messages, isOnboarded } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ buyer, messages, isOnboarded }));
    } catch {
      // ignore
    }
  },

  reset: () => {
    set({ buyer: null, messages: [], isOnboarded: false });
    AsyncStorage.removeItem(STORAGE_KEY);
  },
}));
