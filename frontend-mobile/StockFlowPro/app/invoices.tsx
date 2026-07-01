import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const getInvoicesForTier = (tier?: string) => {
  if (tier === 'MANUFACTURER') {
    return [
      { id: 'INV-001', party: 'Apex Distributors', date: 'Jun 26, 2026', amount: 42000.00, status: 'PAID' },
      { id: 'INV-002', party: 'Sunrise Wholesale', date: 'Jun 20, 2026', amount: 28500.00, status: 'UNPAID' },
      { id: 'INV-003', party: 'Delta Trading Co', date: 'Jun 15, 2026', amount: 14800.00, status: 'OVERDUE' },
      { id: 'INV-004', party: 'Metro Distributors', date: 'Jun 10, 2026', amount: 22000.00, status: 'PAID' },
    ];
  }
  if (tier === 'WHOLESALER') {
    return [
      { id: 'INV-101', party: 'Bright Mart Retail', date: 'Jun 26, 2026', amount: 2800.00, status: 'PAID' },
      { id: 'INV-102', party: 'Delta Stores', date: 'Jun 22, 2026', amount: 1400.00, status: 'UNPAID' },
      { id: 'INV-103', party: 'City Mart', date: 'Jun 18, 2026', amount: 3200.00, status: 'OVERDUE' },
    ];
  }
  return [
    { id: 'INV-201', party: 'John Mensah', date: 'Jun 26, 2026', amount: 45.00, status: 'PAID' },
    { id: 'INV-202', party: 'Abena Asante', date: 'Jun 24, 2026', amount: 85.50, status: 'UNPAID' },
    { id: 'INV-203', party: 'Kofi Boateng', date: 'Jun 20, 2026', amount: 120.00, status: 'OVERDUE' },
  ];
};

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: '#D1FAE5', text: '#065F46', label: 'Paid' },
  UNPAID: { bg: '#F3F4F6', text: '#374151', label: 'Unpaid' },
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue' },
};

export default function InvoicesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'PAID', 'UNPAID', 'OVERDUE'];
  const INVOICES = getInvoicesForTier(user?.tierType);

  const filtered = filter === 'ALL' ? INVOICES : INVOICES.filter(i => i.status === filter);
  const total = filtered.reduce((sum, i) => sum + i.amount, 0);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Invoices</Text>
          <Text style={s.sub}>{filtered.length} invoices · ${total.toLocaleString()}</Text>
        </View>
      </View>
      <View style={s.body}>
        <View style={s.chips}>
          {filters.map(f => (
            <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f === 'ALL' ? 'All' : STATUS_MAP[f]?.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const st = STATUS_MAP[item.status];
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                  <Ionicons name="receipt-outline" size={18} color={st.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.party}>{item.party}</Text>
                  <View style={s.row}>
                    <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                    <Text style={s.date}> {item.date}</Text>
                  </View>
                  <Text style={s.invoiceId}>{item.id}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.amount}>${item.amount.toLocaleString()}</Text>
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
});