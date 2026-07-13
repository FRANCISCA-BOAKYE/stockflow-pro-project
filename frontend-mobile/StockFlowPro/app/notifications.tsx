import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const TYPE_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  warning: { bg: '#FFFBEB', color: '#C27803', icon: 'warning-outline' },
  success: { bg: '#ECFDF5', color: '#059669', icon: 'checkmark-circle-outline' },
  info: { bg: '#EFF6FF', color: '#1A56DB', icon: 'information-circle-outline' },
  error: { bg: '#FEF2F2', color: '#DC2626', icon: 'alert-circle-outline' },
};

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

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor="#1A56DB" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="notifications-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>All caught up!</Text>
            <Text style={s.emptySub}>No alerts right now. Pull down to refresh.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const t = TYPE_MAP[item.type] || TYPE_MAP.info;
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

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  markBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EFF6FF', borderRadius: 20 },
  markBtnText: { fontSize: 12, color: '#1A56DB', fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardUnread: { borderColor: '#1A56DB', borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A56DB' },
  body: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  time: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});