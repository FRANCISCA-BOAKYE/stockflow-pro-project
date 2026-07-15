import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  OVERDUE: { bg: '#FEE2E2', text: '#991B1B', label: 'Overdue', icon: 'alert-circle-outline' },
  OUTSTANDING: { bg: '#F3F4F6', text: '#374151', label: 'Outstanding', icon: 'ellipse-outline' },
  SETTLED: { bg: '#D1FAE5', text: '#065F46', label: 'Settled', icon: 'checkmark-circle-outline' },
};

interface CreditScreenProps {
  subtitle: string;
  emptySubtext: string;
}

export function CreditScreen({ subtitle, emptySubtext }: CreditScreenProps) {
  const [tab, setTab] = useState<'owe_me' | 'i_owe'>('owe_me');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await api.get('/credit/accounts');
      setAccounts(res.data || []);
    } catch (e) {
      console.log('Error fetching credit accounts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleRecordPayment = async () => {
    if (!paymentAmount || !selectedAccount) return;
    setSubmitting(true);
    try {
      await api.post('/credit/payment', {
        creditRecordId: selectedAccount.id,
        amountPaid: parseFloat(paymentAmount),
      });
      Alert.alert('Success', 'Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedAccount(null);
      fetchAccounts();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHold = async (account: any) => {
    Alert.alert(
      account.holdPlaced ? 'Remove hold' : 'Place hold',
      account.holdPlaced
        ? `Remove the credit hold on ${account.partnerBusinessName}?`
        : `Place a hold on ${account.partnerBusinessName}? This blocks new credit until cleared.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: account.holdPlaced ? 'Remove hold' : 'Place hold',
          style: account.holdPlaced ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await api.post('/credit/hold', {
                debtorBusinessId: account.partnerBusinessId,
                holdActive: !account.holdPlaced,
              });
              fetchAccounts();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message || 'Action failed');
            }
          }
        }
      ]
    );
  };

  const data = accounts.filter(a => a.direction === (tab === 'owe_me' ? 'OWED_TO_ME' : 'I_OWE'));
  const total = data.filter(a => a.status !== 'SETTLED').reduce((sum, a) => sum + Number(a.amountUsd), 0);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Credit accounts</Text>
        <Text style={s.sub}>{subtitle}</Text>
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
              <Text style={s.balAmount}>${total.toFixed(2)}</Text>
              <Text style={s.balCount}>{data.length} accounts</Text>
            </View>
            <View style={s.balIcon}>
              <Ionicons name="wallet-outline" size={28} color="rgba(255,255,255,0.6)" />
            </View>
          </View>
        </View>

        <FlatList
          data={data}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAccounts(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="wallet-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No credit accounts</Text>
              <Text style={s.emptySub}>{emptySubtext}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS_MAP[item.status] || STATUS_MAP.OUTSTANDING;
            const showActions = tab === 'owe_me' && item.status !== 'SETTLED';
            const isIndividualCustomer = tab === 'owe_me' && !item.partnerBusinessId;
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                    <Ionicons name={st.icon as any} size={18} color={st.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.acctName}>{item.partnerBusinessName}</Text>
                      {item.holdPlaced && (
                        <View style={s.heldPill}>
                          <Ionicons name="lock-closed-outline" size={9} color="#991B1B" />
                          <Text style={s.heldPillText}>On hold</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.dueRow}>
                      <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                      <Text style={s.acctDue}> Due {new Date(item.dueDate).toLocaleDateString()}</Text>
                    </View>
                    {item.debtorContact && (
                      <View style={s.dueRow}>
                        <Ionicons name="call-outline" size={11} color="#9CA3AF" />
                        <Text style={s.acctDue}> {item.debtorContact}</Text>
                      </View>
                    )}
                    {item.debtorAddress && (
                      <View style={s.dueRow}>
                        <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                        <Text style={s.acctDue}> {item.debtorAddress}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.acctAmt}>${Number(item.amountUsd).toFixed(2)}</Text>
                    <View style={[s.badge, { backgroundColor: st.bg }]}>
                      <Text style={[s.badgeText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>
                </View>
                {showActions && (
                  <View style={s.actionsRow}>
                    <TouchableOpacity style={s.paymentBtn} onPress={() => { setSelectedAccount(item); setPaymentAmount(String(item.amountUsd)); setShowPaymentModal(true); }}>
                      <Ionicons name="checkmark-circle-outline" size={13} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={s.paymentBtnText}>Record payment</Text>
                    </TouchableOpacity>
                    {!isIndividualCustomer && (
                      <TouchableOpacity style={[s.holdBtn, item.holdPlaced && s.holdBtnActive]} onPress={() => handleToggleHold(item)}>
                        <Ionicons name="lock-closed-outline" size={13} color={item.holdPlaced ? '#fff' : '#DC2626'} style={{ marginRight: 4 }} />
                        <Text style={[s.holdBtnText, item.holdPlaced && s.holdBtnTextActive]}>{item.holdPlaced ? 'Remove hold' : 'Place hold'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>

      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPaymentModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={s.fieldLabel}>Amount paid (USD)</Text>
            <TextInput
              style={s.fieldInput}
              placeholder="Enter amount"
              placeholderTextColor="#9CA3AF"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
            />
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, marginBottom: 24 }}>
              Full balance: ${Number(selectedAccount?.amountUsd || 0).toFixed(2)}
            </Text>
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleRecordPayment} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Confirm Payment</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
