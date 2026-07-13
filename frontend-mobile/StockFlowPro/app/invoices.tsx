import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: '#D1FAE5', text: '#065F46', label: 'Paid' },
  UNPAID: { bg: '#F3F4F6', text: '#374151', label: 'Unpaid' },
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue' },
};

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const url = filter === 'ALL' ? '/pos/invoices' : `/pos/invoices?status=${filter}`;
      const res = await api.get(url);
      setInvoices(res.data?.content || res.data || []);
    } catch (e) {
      console.log('Error fetching invoices:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const total = invoices.reduce((sum, i) => sum + Number(i.totalUsd || 0), 0);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Invoices</Text>
          <Text style={s.sub}>{invoices.length} invoices · ${total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.chips}>
          {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map(f => (
            <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.chipText, filter === f && s.chipTextActive]}>
                {f === 'ALL' ? 'All' : STATUS_MAP[f]?.label || f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={invoices}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchInvoices(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No invoices yet</Text>
              <Text style={s.emptySub}>Invoices are generated automatically from POS sales</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = item.status || (item.paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID');
            const st = STATUS_MAP[status] || STATUS_MAP.UNPAID;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                  <Ionicons name="receipt-outline" size={18} color={st.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.party}>{item.buyerName || item.buyerBusinessName || 'Sale'}</Text>
                  <View style={s.row}>
                    <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                    <Text style={s.date}> {new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={s.invoiceId}>{item.invoiceNumber}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.amount}>${Number(item.totalUsd).toFixed(2)}</Text>
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
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  party: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  date: { fontSize: 11, color: '#9CA3AF' },
  invoiceId: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});