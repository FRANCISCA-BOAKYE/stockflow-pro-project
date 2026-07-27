import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useCurrency } from '../hooks/useCurrency';
import { ThemeColors } from '../theme/colors';
import { StatusIndicator, urgencyBorder, UrgencyStatus } from './StatusIndicator';
import { SkeletonRow } from './Skeleton';
import { useConfirmSheet } from './ConfirmSheet';
import { showToast } from './toast';

const STATUS_MAP = (colors: ThemeColors): Record<string, { bg: string; text: string; label: string; icon: string }> => ({
  OVERDUE: { bg: colors.dangerSurface, text: colors.dangerText, label: 'Overdue', icon: 'alert-circle-outline' },
  OUTSTANDING: { bg: colors.border, text: colors.textSecondary, label: 'Outstanding', icon: 'ellipse-outline' },
  SETTLED: { bg: colors.successSurface, text: colors.successText, label: 'Settled', icon: 'checkmark-circle-outline' },
});

const URGENCY_MAP: Record<string, UrgencyStatus> = {
  OVERDUE: 'danger',
  OUTSTANDING: 'neutral',
  SETTLED: 'ok',
};

interface CreditScreenProps {
  subtitle: string;
  emptySubtext: string;
}

export function CreditScreen({ subtitle, emptySubtext }: CreditScreenProps) {
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const { country, format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const STATUS = useMemo(() => STATUS_MAP(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();
  const [tab, setTab] = useState<'owe_me' | 'i_owe'>('owe_me');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<any>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    if (!selectedAccount) return;
    const amountNum = parseFloat(paymentAmount);
    if (!paymentAmount.trim()) {
      setFieldErrors(fe => ({ ...fe, amount: 'Enter a payment amount' }));
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setFieldErrors(fe => ({ ...fe, amount: 'Enter a valid amount' }));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post('/credit/payment', {
        creditRecordId: selectedAccount.id,
        amountPaid: parseFloat(paymentAmount),
      });
      showToast('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount('');
      setSelectedAccount(null);
      fetchAccounts();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleHold = async (account: any) => {
    const ok = await confirm({
      title: account.holdPlaced ? 'Remove hold' : 'Place hold',
      message: account.holdPlaced
        ? `Remove the credit hold on ${account.partnerBusinessName}?`
        : `Place a hold on ${account.partnerBusinessName}? This blocks new credit until cleared.`,
      destructive: !account.holdPlaced,
      confirmLabel: account.holdPlaced ? 'Remove hold' : 'Place hold',
      icon: 'lock-closed-outline',
    });
    if (!ok) return;
    try {
      await api.post('/credit/hold', {
        debtorBusinessId: account.partnerBusinessId,
        holdActive: !account.holdPlaced,
      });
      fetchAccounts();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteAccount || !deletePassword.trim()) return;
    setDeleting(true);
    try {
      await api.delete(`/credit/${deleteAccount.id}`, { data: { currentPassword: deletePassword } });
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteAccount(null);
      fetchAccounts();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to delete record');
    } finally {
      setDeleting(false);
    }
  };

  const data = accounts.filter(a => a.direction === (tab === 'owe_me' ? 'OWED_TO_ME' : 'I_OWE'));
  const total = data.filter(a => a.status !== 'SETTLED').reduce((sum, a) => sum + Number(a.amountUsd), 0);

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Credit accounts</Text>
        <Text style={s.sub}>{subtitle}</Text>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Credit accounts</Text>
        <Text style={s.sub}>{subtitle}</Text>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'owe_me' && s.tabActive]} onPress={() => setTab('owe_me')}>
          <Ionicons name="arrow-down-circle-outline" size={15} color={tab === 'owe_me' ? colors.primary : colors.textPlaceholder} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'owe_me' && s.tabTextActive]}>They owe me</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'i_owe' && s.tabActive]} onPress={() => setTab('i_owe')}>
          <Ionicons name="arrow-up-circle-outline" size={15} color={tab === 'i_owe' ? colors.primary : colors.textPlaceholder} style={{ marginRight: 5 }} />
          <Text style={[s.tabText, tab === 'i_owe' && s.tabTextActive]}>I owe them</Text>
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        <View style={s.balanceCard}>
          <View style={s.balRow}>
            <View>
              <Text style={s.balLabel}>Total outstanding</Text>
              <Text style={s.balAmount}>{format(total)}</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAccounts(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="wallet-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No credit accounts</Text>
              <Text style={s.emptySub}>{emptySubtext}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const st = STATUS[item.status] || STATUS.OUTSTANDING;
            const urgency = URGENCY_MAP[item.status] || 'neutral';
            const showActions = tab === 'owe_me' && item.status !== 'SETTLED';
            const isIndividualCustomer = tab === 'owe_me' && !item.partnerBusinessId;
            return (
              <View style={[s.card, urgencyBorder(urgency, colors), urgency === 'danger' && { paddingLeft: 11 }]}>
                <View style={s.cardTop}>
                  <View style={[s.cardIcon, { backgroundColor: st.bg }]}>
                    <Ionicons name={st.icon as any} size={18} color={st.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.nameRow}>
                      <Text style={s.acctName}>{item.partnerBusinessName}</Text>
                      {item.holdPlaced && (
                        <View style={s.heldPill}>
                          <Ionicons name="lock-closed-outline" size={9} color={colors.dangerText} />
                          <Text style={s.heldPillText}>On hold</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.dueRow}>
                      <Ionicons name="calendar-outline" size={11} color={colors.textPlaceholder} />
                      <Text style={s.acctDue}> Due {new Date(item.dueDate).toLocaleDateString()}</Text>
                    </View>
                    {item.debtorContact && (
                      <View style={s.dueRow}>
                        <Ionicons name="call-outline" size={11} color={colors.textPlaceholder} />
                        <Text style={s.acctDue}> {item.debtorContact}</Text>
                      </View>
                    )}
                    {item.debtorAddress && (
                      <View style={s.dueRow}>
                        <Ionicons name="location-outline" size={11} color={colors.textPlaceholder} />
                        <Text style={s.acctDue}> {item.debtorAddress}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={s.acctAmt}>{format(Number(item.amountUsd))}</Text>
                    <StatusIndicator status={urgency} label={st.label} />
                  </View>
                </View>
                {showActions && (
                  <View style={s.actionsRow}>
                    <TouchableOpacity style={s.paymentBtn} onPress={() => { setSelectedAccount(item); setPaymentAmount(String(item.amountUsd)); setFieldErrors({}); setShowPaymentModal(true); }}>
                      <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} style={{ marginRight: 4 }} />
                      <Text style={s.paymentBtnText}>Record payment</Text>
                    </TouchableOpacity>
                    {!isIndividualCustomer && (
                      <TouchableOpacity style={[s.holdBtn, item.holdPlaced && s.holdBtnActive]} onPress={() => handleToggleHold(item)}>
                        <Ionicons name="lock-closed-outline" size={13} color={item.holdPlaced ? '#fff' : colors.danger} style={{ marginRight: 4 }} />
                        <Text style={[s.holdBtnText, item.holdPlaced && s.holdBtnTextActive]}>{item.holdPlaced ? 'Remove hold' : 'Place hold'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {tab === 'owe_me' && !user?.isSubAccount && (
                  <TouchableOpacity style={s.deleteBtn} onPress={() => { setDeleteAccount(item); setDeletePassword(''); setShowDeleteModal(true); }}>
                    <Ionicons name="trash-outline" size={12} color={colors.textPlaceholder} style={{ marginRight: 4 }} />
                    <Text style={s.deleteBtnText}>Delete record</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      </View>

      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPaymentModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Record Payment</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={s.fieldLabel}>Amount paid</Text>
            <View style={[s.fieldInputRow, fieldErrors.amount && { borderColor: colors.danger }]}>
              <Text style={{ paddingLeft: 12, color: colors.textMuted, fontWeight: '600' }}>{country.currencySymbol}</Text>
              <TextInput
                style={s.fieldInputInner}
                placeholder="Enter amount"
                placeholderTextColor={colors.textPlaceholder}
                value={paymentAmount}
                onChangeText={v => { setPaymentAmount(v); setFieldErrors(fe => ({ ...fe, amount: '' })); }}
                keyboardType="decimal-pad"
              />
            </View>
            {!!fieldErrors.amount && <Text style={s.errorText}>{fieldErrors.amount}</Text>}
            <Text style={{ fontSize: 12, color: colors.textPlaceholder, marginTop: 8, marginBottom: 24 }}>
              Full balance: {format(Number(selectedAccount?.amountUsd || 0))}
            </Text>
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleRecordPayment} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Confirm Payment</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={showDeleteModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDeleteModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Delete Credit Record</Text>
            <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 13, color: colors.dangerText, marginBottom: 16, lineHeight: 19 }}>
              This permanently removes the credit record for {deleteAccount?.partnerBusinessName}
              ({format(Number(deleteAccount?.amountUsd || 0))}). This cannot be undone.
            </Text>
            <Text style={s.fieldLabel}>Enter your password to confirm</Text>
            <TextInput
              style={s.fieldInput}
              placeholder="Your account password"
              placeholderTextColor={colors.textPlaceholder}
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[s.deleteConfirmBtn, (deleting || !deletePassword.trim()) && { opacity: 0.5 }]}
              onPress={handleDeleteRecord}
              disabled={deleting || !deletePassword.trim()}
            >
              {deleting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Delete Permanently</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 0.5, borderBottomColor: colors.borderStrong },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textPlaceholder },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  body: { flex: 1, padding: 12 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, marginBottom: 12 },
  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balAmount: { fontSize: 28, fontWeight: '700', color: colors.onPrimary, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  balCount: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  balIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: colors.border, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  acctName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  heldPill: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.dangerSurface, paddingVertical: 1.5, paddingHorizontal: 6, borderRadius: 20 },
  heldPillText: { fontSize: 8.5, color: colors.dangerText, fontWeight: '600' },
  dueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  acctDue: { fontSize: 11, color: colors.textPlaceholder },
  acctAmt: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4, fontVariant: ['tabular-nums'] },
  actionsRow: { flexDirection: 'row', gap: 8, borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 10 },
  paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.successSurface, borderRadius: 8, paddingVertical: 8 },
  paymentBtnText: { fontSize: 11.5, color: colors.success, fontWeight: '600' },
  holdBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.dangerSurface, borderRadius: 8, paddingVertical: 8 },
  holdBtnActive: { backgroundColor: colors.danger },
  holdBtnText: { fontSize: 11.5, color: colors.danger, fontWeight: '600' },
  holdBtnTextActive: { color: '#fff' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  deleteBtnText: { fontSize: 11, color: colors.textPlaceholder, fontWeight: '500' },
  deleteConfirmBtn: { backgroundColor: colors.danger, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center', paddingHorizontal: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  fieldInputInner: { flex: 1, padding: 12, fontSize: 14, color: colors.textPrimary },
  errorText: { fontSize: 11, color: colors.danger, marginTop: 4 },
  confirmBtn: { backgroundColor: colors.success, borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
