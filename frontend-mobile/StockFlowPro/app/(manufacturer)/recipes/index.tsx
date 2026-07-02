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
  const [form, setForm] = useState({ name: '', outputQuantity: '', outputUnit: '' });
  const [recipeMaterials, setRecipeMaterials] = useState<{ materialId: string; quantityRequired: string }[]>([]);

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
    setRecipeMaterials(prev => [...prev, { materialId: '', quantityRequired: '' }]);
  };

  const updateMaterialLine = (index: number, field: string, value: string) => {
    setRecipeMaterials(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMaterialLine = (index: number) => {
    setRecipeMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRecipe = async () => {
    if (!form.name || !form.outputQuantity || !form.outputUnit) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    if (recipeMaterials.length === 0) {
      Alert.alert('Missing info', 'Please add at least one material.');
      return;
    }
    setAddLoading(true);
    try {
      await api.post('/manufacturer/recipes', {
        name: form.name,
        outputQuantity: parseInt(form.outputQuantity),
        outputUnit: form.outputUnit,
        materials: recipeMaterials.map(m => ({
          materialId: parseInt(m.materialId),
          quantityRequired: parseFloat(m.quantityRequired),
        })),
      });
      setShowAddModal(false);
      setForm({ name: '', outputQuantity: '', outputUnit: '' });
      setRecipeMaterials([]);
      fetchData();
      Alert.alert('Success', 'Recipe added successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add recipe');
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
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.output}>Output: {item.outputQuantity} {item.outputUnit} per group</Text>
                </View>
              </View>
              {item.materials && item.materials.length > 0 && (
                <View style={s.materialsList}>
                  <Text style={s.materialsTitle}>Materials required:</Text>
                  {item.materials.map((m: any, i: number) => (
                    <View key={i} style={s.materialRow}>
                      <Ionicons name="flask-outline" size={12} color="#9CA3AF" />
                      <Text style={s.materialText}>{m.materialName}: {m.quantityRequired} {m.unit}</Text>
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
              <Text style={s.fieldLabel}>Recipe name *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. Cotton T-Shirt" placeholderTextColor="#9CA3AF"
                value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Output quantity *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. 24" placeholderTextColor="#9CA3AF"
                  value={form.outputQuantity} onChangeText={v => setForm(f => ({ ...f, outputQuantity: v }))} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Output unit *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. units" placeholderTextColor="#9CA3AF"
                  value={form.outputUnit} onChangeText={v => setForm(f => ({ ...f, outputUnit: v }))} />
              </View>
            </View>

            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={s.fieldLabel}>Materials needed</Text>
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
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                    <View style={{ flex: 2 }}>
                      <Text style={[s.fieldLabel, { fontSize: 11 }]}>Material</Text>
                      <View style={[s.fieldInput, { padding: 0 }]}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          <View style={{ flexDirection: 'row', gap: 6, padding: 8 }}>
                            {materials.map((mat: any) => (
                              <TouchableOpacity key={mat.id} style={[s.matChip, m.materialId === String(mat.id) && s.matChipActive]}
                                onPress={() => updateMaterialLine(i, 'materialId', String(mat.id))}>
                                <Text style={[s.matChipText, m.materialId === String(mat.id) && s.matChipTextActive]}>{mat.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </ScrollView>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.fieldLabel, { fontSize: 11 }]}>Qty</Text>
                      <TextInput style={s.fieldInput} placeholder="0" placeholderTextColor="#9CA3AF"
                        value={m.quantityRequired} onChangeText={v => updateMaterialLine(i, 'quantityRequired', v)} keyboardType="decimal-pad" />
                    </View>
                    <TouchableOpacity onPress={() => removeMaterialLine(i)} style={{ marginTop: 18 }}>
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
  matChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  matChipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  matChipText: { fontSize: 11, color: '#374151' },
  matChipTextActive: { color: '#fff', fontWeight: '500' },
  confirmBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});