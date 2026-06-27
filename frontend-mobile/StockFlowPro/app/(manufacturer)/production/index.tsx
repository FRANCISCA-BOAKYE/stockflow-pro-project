import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RECIPES = [
  {
    id: '1',
    name: 'Steel Bracket A',
    outputUnit: 'units',
    materials: [
      { name: 'Steel Rods 6mm', qty: 2, unit: 'kg' },
      { name: 'Industrial Adhesive', qty: 0.5, unit: 'litres' },
      { name: 'Cardboard Box A4', qty: 1, unit: 'units' },
    ],
  },
  {
    id: '2',
    name: 'Copper Assembly B',
    outputUnit: 'units',
    materials: [
      { name: 'Copper Wire 2m', qty: 3, unit: 'rolls' },
      { name: 'Aluminium Sheet', qty: 1, unit: 'sheets' },
    ],
  },
  {
    id: '3',
    name: 'Fabric Panel C',
    outputUnit: 'metres',
    materials: [
      { name: 'Cotton Fabric 1m', qty: 1.2, unit: 'metres' },
      { name: 'Industrial Adhesive', qty: 0.1, unit: 'litres' },
    ],
  },
];

export default function ProductionScreen() {
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [target, setTarget] = useState('');
  const [calculated, setCalculated] = useState<any>(null);

  const calculate = () => {
    if (!selectedRecipe || !target || isNaN(Number(target))) {
      Alert.alert('Missing info', 'Please select a recipe and enter a target quantity.');
      return;
    }
    const qty = Number(target);
    const breakdown = selectedRecipe.materials.map((m: any) => ({
      name: m.name,
      required: (m.qty * qty).toFixed(2),
      unit: m.unit,
    }));
    setCalculated({ recipe: selectedRecipe.name, target: qty, breakdown });
  };

  const confirmRun = () => {
    Alert.alert(
      'Confirm production run',
      `Start production of ${target} ${selectedRecipe?.outputUnit} of ${selectedRecipe?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: () => {
            Alert.alert('Success', 'Production run started successfully.');
            setSelectedRecipe(null);
            setTarget('');
            setCalculated(null);
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Production</Text>
        <Text style={s.sub}>Plan and run production batches</Text>
      </View>
      <ScrollView style={s.body} contentContainerStyle={{ gap: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Recipe selector */}
        <View>
          <Text style={s.sectionLabel}>Select recipe</Text>
          <View style={s.recipeList}>
            {RECIPES.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={[s.recipeCard, selectedRecipe?.id === recipe.id && s.recipeCardActive]}
                onPress={() => { setSelectedRecipe(recipe); setCalculated(null); }}
              >
                <View style={s.recipeIcon}>
                  <Ionicons
                    name="construct-outline"
                    size={16}
                    color={selectedRecipe?.id === recipe.id ? '#fff' : '#1A56DB'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.recipeName, selectedRecipe?.id === recipe.id && { color: '#fff' }]}>
                    {recipe.name}
                  </Text>
                  <Text style={[s.recipeMats, selectedRecipe?.id === recipe.id && { color: 'rgba(255,255,255,0.7)' }]}>
                    {recipe.materials.length} materials
                  </Text>
                </View>
                {selectedRecipe?.id === recipe.id && (
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target quantity */}
        {selectedRecipe && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Target quantity</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                placeholder="e.g. 100"
                placeholderTextColor="#9CA3AF"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
              />
              <Text style={s.inputUnit}>{selectedRecipe.outputUnit}</Text>
            </View>
            <TouchableOpacity style={s.calcBtn} onPress={calculate}>
              <Ionicons name="calculator-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={s.calcBtnText}>Calculate materials needed</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Material breakdown */}
        {calculated && (
          <View style={s.card}>
            <Text style={s.sectionLabel}>Materials needed for {calculated.target} {selectedRecipe?.outputUnit}</Text>
            {calculated.breakdown.map((item: any, i: number) => (
              <View key={i} style={[s.breakdownRow, i < calculated.breakdown.length - 1 && s.breakdownBorder]}>
                <View style={s.breakdownIcon}>
                  <Ionicons name="flask-outline" size={14} color="#1A56DB" />
                </View>
                <Text style={s.breakdownName}>{item.name}</Text>
                <Text style={s.breakdownQty}>{item.required} {item.unit}</Text>
              </View>
            ))}
            <TouchableOpacity style={s.confirmBtn} onPress={confirmRun}>
              <Ionicons name="play-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={s.confirmBtnText}>Confirm production run</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Production history */}
        <Text style={s.sectionLabel}>Recent runs</Text>
        {[
          { name: 'Steel Bracket A', date: 'Today · 8:00 AM', qty: '500 units', status: 'Completed' },
          { name: 'Copper Assembly B', date: 'Yesterday · 2:00 PM', qty: '200 units', status: 'Completed' },
          { name: 'Fabric Panel C', date: 'Jun 19 · 9:00 AM', qty: '150 metres', status: 'Completed' },
        ].map((run, i) => (
          <View key={i} style={[s.runCard, i < 2 && { marginBottom: 0 }]}>
            <View style={s.runIcon}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.runName}>{run.name}</Text>
              <Text style={s.runDate}>{run.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.runQty}>{run.qty}</Text>
              <View style={s.runBadge}>
                <Text style={s.runBadgeText}>{run.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  recipeList: { gap: 8 },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  recipeCardActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  recipeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(26,86,219,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  recipeMats: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  inputUnit: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 0.5,
    borderLeftColor: 'rgba(0,0,0,0.07)',
    paddingVertical: 10,
  },
  calcBtn: {
    backgroundColor: '#1A56DB',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  breakdownBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  breakdownIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownName: { flex: 1, fontSize: 12, color: '#374151' },
  breakdownQty: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  confirmBtn: {
    backgroundColor: '#059669',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  runCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    marginBottom: 6,
  },
  runIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runName: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  runDate: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  runQty: { fontSize: 12, fontWeight: '600', color: '#0F172A', marginBottom: 3 },
  runBadge: { backgroundColor: '#D1FAE5', borderRadius: 20, paddingVertical: 2, paddingHorizontal: 8 },
  runBadgeText: { fontSize: 9, color: '#065F46', fontWeight: '500' },
});