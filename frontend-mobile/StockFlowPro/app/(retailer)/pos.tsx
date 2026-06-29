import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: '1', name: 'Coca-Cola 500ml', price: 2.50, stock: 120 },
  { id: '2', name: 'Mineral Water 1L', price: 1.00, stock: 4 },
  { id: '3', name: 'Rice 1kg', price: 3.50, stock: 6 },
  { id: '4', name: 'Bread Loaf', price: 2.00, stock: 8 },
  { id: '5', name: 'Cooking Oil 1L', price: 4.00, stock: 30 },
  { id: '6', name: 'Sugar 1kg', price: 2.50, stock: 2 },
];

const PAYMENT_MODES = [
  { key: 'CASH', label: 'Cash', icon: 'cash-outline' },
  { key: 'MOBILE_MONEY', label: 'Mobile Money', icon: 'phone-portrait-outline' },
  { key: 'CREDIT', label: 'Credit', icon: 'time-outline' },
];

export default function POSScreen() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('CASH');
  const [creditBuyer, setCreditBuyer] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const results = search.length > 1
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  const total = selected ? (selected.price * qty).toFixed(2) : '0.00';

  const confirmSale = () => {
    if (!selected) { Alert.alert('No product', 'Please select a product.'); return; }
    if (payment === 'CREDIT' && !creditBuyer.trim()) { Alert.alert('Missing info', 'Enter the buyer name for credit.'); return; }
    if (payment === 'MOBILE_MONEY' && !mobileNumber.trim()) { Alert.alert('Missing info', 'Enter the mobile money number.'); return; }
    Alert.alert('Sale confirmed', `${selected.name} x${qty} — $${total} via ${payment}`, [
      { text: 'OK', onPress: () => { setSelected(null); setSearch(''); setQty(1); setPayment('CASH'); setCreditBuyer(''); setMobileNumber(''); } }
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>POS</Text>
        <Text style={s.sub}>New sale</Text>
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search products..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={t => { setSearch(t); setSelected(null); setQty(1); }} />
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
                  <Ionicons name="cube-outline" size={16} color="#1A56DB" />
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
            <Text style={s.prodPrice}>${selected.price.toFixed(2)} per unit</Text>
            <View style={s.stepperRow}>
              <Text style={s.stepLabel}>Quantity</Text>
              <View style={s.stepper}>
                <TouchableOpacity style={s.stepBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                  <Ionicons name="remove" size={18} color="#374151" />
                </TouchableOpacity>
                <Text style={s.stepNum}>{qty}</Text>
                <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => setQty(q => Math.min(selected.stock, q + 1))}>
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
            <Text style={s.fieldLabel}>Buyer name</Text>
            <View style={s.fieldInputRow}>
              <TextInput style={s.fieldInput} placeholder="Customer name" placeholderTextColor="#9CA3AF"
                value={creditBuyer} onChangeText={setCreditBuyer} />
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

        {selected && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Order summary</Text>
            <View style={s.summaryRow}>
              <Text style={s.summaryItem}>{selected.name} x{qty}</Text>
              <Text style={s.summaryAmt}>${total}</Text>
            </View>
            <View style={s.divider} />
            <View style={s.summaryRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalAmt}>${total}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={[s.confirmBtn, !selected && { opacity: 0.4 }]} onPress={confirmSale} disabled={!selected}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.confirmText}>Confirm Sale · ${total}</Text>
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 13, color: '#374151' },
  resultsBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  result: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  resultIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  resultName: { flex: 1, fontSize: 13, color: '#0F172A' },
  resultPrice: { fontSize: 13, fontWeight: '600', color: '#1A56DB' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 8 },
  prodName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  prodPrice: { fontSize: 12, color: '#6B7280' },
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
  divider: { height: 0.5, backgroundColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  totalAmt: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  footer: { padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});