import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView,
  RefreshControl, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useCurrency } from '../../../hooks/useCurrency';
import { ThemeColors } from '../../../theme/colors';
import { SkeletonRow } from '../../../components/Skeleton';

export default function CustomersScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get('/retailer/customers');
      setCustomers(res.data || []);
    } catch (e) {
      console.log('Error fetching customers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCustomer = async (customer: any) => {
    setSelected(customer);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/retailer/customers/${customer.id}`);
      setHistory(res.data || []);
    } catch (e) {
      console.log('Error fetching customer history:', e);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Customers</Text>
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
          <Text style={s.title}>Customers</Text>
          <Text style={s.sub}>{customers.length} on record</Text>
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCustomers(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color={colors.borderStrong} />
            <Text style={s.emptyText}>No customers yet</Text>
            <Text style={s.emptySub}>Enter a buyer's phone number at POS to start building their customer ID</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => openCustomer(item)}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.meta}>ID #{item.id} · {item.phone || 'no phone'} · {item.purchaseCount} purchase{item.purchaseCount !== 1 ? 's' : ''}</Text>
            </View>
            <Text style={s.spent}>{format(Number(item.totalSpentUsd || 0))}</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.borderStrong} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <View>
              <Text style={s.modalTitle}>{selected?.name}</Text>
              <Text style={s.modalSub}>Customer ID #{selected?.id} · {selected?.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {historyLoading ? (
            <View style={{ padding: 16, gap: 8 }}>
              {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              ListEmptyComponent={<Text style={s.emptySub}>No purchases recorded yet.</Text>}
              renderItem={({ item }) => (
                <View style={s.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.historyProduct}>{item.productName} x{item.quantity}</Text>
                    <Text style={s.historyMeta}>{item.paymentMode} · {new Date(item.recordedAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={s.historyAmt}>{format(Number(item.amountUsd))}</Text>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
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
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  name: { fontSize: 13.5, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  spent: { fontSize: 13, fontWeight: '700', color: colors.success, marginRight: 4, fontVariant: ['tabular-nums'] },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  modalSub: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, borderWidth: 0.5, borderColor: colors.border },
  historyProduct: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  historyMeta: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  historyAmt: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, fontVariant: ['tabular-nums'] },
});
