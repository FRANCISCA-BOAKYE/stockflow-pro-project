import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function MaterialsScreen() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', minThreshold: '', costPerUnit: '' });
  const [stockInQty, setStockInQty] = useState('');

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/materials');
      setMaterials(res.data || []);
    } catch (e) {
      console.log('Error fetching materials:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const handleAddMaterial = async () => {
    if (!form.name || !form.unit || !form.quantity) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setAddLoading(true);
    try {
      await api.post('/manufacturer/materials', {
        name: form.name,
        unit: form.unit,
        quantity: parseFloat(form.quantity),
        minThreshold: form.minThreshold ? parseFloat(form.minThreshold) : 100,
        costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : 0,
      });
      setShowAddModal(false);
      setForm({ name: '', unit: '', quantity: '', minThreshold: '', costPerUnit: '' });
      fetchMaterials();
      Alert.alert('Success', 'Material added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add material');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStockIn = async () => {
    if (!stockInQty || !selectedMaterial) return;
    setAddLoading(true);
    try {
      await api.post('/manufacturer/materials/stock-in', {
        materialId: selectedMaterial.id,
        quantity: parseFloat(stockInQty),
      });
      setShowStockInModal(false);
      setStockInQty('');
      setSelectedMaterial(null);
      fetchMaterials();
      Alert.alert('Success', 'Stock added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add stock');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string | number) => {
    setAddLoading(true);
    try {
      await api.delete(`/manufacturer/materials/${id}`);
      fetchMaterials();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete material');
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = materials.filter(m => m.quantity < m.minThreshold).length;

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1A56DB" />
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Raw Materials</Text>
          <Text style={s.sub}>{materials.length} materials tracked</Text>
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
          <TextInput style={s.searchInput} placeholder="Search materials..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMaterials(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="flask-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No materials yet</Text>
              <Text style={s.emptySub}>Tap + to add your first material</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < item.minThreshold;
            return (
              <TouchableOpacity style={s.card} onLongPress={() => {
                setSelectedMaterial(item);
                setShowStockInModal(true);
              }}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#ECFDF5' }]}>
                  <Ionicons name={isLow ? 'warning-outline' : 'flask-outline'} size={18} color={isLow ? '#DC2626' : '#059669'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit} · ${Number(item.costPerUnit).toFixed(2)}/unit</Text>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>
                    {Number(item.quantity).toFixed(0)} {item.unit} · Min: {item.minThreshold}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                    <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                      {isLow ? 'Low' : 'OK'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={s.stockInBtn} onPress={() => {
                      setSelectedMaterial(item);
                      setShowStockInModal(true);
                    }}>
                      <Ionicons name="add" size={14} color="#1A56DB" />
                      <Text style={s.stockInText}>Stock in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => {
                      setSelectedMaterial(item);
                      Alert.alert('Delete material', `Remove "${item.name}"? This cannot be undone.`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMaterial(item.id) },
                      ]);
                    }}>
                      <Ionicons name="trash-outline" size={14} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Material Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Material</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            {[
              { label: 'Material name *', key: 'name', placeholder: 'e.g. Cotton Fabric' },
              { label: 'Unit *', key: 'unit', placeholder: 'e.g. metres, kg, litres' },
              { label: 'Initial quantity *', key: 'quantity', placeholder: '1000', keyboard: 'decimal-pad' },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '100', keyboard: 'decimal-pad' },
              { label: 'Cost per unit (USD)', key: 'costPerUnit', placeholder: '2.50', keyboard: 'decimal-pad' },
            ].map(field => (
              <View key={field.key} style={{ marginBottom: 16 }}>
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
            ))}
            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddMaterial} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>Add Material</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Stock In Modal */}
      <Modal visible={showStockInModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowStockInModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Stock In — {selectedMaterial?.name}</Text>
            <TouchableOpacity onPress={() => setShowStockInModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={s.modalBody}>
            <Text style={s.fieldLabel}>Quantity to add ({selectedMaterial?.unit})</Text>
            <TextInput
              style={s.fieldInput}
              placeholder="e.g. 500"
              placeholderTextColor="#9CA3AF"
              value={stockInQty}
              onChangeText={setStockInQty}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={[s.confirmBtn, { marginTop: 16 }, addLoading && { opacity: 0.7 }]} onPress={handleStockIn} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>Add Stock</Text>}
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
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  stockInBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#EFF6FF', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  stockInText: { fontSize: 10, color: '#1A56DB', fontWeight: '600' },
  deleteBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
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
});