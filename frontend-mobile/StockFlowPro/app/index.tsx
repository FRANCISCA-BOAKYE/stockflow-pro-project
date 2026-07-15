import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { TIER_DASHBOARD_ROUTES } from '../constants/routes';

export default function Index() {
  const { token, user, isLoading } = useAuthStore();

  // Wait for the root layout to finish checking SecureStore for a saved
  // session before deciding where to send the user — otherwise this always
  // flashes the login screen first, even when already signed in.
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </View>
    );
  }

  if (token && user) {
    return <Redirect href={(TIER_DASHBOARD_ROUTES[user.tierType] ?? '/(auth)/login') as any} />;
  }

  return <Redirect href="/(auth)/login" />;
}
