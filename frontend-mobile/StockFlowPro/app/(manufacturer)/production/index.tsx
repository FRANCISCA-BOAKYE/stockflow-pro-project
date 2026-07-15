import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert, ScrollView,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function ProductionScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [target, setTarget] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [recipesRes, historyRes] = await Promise.all([
        api.get('/manufacturer/recipes'),
        api.get('/manufacturer/production/history'),
      ]);
      setRecipes(recipesRes.data || []);
      setHistory(historyRes.data || []);
    } catch (e) {
      console.log('Error fetching production data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calculate = async () => {
    if (!selectedRecipe || !target || isNaN(Number(target))) {
      Alert.alert('Missing info', 'Please select a recipe and enter target groups.');
      return;
    }
    setCalculating(true);
    try {
      const res = await api.post('/manufacturer/production/calculate', {
        recipeId: selectedRecipe.id,
        targetGroups: parseInt(target),
      });
      setPreview(res.data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const confirmRun = async () => {
    if (!selectedRecipe || !target) return;
    Alert.alert(
      'Confirm production run',
      `Start ${target} ${selectedRecipe.groupLabel}(s) of ${selectedRecipe.productName}? This will deduct materials from stock.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            setConfirming(true);
            try {
              await api.post('/manufacturer/production/confirm', {
                recipeId: selectedRecipe.id,
                targetGroups: parseInt(target),
              });
              Alert.alert('Success', `Production run confirmed! ${preview?.totalUnits || ''} units added to finished goods.`);
              setSelectedRecipe(null);
              setTarget('');
              setPreview(null);
              fetchData();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Production run failed');
            } finally {
              setConfirming(false);
            }
          }
        },
      ]
    );
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1A56DB" />
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Production</Text>
        <Text style={s.sub}>Plan and run production batches</Text>
      </View>
      <ScrollView
        style={s.body}
        contentContainerStyle={{ gap: 14, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1A56DB" />}
      >
        {/* Recipe selector */}
        <View>
          <Text style={s.sectionLabel}>Select recipe</Text>
          {recipes.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="git-branch-outline" size={32} color="#D1D5DB" />
              <Text style={s.emptyText}>No recipes yet</Text>
              <Text style={s.emptySub}>Add recipes to start production planning</Text>
            </View>
          ) : (
            <View style={s.recipeList}>
              {recipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[s.recipeCard, selectedRecipe?.id === recipe.id && s.recipeCardActive]}
                  onPress={() => { setSelectedRecipe(recipe); setPreview(null); }}
                >
                  <View style={s.recipeIcon}>
                    <Ionicons name="construct-outline" size={16} color={selectedRecipe?.id === recipe.id ? '#fff' : '#1A56DB'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.recipeName, selectedRecipe?.id === recipe.id && { color: '#fff' }]}>{recipe.productName}</Text>
                    <Text style={[s.recipeMats, selectedRecipe?.id === recipe.id && { color: 'rgba(255,255,255,0.7)' }]}>
                      {recipe.materials?.length || 0} materials · {recipe.unitsPerGroup} {recipe.unitLabel} per {recipe.groupLabel}
                    </Text>
                  </View>
                  {selectedRecipe?.id === recipe.id && <Ionicons name="checkmark-circle" size={18} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Target quantity */}
        {selectedRecipe && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Target groups</Text>
            <Text style={s.hint}>1 {selectedRecipe.groupLabel} = {selectedRecipe.unitsPerGroup} {selectedRecipe.unitLabel} of {selectedRecipe.productName}</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="e.g. 10"
                placeholderTextColor="#9CA3AF"
                value={target}
                onChangeText={t => { setTarget(t); setPreview(null); }}
                keyboardType="numeric"
              />
              <Text style={s.inputUnit}>groups</Text>
            </View>
            <TouchableOpacity style={s.calcBtn} onPress={calculate} disabled={calculating}>
              {calculating ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="calculator-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={s.calcBtnText}>Calculate materials needed</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Preview */}
        {preview && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={s.sectionLabel}>Materials needed</Text>
              <View style={[s.feasibleBadge, { backgroundColor: preview.feasible ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[s.feasibleText, { color: preview.feasible ? '#065F46' : '#991B1B' }]}>
                  {preview.feasible ? '✓ Feasible' : '✗ Not feasible'}
                </Text>
              </View>
            </View>
            <Text style={s.hint}>Total output: {preview.totalUnits} units</Text>
            {preview.materials?.map((m: any, i: number) => (
              <View key={i} style={[s.breakdownRow, i < preview.materials.length - 1 && s.breakdownBorder]}>
                <View style={[s.breakdownIcon, { backgroundColor: m.sufficient ? '#EFF6FF' : '#FEF2F2' }]}>
                  <Ionicons name="flask-outline" size={14} color={m.sufficient ? '#1A56DB' : '#DC2626'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.breakdownName}>{m.materialName}</Text>
                  <Text style={s.breakdownSub}>Required: {m.required} {m.unit} · In stock: {m.inStock}</Text>
                </View>
                <Ionicons name={m.sufficient ? 'checkmark-circle' : 'close-circle'} size={18} color={m.sufficient ? '#059669' : '#DC2626'} />
              </View>
            ))}
            {preview.feasible && (
              <TouchableOpacity style={s.confirmBtn} onPress={confirmRun} disabled={confirming}>
                {confirming ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="play-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={s.confirmBtnText}>Confirm production run</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* History */}
        <Text style={s.sectionLabel}>Recent runs</Text>
        {history.length === 0 ? (
          <View style={[s.empty, { paddingTop: 20 }]}>
            <Text style={s.emptySub}>No production runs yet</Text>
          </View>
        ) : (
          history.slice(0, 5).map((run: any, i: number) => (
            <View key={i} style={[s.runCard, { marginBottom: 6 }]}>
              <View style={s.runIcon}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.runName}>{run.recipe?.productName || `Recipe #${run.id}`}</Text>
                <Text style={s.runDate}>{new Date(run.confirmedAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.runQty}>{run.totalUnits} units</Text>
                <Text style={s.runCost}>${Number(run.totalCostUsd).toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  hint: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  recipeList: { gap: 8 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  recipeCardActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  recipeIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(26,86,219,0.1)', alignItems: 'center', justifyContent: 'center' },
  recipeName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  recipeMats: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 10, overflow: 'hidden' },
  input: { flex: 1, padding: 10, fontSize: 14, color: '#0F172A' },
  inputUnit: { paddingHorizontal: 12, fontSize: 13, color: '#6B7280', backgroundColor: '#F8FAFC', borderLeftWidth: 0.5, borderLeftColor: 'rgba(0,0,0,0.07)', paddingVertical: 10 },
  calcBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  calcBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  feasibleBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  feasibleText: { fontSize: 11, fontWeight: '600' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  breakdownBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  breakdownIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  breakdownName: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  breakdownSub: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  confirmBtn: { backgroundColor: '#059669', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  runCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  runIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  runName: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  runDate: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  runQty: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  runCost: { fontSize: 10, color: '#9CA3AF' },
  empty: { alignItems: 'center', paddingTop: 40, gap: 6 },
  emptyText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});