import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const GOODS = [
  { id: '1', name: 'Steel Bracket A', sku: 'SBA-001', stock: 1240, unit: 'units', price: 45.00, category: 'Metal Parts' },
  { id: '2', name: 'Copper Assembly B', sku: 'CAB-002', stock: 680, unit: 'units', price: 120.00, category: 'Electrical' },
  { id: '3', name: 'Fabric Panel C', sku: 'FPC-003', stock: 320, unit: 'metres', price: 18.00, category: 'Textile' },
  { id: '4', name: 'Aluminium Frame D', sku: 'AFD-004', stock: 45, unit: 'units', price: 200.00, category: 'Metal Parts' },
  { id: '5', name: 'Wire Harness E', sku: 'WHE-005', stock: 890, unit: 'units', price: 35.00, category: 'Electrical' },
];

const CATEGORIES = ['All', 'Metal Parts', 'Electrical', 'Textile'];

export default function FinishedGoodsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = GOODS.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || g.category === category;
    return matchSearch && matchCat;
  });

  const totalValue = filtered.reduce((sum, g) => sum + g.stock * g.price, 0);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Finished Goods</Text>
          <Text style={s.sub}>Total value: ${totalValue.toLocaleString()}</Text>
        </View>
      </View>
      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search goods..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>
        <View style={s.chips}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} style={[s.chip, category === cat && s.chipActive]} onPress={() => setCategory(cat)}>
              <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="cube-outline" size={18} color="#1A56DB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.sku}>{item.sku} · {item.category}</Text>
                <Text style={s.stock}>{item.stock} {item.unit} in stock</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.price}>${item.price.toFixed(2)}</Text>
                <Text style={s.perUnit}>per {item.unit.replace('s', '')}</Text>
              </View>
            </View>
          )}
        />
      </View>
      <TouchableOpacity style={s.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  perUnit: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', elevation: 6 },
});