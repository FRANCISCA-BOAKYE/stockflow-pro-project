import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../services/api';
import PaystackPayment from '../../../components/PaystackPayment';
import { USD_TO_GHS } from '../../../constants/subscriptionPlans';

const MIN_QTY = 5;

const PAYMENT_MODES = [
  { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { key: 'CARD', label: 'Card', icon: 'card-outline' },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
  { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
];

export default function ManufacturerPOSScreen() {
  const { user } = useAuthStore();
  const [goods, setGoods] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [qty, setQty] = useState(MIN_QTY);
  const [unitPrice, setUnitPrice] = useState('');
  const [payment, setPayment] = useState('CASH');
  const [dueDate, setDueDate] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPaystack, setShowPaystack] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [goodsRes, partnersRes] = await Promise.all([
        api.get('/manufacturer/finished-goods'),
        api.get('/links/partners'),
      ]);
      setGoods(goodsRes.data || []);
      const wholesalers = (partnersRes.data || []).filter((p: any) =>
        p.partnerBusiness?.tierType === 'WHOLESALER' || p.requesterBusiness?.tierType === 'WHOLESALER'
      ).map((p: any) => {
        const w = p.partnerBusiness?.tierType === 'WHOLESALER' ? p.partnerBusiness : p.requesterBusiness;
        return { id: w.id, name: w.name };
      });
      setPartners(wholesalers);
    } catch (e) {
      console.log('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const results = search.length > 1
    ? goods.filter(g => (g.recipe?.productName || `Product ${g.id}`).toLowerCase().includes(search.toLowerCase()))
    : [];

  const total = selected && unitPrice ? (parseFloat(unitPrice) * qty).toFixed(2) : '0.00';

  const confirmDispatch = async () => {
    if (!selected) { Alert.alert('Missing info', 'Please select a finished good.'); return; }
    if (!unitPrice) { Alert.alert('Missing info', 'Please enter a unit price.'); return; }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) { Alert.alert('Missing info', 'Enter the mobile money number.'); return; }
    if (payment === 'CREDIT' && !dueDate.trim()) { Alert.alert('Missing info', 'Enter a due date for credit.'); return; }
    if (payment === 'CARD') { setShowPaystack(true); return; }
    await recordDispatch(payment);
  };

  const recordDispatch = async (paymentMode: string) => {
    setSubmitting(true);
    try {
      const body: any = {
        finishedGoodId: selected.id,
        quantity: qty,
        amountUsd: parseFloat(total),
        paymentMode,
      };
      if (selectedPartner) body.wholesalerBusinessId = selectedPartner.id;
      if (paymentMode === 'CREDIT') body.dueDate = dueDate;

      await api.post('/manufacturer/dispatch', body);
      Alert.alert('Dispatch confirmed ✓', `${selected.recipe?.productName || `Product #${selected.id}`} x${qty} — $${total}`, [
        { text: 'OK', onPress: () => { setSelected(null); setSearch(''); setQty(MIN_QTY); setPayment('CASH'); setDueDate(''); setUnitPrice(''); setSelectedPartner(null); fetchData(); } }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Dispatch failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaystackSuccess = async (reference: string) => {
    setShowPaystack(false);
    await recordDispatch('CARD');
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <PaystackPayment
        visible={showPaystack}
        email={user?.email || 'customer@business.com'}
        amount={parseFloat(total) * USD_TO_GHS}
        onSuccess={handlePaystackSuccess}
        onClose={() => setShowPaystack(false)}
      />

      <View style={s.header}>
        <Text style={s.title}>POS Dispatch</Text>
        <Text style={s.sub}>Sell finished goods</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={s.partnerBtn} onPress={() => setShowPartnerModal(true)}>
          <Ionicons name="business-outline" size={16} color="#1A56DB" />
          <Text style={[s.partnerBtnText, selectedPartner && { color: '#0F172A' }]}>
            {selectedPartner ? selectedPartner.name : 'Select linked wholesaler (optional)'}
          </Text>
          <Ionicons name="chevron-down-outline" size={14} color="#9CA3AF" />
        </TouchableOpacity>

        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search finished goods..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={text => { setSearch(text); setSelected(null); setQty(MIN_QTY); }} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSelected(null); }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 && (
          <View style={s.resultsBox}>
            {results.map(g => (
              <TouchableOpacity key={g.id} style={s.result} onPress={() => { setSelected(g); setSearch(g.recipe?.productName || `Product #${g.id}`); }}>
                <View style={s.resultIcon}>
                  <Ionicons name="cube-outline" size={16} color="#1A56DB" />
                </View>
                <Text style={s.resultName}>{g.recipe?.productName || `Product #${g.id}`}</Text>
                <Text style={s.resultStock}>{g.quantityInStock} units</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {goods.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="cube-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>No finished goods</Text>
            <Text style={s.emptySub}>Run a production batch first to create finished goods</Text>
          </View>
        )}

        {selected && (
          <View style={s.card}>
            <Text style={s.prodName}>{selected.recipe?.productName || `Product #${selected.id}`}</Text>
            <View style={s.reserveRow}>
              <Ionicons name="lock-closed-outline" size={12} color="#1A56DB" />
              <Text style={s.reserveText}> {qty} units reserved · {selected.quantityInStock - qty} available</Text>
            </View>
            <View>
              <Text style={s.fieldLabel}>Unit price (USD) *</Text>
              <View style={s.fieldInputRow}>
                <TextInput style={s.fieldInput} placeholder="e.g. 120.00" placeholderTextColor="#9CA3AF"
                  value={unitPrice} onChangeText={setUnitPrice} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={s.stepperRow}>
              <Text style={s.stepLabel}>Quantity (min {MIN_QTY})</Text>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setQty(q => Math.max(MIN_QTY, q - 5))}>
                  <Ionicons name="remove" size={18} color="#374151" />
                </TouchableOpacity>
                <Text style={s.stepNum}>{qty}</Text>
                <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => setQty(q => Math.min(selected.quantityInStock, q + 5))}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View>
          <Text style={s.sectionLabel}>Payment mode</Text>
          <View style={s.paymentRow}>
            {PAYMENT_MODES.map(mode => (
              <TouchableOpacity key={mode.key} style={[s.payBtn, payment === mode.key && s.payBtnActive]} onPress={() => setPayment(mode.key)}>
                <Ionicons name={mode.icon as any} size={13} color={payment === mode.key ? '#fff' : '#374151'} style={{ marginRight: 4 }} />
                <Text style={[s.payBtnText, payment === mode.key && s.payBtnTextActive]}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {payment === 'CARD' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
              <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600' }}>Secure card payment via Paystack</Text>
            </View>
          </View>
        )}

        {payment === 'MOBILE_MONEY' && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Mobile money number</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 0244000000" placeholderTextColor="#9CA3AF"
                value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
            </View>
          </View>
        )}

        {payment === 'CREDIT' && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Due date *</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor="#9CA3AF"
                value={dueDate} onChangeText={setDueDate} />
            </View>
          </View>
        )}

        {selected && unitPrice ? (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Order summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryItem}>{selected.recipe?.productName || `Product #${selected.id}`} x{qty}</Text>
              <Text style={s.summaryAmt}>${total}</Text>
            </View>
            <View style={s.dividerLine} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>${total}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.confirmBtn, (!selected || !unitPrice || submitting) && { opacity: 0.4 }]} onPress={confirmDispatch} disabled={!selected || !unitPrice || submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.confirmText}>Confirm Dispatch · ${total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Partner Modal */}
      <Modal visible={showPartnerModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPartnerModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Wholesaler</Text>
            <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {partners.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No linked wholesalers</Text>
              <Text style={s.emptySub}>Wholesalers must send you a link request first</Text>
            </View>
          ) : (
            <FlatList
              data={partners}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.partnerItem} onPress={() => { setSelectedPartner(item); setShowPartnerModal(false); }}>
                  <View style={s.partnerIcon}>
                    <Ionicons name="business-outline" size={18} color="#1A56DB" />
                  </View>
                  <Text style={s.partnerName}>{item.name}</Text>
                  <Ionicons name="checkmark-circle" size={18} color={selectedPartner?.id === item.id ? '#059669' : '#E5E7EB'} />
                </TouchableOpacity>
              )}
            />
          )}
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
  body: { flex: 1, padding: 12 },
  partnerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  partnerBtnText: { flex: 1, fontSize: 13, color: '#9CA3AF' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: '#374151' },
  resultsBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  resultIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultName: { flex: 1, fontSize: 13, color: '#0F172A' },
  resultStock: { fontSize: 12, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  reserveRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8 },
  reserveText: { fontSize: 10.5, color: '#1A56DB' },
  prodName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)', alignItems: 'center', justifyContent: 'center' },
  stepBtnBlue: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  stepNum: { fontSize: 17, fontWeight: '700', color: '#0F172A', minWidth: 28, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  paymentRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  payBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  payBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  payBtnText: { fontSize: 12, color: '#374151' },
  payBtnTextActive: { color: '#fff', fontWeight: '500' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#374151', marginBottom: 4 },
  fieldInputRow: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, overflow: 'hidden' },
  fieldInput: { padding: 10, fontSize: 13, color: '#0F172A' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 12, color: '#6B7280' },
  summaryAmt: { fontSize: 12, fontWeight: '500', color: '#0F172A' },
  dividerLine: { height: 0.5, backgroundColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  footer: { padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  partnerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  partnerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  partnerName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});