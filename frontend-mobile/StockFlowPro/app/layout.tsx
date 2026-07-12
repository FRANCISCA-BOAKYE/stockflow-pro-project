import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { TIER_DASHBOARD_ROUTES, TIER_GROUP_SEGMENTS } from '../constants/routes';

export default function RootLayout() {
  const { token, user, isLoading, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync('jwt_token');
      const storedUser = await SecureStore.getItemAsync('user_data');

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setAuth({ token: storedToken, ...parsed });
      } else {
        clearAuth();
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';

    if (!token) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    if (user?.subscriptionStatus === 'EXPIRED') {
      router.replace('/(auth)/trial-expired');
      return;
    }

    if (inAuth) {
      router.replace((TIER_DASHBOARD_ROUTES[user?.tierType ?? ''] ?? '/(auth)/login') as any);
      return;
    }

    // Tier guard: block deep-linking into another tier's route group
    const currentGroup = segments[0];
    const ownGroup = TIER_GROUP_SEGMENTS[user?.tierType ?? ''];
    const isAnyTierGroup = Object.values(TIER_GROUP_SEGMENTS).includes(currentGroup as string);
    if (isAnyTierGroup && currentGroup !== ownGroup && ownGroup) {
      router.replace(TIER_DASHBOARD_ROUTES[user?.tierType ?? ''] as any);
    }
  }, [token, user, isLoading, segments]);

  return <Slot />;
}