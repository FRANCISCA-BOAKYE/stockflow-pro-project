import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const INITIAL_THEY_OWE_ME = [
  { id: '1', name: 'John Mensah', due: 'Jun 30, 2026', amount: 120.00, status: 'DUE_SOON', held: false },
  { id: '2', name: 'Abena Asante', due: 'Jun 15, 2026', amount: 85.50, status: 'OVERDUE', held: false },
  { id: '3', name: 'Kofi Boateng', due: 'Jul 10, 2026', amount: 200.00, status: 'OUTSTANDING', held: false },
  { id: '4', name: 'Ama Owusu', due: 'Jun 1, 2026', amount: 45.00, status: 'SETTLED', held: false },
];

const I_OWE_THEM = [
  { id: '5', name: 'Apex Distributors', due: 'Jul 5, 2026', amount: 1800.00, status: 'OUTSTANDING' },
  { id: '6', name: 'Metro Wholesale', due: 'Jun 25, 2026', amount: 950.00, status: 'DUE_SOON' },
];

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue', icon: 'alert-circle-outline' },
  DUE_SOON: { bg: '#FEF3C7', text: '#92400E', label: 'Due soon', icon: 'time-outline' },
  OUTSTANDING: { bg: '#F3F4F6', text: '#374151', label: 'Outstanding', icon: 'ellipse-outline' },
  SETTLED: { bg: '#D1FAE5', text: '#065F46', label: 'Settled', icon: 'checkmark-circle-outline' },
};

export default function RetailerCreditScreen() {
  const [tab, setTab] = useState<'owe_me' | 'i_owe'>('owe_me');
  const [theyOweMe, setTheyOweMe] = useState(INITIAL_THEY_OWE_ME);
  const data = tab === 'owe_me' ? theyOweMe : I_OWE_THEM;
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  const toggleHold = (id: string) => {
    const acct = theyOweMe.find(a => a.id === id);
    if (!acct) return;
    Alert.alert(
      acct.held ? 'Remove hold' : 'Place hold',
      acct.held ? `Remove the credit hold on ${acct.name}?` : `Place a hold on ${acct.name}? This blocks new credit until the balance is cleared.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: acct.held ? 'Remove hold' : 'Place hold', style: acct.held ? 'default' : 'destructive', onPress: () => setTheyOweMe(prev => prev.map(a => a.id === id ? { ...a, held: !a.held } : a)) }
      ]
    );
  };

  const recordPayment = (id: string) => {
    const acct = theyOweMe.find(a => a.id === id);
    if (!acct) return;
    Alert.alert('Record payment', `Mark ${acct.name}'s balance of $${acct.amount.toLocaleString()} as settled?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => setTheyOweMe(prev => prev.map(a => a.id === id ? { ...a, status: 'SETTLED', held: false } : a)) }
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Credit accounts</Text>
        <Text style={s.sub}>Customer credit accounts</Text>
      </View>
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'owe_me' && s.tabActive]} onPress={() => setTab('owe_me')}>
          <Ionicons name="arrow-down-circle-outline" size={15} color={tab === 'owe_me' ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'owe_me' && s.tabTextActive]}>They owe me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'i_owe' && s.tabActive]} onPress={() => setTab('i_owe')}>
          <Ionicons name="arrow-up-circle-outline" size={15} color={tab === 'i_owe' ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'i_owe' && s.tabTextActive]}>I owe them</Text>
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <View style={s.balanceCard}>
          <View style={s.balRow}>
            <View>
              <Text style={s.balLabel}>Total outstanding</Text>
              <Text style={s.balAmount}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
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
          renderItem={({ item }: { item: any }) => {
            const st = STATUS_MAP[item.status];
            const showActions = tab === 'owe_me' && item.status !== 'SETTLED';
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                    <Ionicons name={st.icon as any} size={18} color={st.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.acctName}>{item.name}</Text>
                      {item.held && (
                        <View style={s.heldPill}>
                          <Ionicons name="lock-closed-outline" size={9} color="#991B1B" />
                          <Text style={s.heldPillText}>On hold</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.dueRow}>
                      <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                      <Text style={s.acctDue}> Due {item.due}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.acctAmt}>${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                    <View style={[s.badge, { backgroundColor: st.bg }]}>
                      <Text style={[s.badgeText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>
                </View>
                {showActions && (
                  <View style={s.actionsRow}>
                    <TouchableOpacity style={s.paymentBtn} onPress={() => recordPayment(item.id)}>
                      <Ionicons name="checkmark-circle-outline" size={13} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={s.paymentBtnText}>Record payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.holdBtn, item.held && s.holdBtnActive]} onPress={() => toggleHold(item.id)}>
                      <Ionicons name="lock-closed-outline" size={13} color={item.held ? '#fff' : '#DC2626'} style={{ marginRight: 4 }} />
                      <Text style={[s.holdBtnText, item.held && s.holdBtnTextActive]}>{item.held ? 'Remove hold' : 'Place hold'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  acctName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  heldPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#FEE2E2', paddingVertical: 1.5, paddingHorizontal: 6, borderRadius: 20 },
  heldPillText: { fontSize: 8.5, color: '#991B1B', fontWeight: '600' },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  acctDue: { fontSize: 11, color: '#9CA3AF' },
  acctAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 8, borderTopWidth: 0.5, borderTopColor: '#F3F4F6', paddingTop: 10 },
  paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5', borderRadius: 8, paddingVertical: 8 },
  paymentBtnText: { fontSize: 11.5, color: '#059669', fontWeight: '600' },
  holdBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, paddingVertical: 8 },
  holdBtnActive: { backgroundColor: '#DC2626' },
  holdBtnText: { fontSize: 11.5, color: '#DC2626', fontWeight: '600' },
  holdBtnTextActive: { color: '#fff' },
});