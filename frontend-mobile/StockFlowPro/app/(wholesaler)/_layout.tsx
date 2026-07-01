import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WholesalerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A56DB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="warehouse/index" options={{ title: 'Warehouse', tabBarIcon: ({ color, size }) => <Ionicons name="archive-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="pos/index" options={{ title: 'Sell', tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="credit/index" options={{ title: 'Credit', tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="more" options={{ title: 'More', tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="linked-partners/index" options={{ href: null }} />
    </Tabs>
  );
}