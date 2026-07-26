import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import UnitPicker from '../../../components/UnitPicker';
import ImagePickerAvatar from '../../../components/ImagePickerAvatar';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';

export default function MaterialsScreen() {
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
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
      <ActivityIndicator size="large" color={colors.primary} />
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
            <Ionicons name="warning-outline" size={12} color={colors.warning} />
            <Text style={s.alertPillText}>{lowCount} low</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search materials..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMaterials(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="flask-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No materials yet</Text>
              <Text style={s.emptySub}>Tap + to add your first material</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < item.minThreshold;
            return (
              <TouchableOpacity style={s.card} onPress={() => {
                setSelectedMaterial(item);
                setShowActionsModal(true);
              }}>
                <ImagePickerAvatar
                  imageUri={item.imageBase64}
                  onChange={(uri) => handleUpdateMaterialImage(item.id, uri)}
                  size={44}
                  placeholderIcon={isLow ? 'warning-outline' : 'flask-outline'}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={[s.qty, isLow && { color: colors.danger }]}>
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
                  <Ionicons name="chevron-forward" size={16} color={colors.borderStrong} />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => { setLastAdded(''); setShowAddModal(true); }}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Actions Sheet */}
      <Modal visible={showActionsModal} animationType="slide" transparent onRequestClose={() => setShowActionsModal(false)}>
        <TouchableOpacity style={s.sheetBackdrop} activeOpacity={1} onPress={() => setShowActionsModal(false)}>
          <TouchableOpacity activeOpacity={1} style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>{selectedMaterial?.name}</Text>
            <Text style={s.sheetSub}>
              {selectedMaterial ? `${Number(selectedMaterial.quantity).toFixed(0)} ${selectedMaterial.unit} in stock` : ''}
            </Text>

            <TouchableOpacity style={s.sheetAction} onPress={() => {
              setShowActionsModal(false);
              setStockInMode('base'); setStockInQty(''); setStockInPackages('');
              setShowStockInModal(true);
            }}>
              <View style={[s.sheetActionIcon, { backgroundColor: colors.primarySurface }]}>
                <Ionicons name="add" size={18} color={colors.primary} />
              </View>
              <Text style={s.sheetActionText}>Stock In</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.borderStrong} />
            </TouchableOpacity>

            <TouchableOpacity style={s.sheetAction} onPress={() => {
              const material = selectedMaterial;
              setShowActionsModal(false);
              Alert.alert('Delete material', `Remove "${material?.name}"? This cannot be undone.`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDeleteMaterial(material.id) },
              ]);
            }}>
              <View style={[s.sheetActionIcon, { backgroundColor: colors.dangerSurface }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <Text style={[s.sheetActionText, { color: colors.danger }]}>Delete Material</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.borderStrong} />
            </TouchableOpacity>

            <TouchableOpacity style={s.sheetCancel} onPress={() => setShowActionsModal(false)}>
              <Text style={s.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add Material Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Material</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            {lastAdded ? (
              <View style={s.addedBanner}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
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
                    placeholderTextColor={colors.textPlaceholder}
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
                <TextInput style={s.fieldInput} placeholder="e.g. box" placeholderTextColor={colors.textPlaceholder}
                  value={form.packageUnit} onChangeText={v => setForm(f => ({ ...f, packageUnit: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>{form.unit || 'Units'} per package</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. 12" placeholderTextColor={colors.textPlaceholder}
                  value={form.unitsPerPackage} onChangeText={v => setForm(f => ({ ...f, unitsPerPackage: v }))} keyboardType="decimal-pad" />
              </View>
            </View>
            {form.packageUnit.trim() && form.unitsPerPackage.trim() && (
              <View style={s.previewBox}>
                <Text style={s.previewText}>1 {form.packageUnit} = {form.unitsPerPackage} {form.unit || 'unit'}(s)</Text>
              </View>
            )}

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddMaterial} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add Material'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Stock In Modal */}
      <Modal visible={showStockInModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowStockInModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Stock In — {selectedMaterial?.name}</Text>
            <TouchableOpacity onPress={() => setShowStockInModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
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
                  placeholderTextColor={colors.textPlaceholder}
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
                  placeholderTextColor={colors.textPlaceholder}
                  value={stockInQty}
                  onChangeText={setStockInQty}
                  keyboardType="decimal-pad"
                />
              </>
            )}
            <TouchableOpacity style={[s.confirmBtn, { marginTop: 16 }, addLoading && { opacity: 0.7 }]} onPress={handleStockIn} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmText}>Add Stock</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  packageCaption: { fontSize: 10.5, color: colors.purpleDark, fontWeight: '500', marginTop: 1 },
  explainerBox: { backgroundColor: colors.purpleSurface, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 0.5, borderColor: colors.purple + '26' },
  explainerTitle: { fontSize: 12.5, fontWeight: '700', color: colors.purpleDark, marginBottom: 4 },
  explainerText: { fontSize: 11.5, color: colors.purple, lineHeight: 16 },
  previewBox: { backgroundColor: colors.successSurface, borderRadius: 10, padding: 10, marginBottom: 16, alignItems: 'center' },
  previewText: { fontSize: 12.5, color: colors.successText, fontWeight: '600', marginTop: 6 },
  payRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  payBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', borderWidth: 0.5, borderColor: colors.border },
  payBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  payBtnText: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '600' },
  payBtnTextActive: { color: colors.onPrimary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warningSurface, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: colors.warning + '33' },
  alertPillText: { fontSize: 11, color: colors.warning, fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  unit: { fontSize: 12, color: colors.textPlaceholder },
  metaDot: { fontSize: 12, color: colors.borderStrong },
  qty: { fontSize: 13, color: colors.success, fontWeight: '600' },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: colors.successSurface },
  badgeRed: { backgroundColor: colors.dangerSurface },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: colors.successText },
  badgeTextRed: { color: colors.dangerText },
  sheetBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 32 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  sheetSub: { fontSize: 12.5, color: colors.textMuted, textAlign: 'center', marginTop: 2, marginBottom: 18 },
  sheetAction: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  sheetActionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sheetActionText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: colors.textPrimary },
  sheetCancel: { marginTop: 14, alignItems: 'center', paddingVertical: 12, backgroundColor: colors.border, borderRadius: 12 },
  sheetCancelText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  bulkHint: { fontSize: 11, color: colors.textPlaceholder, marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.successSurface, borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: colors.successText, flex: 1 },
});