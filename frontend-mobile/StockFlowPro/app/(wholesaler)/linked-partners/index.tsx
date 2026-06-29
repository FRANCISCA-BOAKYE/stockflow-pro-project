import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PARTNERS = [
  { id: '1', name: 'Acme Manufacturing', type: 'MANUFACTURER', location: 'Kumasi, Ghana', products: ['Steel Parts'], rating: 4.8, verified: true, linked: true },
  { id: '2', name: 'Bright Mart Retail', type: 'RETAILER', location: 'Kumasi, Ghana', products: ['Food', 'Household'], rating: 4.5, verified: true, linked: true },
  { id: '3', name: 'GoldCoast Manufacturers', type: 'MANUFACTURER', location: 'Cape Coast, Ghana', products: ['Textiles'], rating: 4.7, verified: true, linked: false },
  { id: '4', name: 'City Mart', type: 'RETAILER', location: 'Accra, Ghana', products: ['Food'], rating: 4.4, verified: false, linked: false },
];

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  MANUFACTURER: { bg: '#EFF6FF', text: '#1A56DB' },
  RETAILER: { bg: '#ECFDF5', text: '#059669' },
};

export default function LinkedPartnersScreen() {
  const router = useRouter();
  const [partners, setPartners] = useState(PARTNERS);
  const [tab, setTab] = useState<'linked' | 'discover'>('linked');

  const displayed = partners.filter(p => tab === 'linked' ? p.linked : !p.linked);

  const toggleLink = (id: string) => {
    const p = partners.find(p => p.id === id);
    if (!p) return;
    Alert.alert(p.linked ? 'Unlink' : 'Link', `${p.linked ? 'Unlink from' : 'Send link request to'} ${p.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: p.linked ? 'Unlink' : 'Send', style: p.linked ? 'destructive' : 'default', onPress: () => setPartners(prev => prev.map(x => x.id === id ? { ...x, linked: !x.linked } : x)) }
    ]);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Linked Partners</Text>
          <Text style={s.sub}>{partners.filter(p => p.linked).length} active</Text>
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
      <FlatList
        data={displayed}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const tc = TYPE_COLOR[item.type];
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                  <Text style={[s.typeText, { color: tc.text }]}>{item.type.charAt(0) + item.type.slice(1).toLowerCase()}</Text>
                </View>
                <View style={s.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={s.rating}>{item.rating}</Text>
                </View>
              </View>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.location}>{item.location}</Text>
              <TouchableOpacity style={[s.linkBtn, item.linked && s.unlinkBtn]} onPress={() => toggleLink(item.id)}>
                <Text style={[s.linkBtnText, item.linked && s.unlinkBtnText]}>{item.linked ? 'Unlink' : 'Send Link Request'}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  typeBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  typeText: { fontSize: 10, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  name: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  location: { fontSize: 11, color: '#9CA3AF' },
  linkBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 10, alignItems: 'center', marginTop: 4 },
  unlinkBtn: { backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#DC2626' },
  linkBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  unlinkBtnText: { color: '#DC2626' },
});