import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEY_OWE_ME = [
  { id: '1', name: 'Apex Distributors', due: 'Jun 30, 2026', amount: 42000.00, status: 'DUE_SOON' },
  { id: '2', name: 'Sunrise Wholesale', due: 'Jun 15, 2026', amount: 68000.00, status: 'OVERDUE' },
  { id: '3', name: 'Delta Trading Co', due: 'Jul 10, 2026', amount: 14800.00, status: 'OUTSTANDING' },
  { id: '4', name: 'Metro Distributors', due: 'May 30, 2026', amount: 22000.00, status: 'SETTLED' },
];

const I_OWE_THEM = [
  { id: '5', name: 'MetalWorks Ltd', due: 'Jul 5, 2026', amount: 31000.00, status: 'OUTSTANDING' },
  { id: '6', name: 'ChemBase Industries', due: 'Jun 25, 2026', amount: 9800.00, status: 'DUE_SOON' },
];

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  OVERDUE:     { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue', icon: 'alert-circle-outline' },
  DUE_SOON:    { bg: '#FEF3C7', text: '#92400E', label: 'Due soon', icon: 'time-outline' },
  OUTSTANDING: { bg: '#F3F4F6', text: '#374151', label: 'Outstanding', icon: 'ellipse-outline' },
  SETTLED:     { bg: '#D1FAE5', text: '#065F46', label: 'Settled', icon: 'checkmark-circle-outline' },
};

export default function ManufacturerCreditScreen() {
  const [tab, setTab] = useState<'owe_me' | 'i_owe'>('owe_me');
  const data = tab === 'owe_me' ? THEY_OWE_ME : I_OWE_THEM;
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Credit accounts</Text>
        <Text style={s.sub}>Wholesaler credit accounts</Text>
      </View>
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'owe_me' && s.tabActive]}
          onPress={() => setTab('owe_me')}
        >
          <Ionicons name="arrow-down-circle-outline" size={15} color={tab === 'owe_me' ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'owe_me' && s.tabTextActive]}>They owe me</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'i_owe' && s.tabActive]}
          onPress={() => setTab('i_owe')}
        >
          <Ionicons name="arrow-up-circle-outline" size={15} color={tab === 'i_owe' ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'i_owe' && s.tabTextActive]}>I owe them</Text>
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <View style={s.balanceCard}>
          <View style={s.balRow}>
            <View>
              <Text style={s.balLabel}>Total outstanding</Text>
              <Text style={s.balAmount}>
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text style={s.balCount}>{data.length} accounts</Text>
            </View>
            <View style={s.balIcon}>
              <Ionicons name="wallet-outline" size={28} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
        </View>
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const st = STATUS_MAP[item.status];
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                  <Ionicons name={st.icon as any} size={18} color={st.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.acctName}>{item.name}</Text>
                  <View style={s.dueRow}>
                    <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                    <Text style={s.acctDue}> Due {item.due}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.acctAmt}>
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
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
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1A56DB' },
  tabText: { fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#1A56DB', fontWeight: '600' },
  body: { flex: 1, padding: 12 },
  balanceCard: { backgroundColor: '#1A56DB', borderRadius: 16, padding: 18, marginBottom: 12 },
  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balAmount: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  balCount: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  balIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  acctName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  acctDue: { fontSize: 11, color: '#9CA3AF' },
  acctAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '500' },
});