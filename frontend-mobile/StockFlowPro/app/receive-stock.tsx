import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const PAYMENT_MODES = ['CASH', 'CARD', 'MOBILE_MONEY', 'CREDIT'];

export default function ReceiveStockScreen() {
  const router = useRouter();
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ quantity: '', amountUsd: '', paymentMode: 'CASH', manufacturerBusinessId: '' });

  const fetchStock = useCallback(async () => {
    try {
      const res = await api.get('/wholesaler/stock');
      setStock(res.data || []);
    } catch (e) {
      console.log('Error fetching stock:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const handleReceive = async () => {
    if (!selectedProduct || !form.quantity || !form.amountUsd) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/wholesaler/receive', {
        productId: selectedProduct.id,
        quantity: parseInt(form.quantity),
        amountUsd: parseFloat(form.amountUsd),
        paymentMode: form.paymentMode,
        manufacturerBusinessId: form.manufacturerBusinessId ? parseInt(form.manufacturerBusinessId) : null,
      });
      Alert.alert('Success', `${form.quantity} units of ${selectedProduct.name} received!`);
      setShowModal(false);
      setForm({ quantity: '', amountUsd: '', paymentMode: 'CASH', manufacturerBusinessId: '' });
      setSelectedProduct(null);
      fetchStock();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Receive stock failed');
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
          <Text style={s.title}>Receive Stock</Text>
          <Text style={s.sub}>Record incoming stock from manufacturers</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.sectionLabel}>Select product to restock</Text>
        <FlatList
          data={stock}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStock(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="archive-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No products yet</Text>
              <Text style={s.emptySub}>Add products to your warehouse first</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < (item.minThreshold || 20);
            return (
              <TouchableOpacity style={s.card} onPress={() => { setSelectedProduct(item); setShowModal(true); }}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons name="archive-outline" size={18} color={isLow ? '#DC2626' : '#1A56DB'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit}</Text>
                  <Text style={[s.stock, isLow && { color: '#DC2626' }]}>{item.quantity} in stock</Text>
                </View>
                <View style={s.receiveBtn}>
                  <Ionicons name="add" size={14} color="#1A56DB" />
                  <Text style={s.receiveBtnText}>Receive</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Receive — {selectedProduct?.name}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <View>
              <Text style={s.fieldLabel}>Quantity received *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 500" placeholderTextColor="#9CA3AF"
                value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Total cost (USD) *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 2500.00" placeholderTextColor="#9CA3AF"
                value={form.amountUsd} onChangeText={v => setForm(f => ({ ...f, amountUsd: v }))} keyboardType="decimal-pad" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Manufacturer business ID (optional)</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 1" placeholderTextColor="#9CA3AF"
                value={form.manufacturerBusinessId} onChangeText={v => setForm(f => ({ ...f, manufacturerBusinessId: v }))} keyboardType="numeric" />
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Leave blank for walk-in purchases</Text>
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
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleReceive} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Confirm Receive</Text>}
            </TouchableOpacity>
          </ScrollView>
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
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  unit: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  receiveBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EFF6FF', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  receiveBtnText: { fontSize: 11, color: '#1A56DB', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  payRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  payBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  payBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  payBtnText: { fontSize: 12, color: '#374151' },
  payBtnTextActive: { color: '#fff', fontWeight: '500' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});