import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

const TYPE_MAP = (colors: ThemeColors): Record<string, { bg: string; color: string; icon: string }> => ({
  warning: { bg: colors.warningSurface, color: colors.warning, icon: 'warning-outline' },
  success: { bg: colors.successSurface, color: colors.success, icon: 'checkmark-circle-outline' },
  info: { bg: colors.primarySurface, color: colors.primary, icon: 'information-circle-outline' },
  error: { bg: colors.dangerSurface, color: colors.danger, icon: 'alert-circle-outline' },
});

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const TYPES = useMemo(() => TYPE_MAP(colors), [colors]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log('Error fetching notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await api.post(`/notifications/${id}/read`, {});
    } catch (e) {
      console.log('Error marking notification read:', e);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.post('/notifications/read-all', {});
    } catch (e) {
      console.log('Error marking all notifications read:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Notifications</Text>
          <Text style={s.sub}>{unreadCount} unread</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={s.markBtn} onPress={markAllRead}>
            <Text style={s.markBtnText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-outline" size={40} color={colors.borderStrong} />
            <Text style={s.emptyText}>All caught up!</Text>
            <Text style={s.emptySub}>No alerts right now. Pull down to refresh.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const t = TYPES[item.type] || TYPES.info;
          return (
            <TouchableOpacity
              style={[s.card, !item.read && s.cardUnread]}
              onPress={() => !item.read && markRead(item.id)}
            >
              <View style={[s.icon, { backgroundColor: t.bg }]}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.titleRow}>
                  <Text style={s.notifTitle}>{item.title}</Text>
                  {!item.read && <View style={s.dot} />}
                </View>
                <Text style={s.body}>{item.body}</Text>
                <Text style={s.time}>{timeAgo(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  markBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.primarySurface, borderRadius: 20 },
  markBtnText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardUnread: { borderColor: colors.primary, borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  body: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  time: { fontSize: 10, color: colors.textPlaceholder, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
});