import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LISTINGS = [
  { id: '1', name: 'Acme Manufacturing', type: 'MANUFACTURER', location: 'Kumasi, Ghana', products: ['Steel Parts', 'Aluminium Sheets'], rating: 4.8, verified: true },
  { id: '2', name: 'Apex Distributors', type: 'WHOLESALER', location: 'Accra, Ghana', products: ['Beverages', 'Dry Goods'], rating: 4.6, verified: true },
  { id: '3', name: 'Bright Mart Retail', type: 'RETAILER', location: 'Kumasi, Ghana', products: ['Food', 'Household'], rating: 4.5, verified: true },
  { id: '4', name: 'Metro Wholesale', type: 'WHOLESALER', location: 'Tema, Ghana', products: ['Cement', 'Steel'], rating: 4.3, verified: false },
  { id: '5', name: 'GoldCoast Manufacturers', type: 'MANUFACTURER', location: 'Cape Coast, Ghana', products: ['Textiles', 'Garments'], rating: 4.7, verified: true },
  { id: '6', name: 'Volta Distributors', type: 'WHOLESALER', location: 'Ho, Ghana', products: ['Electronics'], rating: 4.9, verified: true },
];

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  MANUFACTURER: { bg: '#EFF6FF', text: '#1A56DB' },
  WHOLESALER: { bg: '#FFFBEB', text: '#C27803' },
  RETAILER: { bg: '#ECFDF5', text: '#059669' },
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filtered = LISTINGS.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.products.some(p => p.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'ALL' || l.type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Marketplace</Text>
          <Text style={s.sub}>Find suppliers and partners</Text>
        </View>
      </View>
      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search businesses..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>
        <View style={s.chips}>
          {['ALL', 'MANUFACTURER', 'WHOLESALER', 'RETAILER'].map(f => (
            <TouchableOpacity key={f} style={[s.chip, filter === f && s.chipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.chipText, filter === f && s.chipTextActive]}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
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
            const tc = TYPE_COLOR[item.type];
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                    <Text style={[s.typeText, { color: tc.text }]}>{item.type.charAt(0) + item.type.slice(1).toLowerCase()}</Text>
                  </View>
                  {item.verified && (
                    <View style={s.verifiedBadge}>
                      <Ionicons name="shield-checkmark-outline" size={12} color="#059669" />
                      <Text style={s.verifiedText}>Verified</Text>
                    </View>
                  )}
                  <View style={s.ratingRow}>
                    <Ionicons name="star" size={12} color="#F59E0B" />
                    <Text style={s.rating}>{item.rating}</Text>
                  </View>
                </View>
                <Text style={s.name}>{item.name}</Text>
                <View style={s.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  <Text style={s.location}> {item.location}</Text>
                </View>
                <View style={s.productRow}>
                  {item.products.map(p => (
                    <View key={p} style={s.productChip}>
                      <Text style={s.productChipText}>{p}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={s.contactBtn}>
                  <Text style={s.contactBtnText}>Contact</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  typeText: { fontSize: 10, fontWeight: '600' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  verifiedText: { fontSize: 10, color: '#059669', fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' },
  rating: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  name: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 11, color: '#9CA3AF' },
  productRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  productChip: { backgroundColor: '#F3F4F6', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  productChipText: { fontSize: 10, color: '#374151' },
  contactBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 10, alignItems: 'center' },
  contactBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});