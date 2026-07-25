import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const ACTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  SALE: { icon: 'cash-outline', color: '#059669', bg: '#ECFDF5' },
  DISPATCH: { icon: 'car-outline', color: '#1A56DB', bg: '#EFF6FF' },
  PRODUCTION: { icon: 'cog-outline', color: '#7C3AED', bg: '#F5F3FF' },
  CREDIT_PAYMENT: { icon: 'wallet-outline', color: '#059669', bg: '#ECFDF5' },
  CREDIT_DELETE: { icon: 'trash-outline', color: '#DC2626', bg: '#FEF2F2' },
};

export function ActivityLogScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLog = useCallback(async () => {
    try {
      const res = await api.get('/activity-log?size=50');
      setEntries(res.data?.content || []);
    } catch (e) {
      console.log('Error fetching activity log:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Team Activity</Text>
          <Text style={s.sub}>Every sale, dispatch, and money action your team recorded</Text>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLog(); }} tintColor="#1A56DB" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="list-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>No activity yet</Text>
            <Text style={s.emptySub}>Sales, dispatches, and credit actions will show up here as your team records them</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = ACTION_ICONS[item.actionType] || { icon: 'ellipse-outline', color: '#6B7280', bg: '#F3F4F6' };
          return (
            <View style={s.card}>
              <View style={[s.icon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={17} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.description}>{item.description}</Text>
                <View style={s.metaRow}>
                  <Text style={s.actorName}>{item.actorName}</Text>
                  {item.actorIsSubAccount && (
                    <View style={s.subBadge}>
                      <Text style={s.subBadgeText}>Sub-account</Text>
                    </View>
                  )}
                  <Text style={s.time}> · {new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              {item.amountUsd != null && (
                <Text style={s.amount}>${Number(item.amountUsd).toFixed(2)}</Text>
              )}
            </View>
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
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 3 },
  actorName: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  time: { fontSize: 11, color: '#9CA3AF' },
  subBadge: { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 },
  subBadgeText: { fontSize: 9, color: '#92400E', fontWeight: '700' },
  amount: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});
