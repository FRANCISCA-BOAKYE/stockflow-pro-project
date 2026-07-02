import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

export default function LinkedWholesalersScreen() {
  const router = useRouter();
  const [wholesalers, setWholesalers] = useState<any[]>([]);
  const [tab, setTab] = useState<'linked' | 'discover'>('linked');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWholesalers = useCallback(async () => {
    try {
      const res = await api.get('/links/partners');
      const all = (res.data || []).filter((p: any) => {
        const biz = p.partnerBusiness || p.requesterBusiness;
        return biz?.tierType === 'WHOLESALER';
      }).map((p: any) => {
        const biz = p.partnerBusiness?.tierType === 'WHOLESALER' ? p.partnerBusiness : p.requesterBusiness;
        return {
          id: p.id,
          name: biz?.name || 'Unknown',
          location: biz?.location || '',
          products: biz?.categories || [],
          rating: biz?.rating || 0,
          verified: biz?.verified || false,
          linked: p.status === 'ACCEPTED',
          creditLimit: biz?.creditLimit || 0,
        };
      });
      setWholesalers(all);
    } catch (e) {
      console.log('Error fetching wholesalers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWholesalers(); }, [fetchWholesalers]);

  const displayed = tab === 'linked' ? wholesalers.filter(w => w.linked) : wholesalers.filter(w => !w.linked);

  const toggleLink = async (id: string) => {
    const w = wholesalers.find(w => w.id === id);
    if (!w) return;
    if (w.linked) {
      Alert.alert('Unlink', `Unlink from ${w.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unlink', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/links/partners/${id}`);
            fetchWholesalers();
          } catch (e) { console.log('Error unlinking:', e); }
        }}
      ]);
    } else {
      Alert.alert('Link', `Send link request to ${w.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Request', onPress: async () => {
          try {
            await api.post('/links/request', { partnerLinkId: id });
            fetchWholesalers();
          } catch (e) { console.log('Error sending request:', e); }
        }}
      ]);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Wholesalers</Text>
          <Text style={s.sub}>{wholesalers.filter(w => w.linked).length} linked partners</Text>
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
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWholesalers(); }} tintColor="#1A56DB" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>No wholesalers found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.name}>{item.name}</Text>
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
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={12} color="#9CA3AF" />
              <Text style={s.location}> {item.location}</Text>
            </View>
            <View style={s.productRow}>
              {(item.products || []).map((p: string) => (
                <View key={p} style={s.productChip}>
                  <Text style={s.productChipText}>{p}</Text>
                </View>
              ))}
            </View>
            {item.linked && item.creditLimit > 0 && (
              <View style={s.creditRow}>
                <Ionicons name="wallet-outline" size={12} color="#1A56DB" />
                <Text style={s.creditText}> Credit limit: ${Number(item.creditLimit).toLocaleString()}</Text>
              </View>
            )}
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
        )}
      />
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
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1A56DB' },
  tabText: { fontSize: 13, color: '#9CA3AF' },
  tabTextActive: { color: '#1A56DB', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  verifiedText: { fontSize: 10, color: '#059669', fontWeight: '500' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { fontSize: 11, color: '#9CA3AF' },
  productRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  productChip: { backgroundColor: '#F3F4F6', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  productChipText: { fontSize: 10, color: '#374151' },
  creditRow: { flexDirection: 'row', alignItems: 'center' },
  creditText: { fontSize: 12, color: '#1A56DB', fontWeight: '500' },
  linkBtn: { backgroundColor: '#1A56DB', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  unlinkBtn: { backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#DC2626' },
  linkBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  unlinkBtnText: { color: '#DC2626' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
