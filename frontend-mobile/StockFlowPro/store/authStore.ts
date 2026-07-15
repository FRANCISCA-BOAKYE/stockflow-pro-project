import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  setAuth: (data: any) => void;
  updateUser: (partial: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (data: any) => {
    const { token, ...user } = data;
    await SecureStore.setItemAsync('jwt_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ token, user, isLoading: false });
  },

  updateUser: async (partial: any) => {
    const merged = { ...get().user, ...partial };
    await SecureStore.setItemAsync('user_data', JSON.stringify(merged));
    set({ user: merged });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ token: null, user: null, isLoading: false });
  },
}));
