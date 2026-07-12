import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  MANUFACTURER: { label: 'Manufacturer', bg: '#EFF6FF', color: '#1A56DB' },
  WHOLESALER: { label: 'Wholesaler', bg: '#FFFBEB', color: '#C27803' },
  RETAILER: { label: 'Retailer', bg: '#ECFDF5', color: '#059669' },
};

export default function MarketplaceScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/listings');
      const data = res.data;
      if (Array.isArray(data)) {
        setListings(data.map((item: any) => {
          const b = item.business || item;
          return {
            id: String(b.id || item.id),
            name: b.name || b.businessName || 'Business',
            type: b.tierType || 'MANUFACTURER',
            location: item.location || 'Ghana',
            products: item.productsOffered ? item.productsOffered.split(',') : [],
            priceRange: item.priceRange || 'Contact for pricing',
            verified: b.subscriptionStatus === 'ACTIVE' || b.subscriptionStatus === 'TRIAL',
          };
        }));
      }
    } catch (e) {
      console.log('Error fetching listings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const filtered = listings.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || l.type === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Marketplace</Text>
          <Text style={s.sub}>{filtered.length} businesses</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search businesses..." placeholderTextColor="#9CA3AF"
            value={search} onChangeText={setSearch} />
        </View>

        <View style={s.filters}>
          {['ALL', 'MANUFACTURER', 'WHOLESALER'].map(f => (
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="storefront-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No listings found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.MANUFACTURER;
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={[s.cardIcon, { backgroundColor: tc.bg }]}>
                    <Ionicons name="business-outline" size={18} color={tc.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.name}>{item.name}</Text>
                      {item.verified && <Ionicons name="checkmark-circle" size={14} color="#059669" />}
                    </View>
                    <Text style={s.location}><Ionicons name="location-outline" size={11} color="#9CA3AF" /> {item.location}</Text>
                  </View>
                  <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                    <Text style={[s.typeBadgeText, { color: tc.color }]}>{tc.label}</Text>
                  </View>
                </View>
                {item.products.length > 0 && (
                  <View style={s.products}>
                    {item.products.slice(0, 3).map((p: string, i: number) => (
                      <View key={i} style={s.productTag}>
                        <Text style={s.productTagText}>{p.trim()}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={s.price}>{item.priceRange}</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  location: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  typeBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  products: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  productTag: { backgroundColor: '#F8FAFC', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 0.5, borderColor: '#E5E7EB' },
  productTagText: { fontSize: 10, color: '#374151' },
  price: { fontSize: 11, color: '#6B7280' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
});