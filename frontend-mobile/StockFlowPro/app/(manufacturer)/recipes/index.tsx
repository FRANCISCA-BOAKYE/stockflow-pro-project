import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, RefreshControl, Modal, ScrollView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';
import { SkeletonRow } from '../../../components/Skeleton';
import { useConfirmSheet } from '../../../components/ConfirmSheet';
import { showToast } from '../../../components/toast';

export default function RecipesScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ productName: '', unitLabel: '', groupLabel: '', unitsPerGroup: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [recipeMaterials, setRecipeMaterials] = useState<{ materialId: string; quantityPerUnit: string }[]>([]);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [pickingForIndex, setPickingForIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, matsRes] = await Promise.all([
        api.get('/manufacturer/recipes'),
        api.get('/manufacturer/materials'),
      ]);
      setRecipes(recipesRes.data || []);
      setMaterials(matsRes.data || []);
    } catch (e) {
      console.log('Error fetching recipes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addMaterialLine = () => {
    setRecipeMaterials(prev => [...prev, { materialId: '', quantityPerUnit: '' }]);
  };

  const updateMaterialLine = (index: number, field: string, value: string) => {
    setRecipeMaterials(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMaterialLine = (index: number) => {
    setRecipeMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const openMaterialPicker = (index: number) => {
    setPickingForIndex(index);
    setShowMaterialPicker(true);
  };

  const selectMaterial = (materialId: string) => {
    if (pickingForIndex !== null) {
      updateMaterialLine(pickingForIndex, 'materialId', materialId);
    }
    setShowMaterialPicker(false);
    setPickingForIndex(null);
  };

  const getSelectedMaterialName = (materialId: string) => {
    const mat = materials.find(m => String(m.id) === materialId);
    return mat ? `${mat.name} (${mat.unit})` : '';
  };

  const getSelectedMaterialUnit = (materialId: string) => {
    const mat = materials.find(m => String(m.id) === materialId);
    return mat ? mat.unit : '';
  };

  const getSelectedMaterialPackageHint = (materialId: string) => {
    const mat = materials.find(m => String(m.id) === materialId);
    if (!mat?.packageUnit || !mat?.unitsPerPackage) return null;
    return `1 ${mat.packageUnit} = ${Number(mat.unitsPerPackage).toFixed(0)} ${mat.unit} — enter this quantity in ${mat.unit}, not ${mat.packageUnit}`;
  };

  const handleAddRecipe = async () => {
    const errors: Record<string, string> = {};
    if (!form.productName.trim()) errors.productName = 'Product name is required.';
    if (!form.unitLabel.trim()) errors.unitLabel = 'Unit label is required.';
    if (!form.groupLabel.trim()) errors.groupLabel = 'Group label is required.';
    if (!form.unitsPerGroup) errors.unitsPerGroup = 'Units per group is required.';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    if (recipeMaterials.length === 0) {
      Alert.alert('Missing info', 'Please add at least one material.');
      return;
    }
    const hasEmpty = recipeMaterials.some(m => !m.materialId || !m.quantityPerUnit);
    if (hasEmpty) {
      Alert.alert('Missing info', 'Please complete all material entries.');
      return;
    }
    setAddLoading(true);
    try {
      await api.post('/manufacturer/recipes', {
        productName: form.productName,
        unitLabel: form.unitLabel,
        groupLabel: form.groupLabel,
        unitsPerGroup: parseInt(form.unitsPerGroup),
        materials: recipeMaterials.map(m => ({
          materialId: parseInt(m.materialId),
          quantityPerUnit: parseFloat(m.quantityPerUnit),
        })),
      });
      setShowAddModal(false);
      setForm({ productName: '', unitLabel: '', groupLabel: '', unitsPerGroup: '' });
      setRecipeMaterials([]);
      fetchData();
      showToast('Recipe added successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add recipe');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Recipes</Text>
        </View>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Recipes</Text>
          <Text style={s.sub}>{recipes.length} production recipes</Text>
        </View>
      </View>

      <View style={s.body}>
        <FlatList
          data={recipes}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="git-branch-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No recipes yet</Text>
              <Text style={s.emptySub}>Add a recipe to start production planning</Text>
              <TouchableOpacity style={s.emptyActionBtn} onPress={() => setShowAddModal(true)}>
                <Ionicons name="add" size={16} color={colors.onPrimary} />
                <Text style={s.emptyActionText}>Add Recipe</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.cardIcon}>
        <Ionicons name="git-branch-outline" size={18} color={colors.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.productName || item.name}</Text>
        <Text style={s.output}>Output: {item.unitsPerGroup || item.outputQuantity} {item.unitLabel || item.outputUnit} per {item.groupLabel || 'group'}</Text>
      </View>
      <TouchableOpacity onPress={async () => {
        const ok = await confirm({
          title: 'Delete recipe',
          message: `Delete "${item.productName || item.name}"? This cannot be undone.`,
          destructive: true,
          confirmLabel: 'Delete',
          icon: 'trash-outline',
        });
        if (!ok) return;
        try {
          await api.delete(`/manufacturer/recipes/${item.id}`);
          fetchData();
        } catch (e: any) {
          Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Delete failed');
        }
      }} style={{ padding: 4 }}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
              {item.materials && item.materials.length > 0 && (
                <View style={s.materialsList}>
                  <Text style={s.materialsTitle}>Materials required:</Text>
                  {item.materials.map((m: any, i: number) => (
                    <View key={i} style={s.materialRow}>
                      <Ionicons name="flask-outline" size={12} color={colors.textPlaceholder} />
                      <Text style={s.materialText}>{m.material?.name}: {m.quantityPerUnit} {m.material?.unit}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Add Recipe Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Recipe</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
            <View>
              <Text style={s.fieldLabel}>Product name *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. Golden Butter Biscuits" placeholderTextColor={colors.textPlaceholder}
                value={form.productName} onChangeText={v => { setForm(f => ({ ...f, productName: v })); if (fieldErrors.productName) setFieldErrors(e => ({ ...e, productName: '' })); }} />
              {fieldErrors.productName ? <Text style={s.fieldError}>{fieldErrors.productName}</Text> : null}
            </View>
            <View style={s.explainerBox}>
              <Text style={s.explainerTitle}>How production is measured for this recipe</Text>
              <Text style={s.explainerText}>
                "Unit" is the single smallest item you make (e.g. a bottle, a bag, a shirt).{"\n"}
                "Group" is how you produce and dispatch them in bulk (e.g. a batch, a carton, a crate).{"\n"}
                "Units per group" is how many single units make up one of those groups.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Unit label *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. bottle" placeholderTextColor={colors.textPlaceholder}
                  value={form.unitLabel} onChangeText={v => { setForm(f => ({ ...f, unitLabel: v })); if (fieldErrors.unitLabel) setFieldErrors(e => ({ ...e, unitLabel: '' })); }} />
                {fieldErrors.unitLabel ? <Text style={s.fieldError}>{fieldErrors.unitLabel}</Text> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Group label *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. batch" placeholderTextColor={colors.textPlaceholder}
                  value={form.groupLabel} onChangeText={v => { setForm(f => ({ ...f, groupLabel: v })); if (fieldErrors.groupLabel) setFieldErrors(e => ({ ...e, groupLabel: '' })); }} />
                {fieldErrors.groupLabel ? <Text style={s.fieldError}>{fieldErrors.groupLabel}</Text> : null}
              </View>
            </View>
            <View>
              <Text style={s.fieldLabel}>Units per group *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 24" placeholderTextColor={colors.textPlaceholder}
                value={form.unitsPerGroup} onChangeText={v => { setForm(f => ({ ...f, unitsPerGroup: v })); if (fieldErrors.unitsPerGroup) setFieldErrors(e => ({ ...e, unitsPerGroup: '' })); }} keyboardType="numeric" />
              {fieldErrors.unitsPerGroup ? <Text style={s.fieldError}>{fieldErrors.unitsPerGroup}</Text> : null}
            </View>
            {!!(form.unitLabel && form.groupLabel && form.unitsPerGroup) && (
              <View style={s.previewBox}>
                <Ionicons name="eye-outline" size={14} color={colors.primary} />
                <Text style={s.previewText}>
                  1 {form.groupLabel} = {form.unitsPerGroup} {form.unitLabel}{Number(form.unitsPerGroup) === 1 ? '' : 's'} of {form.productName || 'this product'}
                </Text>
              </View>
            )}

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={s.fieldLabel}>Materials per unit</Text>
                <TouchableOpacity style={s.addMatBtn} onPress={addMaterialLine}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={s.addMatBtnText}>Add material</Text>
                </TouchableOpacity>
              </View>
              {recipeMaterials.length === 0 ? (
                <View style={[s.empty, { paddingTop: 20 }]}>
                  <Text style={s.emptySub}>Tap "Add material" to add ingredients</Text>
                </View>
              ) : (
                recipeMaterials.map((m, i) => (
                  <View key={i} style={{ marginBottom: 10 }}>
                    <View style={[s.matLineCard, { marginBottom: 0 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.fieldLabel, { fontSize: 11 }]}>Material *</Text>
                        <TouchableOpacity style={s.matPickerBtn} onPress={() => openMaterialPicker(i)}>
                          <Text style={[s.matPickerText, !m.materialId && { color: colors.textPlaceholder }]}>
                            {m.materialId ? getSelectedMaterialName(m.materialId) : 'Choose material...'}
                          </Text>
                          <Ionicons name="chevron-down" size={14} color={colors.textPlaceholder} />
                        </TouchableOpacity>
                      </View>
                      <View style={{ width: 100 }}>
                        <Text style={[s.fieldLabel, { fontSize: 11 }]}>Qty per unit *</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TextInput style={[s.fieldInput, { flex: 1 }]} placeholder="0" placeholderTextColor={colors.textPlaceholder}
                            value={m.quantityPerUnit} onChangeText={v => updateMaterialLine(i, 'quantityPerUnit', v)} keyboardType="decimal-pad" />
                          {m.materialId ? <Text style={s.matUnitHint}>{getSelectedMaterialUnit(m.materialId)}</Text> : null}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeMaterialLine(i)} style={s.matRemoveBtn}>
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                    {m.materialId && getSelectedMaterialPackageHint(m.materialId) && (
                      <Text style={s.matPackageHint}>{getSelectedMaterialPackageHint(m.materialId)}</Text>
                    )}
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddRecipe} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmBtnText}>Save Recipe</Text>}
            </TouchableOpacity>
          </ScrollView>

          {/* Material Picker Modal */}
          <Modal visible={showMaterialPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setShowMaterialPicker(false); setPickingForIndex(null); }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Select Material</Text>
                <TouchableOpacity onPress={() => { setShowMaterialPicker(false); setPickingForIndex(null); }}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={materials}
                keyExtractor={(item, index) => item.id ? String(item.id) : String(index)}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={[s.empty, { paddingTop: 40 }]}>
                    <Text style={s.emptySub}>No materials available. Add materials first.</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity style={s.matOptionCard} onPress={() => selectMaterial(String(item.id))}>
                    <View style={[s.matOptionDot, { backgroundColor: item.quantity < item.minThreshold ? colors.dangerSurface : colors.successSurface }]}>
                      <Ionicons name="flask" size={16} color={item.quantity < item.minThreshold ? colors.danger : colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.matOptionName}>{item.name}</Text>
                      <Text style={s.matOptionUnit}>{item.unit} · {Number(item.quantity).toFixed(0)} in stock</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </Modal>
        </SafeAreaView>
      </Modal>
      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: colors.border, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.purpleSurface, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  output: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  materialsList: { backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 10, gap: 6 },
  materialsTitle: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  materialRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  materialText: { fontSize: 11, color: colors.textMuted },
  fab: {
    position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: colors.purple, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: colors.purple, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 6 }),
  },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center', paddingHorizontal: 40 },
  emptyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, marginTop: 8 },
  emptyActionText: { fontSize: 13, fontWeight: '600', color: colors.onPrimary },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  fieldError: { fontSize: 11, color: colors.danger, marginTop: 4 },
  explainerBox: { backgroundColor: colors.purpleSurface, borderRadius: 12, padding: 12, gap: 4 },
  explainerTitle: { fontSize: 12, fontWeight: '700', color: colors.purpleDark },
  explainerText: { fontSize: 12, color: colors.purple, lineHeight: 18 },
  previewBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primarySurface, borderRadius: 10, padding: 10 },
  previewText: { fontSize: 12, color: colors.primary, fontWeight: '600', flex: 1 },
  addMatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySurface, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  addMatBtnText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  matLineCard: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 10, borderWidth: 0.5, borderColor: colors.border },
  matPickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, backgroundColor: colors.surface },
  matPickerText: { fontSize: 13, color: colors.textPrimary, flex: 1 },
  matUnitHint: { fontSize: 11, color: colors.textMuted, marginLeft: 4 },
  matPackageHint: { fontSize: 10.5, color: colors.purpleDark, marginTop: 4, marginLeft: 4 },
  matRemoveBtn: { marginTop: 22, width: 32, height: 32, borderRadius: 10, backgroundColor: colors.dangerSurface, alignItems: 'center', justifyContent: 'center' },
  matOptionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceAlt, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  matOptionDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  matOptionName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  matOptionUnit: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  confirmBtn: { backgroundColor: colors.purple, borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});