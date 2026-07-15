import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ productName: '', unitLabel: '', groupLabel: '', unitsPerGroup: '' });
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

  const handleAddRecipe = async () => {
    if (!form.productName || !form.unitLabel || !form.groupLabel || !form.unitsPerGroup) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
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
      Alert.alert('Success', 'Recipe added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add recipe');
    } finally {
      setAddLoading(false);
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="git-branch-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No recipes yet</Text>
              <Text style={s.emptySub}>Add a recipe to start production planning</Text>
            </View>
          }
          renderItem={({ item }) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.cardIcon}>
        <Ionicons name="git-branch-outline" size={18} color="#8B5CF6" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{item.productName || item.name}</Text>
        <Text style={s.output}>Output: {item.unitsPerGroup || item.outputQuantity} {item.unitLabel || item.outputUnit} per {item.groupLabel || 'group'}</Text>
      </View>
      <TouchableOpacity onPress={() => {
        Alert.alert('Delete recipe', `Delete "${item.productName || item.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await api.delete(`/manufacturer/recipes/${item.id}`);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Delete failed');
            }
          }}
        ]);
      }} style={{ padding: 4 }}>
        <Ionicons name="trash-outline" size={18} color="#DC2626" />
      </TouchableOpacity>
    </View>
              {item.materials && item.materials.length > 0 && (
                <View style={s.materialsList}>
                  <Text style={s.materialsTitle}>Materials required:</Text>
                  {item.materials.map((m: any, i: number) => (
                    <View key={i} style={s.materialRow}>
                      <Ionicons name="flask-outline" size={12} color="#9CA3AF" />
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
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Recipe Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Recipe</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
            <View>
              <Text style={s.fieldLabel}>Product name *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. Golden Butter Biscuits" placeholderTextColor="#9CA3AF"
                value={form.productName} onChangeText={v => setForm(f => ({ ...f, productName: v }))} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Unit label *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. pack" placeholderTextColor="#9CA3AF"
                  value={form.unitLabel} onChangeText={v => setForm(f => ({ ...f, unitLabel: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Group label *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. carton" placeholderTextColor="#9CA3AF"
                  value={form.groupLabel} onChangeText={v => setForm(f => ({ ...f, groupLabel: v }))} />
              </View>
            </View>
            <View>
              <Text style={s.fieldLabel}>Units per group *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 24" placeholderTextColor="#9CA3AF"
                value={form.unitsPerGroup} onChangeText={v => setForm(f => ({ ...f, unitsPerGroup: v }))} keyboardType="numeric" />
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={s.fieldLabel}>Materials per unit</Text>
                <TouchableOpacity style={s.addMatBtn} onPress={addMaterialLine}>
                  <Ionicons name="add" size={14} color="#1A56DB" />
                  <Text style={s.addMatBtnText}>Add material</Text>
                </TouchableOpacity>
              </View>
              {recipeMaterials.length === 0 ? (
                <View style={[s.empty, { paddingTop: 20 }]}>
                  <Text style={s.emptySub}>Tap "Add material" to add ingredients</Text>
                </View>
              ) : (
                recipeMaterials.map((m, i) => (
                  <View key={i} style={s.matLineCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.fieldLabel, { fontSize: 11 }]}>Material *</Text>
                      <TouchableOpacity style={s.matPickerBtn} onPress={() => openMaterialPicker(i)}>
                        <Text style={[s.matPickerText, !m.materialId && { color: '#9CA3AF' }]}>
                          {m.materialId ? getSelectedMaterialName(m.materialId) : 'Choose material...'}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                    <View style={{ width: 100 }}>
                      <Text style={[s.fieldLabel, { fontSize: 11 }]}>Qty per unit *</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput style={[s.fieldInput, { flex: 1 }]} placeholder="0" placeholderTextColor="#9CA3AF"
                          value={m.quantityPerUnit} onChangeText={v => updateMaterialLine(i, 'quantityPerUnit', v)} keyboardType="decimal-pad" />
                        {m.materialId ? <Text style={s.matUnitHint}>{getSelectedMaterialUnit(m.materialId)}</Text> : null}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeMaterialLine(i)} style={s.matRemoveBtn}>
                      <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddRecipe} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Save Recipe</Text>}
            </TouchableOpacity>
          </ScrollView>

          {/* Material Picker Modal */}
          <Modal visible={showMaterialPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setShowMaterialPicker(false); setPickingForIndex(null); }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Select Material</Text>
                <TouchableOpacity onPress={() => { setShowMaterialPicker(false); setPickingForIndex(null); }}>
                  <Ionicons name="close" size={24} color="#374151" />
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
                    <View style={[s.matOptionDot, { backgroundColor: item.quantity < item.minThreshold ? '#FEE2E2' : '#D1FAE5' }]}>
                      <Ionicons name="flask" size={16} color={item.quantity < item.minThreshold ? '#DC2626' : '#059669'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.matOptionName}>{item.name}</Text>
                      <Text style={s.matOptionUnit}>{item.unit} · {Number(item.quantity).toFixed(0)} in stock</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#1A56DB" />
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </Modal>
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  output: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  materialsList: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, gap: 6 },
  materialsTitle: { fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 4 },
  materialRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  materialText: { fontSize: 11, color: '#6B7280' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#8B5CF6', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  addMatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  addMatBtnText: { fontSize: 12, color: '#1A56DB', fontWeight: '600' },
  matLineCard: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' },
  matPickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  matPickerText: { fontSize: 13, color: '#0F172A', flex: 1 },
  matUnitHint: { fontSize: 11, color: '#6B7280', marginLeft: 4 },
  matRemoveBtn: { marginTop: 22, width: 32, height: 32, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' },
  matOptionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)' },
  matOptionDot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  matOptionName: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  matOptionUnit: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  confirmBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});