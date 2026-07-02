import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecipes = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/recipes');
      setRecipes(res.data || []);
    } catch (e) {
      console.log('Error fetching recipes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

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
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="add" size={20} color="#1A56DB" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={recipes}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecipes(); }} tintColor="#1A56DB" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="git-branch-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>No recipes yet</Text>
            <Text style={s.emptySub}>Create recipes to define how finished goods are produced</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <TouchableOpacity style={s.cardHeader} onPress={() => setExpanded(expanded === item.id ? null : String(item.id))}>
              <View style={s.cardIcon}>
                <Ionicons name="git-branch-outline" size={18} color="#1A56DB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.sub2}>{(item.materials || item.recipeMaterials || []).length} materials · produces {item.outputUnit || 'units'}</Text>
              </View>
              <Ionicons name={expanded === item.id ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
            {expanded === item.id && (
              <View style={s.materialsBox}>
                <Text style={s.materialsLabel}>Materials per unit</Text>
                {(item.materials || item.recipeMaterials || []).map((m: any, i: number) => {
                  const mats = item.materials || item.recipeMaterials || [];
                  return (
                    <View key={i} style={[s.materialRow, i < mats.length - 1 && s.materialBorder]}>
                      <View style={s.materialIcon}>
                        <Ionicons name="flask-outline" size={14} color="#6B7280" />
                      </View>
                      <Text style={s.materialName}>{m.name || m.materialName}</Text>
                      <Text style={s.materialQty}>{m.quantity || m.qty} {m.unit}</Text>
                    </View>
                  );
                })}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});
