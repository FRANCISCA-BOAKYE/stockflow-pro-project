import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: '1', name: 'Coca-Cola 500ml', category: 'Beverages', price: 1.50, quantity: 84 },
  { id: '2', name: 'Mineral Water 1L', category: 'Beverages', price: 0.80, quantity: 4 },
  { id: '3', name: 'Bread Loaf', category: 'Food', price: 2.20, quantity: 32 },
  { id: '4', name: 'Rice 1kg', category: 'Food', price: 3.50, quantity: 6 },
  { id: '5', name: 'Cooking Oil 1L', category: 'Food', price: 4.00, quantity: 20 },
  { id: '6', name: 'Laundry Soap', category: 'Household', price: 1.20, quantity: 55 },
];

const CATEGORIES = ['All', 'Beverages', 'Food', 'Household'];

export default function RetailerProductsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = PRODUCTS.filter(p => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchName && matchCat;
  });

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.title}>Products</Text>
        <Text style={s.sub}>Your shop inventory</Text>
      </View>
      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name='search-outline' size={16} color='#9CA3AF' style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder='Search products...'
            placeholderTextColor='#9CA3AF'
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={s.chips}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.chip, category === cat && s.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.chipText, category === cat && s.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isLow = item.quantity < 10;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons
                    name={isLow ? 'warning-outline' : 'cube-outline'}
                    size={18}
                    color={isLow ? '#DC2626' : '#1A56DB'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.meta}>
                    {item.category} · ${item.price.toFixed(2)}/unit
                  </Text>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>
                    {item.quantity} units
                  </Text>
                </View>
                <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                  <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                    {isLow ? 'Low stock' : 'In stock'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>
      <TouchableOpacity style={s.fab}>
        <Ionicons name='add' size={28} color='#fff' />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#EEF2F7' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#111827' },
  meta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  qty: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#1A56DB', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
});
