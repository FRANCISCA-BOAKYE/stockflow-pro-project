import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const RECIPES = [
  {
    id: '1', name: 'Steel Bracket A', output: 'Steel Bracket A', outputUnit: 'units',
    materials: [
      { name: 'Steel Rods 6mm', qty: 2, unit: 'kg' },
      { name: 'Industrial Adhesive', qty: 0.5, unit: 'litres' },
      { name: 'Cardboard Box A4', qty: 1, unit: 'units' },
    ],
  },
  {
    id: '2', name: 'Copper Assembly B', output: 'Copper Assembly B', outputUnit: 'units',
    materials: [
      { name: 'Copper Wire 2m', qty: 3, unit: 'rolls' },
      { name: 'Aluminium Sheet', qty: 1, unit: 'sheets' },
    ],
  },
  {
    id: '3', name: 'Fabric Panel C', output: 'Fabric Panel C', outputUnit: 'metres',
    materials: [
      { name: 'Cotton Fabric 1m', qty: 1.2, unit: 'metres' },
      { name: 'Industrial Adhesive', qty: 0.1, unit: 'litres' },
    ],
  },
];

export default function RecipesScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Recipes</Text>
          <Text style={s.sub}>{RECIPES.length} production recipes</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="add" size={20} color="#1A56DB" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={RECIPES}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={s.card}>
            <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(expanded === item.id ? null : item.id)}>
              <View style={s.cardIcon}>
                <Ionicons name="git-branch-outline" size={18} color="#1A56DB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.sub2}>{item.materials.length} materials · produces {item.outputUnit}</Text>
              </View>
              <Ionicons name={expanded === item.id ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {expanded === item.id && (
              <View style={s.materialsBox}>
                <Text style={s.materialsLabel}>Materials per unit</Text>
                {item.materials.map((m, i) => (
                  <View key={i} style={[s.materialRow, i < item.materials.length - 1 && s.materialBorder]}>
                    <View style={s.materialIcon}>
                      <Ionicons name="flask-outline" size={14} color="#6B7280" />
                    </View>
                    <Text style={s.materialName}>{m.name}</Text>
                    <Text style={s.materialQty}>{m.qty} {m.unit}</Text>
                  </View>
                ))}
                <TouchableOpacity style={s.runBtn}>
                  <Ionicons name="play-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={s.runBtnText}>Start production run</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sub2: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  materialsBox: { borderTopWidth: 0.5, borderTopColor: '#F3F4F6', padding: 14, gap: 8 },
  materialsLabel: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  materialRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  materialBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  materialIcon: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  materialName: { flex: 1, fontSize: 12, color: '#374151' },
  materialQty: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  runBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  runBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});