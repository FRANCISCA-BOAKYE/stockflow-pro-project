import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PARTNERS = [
  { id: '1', name: 'Acme Manufacturing', type: 'MANUFACTURER', location: 'Kumasi, Ghana', products: ['Steel Parts', 'Aluminium'], rating: 4.8, verified: true, linked: true },
  { id: '2', name: 'BevCo Ltd', type: 'MANUFACTURER', location: 'Accra, Ghana', products: ['Beverages'], rating: 4.6, verified: true, linked: true },
  { id: '3', name: 'Bright Mart Retail', type: 'RETAILER', location: 'Kumasi, Ghana', products: ['Food', 'Household'], rating: 4.5, verified: true, linked: true },
  { id: '4', name: 'Delta Stores', type: 'RETAILER', location: 'Tema, Ghana', products: ['Electronics'], rating: 4.3, verified: false, linked: true },
  { id: '5', name: 'GoldCoast Manufacturers', type: 'MANUFACTURER', location: 'Cape Coast, Ghana', products: ['Textiles'], rating: 4.7, verified: true, linked: false },
  { id: '6', name: 'City Mart', type: 'RETAILER', location: 'Accra, Ghana', products: ['Food', 'Beverages'], rating: 4.4, verified: false, linked: false },
];

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  MANUFACTURER: { bg: '#EFF6FF', text: '#1A56DB' },
  RETAILER: { bg: '#ECFDF5', text: '#059669' },
};

export default function LinkedPartnersScreen() {
  const router = useRouter();
  const [partners, setPartners] = useState(PARTNERS);
  const [tab, setTab] = useState<'linked' | 'discover'>('linked');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const displayed = partners
    .filter(p => tab === 'linked' ? p.linked : !p.linked)
    .filter(p => typeFilter === 'ALL' || p.type === typeFilter);

  const toggleLink = (id: string) => {
    const p = partners.find(p => p.id === id);
    if (!p) return;
    if (p.linked) {
      Alert.alert('Unlink', `Unlink from ${p.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlink', style: 'destructive', onPress: () => setPartners(prev => prev.map(x => x.id === id ? { ...x, linked: false } : x)) }
      ]);
    } else {
      Alert.alert('Link', `Send link request to ${p.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: () => setPartners(prev => prev.map(x => x.id === id ? { ...x, linked: true } : x)) }
      ]);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Linked Partners</Text>
          <Text style={s.sub}>{partners.filter(p => p.linked).length} active partners</Text>
        </View>
      </View>
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'linked' && s.tabActive]} onPress={() => setTab('linked')}>
          <Text style={[s.tabText, tab === 'linked' && s.tabTextActive]}>Linked</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'discover' && s.tabActive]} onPress={() => setTab('discover')}>
          <Text style={[s.tabText, tab === 'discover' && s.tabTextActive]}>Discover</Text>
        </TouchableOpacity>
      </View>
      <View style={s.body}>
        <View style={s.chips}>
          {['ALL', 'MANUFACTURER', 'RETAILER'].map(f => (
            <TouchableOpacity key={f} style={[s.chip, typeFilter === f && s.chipActive]} onPress={() => setTypeFilter(f)}>
              <Text style={[s.chipText, typeFilter === f && s.chipTextActive]}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={displayed}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No partners found</Text>
            </View>
          }
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
                <TouchableOpacity
                  style={[s.linkBtn, item.linked && s.unlinkBtn]}
                  onPress={() => toggleLink(item.id)}
                >
                  <Ionicons name={item.linked ? 'unlink-outline' : 'link-outline'} size={14} color={item.linked ? '#DC2626' : '#fff'} style={{ marginRight: 6 }} />
                  <Text style={[s.linkBtnText, item.linked && s.unlinkBtnText]}>
                    {item.linked ? 'Unlink' : 'Send Link Request'}
                  </Text>
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
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1A56DB' },
  tabText: { fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#1A56DB', fontWeight: '600' },
  body: { flex: 1, padding: 12 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 12 },
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
  linkBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  unlinkBtn: { backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#DC2626' },
  linkBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  unlinkBtnText: { color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});