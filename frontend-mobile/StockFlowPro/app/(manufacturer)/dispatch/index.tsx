import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

const PAYMENT_MODES = ['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CREDIT'];

export default function DispatchScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPremium = user?.subscriptionPlan === 'PREMIUM';
  const [goods, setGoods] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedGood, setSelectedGood] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    quantity: '', amountUsd: '', paymentMode: 'CASH', dueDate: '',
    deliveryMode: 'DELIVERY', deliveryFeeUsd: '',
    driverName: '', vehicleNumber: '', driverContact: '', driverIdNumber: '',
    wantsInvoice: true,
  });

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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDispatch = async () => {
    if (!selectedGood || !form.quantity || !form.amountUsd) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    if (!selectedPartner) {
      Alert.alert('Missing info', 'Please select which wholesaler this is going to.');
      return;
    }
    if (form.paymentMode === 'CREDIT' && !form.dueDate) {
      Alert.alert('Missing info', 'Please enter a due date for credit.');
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        finishedGoodId: selectedGood.id,
        wholesalerBusinessId: selectedPartner.id,
        quantity: parseInt(form.quantity),
        amountUsd: parseFloat(form.amountUsd),
        paymentMode: form.paymentMode,
        deliveryMode: form.deliveryMode,
      };
      if (form.paymentMode === 'CREDIT') body.dueDate = form.dueDate;
      if (isPremium) body.wantsInvoice = form.wantsInvoice;
      if (form.deliveryMode === 'DELIVERY') {
        if (form.deliveryFeeUsd) body.deliveryFeeUsd = parseFloat(form.deliveryFeeUsd);
        if (form.driverName) body.driverName = form.driverName;
        if (form.vehicleNumber) body.vehicleNumber = form.vehicleNumber;
        if (form.driverContact) body.driverContact = form.driverContact;
        if (form.driverIdNumber) body.driverIdNumber = form.driverIdNumber;
      }

      await api.post('/manufacturer/dispatch', body);
      Alert.alert('Success', `${form.quantity} units dispatched successfully!`);
      setShowModal(false);
      setForm({
        quantity: '', amountUsd: '', paymentMode: 'CASH', dueDate: '',
        deliveryMode: 'DELIVERY', deliveryFeeUsd: '',
        driverName: '', vehicleNumber: '', driverContact: '', driverIdNumber: '',
        wantsInvoice: true,
      });
      setSelectedGood(null);
      setSelectedPartner(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Dispatch</Text>
          <Text style={s.sub}>Send finished goods to wholesalers</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.sectionLabel}>Select finished goods to dispatch</Text>
        <FlatList
          data={goods}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No finished goods</Text>
              <Text style={s.emptySub}>Run a production batch to create finished goods</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => { setSelectedGood(item); setShowModal(true); }}>
              <View style={s.cardIcon}>
                <Ionicons name="cube-outline" size={18} color="#1A56DB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.recipe?.productName || `Product #${item.id}`}</Text>
                <Text style={s.stock}>{item.quantityInStock} units available</Text>
              </View>
              <View style={s.dispatchBtn}>
                <Ionicons name="send-outline" size={13} color="#1A56DB" />
                <Text style={s.dispatchBtnText}>Dispatch</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Dispatch Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Dispatch — {selectedGood?.recipe?.productName || `Product #${selectedGood?.id}`}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <TouchableOpacity style={s.partnerBtn} onPress={() => setShowPartnerModal(true)}>
              <Ionicons name="business-outline" size={16} color="#1A56DB" />
              <Text style={[s.partnerBtnText, selectedPartner && { color: '#0F172A' }]}>
                {selectedPartner ? selectedPartner.name : 'Select linked wholesaler *'}
              </Text>
              <Ionicons name="chevron-down-outline" size={14} color="#9CA3AF" />
            </TouchableOpacity>
            <View>
              <Text style={s.fieldLabel}>Quantity to dispatch *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 100" placeholderTextColor="#9CA3AF"
                value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Total amount (USD) *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 5000.00" placeholderTextColor="#9CA3AF"
                value={form.amountUsd} onChangeText={v => setForm(f => ({ ...f, amountUsd: v }))} keyboardType="decimal-pad" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Payment mode</Text>
              <View style={s.payRow}>
                {PAYMENT_MODES.map(mode => (
                  <TouchableOpacity key={mode} style={[s.payBtn, form.paymentMode === mode && s.payBtnActive]}
                    onPress={() => setForm(f => ({ ...f, paymentMode: mode }))}>
                    <Text style={[s.payBtnText, form.paymentMode === mode && s.payBtnTextActive]}>{mode.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {form.paymentMode === 'CREDIT' && (
              <View>
                <Text style={s.fieldLabel}>Due date *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor="#9CA3AF"
                  value={form.dueDate} onChangeText={v => setForm(f => ({ ...f, dueDate: v }))} />
              </View>
            )}

            <View>
              <Text style={s.fieldLabel}>How is this getting there?</Text>
              <View style={s.payRow}>
                {[{ key: 'DELIVERY', label: 'We deliver it' }, { key: 'PICKUP', label: 'They pick it up' }].map(mode => (
                  <TouchableOpacity key={mode.key} style={[s.payBtn, form.deliveryMode === mode.key && s.payBtnActive]}
                    onPress={() => setForm(f => ({ ...f, deliveryMode: mode.key }))}>
                    <Text style={[s.payBtnText, form.deliveryMode === mode.key && s.payBtnTextActive]}>{mode.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {form.deliveryMode === 'DELIVERY' && (
              <>
                <View>
                  <Text style={s.fieldLabel}>Delivery fee (USD) — optional</Text>
                  <TextInput style={s.fieldInput} placeholder="e.g. 50.00 (added to total)" placeholderTextColor="#9CA3AF"
                    value={form.deliveryFeeUsd} onChangeText={v => setForm(f => ({ ...f, deliveryFeeUsd: v }))} keyboardType="decimal-pad" />
                </View>
                <View>
                  <Text style={s.fieldLabel}>Driver name</Text>
                  <TextInput style={s.fieldInput} placeholder="Who's driving" placeholderTextColor="#9CA3AF"
                    value={form.driverName} onChangeText={v => setForm(f => ({ ...f, driverName: v }))} />
                </View>
                <View>
                  <Text style={s.fieldLabel}>Vehicle number</Text>
                  <TextInput style={s.fieldInput} placeholder="e.g. GT 1234-20" placeholderTextColor="#9CA3AF"
                    value={form.vehicleNumber} onChangeText={v => setForm(f => ({ ...f, vehicleNumber: v }))} />
                </View>
                <View>
                  <Text style={s.fieldLabel}>Driver contact</Text>
                  <TextInput style={s.fieldInput} placeholder="Phone number" placeholderTextColor="#9CA3AF"
                    value={form.driverContact} onChangeText={v => setForm(f => ({ ...f, driverContact: v }))} keyboardType="phone-pad" />
                </View>
                <View>
                  <Text style={s.fieldLabel}>Driver ID number</Text>
                  <TextInput style={s.fieldInput} placeholder="e.g. Ghana Card number, for the receiver's records" placeholderTextColor="#9CA3AF"
                    value={form.driverIdNumber} onChangeText={v => setForm(f => ({ ...f, driverIdNumber: v }))} />
                </View>
              </>
            )}

            {isPremium && (
              <TouchableOpacity style={s.invoiceToggleRow} onPress={() => setForm(f => ({ ...f, wantsInvoice: !f.wantsInvoice }))}>
                <Ionicons name={form.wantsInvoice ? 'checkbox' : 'square-outline'} size={20} color={form.wantsInvoice ? '#1A56DB' : '#9CA3AF'} />
                <Text style={s.invoiceToggleText}>Buyer wants an invoice</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleDispatch} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Confirm Dispatch</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

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
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  dispatchBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EFF6FF', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  dispatchBtnText: { fontSize: 11, color: '#1A56DB', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  partnerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  partnerBtnText: { flex: 1, fontSize: 13, color: '#9CA3AF' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  payRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  payBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  payBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  payBtnText: { fontSize: 12, color: '#374151' },
  payBtnTextActive: { color: '#fff', fontWeight: '500' },
  invoiceToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  invoiceToggleText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  partnerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  partnerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  partnerName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
});