import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { StatusIndicator } from '../components/StatusIndicator';
import { SkeletonRow } from '../components/Skeleton';
import { showToast } from '../components/toast';

// Mirrors backend PlanCatalog.ALLOWED_LINK_PAIRS
const ALLOWED_LINK_PAIRS: Record<string, string[]> = {
  MANUFACTURER: ['WHOLESALER'],
  WHOLESALER: ['MANUFACTURER', 'RETAILER'],
  RETAILER: ['WHOLESALER'],
};

const TYPE_CONFIG_MAP = (colors: ThemeColors): Record<string, { label: string; bg: string; color: string }> => ({
  MANUFACTURER: { label: 'Manufacturer', bg: colors.primarySurface, color: colors.primary },
  WHOLESALER: { label: 'Wholesaler', bg: colors.warningSurface, color: colors.warning },
  RETAILER: { label: 'Retailer', bg: colors.successSurface, color: colors.success },
});

export default function MarketplaceScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const TYPE_CONFIG = useMemo(() => TYPE_CONFIG_MAP(colors), [colors]);
  const [listings, setListings] = useState<any[]>([]);
  const [linkStatus, setLinkStatus] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const [listingsRes, partnersRes] = await Promise.all([
        api.get('/marketplace/listings'),
        api.get('/links/partners').catch(() => ({ data: [] })),
      ]);
      const data = listingsRes.data;
      if (Array.isArray(data)) {
        setListings(data.map((item: any) => {
          const b = item.business || item;
          return {
            id: String(b.id || item.id),
            name: b.name || b.businessName || 'Business',
            type: b.tierType || 'MANUFACTURER',
            location: item.location || 'Ghana',
            headline: item.headline || '',
            description: item.description || 'No description provided yet.',
            deliveryTerms: item.deliveryTerms || 'TBD',
            creditTerms: item.creditTerms || 'TBD',
            verified: b.subscriptionStatus === 'ACTIVE' || b.subscriptionStatus === 'TRIAL',
          };
        }));
      }
      const statusMap: Record<string, string> = {};
      (partnersRes.data || []).forEach((link: any) => {
        const otherId = String(
          link.requesterBusiness?.id === user?.businessId
            ? link.partnerBusiness?.id
            : link.requesterBusiness?.id
        );
        statusMap[otherId] = link.status;
      });
      setLinkStatus(statusMap);
    } catch (e) {
      console.log('Error fetching listings:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.businessId]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleRequestLink = async (item: any) => {
    setRequestingId(item.id);
    try {
      await api.post('/links/request', { partnerBusinessId: parseInt(item.id, 10) });
      showToast(`Link request sent to ${item.name}.`);
      fetchListings();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to send link request');
    } finally {
      setRequestingId(null);
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || l.type === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Marketplace</Text>
        </View>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Marketplace</Text>
          <Text style={s.sub}>{filtered.length} businesses</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search businesses..." placeholderTextColor={colors.textPlaceholder}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="storefront-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No listings found</Text>
              {(search.length > 0 || filter !== 'ALL') && (
                <TouchableOpacity style={s.emptyBtn} onPress={() => { setSearch(''); setFilter('ALL'); }}>
                  <Ionicons name="refresh-outline" size={16} color={colors.onPrimary} style={{ marginRight: 6 }} />
                  <Text style={s.emptyBtnText}>Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => {
            const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.MANUFACTURER;
            const isOwnBusiness = String(user?.businessId) === item.id;
            const canLink = !isOwnBusiness && (ALLOWED_LINK_PAIRS[user?.tierType] || []).includes(item.type);
            const status = linkStatus[item.id];
            return (
              <View style={s.card}>
                <View style={s.cardTop}>
                  <View style={[s.cardIcon, { backgroundColor: tc.bg }]}>
                    <Ionicons name="business-outline" size={18} color={tc.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={s.name}>{item.name}</Text>
                      {item.verified && <Ionicons name="checkmark-circle" size={14} color={colors.success} />}
                    </View>
                    <Text style={s.location}><Ionicons name="location-outline" size={11} color={colors.textPlaceholder} /> {item.location}</Text>
                  </View>
                  <View style={[s.typeBadge, { backgroundColor: tc.bg }]}>
                    <Text style={[s.typeBadgeText, { color: tc.color }]}>{tc.label}</Text>
                  </View>
                </View>
                {item.headline ? <Text style={s.headline}>{item.headline}</Text> : null}
                <Text style={s.description}>{item.description}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.terms}>Delivery: {item.deliveryTerms}</Text>
                    <Text style={s.terms}>Credit: {item.creditTerms}</Text>
                  </View>
                  {canLink && (
                    status === 'ACTIVE' ? (
                      <StatusIndicator status="ok" label="Linked" />
                    ) : status === 'PENDING' ? (
                      <StatusIndicator status="warning" label="Request pending" />
                    ) : (
                      <TouchableOpacity
                        style={s.linkBtn}
                        disabled={requestingId === item.id}
                        onPress={() => handleRequestLink(item)}
                      >
                        {requestingId === item.id
                          ? <ActivityIndicator size="small" color={colors.primary} />
                          : <Text style={s.linkBtnText}>Request Link</Text>}
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: colors.textSecondary },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.onPrimary, fontWeight: '500' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: colors.border, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  location: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  typeBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  typeBadgeText: { fontSize: 10, fontWeight: '600' },
  headline: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  description: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  terms: { fontSize: 11, color: colors.textMuted },
  linkBtn: { backgroundColor: colors.primarySurface, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 12 },
  linkBtnText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, marginTop: 8 },
  emptyBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
});