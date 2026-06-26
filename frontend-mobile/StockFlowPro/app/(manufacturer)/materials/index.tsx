import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MATERIALS = [
  { id: '1', name: 'Steel Rods 6mm', category: 'Metals', unit: 'kg', quantity: 240, reorderAt: 300, supplier: 'MetalWorks Ltd', usedIn: 3 },
  { id: '2', name: 'Copper Wire 2m', category: 'Metals', unit: 'rolls', quantity: 1840, reorderAt: 500, supplier: 'WirePro', usedIn: 2 },
  { id: '3', name: 'Aluminium Sheet', category: 'Metals', unit: 'sheets', quantity: 520, reorderAt: 200, supplier: 'AlumCo', usedIn: 4 },
  { id: '4', name: 'Industrial Adhesive', category: 'Chemicals', unit: 'litres', quantity: 48, reorderAt: 100, supplier: 'ChemBase', usedIn: 1 },
  { id: '5', name: 'Cardboard Box A4', category: 'Packaging', unit: 'units', quantity: 2000, reorderAt: 1000, supplier: 'PackIt', usedIn: 5 },
  { id: '6', name: 'Cotton Fabric 1m', category: 'Fabric', unit: 'metres', quantity: 80, reorderAt: 200, supplier: 'TextileCo', usedIn: 2 },
];

const CATEGORIES = ['All', 'Metals', 'Chemicals', 'Packaging', 'Fabric'];

export default function MaterialsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = MATERIALS.filter(m => {
    const matchName = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || m.category === category;
    return matchName && matchCat;
  });

  const lowStockCount = MATERIALS.filter(m => m.quantity < m.reorderAt).length;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Raw Materials</Text>
          <Text style={s.sub}>Production inputs</Text>
        </View>
        {lowStockCount > 0 && (
          <View style={s.alertPill}>
            <Ionicons name="warning-outline" size={12} color="#C27803" />
            <Text style={s.alertPillText}>{lowStockCount} low</Text>
          </View>
        )}
      </View>
      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search materials..."
            placeholderTextColor="#9CA3AF"
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
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isLow = item.quantity < item.reorderAt;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#ECFDF5' }]}>
                  <Ionicons
                    name={isLow ? 'warning-outline' : 'flask-outline'}
                    size={18}
                    color={isLow ? '#DC2626' : '#059669'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={s.row}>
                    <Ionicons name="business-outline" size={11} color="#9CA3AF" />
                    <Text style={s.supplier}> {item.supplier}</Text>
                  </View>
                  <Text style={[s.qty, isLow && { color: '#DC2626' }]}>
                    {item.quantity} {item.unit} · Reorder at {item.reorderAt}
                  </Text>
                  <View style={s.row}>
                    <Ionicons name="git-branch-outline" size={11} color="#9CA3AF" />
                    <Text style={s.usedIn}> Used in {item.usedIn} recipes</Text>
                  </View>
                </View>
                <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                  <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                    {isLow ? 'Low stock' : 'Available'}
                  </Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(194,120,3,0.2)',
  },
  alertPillText: { fontSize: 11, color: '#C27803', fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  supplier: { fontSize: 11, color: '#9CA3AF' },
  qty: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  usedIn: { fontSize: 10, color: '#9CA3AF' },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    width: 50,
    height: 50,
    backgroundColor: '#1A56DB',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A56DB',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});