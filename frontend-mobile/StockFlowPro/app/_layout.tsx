import { useEffect, useState, useCallback } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import { TIER_DASHBOARD_ROUTES, TIER_GROUP_SEGMENTS } from '../constants/routes';
import AnimatedSplash from '../components/AnimatedSplash';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const { token, user, isLoading, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('jwt_token');
        const storedUser = await SecureStore.getItemAsync('user_data');

        if (storedToken && storedUser) {
          const parsed = JSON.parse(storedUser);
          await setAuth({ token: storedToken, ...parsed });
        } else {
          await clearAuth();
        }
      } catch (e) {
        // Corrupted or unreadable session data — fall back to a clean
        // logged-out state instead of hanging on isLoading forever.
        console.log('Error restoring session:', e);
        await clearAuth();
      } finally {
        // Hand off from the native splash to our animated one immediately —
        // they use the same logo/background so the swap is invisible.
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  const handleIntroFinish = useCallback(() => setShowIntro(false), []);

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

  return (
    <>
      <Slot />
      {showIntro && <AnimatedSplash onFinish={handleIntroFinish} />}
    </>
  );
}