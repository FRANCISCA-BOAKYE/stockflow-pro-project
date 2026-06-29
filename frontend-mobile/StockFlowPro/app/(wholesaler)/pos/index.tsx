import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STOCK = [
  { id: '1', name: 'Coca-Cola 500ml (Case of 24)', price: 28.00, quantity: 340 },
  { id: '2', name: 'Mineral Water 1L (Case of 12)', price: 8.00, quantity: 42 },
  { id: '3', name: 'Flour 50kg Bag', price: 45.00, quantity: 120 },
  { id: '4', name: 'Cooking Oil 20L Drum', price: 62.00, quantity: 18 },
  { id: '5', name: 'Rice 50kg Bag', price: 55.00, quantity: 35 },
];

const PAYMENT_MODES = [
  { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { key: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
  { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
];

const MIN_QTY = 10;

export default function WholesalerPOSScreen() {
  const [customer, setCustomer] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [qty, setQty] = useState(MIN_QTY);
  const [payment, setPayment] = useState('CASH');
  const [dueDate, setDueDate] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const results = search.length > 1
    ? STOCK.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const total = selected ? (selected.price * qty).toFixed(2) : '0.00';

  const confirmOrder = () => {
    if (!selected || !customer.trim()) {
      Alert.alert('Missing info', 'Please enter a customer name and select a product.');
      return;
    }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) {
      Alert.alert('Missing info', 'Please enter the mobile money number.');
      return;
    }
    if (payment === 'CREDIT' && !dueDate.trim()) {
      Alert.alert('Missing info', 'Please enter a due date for credit payment.');
      return;
    }
    Alert.alert(
      'Order confirmed',
      `${customer} — ${selected.name} x${qty} — $${total} via ${payment}`,
      [{ text: 'OK', onPress: () => { setCustomer(''); setSelected(null); setQty(MIN_QTY); setSearch(''); setPayment('CASH'); setDueDate(''); setMobileNumber(''); } }]
    );
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Bulk Orders</Text>
        <Text style={s.sub}>Sell to retailers</Text>
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View style={s.fieldLabelRow}>
            <Ionicons name="business-outline" size={14} color="#6B7280" />
            <Text style={s.fieldLabel}> Customer (Retailer name)</Text>
          </View>
          <View style={s.fieldInputRow}>
            <TextInput style={s.fieldInput} placeholder="e.g. Bright Mart Retail" placeholderTextColor="#9CA3AF" value={customer} onChangeText={setCustomer} />
          </View>
        </View>

        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search warehouse stock..." placeholderTextColor="#9CA3AF" value={search} onChangeText={text => { setSearch(text); setSelected(null); setQty(MIN_QTY); }} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setSelected(null); }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 && (
          <View style={s.resultsBox}>
            {results.map(p => (
              <TouchableOpacity key={p.id} style={s.result} onPress={() => { setSelected(p); setSearch(p.name); }}>
                <View style={s.resultIcon}>
                  <Ionicons name="archive-outline" size={16} color="#1A56DB" />
                </View>
                <Text style={s.resultName}>{p.name}</Text>
                <Text style={s.resultPrice}>${p.price.toFixed(2)}</Text>
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
    <View style={s.availRow}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#059669" />
              <Text style={s.prodAvail}> Available: {selected.quantity} units</Text>
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

        {payment === 'MOBILE_MONEY' && (
          <View style={s.card}>
            <View style={s.fieldLabelRow}>
              <Ionicons name="phone-portrait-outline" size={14} color="#6B7280" />
              <Text style={s.fieldLabel}> Mobile money number</Text>
            </View>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 0244000000" placeholderTextColor="#9CA3AF" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" />
            </View>
            <Text style={s.fieldHint}>Customer will receive a payment prompt on their phone</Text>
          </View>
        )}

        {payment === 'CREDIT' && (
          <View style={s.card}>
            <View style={s.fieldLabelRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={s.fieldLabel}> Due date</Text>
            </View>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor="#9CA3AF" value={dueDate} onChangeText={setDueDate} />
            </View>
            <Text style={s.fieldHint}>A credit record will be created for this retailer</Text>
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
        <TouchableOpacity style={[s.confirmBtn, !selected && { opacity: 0.4 }]} onPress={confirmOrder} disabled={!selected}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.confirmText}>Confirm Order · ${total}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 8 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#374151' },
  fieldInputRow: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, overflow: 'hidden' },
  fieldInput: { padding: 10, fontSize: 13, color: '#0F172A' },
  fieldHint: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: '#374151' },
  resultsBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  resultIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultName: { flex: 1, fontSize: 13, color: '#0F172A' },
  resultPrice: { fontSize: 13, fontWeight: '600', color: '#1A56DB' },
  prodName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  availRow: { flexDirection: 'row', alignItems: 'center' },
  prodAvail: { fontSize: 11, color: '#059669', fontWeight: '500' },
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { fontSize: 12, color: '#6B7280' },
  summaryAmt: { fontSize: 12, fontWeight: '500', color: '#0F172A' },
  dividerLine: { height: 0.5, backgroundColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  footer: { padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  reserveRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 8, padding: 8 },
reserveText: { fontSize: 10.5, color: '#1A56DB' },
});