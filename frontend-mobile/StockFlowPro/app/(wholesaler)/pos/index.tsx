import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert,
  ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../services/api';
import PaystackPayment from '../../../components/PaystackPayment';

const MIN_QTY = 10;

const PAYMENT_MODES = [
  { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { key: 'CARD', label: 'Card', icon: 'card-outline' },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
  { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
]

export default function WholesalerPOSScreen() {
  const { user } = useAuthStore()
  const [stock, setStock] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [qty, setQty] = useState(MIN_QTY)
  const [payment, setPayment] = useState('CASH')
  const [dueDate, setDueDate] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [showPaystack, setShowPaystack] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [stockRes, partnerRes] = await Promise.all([
        api.get('/wholesaler/stock'),
        api.get('/links/partners'),
      ])
      setStock(stockRes.data || [])
      const retailers = (partnerRes.data || []).filter((p: any) =>
        p.partnerBusiness?.tierType === 'RETAILER' || p.requesterBusiness?.tierType === 'RETAILER'
      ).map((p: any) => {
        const retailer = p.partnerBusiness?.tierType === 'RETAILER' ? p.partnerBusiness : p.requesterBusiness
        return { id: retailer.id, name: retailer.name }
      })
      setPartners(retailers)
    } catch (e) {
      console.log('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const results = search.length > 1
    ? stock.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const total = selected ? (Number(selected.price || 0) * qty).toFixed(2) : '0.00'

  const confirmOrder = async () => {
    if (!selected) { Alert.alert('Missing info', 'Please select a product.'); return }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) { Alert.alert('Missing info', 'Please enter the mobile money number.'); return }
    if (payment === 'CREDIT' && !dueDate.trim()) { Alert.alert('Missing info', 'Please enter a due date for credit payment.'); return }
    if (payment === 'CARD') { setShowPaystack(true); return }
    await recordSale(payment)
  }

  const recordSale = async (paymentMode: string) => {
    setSubmitting(true)
    try {
      const body: any = {
        productId: selected.id,
        quantity: qty,
        amountUsd: parseFloat(total),
        paymentMode,
      }
      if (selectedPartner) body.retailerBusinessId = selectedPartner.id
      if (paymentMode === 'CREDIT') body.dueDate = dueDate

      await api.post('/wholesaler/sell', body)
      Alert.alert('Order confirmed ✓', `${selected.name} x${qty} — $${total} via ${paymentMode}`, [
        { text: 'OK', onPress: () => { setSelected(null); setSearch(''); setQty(MIN_QTY); setPayment('CASH'); setDueDate(''); setSelectedPartner(null); fetchData() } }
      ])
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Sale failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaystackSuccess = async (reference: string) => {
    setShowPaystack(false)
    await recordSale('CARD')
  }

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>

  return (
    <SafeAreaView style={s.page}>
      <PaystackPayment
        visible={showPaystack}
        email={user?.email || 'customer@business.com'}
        amount={parseFloat(total)}
        onSuccess={handlePaystackSuccess}
        onClose={() => setShowPaystack(false)}
      />

      <View style={s.header}>
        <Text style={s.title}>Bulk Orders</Text>
        <Text style={s.sub}>Sell to retailers</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Partner selector */}
        <TouchableOpacity style={s.partnerBtn} onPress={() => setShowPartnerModal(true)}>
          <Ionicons name="business-outline" size={16} color="#1A56DB" />
          <Text style={[s.partnerBtnText, selectedPartner && { color: '#0F172A' }]}>
            {selectedPartner ? selectedPartner.name : 'Select linked retailer (optional)'}
          </Text>
          <Ionicons name="chevron-down-outline" size={14} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Stock search */}
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search warehouse stock..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={text => { setSearch(text); setSelected(null); setQty(MIN_QTY) }} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSelected(null) }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 && (
          <View style={s.resultsBox}>
            {results.map(p => (
              <TouchableOpacity key={p.id} style={s.result} onPress={() => { setSelected(p); setSearch(p.name) }}>
                <View style={s.resultIcon}>
                  <Ionicons name="archive-outline" size={16} color="#1A56DB" />
                </View>
                <Text style={s.resultName}>{p.name}</Text>
                <Text style={s.resultStock}>{p.quantity} {p.unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selected && (
          <View style={s.card}>
            <Text style={s.prodName}>{selected.name}</Text>
            <View style={s.reserveRow}>
              <Ionicons name="lock-closed-outline" size={12} color="#1A56DB" />
              <Text style={s.reserveText}> {qty} units reserved · {selected.quantity - qty} available</Text>
            </View>
            <View style={s.stepperRow}>
              <Text style={s.stepLabel}>Quantity (min {MIN_QTY})</Text>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setQty(q => Math.max(MIN_QTY, q - 10))}>
                  <Ionicons name="remove" size={18} color="#374151" />
                </TouchableOpacity>
                <Text style={s.stepNum}>{qty}</Text>
                <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => setQty(q => Math.min(selected.quantity, q + 10))}>
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

        {payment === 'CREDIT' && (
          <View style={s.card}>
            <Text style={s.fieldLabel}>Due date</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor="#9CA3AF"
                value={dueDate} onChangeText={setDueDate} />
            </View>
            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>A credit record will be created for this retailer</Text>
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

        {payment === 'CARD' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
              <Text style={{ fontSize: 12, color: '#059669', fontWeight: '600' }}>Secure card payment via Paystack</Text>
            </View>
          </View>
        )}

        {selected && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Order summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryItem}>{selected.name} x{qty}</Text>
              <Text style={s.summaryAmt}>${total}</Text>
            </View>
            <View style={s.dividerLine} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>${total}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.confirmBtn, (!selected || submitting) && { opacity: 0.4 }]} onPress={confirmOrder} disabled={!selected || submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.confirmText}>Confirm Order · ${total}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Partner modal */}
      <Modal visible={showPartnerModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPartnerModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Retailer</Text>
            <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {partners.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No linked retailers</Text>
              <Text style={s.emptySub}>Retailers must send you a link request first</Text>
            </View>
          ) : (
            <FlatList
              data={partners}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.partnerItem} onPress={() => { setSelectedPartner(item); setShowPartnerModal(false) }}>
                  <View style={s.partnerIcon}>
                    <Ionicons name="storefront-outline" size={18} color="#059669" />
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
  )
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 8 },
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
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
  fieldInputRow: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, overflow: 'hidden' },
  fieldInput: { padding: 10, fontSize: 13, color: '#0F172A' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 12, color: '#6B7280' },
  summaryAmt: { fontSize: 12, fontWeight: '500', color: '#0F172A' },
  dividerLine: { height: 0.5, backgroundColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  footer: { padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  partnerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  partnerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  partnerName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
})