import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const STOCK = [
  { id: '1', name: 'Coca-Cola 500ml (Case of 24)', supplier: 'BevCo Ltd', price: 28.00, quantity: 340, category: 'Beverages' },
  { id: '2', name: 'Mineral Water 1L (Case of 12)', supplier: 'AquaPure', price: 8.00, quantity: 42, category: 'Beverages' },
  { id: '3', name: 'Flour 50kg Bag', supplier: 'Mill Corp', price: 45.00, quantity: 120, category: 'Dry Goods' },
  { id: '4', name: 'Cooking Oil 20L Drum', supplier: 'OilTrade', price: 62.00, quantity: 18, category: 'Dry Goods' },
  { id: '5', name: 'Laundry Detergent 10kg', supplier: 'CleanCo', price: 22.00, quantity: 200, category: 'Household' },
  { id: '6', name: 'Rice 50kg Bag', supplier: 'GrainCo', price: 55.00, quantity: 35, category: 'Dry Goods' },
];

const CATEGORIES = ['All', 'Beverages', 'Dry Goods', 'Household'];
const LOW_THRESHOLD = 50;

export default function WarehouseScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = STOCK.filter(item => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    return matchName && matchCat;
  });

  const lowCount = STOCK.filter(i => i.quantity < LOW_THRESHOLD).length;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Warehouse</Text>
          <Text style={s.sub}>Bulk stock management</Text>
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
          <TextInput style={s.searchInput} placeholder="Search warehouse stock..." placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} />
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
            const isLow = item.quantity < LOW_THRESHOLD;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons name={isLow ? 'warning-outline' : 'archive-outline'} size={18} color={isLow ? '#DC2626' : '#1A56DB'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={s.row}>
                    <Ionicons name="business-outline" size={11} color="#9CA3AF" />
                    <Text style={s.supplier}> {item.supplier}</Text>
                  </View>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>{item.quantity} units · ${item.price.toFixed(2)}/unit</Text>
                </View>
                <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                  <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>{isLow ? 'Low stock' : 'In stock'}</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  supplier: { fontSize: 11, color: '#9CA3AF' },
  qty: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#1A56DB', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
});