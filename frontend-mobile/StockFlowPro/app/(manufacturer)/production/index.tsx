import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert, ScrollView,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useCurrency } from '../../../hooks/useCurrency';
import { ThemeColors } from '../../../theme/colors';
import { StatusIndicator, urgencyBorder } from '../../../components/StatusIndicator';
import { SkeletonRow } from '../../../components/Skeleton';
import { useConfirmSheet } from '../../../components/ConfirmSheet';
import { showToast } from '../../../components/toast';

export default function ProductionScreen() {
  const { colors } = useThemeColors();
  const { format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [target, setTarget] = useState('');
  const [targetError, setTargetError] = useState('');
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
    if (!selectedRecipe) {
      Alert.alert('Missing info', 'Please select a recipe first.');
      return;
    }
    if (!target || isNaN(Number(target))) {
      setTargetError('Enter a valid number of target groups.');
      return;
    }
    setTargetError('');
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
    const ok = await confirm({
      title: 'Confirm production run',
      message: `Start ${target} ${selectedRecipe.groupLabel}(s) of ${selectedRecipe.productName}? This will deduct materials from stock.`,
      destructive: true,
      confirmLabel: 'Confirm',
      icon: 'play-circle-outline',
    });
    if (!ok) return;
    setConfirming(true);
    try {
      await api.post('/manufacturer/production/confirm', {
        recipeId: selectedRecipe.id,
        targetGroups: parseInt(target),
      });
      showToast(`Production run confirmed! ${preview?.totalUnits || ''} units added to finished goods.`);
      setSelectedRecipe(null);
      setTarget('');
      setPreview(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Production run failed');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Production</Text>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        {/* Recipe selector */}
        <View>
          <Text style={s.sectionLabel}>Select recipe</Text>
          {recipes.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="git-branch-outline" size={32} color={colors.borderStrong} />
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
                    <Ionicons name="construct-outline" size={16} color={selectedRecipe?.id === recipe.id ? colors.onPrimary : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.recipeName, selectedRecipe?.id === recipe.id && { color: colors.onPrimary }]}>{recipe.productName}</Text>
                    <Text style={[s.recipeMats, selectedRecipe?.id === recipe.id && { color: 'rgba(255,255,255,0.7)' }]}>
                      {recipe.materials?.length || 0} materials · {recipe.unitsPerGroup} {recipe.unitLabel} per {recipe.groupLabel}
                    </Text>
                  </View>
                  {selectedRecipe?.id === recipe.id && <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />}
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
                placeholderTextColor={colors.textPlaceholder}
                value={target}
                onChangeText={t => { setTarget(t); setPreview(null); if (targetError) setTargetError(''); }}
                keyboardType="numeric"
              />
              <Text style={s.inputUnit}>groups</Text>
            </View>
            {targetError ? <Text style={s.fieldError}>{targetError}</Text> : null}
            <TouchableOpacity style={s.calcBtn} onPress={calculate} disabled={calculating}>
              {calculating ? <ActivityIndicator color={colors.onPrimary} size="small" /> : (
                <>
                  <Ionicons name="calculator-outline" size={16} color={colors.onPrimary} style={{ marginRight: 6 }} />
                  <Text style={s.calcBtnText}>Calculate materials needed</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Preview */}
        {preview && (
          <View style={[s.card, urgencyBorder(preview.feasible ? 'ok' : 'danger', colors), !preview.feasible && { paddingLeft: 11 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={s.sectionLabel}>Materials needed</Text>
              <StatusIndicator status={preview.feasible ? 'ok' : 'danger'} label={preview.feasible ? 'Feasible' : 'Not feasible'} />
            </View>
            <Text style={s.hint}>Total output: {preview.totalUnits} units</Text>
            {preview.materials?.map((m: any, i: number) => (
              <View key={i} style={[s.breakdownRow, i < preview.materials.length - 1 && s.breakdownBorder]}>
                <View style={[s.breakdownIcon, { backgroundColor: m.sufficient ? colors.primarySurface : colors.dangerSurface }]}>
                  <Ionicons name="flask-outline" size={14} color={m.sufficient ? colors.primary : colors.danger} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.breakdownName}>{m.materialName}</Text>
                  <Text style={s.breakdownSub}>Required: {m.required} {m.unit} · In stock: {m.inStock}</Text>
                </View>
                <Ionicons name={m.sufficient ? 'checkmark-circle' : 'close-circle'} size={18} color={m.sufficient ? colors.success : colors.danger} />
              </View>
            ))}
            {preview.feasible && (
              <TouchableOpacity style={s.confirmBtn} onPress={confirmRun} disabled={confirming}>
                {confirming ? <ActivityIndicator color={colors.onPrimary} size="small" /> : (
                  <>
                    <Ionicons name="play-circle-outline" size={18} color={colors.onPrimary} style={{ marginRight: 6 }} />
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
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.runName}>{run.recipe?.productName || `Recipe #${run.id}`}</Text>
                <Text style={s.runDate}>{new Date(run.confirmedAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.runQty}>{run.totalUnits} units</Text>
                <Text style={s.runCost}>{format(Number(run.totalCostUsd))}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  hint: { fontSize: 11, color: colors.textMuted, marginBottom: 8 },
  recipeList: { gap: 8 },
  recipeCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: colors.border },
  recipeCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  recipeIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.primary + '1a', alignItems: 'center', justifyContent: 'center' },
  recipeName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  recipeMats: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: colors.border, gap: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 0.5, borderColor: colors.borderStrong, borderRadius: 10, overflow: 'hidden' },
  input: { flex: 1, padding: 10, fontSize: 14, color: colors.textPrimary },
  inputUnit: { paddingHorizontal: 12, fontSize: 13, color: colors.textMuted, backgroundColor: colors.surfaceAlt, borderLeftWidth: 0.5, borderLeftColor: colors.border, paddingVertical: 10 },
  fieldError: { fontSize: 11, color: colors.danger, marginTop: -2 },
  calcBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  calcBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  breakdownBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.border },
  breakdownIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  breakdownName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  breakdownSub: { fontSize: 10, color: colors.textPlaceholder, marginTop: 1 },
  confirmBtn: { backgroundColor: colors.success, borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  confirmBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
  runCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: colors.border },
  runIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.successSurface, alignItems: 'center', justifyContent: 'center' },
  runName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  runDate: { fontSize: 10, color: colors.textPlaceholder, marginTop: 1 },
  runQty: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  runCost: { fontSize: 10, color: colors.textPlaceholder },
  empty: { alignItems: 'center', paddingTop: 40, gap: 6 },
  emptyText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 12, color: colors.textPlaceholder, textAlign: 'center' },
});