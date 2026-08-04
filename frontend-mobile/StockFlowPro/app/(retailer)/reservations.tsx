import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { SkeletonRow } from '../../components/Skeleton';
import { useConfirmSheet } from '../../components/ConfirmSheet';
import { showToast } from '../../components/toast';
import ListItemCard from '../../components/ListItemCard';
import EmptyState from '../../components/EmptyState';
import FormField from '../../components/FormField';
import Button from '../../components/Button';
import PressableScale from '../../components/PressableScale';

function formatCountdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s left`;
}

export default function ReservationsScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();
  const [reservations, setReservations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [, forceTick] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [resRes, prodRes] = await Promise.all([
        api.get('/reserve'),
        api.get('/retailer/products'),
      ]);
      setReservations(resRes.data || []);
      setProducts(prodRes.data?.content || prodRes.data || []);
    } catch (e) {
      console.log('Error fetching reservations:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Tick every second so countdowns stay live while the screen is open
  useEffect(() => {
    const interval = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const productName = (productId: number) =>
    products.find(p => p.id === productId)?.name || 'Unknown product';

  const handleCreateReservation = async () => {
    if (!selectedProduct || !quantity) return;
    setSubmitting(true);
    try {
      await api.post('/reserve', {
        productId: selectedProduct.id,
        productType: 'RETAIL_PRODUCT',
        quantity: parseInt(quantity, 10),
      });
      setShowAddModal(false);
      setSelectedProduct(null);
      setQuantity('');
      fetchData();
      showToast(`${quantity} ${selectedProduct.unit} of ${selectedProduct.name} held for 10 minutes.`);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.response?.data?.error || 'Failed to create reservation';
      Alert.alert(message.includes('Premium') ? 'Premium feature' : 'Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async (reservation: any) => {
    const ok = await confirm({
      title: 'Release reservation',
      message: `Release the hold on ${productName(reservation.productId)}?`,
      destructive: true,
      confirmLabel: 'Release',
      icon: 'time-outline',
    });
    if (!ok) return;
    try {
      await api.delete(`/reserve/${reservation.id}`);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to release reservation');
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Reservations</Text>
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
          <Text style={s.title}>Reservations</Text>
          <Text style={s.sub}>{reservations.length} active · Premium feature</Text>
        </View>
      </View>

      <View style={s.body}>
        <FlatList
          data={reservations}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="time-outline"
              title="No active reservations"
              message="Hold stock for a customer for 10 minutes with the + button"
            />
          }
          renderItem={({ item }) => (
            <ListItemCard
              leading={
                <View style={s.cardIcon}>
                  <Ionicons name="time-outline" size={18} color={colors.primary} />
                </View>
              }
              title={productName(item.productId)}
              subtitle={`${item.quantity} units held`}
              trailing={
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={s.countdown}>{formatCountdown(item.expiresAt)}</Text>
                  <TouchableOpacity style={s.releaseBtn} onPress={() => handleRelease(item)}>
                    <Text style={s.releaseBtnText}>Release</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        />
      </View>

      <PressableScale style={s.fab} onPress={() => setShowAddModal(true)} haptic>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </PressableScale>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>New Reservation</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            <Text style={s.fieldLabel}>Product</Text>
            <ScrollView style={{ maxHeight: 220, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              {products.map((p: any) => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.productRow, selectedProduct?.id === p.id && s.productRowActive]}
                  onPress={() => setSelectedProduct(p)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.productName}>{p.name}</Text>
                    <Text style={s.productStock}>{p.quantity} {p.unit} in stock</Text>
                  </View>
                  {selectedProduct?.id === p.id && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}
              {products.length === 0 && <Text style={s.productStock}>No products yet — add one first.</Text>}
            </ScrollView>

            <FormField
              label="Quantity to hold"
              placeholder="e.g. 5"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <Text style={s.hint}>Held for 10 minutes, then automatically released.</Text>

            <Button
              title="Reserve Stock"
              onPress={handleCreateReservation}
              loading={submitting}
              disabled={!selectedProduct || !quantity}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  body: { flex: 1, padding: 12 },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  countdown: { fontSize: 11, color: colors.warning, fontWeight: '600' },
  releaseBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.dangerSurface },
  releaseBtnText: { fontSize: 12, fontWeight: '600', color: colors.danger },
  fab: {
    position: 'absolute', bottom: 24, right: 16, width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 6 }),
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  hint: { fontSize: 11, color: colors.textPlaceholder, marginTop: 6, marginBottom: 20 },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, marginBottom: 8 },
  productRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  productName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  productStock: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
});
