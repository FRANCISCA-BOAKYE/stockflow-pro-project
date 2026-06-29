import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ManufacturerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0,0,0,0.07)',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#1A56DB',
        tabBarInactiveTintColor: '#94A3B8',
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
    </Tabs>
  );
}