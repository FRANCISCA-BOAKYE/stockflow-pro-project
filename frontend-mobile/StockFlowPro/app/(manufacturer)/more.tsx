import { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, Linking
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

const HELP_URL = 'https://stockflowpro-web.netlify.app/help';

const MENU_ITEMS = [
  { label: 'Notifications', icon: 'notifications-outline', color: '#1A56DB', bg: '#EFF6FF', route: '/notifications' },
  { label: 'POS Dispatch', icon: 'cart-outline', color: '#059669', bg: '#ECFDF5', route: '/(manufacturer)/pos' },
  { label: 'Finished Goods', icon: 'cube-outline', color: '#059669', bg: '#ECFDF5', route: '/(manufacturer)/finished-goods' },
  { label: 'Dispatch', icon: 'send-outline', color: '#C27803', bg: '#FFFBEB', route: '/(manufacturer)/dispatch' },
  { label: 'Recipes', icon: 'git-branch-outline', color: '#8B5CF6', bg: '#F5F3FF', route: '/(manufacturer)/recipes' },
  { label: 'Invoices', icon: 'receipt-outline', color: '#0EA5E9', bg: '#EFF6FF', route: '/invoices' },
  { label: 'Marketplace', icon: 'storefront-outline', color: '#6B7280', bg: '#F3F4F6', route: '/marketplace' },
  { label: 'My Listing', icon: 'megaphone-outline', color: '#DB2777', bg: '#FDF2F8', route: '/my-listing' },
  { label: 'Linked Partners', icon: 'link-outline', color: '#0EA5E9', bg: '#EFF6FF', route: '/(manufacturer)/linked-partners' },
  { label: 'Subscription', icon: 'card-outline', color: '#374151', bg: '#F3F4F6', route: '/subscription' },
  { label: 'Help', icon: 'help-circle-outline', color: '#0891B2', bg: '#ECFEFF', route: HELP_URL, external: true },
];

export default function ManufacturerMoreScreen() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      api.get('/notifications')
        .then(res => setUnreadCount(Array.isArray(res.data) ? res.data.filter((n: any) => !n.read).length : 0))
        .catch(() => {});
    }, [])
  );

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const statusColor = user?.subscriptionStatus === 'ACTIVE' ? '#059669'
    : user?.subscriptionStatus === 'TRIAL' ? '#C27803' : '#DC2626';

  const statusLabel = user?.subscriptionStatus === 'ACTIVE' ? 'Active'
    : user?.subscriptionStatus === 'TRIAL' ? 'Trial active' : 'Expired';

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive', onPress: async () => {
          await clearAuth();
          router.replace('/(auth)/login');
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>More</Text>
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{user?.name || 'User'}</Text>
            <Text style={s.userRole}>{user?.role} · {user?.tierType}</Text>
            <View style={s.statusRow}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => router.push('/profile')}>
  <Ionicons name="pencil-outline" size={16} color="#6B7280" />
</TouchableOpacity>
        </View>
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[s.menuItem, index < MENU_ITEMS.length - 1 && s.menuBorder]}
              onPress={() => item.external ? Linking.openURL(item.route) : router.push(item.route as any)}
            >
              <View style={[s.menuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              {item.label === 'Notifications' && unreadCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward-outline" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.logoutCard} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  body: { padding: 12, gap: 12, paddingBottom: 100 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  userRole: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontWeight: '500' },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  menuCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: '#374151' },
  badge: { backgroundColor: '#DC2626', borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  logoutCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
});