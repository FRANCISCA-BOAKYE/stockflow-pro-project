import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  hydrated: false,

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync('theme_mode');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        set({ mode: stored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  setMode: (mode: ThemeMode) => {
    SecureStore.setItemAsync('theme_mode', mode).catch(() => {});
    set({ mode });
  },
}));
