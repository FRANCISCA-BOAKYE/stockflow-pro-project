import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';
import { SkeletonRow } from '../../../components/Skeleton';

export default function FinishedGoodsScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [goods, setGoods] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoods = useCallback(async () => {
    try {
      const res = await api.get('/manufacturer/finished-goods');
      setGoods(res.data || []);
    } catch (e) {
      console.log('Error fetching finished goods:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGoods(); }, [fetchGoods]);

  const filtered = goods.filter(g =>
    g.recipe?.productName?.toLowerCase().includes(search.toLowerCase()) || !search
  );

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Finished Goods</Text>
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
        <View>
          <Text style={s.title}>Finished Goods</Text>
          <Text style={s.sub}>{goods.length} products ready for dispatch</Text>
        </View>
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search goods..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGoods(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No finished goods yet</Text>
              <Text style={s.emptySub}>Run a production batch to create finished goods</Text>
              <TouchableOpacity style={s.emptyActionBtn} onPress={() => router.push('/(manufacturer)/production' as any)}>
                <Ionicons name="construct-outline" size={16} color={colors.onPrimary} />
                <Text style={s.emptyActionText}>Go to Production</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="cube-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.recipe?.productName || `Product #${item.id}`}</Text>
                <Text style={s.sku}>ID: {item.id}</Text>
                <Text style={s.stock}>{item.quantityInStock} units in stock</Text>
                <Text style={s.updated}>Updated: {new Date(item.updatedAt).toLocaleDateString()}</Text>
              </View>
              <View style={s.stockBadge}>
                <Text style={s.stockBadgeText}>{item.quantityInStock}</Text>
                <Text style={s.stockBadgeUnit}>units</Text>
              </View>
            </View>
          )}
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
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  sku: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  stock: { fontSize: 11, color: colors.success, fontWeight: '500', marginTop: 2 },
  updated: { fontSize: 10, color: colors.textPlaceholder, marginTop: 2 },
  stockBadge: { alignItems: 'center', backgroundColor: colors.primarySurface, borderRadius: 12, padding: 10, minWidth: 50 },
  stockBadgeText: { fontSize: 18, fontWeight: '800', color: colors.primary },
  stockBadgeUnit: { fontSize: 9, color: colors.primary, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center', paddingHorizontal: 40 },
  emptyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, marginTop: 8 },
  emptyActionText: { fontSize: 13, fontWeight: '600', color: colors.onPrimary },
});