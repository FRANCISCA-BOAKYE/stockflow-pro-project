import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';

export default function FinishedGoodsScreen() {
  const router = useRouter();
  const [goods, setGoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoods = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/finished-goods');
      setGoods(res.data || []);
    } catch (e) {
      console.log('Error fetching finished goods:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGoods(); }, [fetchGoods]);

  const filtered = goods.filter(g =>
    g.recipe?.productName?.toLowerCase().includes(search.toLowerCase()) || !search
  );

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1A56DB" />
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Finished Goods</Text>
          <Text style={s.sub}>{goods.length} products ready for dispatch</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search goods..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoods(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No finished goods yet</Text>
              <Text style={s.emptySub}>Run a production batch to create finished goods</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="cube-outline" size={18} color="#1A56DB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.recipe?.productName || `Product #${item.id}`}</Text>
                <Text style={s.sku}>ID: {item.id}</Text>
                <Text style={s.stock}>{item.quantityInStock} units in stock</Text>
                <Text style={s.updated}>Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
              </View>
              <View style={s.stockBadge}>
                <Text style={s.stockBadgeText}>{item.quantityInStock}</Text>
                <Text style={s.stockBadgeUnit}>units</Text>
              </View>
            </View>
          )}
        />
      </View>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  updated: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  stockBadge: { alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 10, minWidth: 50 },
  stockBadgeText: { fontSize: 18, fontWeight: '800', color: '#1A56DB' },
  stockBadgeUnit: { fontSize: 9, color: '#1A56DB', fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
});