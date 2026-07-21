import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import UnitPicker from '../../../components/UnitPicker';

const LOW_THRESHOLD = 20;

export default function WarehouseScreen() {
  const [stock, setStock] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', minThreshold: '', priceUsd: '' });
  const [lastAdded, setLastAdded] = useState('');

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

  const handleAddProduct = async () => {
    if (!form.name || !form.unit || !form.quantity || !form.priceUsd) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setAddLoading(true);
    try {
      await api.post('/wholesaler/products', {
        name: form.name,
        unit: form.unit,
        quantity: parseInt(form.quantity),
        minThreshold: form.minThreshold ? parseInt(form.minThreshold) : 20,
        priceUsd: parseFloat(form.priceUsd),
      });
      setLastAdded(form.name);
      setForm({ name: '', unit: '', quantity: '', minThreshold: '', priceUsd: '' });
      fetchStock();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = stock.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = stock.filter(i => i.quantity < LOW_THRESHOLD).length;

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1A56DB" />
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Warehouse</Text>
          <Text style={s.sub}>{stock.length} products in stock</Text>
        </View>
        {lowCount > 0 && (
          <View style={s.alertPill}>
            <Ionicons name="warning-outline" size={12} color="#C27803" />
            <Text style={s.alertPillText}>{lowCount} low</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search warehouse stock..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStock(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="archive-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No stock yet</Text>
              <Text style={s.emptySub}>Tap + to add products to your warehouse</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < (item.minThreshold || LOW_THRESHOLD);
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons name={isLow ? 'warning-outline' : 'archive-outline'} size={18} color={isLow ? '#DC2626' : '#1A56DB'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit}</Text>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>
                    {item.quantity} {item.unit} in stock
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {item.priceUsd != null && (
                    <Text style={s.price}>${Number(item.priceUsd).toFixed(2)}</Text>
                  )}
                  <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                    <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                      {isLow ? 'Low stock' : 'In stock'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => { setLastAdded(''); setShowAddModal(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add to Warehouse</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            {lastAdded ? (
              <View style={s.addedBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={s.addedBannerText}>"{lastAdded}" added. Keep adding more, or tap ✕ when done.</Text>
              </View>
            ) : (
              <Text style={s.bulkHint}>Tip: this stays open after each save so you can add several items in a row.</Text>
            )}
            {[
              { label: 'Product name *', key: 'name', placeholder: 'e.g. Coca Cola Crate' },
              { label: 'Quantity *', key: 'quantity', placeholder: '100', keyboard: 'numeric' },
              { label: 'Price per unit (USD) *', key: 'priceUsd', placeholder: '25.00', keyboard: 'decimal-pad' },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '20', keyboard: 'numeric' },
            ].map((field, i) => (
              <View key={field.key}>
                {i === 1 && (
                  <UnitPicker value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))} label="Unit *" />
                )}
                <View style={{ marginBottom: 16 }}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={(form as any)[field.key]}
                    onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                    keyboardType={(field.keyboard as any) || 'default'}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddProduct} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add to Warehouse'}</Text>}
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
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: 'rgba(194,120,3,0.2)' },
  alertPillText: { fontSize: 11, color: '#C27803', fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  unit: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  qty: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  price: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#1A56DB', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bulkHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: '#065F46', flex: 1 },
});