import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  DELIVERED: { bg: '#D1FAE5', text: '#065F46', label: 'Delivered', icon: 'checkmark-circle-outline' },
  IN_TRANSIT: { bg: '#EFF6FF', text: '#1A56DB', label: 'In Transit', icon: 'car-outline' },
  PENDING: { bg: '#FEF3C7', text: '#92400E', label: 'Pending', icon: 'time-outline' },
};

export default function DispatchScreen() {
  const router = useRouter();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDispatches = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/dispatch');
      setDispatches(res.data || []);
    } catch (e) {
      console.log('Error fetching dispatches:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDispatches(); }, [fetchDispatches]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Dispatch</Text>
          <Text style={s.sub}>Outgoing shipments</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => Alert.alert('New Dispatch', 'Create new dispatch coming soon.')}>
          <Ionicons name="add" size={20} color="#1A56DB" />
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <FlatList
          data={dispatches}
          keyExtractor={item => String(item.id || item.dispatchId)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDispatches(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="send-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No dispatches yet</Text>
              <Text style={s.emptySub}>Dispatches appear when you sell finished goods</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = item.status || item.dispatchStatus || 'PENDING';
            const st = STATUS_MAP[status] || STATUS_MAP.PENDING;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                  <Ionicons name={st.icon as any} size={18} color={st.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.to}>{item.wholesalerName || item.buyerName || 'Customer'}</Text>
                  <Text style={s.items}>{item.productName || `Items`} x{item.quantity || 0}</Text>
                  <View style={s.row}>
                    <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                    <Text style={s.date}> {new Date(item.recordedAt || item.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={s.dispatchId}>{item.dispatchId || item.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.amount}>${Number(item.amountUsd || item.amount || 0).toLocaleString()}</Text>
                  <View style={[s.badge, { backgroundColor: st.bg }]}>
                    <Text style={[s.badgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  to: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  items: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  date: { fontSize: 11, color: '#9CA3AF' },
  dispatchId: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});
