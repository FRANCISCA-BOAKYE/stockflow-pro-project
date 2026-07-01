import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RECENT_STOCK_IN = [
  { id: '1', product: 'Coca-Cola 500ml', supplier: 'Apex Distributors', qty: 200, date: 'Jun 26, 2026', cost: 400 },
  { id: '2', product: 'Rice 1kg', supplier: 'Metro Wholesale', qty: 100, date: 'Jun 24, 2026', cost: 280 },
  { id: '3', product: 'Mineral Water 1L', supplier: 'Apex Distributors', qty: 150, date: 'Jun 22, 2026', cost: 120 },
  { id: '4', product: 'Sugar 1kg', supplier: 'Metro Wholesale', qty: 80, date: 'Jun 20, 2026', cost: 160 },
];

export default function StockInScreen() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState('');
  const [supplier, setSupplier] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  const handleSubmit = () => {
    if (!product || !supplier || !qty) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    Alert.alert('Stock In Recorded', `${qty} units of ${product} from ${supplier} recorded successfully.`, [
      { text: 'OK', onPress: () => { setShowForm(false); setProduct(''); setSupplier(''); setQty(''); setCost(''); } }
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Stock In</Text>
          <Text style={s.sub}>Record incoming stock</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#1A56DB" />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={s.form}>
          <Text style={s.formTitle}>New Stock In</Text>
          <View style={s.field}>
            <Text style={s.label}>Product name</Text>
            <TextInput style={s.input} placeholder="e.g. Coca-Cola 500ml" placeholderTextColor="#9CA3AF" value={product} onChangeText={setProduct} />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Supplier</Text>
            <TextInput style={s.input} placeholder="e.g. Apex Distributors" placeholderTextColor="#9CA3AF" value={supplier} onChangeText={setSupplier} />
          </View>
          <View style={s.row}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Quantity</Text>
              <TextInput style={s.input} placeholder="0" placeholderTextColor="#9CA3AF" value={qty} onChangeText={setQty} keyboardType="numeric" />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Total cost ($)</Text>
              <TextInput style={s.input} placeholder="0.00" placeholderTextColor="#9CA3AF" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
            </View>
          </View>
          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={s.submitBtnText}>Record Stock In</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.body}>
        <Text style={s.sectionLabel}>Recent stock in</Text>
        <FlatList
          data={RECENT_STOCK_IN}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="arrow-down-circle-outline" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.productName}>{item.product}</Text>
                <Text style={s.supplierText}>{item.supplier}</Text>
                <View style={s.dateRow}>
                  <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                  <Text style={s.dateText}> {item.date}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.qty}>{item.qty} units</Text>
                <Text style={s.cost}>${item.cost.toLocaleString()}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  form: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', gap: 12 },
  formTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '500', color: '#374151' },
  input: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, padding: 10, fontSize: 13, color: '#0F172A' },
  row: { flexDirection: 'row', gap: 12 },
  submitBtn: { backgroundColor: '#059669', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  supplierText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dateText: { fontSize: 11, color: '#9CA3AF' },
  qty: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  cost: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});