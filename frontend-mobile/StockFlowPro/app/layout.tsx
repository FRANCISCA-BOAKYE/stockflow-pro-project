import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';

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

    const tierRoute: Record<string, any> = {
      MANUFACTURER: '/(manufacturer)/dashboard',
      WHOLESALER: '/(wholesaler)/dashboard',
      RETAILER: '/(retailer)/dashboard',
    };

    if (!inAuth) return;
    router.replace(tierRoute[user?.tierType ?? ''] ?? '/(auth)/login');
  }, [token, user, isLoading]);

  return <Slot />;
}