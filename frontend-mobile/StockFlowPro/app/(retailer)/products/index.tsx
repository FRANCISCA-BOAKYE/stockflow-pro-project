import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: '1', name: 'Coca-Cola 500ml', category: 'Beverages', price: 2.50, stock: 120, sku: 'BEV-001' },
  { id: '2', name: 'Mineral Water 1L', category: 'Beverages', price: 1.00, stock: 4, sku: 'BEV-002' },
  { id: '3', name: 'Rice 1kg', category: 'Food', price: 3.50, stock: 6, sku: 'FOD-001' },
  { id: '4', name: 'Bread Loaf', category: 'Food', price: 2.00, stock: 8, sku: 'FOD-002' },
  { id: '5', name: 'Laundry Detergent 1kg', category: 'Household', price: 5.00, stock: 45, sku: 'HH-001' },
  { id: '6', name: 'Cooking Oil 1L', category: 'Food', price: 4.00, stock: 30, sku: 'FOD-003' },
  { id: '7', name: 'Sugar 1kg', category: 'Food', price: 2.50, stock: 2, sku: 'FOD-004' },
  { id: '8', name: 'Soap Bar', category: 'Household', price: 1.50, stock: 60, sku: 'HH-002' },
];

const CATEGORIES = ['All', 'Beverages', 'Food', 'Household'];
const LOW_STOCK = 10;

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  const lowCount = PRODUCTS.filter(p => p.stock < LOW_STOCK).length;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Products</Text>
          <Text style={s.sub}>Shop inventory</Text>
        </View>
        {lowCount > 0 && (
          <View style={s.alertPill}>
            <Ionicons name="warning-outline" size={12} color="#C27803" />
            <Text style={s.alertPillText}>{lowCount} low</Text>
          </View>
        )}
      </View>
      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search products..." placeholderTextColor="#9CA3AF"
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
          renderItem={({ item }) => {
            const isLow = item.stock < LOW_STOCK;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons name="cube-outline" size={18} color={isLow ? '#DC2626' : '#1A56DB'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sku}>{item.sku} · {item.category}</Text>
                  <Text style={[s.stock, isLow && { color: '#DC2626' }]}>{item.stock} units in stock</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.price}>${item.price.toFixed(2)}</Text>
                  <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                    <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                      {isLow ? 'Low' : 'OK'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
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
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: 'rgba(194,120,3,0.2)' },
  alertPillText: { fontSize: 11, color: '#C27803', fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#1A56DB', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
});