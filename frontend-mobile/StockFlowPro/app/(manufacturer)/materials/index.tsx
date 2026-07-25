import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import UnitPicker from '../../../components/UnitPicker';
import ImagePickerAvatar from '../../../components/ImagePickerAvatar';

export default function MaterialsScreen() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', minThreshold: '', costPerUnit: '', packageUnit: '', unitsPerPackage: '' });
  const [newMaterialImage, setNewMaterialImage] = useState<string | null>(null);
  const [stockInMode, setStockInMode] = useState<'base' | 'package'>('base');
  const [stockInQty, setStockInQty] = useState('');
  const [stockInPackages, setStockInPackages] = useState('');
  const [lastAdded, setLastAdded] = useState('');

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
      const body: any = {
        name: form.name,
        unit: form.unit,
        quantity: parseFloat(form.quantity),
        minThreshold: form.minThreshold ? parseFloat(form.minThreshold) : 100,
        costPerUnit: form.costPerUnit ? parseFloat(form.costPerUnit) : 0,
      };
      if (form.packageUnit.trim() && form.unitsPerPackage.trim()) {
        body.packageUnit = form.packageUnit.trim();
        body.unitsPerPackage = parseFloat(form.unitsPerPackage);
      }
      if (newMaterialImage) body.imageBase64 = newMaterialImage;
      await api.post('/manufacturer/materials', body);
      setLastAdded(form.name);
      setForm({ name: '', unit: '', quantity: '', minThreshold: '', costPerUnit: '', packageUnit: '', unitsPerPackage: '' });
      setNewMaterialImage(null);
      fetchMaterials();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add material');
    } finally {
      setAddLoading(false);
    }
  };

  const handleStockIn = async () => {
    if (!selectedMaterial) return;
    const body: any = { materialId: selectedMaterial.id };
    if (stockInMode === 'package') {
      if (!stockInPackages) return;
      body.packageCount = parseFloat(stockInPackages);
    } else {
      if (!stockInQty) return;
      body.quantity = parseFloat(stockInQty);
    }
    setAddLoading(true);
    try {
      await api.post('/manufacturer/materials/stock-in', body);
      setShowStockInModal(false);
      setStockInQty('');
      setStockInPackages('');
      setStockInMode('base');
      setSelectedMaterial(null);
      fetchMaterials();
      Alert.alert('Success', 'Stock added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add stock');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateMaterialImage = async (materialId: number, dataUri: string) => {
    await api.put(`/manufacturer/materials/${materialId}/image`, { imageBase64: dataUri });
    fetchMaterials();
  };

  const handleDeleteMaterial = async (id: string | number) => {
    setAddLoading(true);
    try {
      await api.delete(`/manufacturer/materials/${id}`);
      fetchMaterials();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to delete material');
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
                setStockInMode('base'); setStockInQty(''); setStockInPackages('');
                setShowStockInModal(true);
              }}>
                <ImagePickerAvatar
                  imageUri={item.imageBase64}
                  onChange={(uri) => handleUpdateMaterialImage(item.id, uri)}
                  size={44}
                  placeholderIcon={isLow ? 'warning-outline' : 'flask-outline'}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>
                    {Number(item.quantity).toFixed(0)} {item.unit} in stock
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.unit}>Min {item.minThreshold} {item.unit}</Text>
                    <Text style={s.metaDot}>·</Text>
                    <Text style={s.unit}>${Number(item.costPerUnit).toFixed(2)}/{item.unit}</Text>
                  </View>
                  {item.packageUnit && item.unitsPerPackage && (
                    <Text style={s.packageCaption}>1 {item.packageUnit} = {Number(item.unitsPerPackage).toFixed(0)} {item.unit}</Text>
                  )}
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

      <TouchableOpacity style={s.fab} onPress={() => { setLastAdded(''); setShowAddModal(true); }}>
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
            {lastAdded ? (
              <View style={s.addedBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={s.addedBannerText}>"{lastAdded}" added. Keep adding more, or tap ✕ when done.</Text>
              </View>
            ) : (
              <Text style={s.bulkHint}>Tip: this stays open after each save so you can add several materials in a row.</Text>
            )}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <ImagePickerAvatar imageUri={newMaterialImage} onChange={(uri) => setNewMaterialImage(uri)} size={72} placeholderIcon="flask-outline" />
            </View>
            {[
              { label: 'Material name *', key: 'name', placeholder: 'e.g. Cotton Fabric' },
              { label: 'Initial quantity *', key: 'quantity', placeholder: '1000', keyboard: 'decimal-pad' },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '100', keyboard: 'decimal-pad' },
              { label: 'Cost per unit (USD)', key: 'costPerUnit', placeholder: '2.50', keyboard: 'decimal-pad' },
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

            <View style={s.explainerBox}>
              <Text style={s.explainerTitle}>Package definition (optional)</Text>
              <Text style={s.explainerText}>If you buy this in bulk packs — e.g. boxes of pieces, or crates of bottles — define it here. You'll then be able to stock in by package count, and it'll convert correctly to {form.unit || 'the base unit'} for you.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Package unit</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. box" placeholderTextColor="#9CA3AF"
                  value={form.packageUnit} onChangeText={v => setForm(f => ({ ...f, packageUnit: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>{form.unit || 'Units'} per package</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. 12" placeholderTextColor="#9CA3AF"
                  value={form.unitsPerPackage} onChangeText={v => setForm(f => ({ ...f, unitsPerPackage: v }))} keyboardType="decimal-pad" />
              </View>
            </View>
            {form.packageUnit.trim() && form.unitsPerPackage.trim() && (
              <View style={s.previewBox}>
                <Text style={s.previewText}>1 {form.packageUnit} = {form.unitsPerPackage} {form.unit || 'unit'}(s)</Text>
              </View>
            )}

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddMaterial} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add Material'}</Text>}
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
            {selectedMaterial?.packageUnit && selectedMaterial?.unitsPerPackage && (
              <View style={s.payRow}>
                {[{ key: 'base', label: `By ${selectedMaterial.unit}` }, { key: 'package', label: `By ${selectedMaterial.packageUnit}` }].map(mode => (
                  <TouchableOpacity key={mode.key} style={[s.payBtn, stockInMode === mode.key && s.payBtnActive]}
                    onPress={() => setStockInMode(mode.key as any)}>
                    <Text style={[s.payBtnText, stockInMode === mode.key && s.payBtnTextActive]}>{mode.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {stockInMode === 'package' && selectedMaterial?.packageUnit ? (
              <>
                <Text style={s.fieldLabel}>Packages to add ({selectedMaterial.packageUnit})</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. 5"
                  placeholderTextColor="#9CA3AF"
                  value={stockInPackages}
                  onChangeText={setStockInPackages}
                  keyboardType="decimal-pad"
                />
                {stockInPackages.trim() && (
                  <Text style={s.previewText}>
                    = {(parseFloat(stockInPackages) * Number(selectedMaterial.unitsPerPackage)).toFixed(0)} {selectedMaterial.unit} added
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={s.fieldLabel}>Quantity to add ({selectedMaterial?.unit})</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder="e.g. 500"
                  placeholderTextColor="#9CA3AF"
                  value={stockInQty}
                  onChangeText={setStockInQty}
                  keyboardType="decimal-pad"
                />
              </>
            )}
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
  packageCaption: { fontSize: 10.5, color: '#7C3AED', fontWeight: '500', marginTop: 1 },
  explainerBox: { backgroundColor: '#F5F3FF', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 0.5, borderColor: 'rgba(124,58,237,0.15)' },
  explainerTitle: { fontSize: 12.5, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  explainerText: { fontSize: 11.5, color: '#6D28D9', lineHeight: 16 },
  previewBox: { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginBottom: 16, alignItems: 'center' },
  previewText: { fontSize: 12.5, color: '#065F46', fontWeight: '600', marginTop: 6 },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  payBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  payBtnActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  payBtnText: { fontSize: 12.5, color: '#374151', fontWeight: '600' },
  payBtnTextActive: { color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: 'rgba(194,120,3,0.2)' },
  alertPillText: { fontSize: 11, color: '#C27803', fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  unit: { fontSize: 12, color: '#9CA3AF' },
  metaDot: { fontSize: 12, color: '#D1D5DB' },
  qty: { fontSize: 13, color: '#059669', fontWeight: '600' },
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
  bulkHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: '#065F46', flex: 1 },
});