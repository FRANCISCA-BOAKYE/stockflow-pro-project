import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

const READ_STORAGE_KEY = 'sf_read_notifications';

async function getReadIds(): Promise<Set<string>> {
  try {
    const raw = await SecureStore.getItemAsync(READ_STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

async function saveReadIds(ids: Set<string>) {
  await SecureStore.setItemAsync(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

const TYPE_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  warning: { bg: '#FFFBEB', color: '#C27803', icon: 'warning-outline' },
  success: { bg: '#ECFDF5', color: '#059669', icon: 'checkmark-circle-outline' },
  info: { bg: '#EFF6FF', color: '#1A56DB', icon: 'information-circle-outline' },
  error: { bg: '#FEF2F2', color: '#DC2626', icon: 'alert-circle-outline' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buildNotifications = useCallback(async () => {
    const items: any[] = [];
    try {
      // Low stock alerts
      if (user?.tierType === 'RETAILER') {
        const lowStockRes = await api.get('/retailer/products/low-stock');
        const lowStock = lowStockRes.data || [];
        lowStock.forEach((p: any) => {
          items.push({
            id: `low-${p.id}`,
            title: 'Low stock alert',
            body: `${p.name} is below reorder level (${p.quantity} ${p.unit} remaining)`,
            time: 'Now',
            type: 'warning',
            read: false,
          });
        });
      }

      if (user?.tierType === 'MANUFACTURER') {
        const matsRes = await api.get('/manufacturer/materials');
        const mats = matsRes.data || [];
        mats.filter((m: any) => m.quantity < m.minThreshold).forEach((m: any) => {
          items.push({
            id: `mat-${m.id}`,
            title: 'Low material alert',
            body: `${m.name} is below threshold (${m.quantity} ${m.unit} remaining)`,
            time: 'Now',
            type: 'warning',
            read: false,
          });
        });
      }

      // Overdue credit alerts
      const creditRes = await api.get('/credit/overdue');
      const overdue = creditRes.data || [];
      overdue.forEach((c: any) => {
        items.push({
          id: `credit-${c.id}`,
          title: 'Credit overdue',
          body: `${c.partnerBusinessName} — $${Number(c.amountUsd).toFixed(2)} overdue since ${new Date(c.dueDate).toLocaleDateString()}`,
          time: 'Now',
          type: 'error',
          read: false,
        });
      });

      // Pending link requests
      const linksRes = await api.get('/links/partners');
      const pending = (linksRes.data || []).filter((l: any) => l.status === 'PENDING');
      pending.forEach((l: any) => {
        const requester = l.requesterBusiness?.name || 'A business';
        items.push({
          id: `link-${l.id}`,
          title: 'New link request',
          body: `${requester} wants to link with your business`,
          time: 'Now',
          type: 'info',
          read: false,
        });
      });

    } catch (e) {
      console.log('Error building notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    const readIds = await getReadIds();
    setNotifications(items.map(n => ({ ...n, read: readIds.has(n.id) })));
  }, [user?.tierType]);

  useEffect(() => { buildNotifications(); }, [buildNotifications]);

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
          <TouchableOpacity style={s.markBtn} onPress={async () => {
            await saveReadIds(new Set(notifications.map(n => n.id)));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
          }}>
            <Text style={s.markBtnText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); buildNotifications(); }} tintColor="#1A56DB" />}
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
              onPress={async () => {
                const readIds = await getReadIds();
                readIds.add(item.id);
                await saveReadIds(readIds);
                setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
              }}
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
                <Text style={s.time}>{item.time}</Text>
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