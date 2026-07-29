import { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Linking
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { useConfirmSheet } from '../../components/ConfirmSheet';

const HELP_URL = 'https://phenomenal-blini-7b80dd.netlify.app/help';

interface MenuItem {
  label: string;
  icon: string;
  color: string;
  bg: string;
  route: string;
  ownerOnly?: boolean;
  external?: boolean;
}

const getMenuGroups = (colors: ThemeColors): { title: string; items: MenuItem[] }[] => [
  {
    title: 'Operations',
    items: [
      { label: 'Recipes', icon: 'git-branch-outline', color: colors.purple, bg: colors.purpleSurface, route: '/(manufacturer)/recipes' },
      { label: 'Finished Goods', icon: 'cube-outline', color: colors.success, bg: colors.successSurface, route: '/(manufacturer)/finished-goods' },
      { label: 'Dispatch', icon: 'send-outline', color: colors.warning, bg: colors.warningSurface, route: '/(manufacturer)/dispatch' },
      { label: 'Team Activity', icon: 'shield-checkmark-outline', color: colors.purpleDark, bg: colors.purpleSurface, route: '/(manufacturer)/activity', ownerOnly: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { label: 'Linked Partners', icon: 'link-outline', color: colors.cyan, bg: colors.primarySurface, route: '/(manufacturer)/linked-partners' },
      { label: 'Marketplace', icon: 'storefront-outline', color: colors.textMuted, bg: colors.border, route: '/marketplace' },
      { label: 'My Listing', icon: 'megaphone-outline', color: colors.pink, bg: colors.pinkSurface, route: '/my-listing' },
      { label: 'Invoices', icon: 'receipt-outline', color: colors.cyan, bg: colors.primarySurface, route: '/invoices' },
      { label: 'Subscription', icon: 'card-outline', color: colors.textSecondary, bg: colors.border, route: '/subscription' },
    ],
  },
  {
    title: 'General',
    items: [
      { label: 'Notifications', icon: 'notifications-outline', color: colors.primary, bg: colors.primarySurface, route: '/notifications' },
      { label: 'Help', icon: 'help-circle-outline', color: colors.cyan, bg: colors.cyanSurface, route: HELP_URL, external: true },
    ],
  },
];

export default function ManufacturerMoreScreen() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const MENU_GROUPS = useMemo(() => getMenuGroups(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();
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

  const statusColor = user?.subscriptionStatus === 'ACTIVE' ? colors.success
    : user?.subscriptionStatus === 'TRIAL' ? colors.warning : colors.danger;

  const statusLabel = user?.subscriptionStatus === 'ACTIVE' ? 'Active'
    : user?.subscriptionStatus === 'TRIAL' ? 'Trial active' : 'Expired';

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      destructive: true,
      confirmLabel: 'Log out',
      icon: 'log-out-outline',
    });
    if (!ok) return;
    await clearAuth();
    router.replace('/(auth)/login');
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
  <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
</TouchableOpacity>
        </View>
        {MENU_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => !item.ownerOnly || !user?.isSubAccount);
          if (visibleItems.length === 0) return null;
          return (
            <View key={group.title}>
              <Text style={s.groupTitle}>{group.title.toUpperCase()}</Text>
              <View style={s.menuCard}>
                {visibleItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[s.menuItem, index < visibleItems.length - 1 && s.menuBorder]}
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
                    <Ionicons name="chevron-forward-outline" size={16} color={colors.borderStrong} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}
        <TouchableOpacity style={s.logoutCard} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={s.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  body: { padding: 12, gap: 12, paddingBottom: 100 },
  profileCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.onPrimary, fontSize: 18, fontWeight: '700' },
  userName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  userRole: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 11, fontWeight: '500' },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginLeft: 4 },
  menuCard: { backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  badge: { backgroundColor: colors.danger, borderRadius: 10, minWidth: 20, height: 20, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  badgeText: { color: colors.onPrimary, fontSize: 10, fontWeight: '700' },
  logoutCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border },
  logoutText: { fontSize: 14, fontWeight: '600', color: colors.danger },
});