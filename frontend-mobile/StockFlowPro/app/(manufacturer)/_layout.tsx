import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ManufacturerLayout() {
  const { colors } = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textPlaceholder,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 2 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="materials/index" options={{ title: 'Materials', tabBarIcon: ({ color, size }) => <Ionicons name="flask-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="production/index" options={{ title: 'Production', tabBarIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="credit/index" options={{ title: 'Credit', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="finished-goods/index" options={{ href: null }} />
      <Tabs.Screen name="dispatch/index" options={{ href: null }} />
      <Tabs.Screen name="recipes/index" options={{ href: null }} />
      <Tabs.Screen name="linked-partners/index" options={{ href: null }} />
      <Tabs.Screen name="activity/index" options={{ href: null }} />
    </Tabs>
  );
}
