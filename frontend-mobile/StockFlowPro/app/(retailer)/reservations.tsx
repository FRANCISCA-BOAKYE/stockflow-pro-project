import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';

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
      Alert.alert('Reserved', `${quantity} ${selectedProduct.unit} of ${selectedProduct.name} held for 10 minutes.`);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.response?.data?.error || 'Failed to create reservation';
      Alert.alert(message.includes('Premium') ? 'Premium feature' : 'Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = (reservation: any) => {
    Alert.alert('Release reservation', `Release the hold on ${productName(reservation.productId)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Release', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/reserve/${reservation.id}`);
            fetchData();
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to release reservation');
          }
        }
      }
    ]);
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

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
            <View style={s.empty}>
              <Ionicons name="time-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No active reservations</Text>
              <Text style={s.emptySub}>Hold stock for a customer for 10 minutes with the + button</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{productName(item.productId)}</Text>
                <Text style={s.qty}>{item.quantity} units held</Text>
                <Text style={s.countdown}>{formatCountdown(item.expiresAt)}</Text>
              </View>
              <TouchableOpacity style={s.releaseBtn} onPress={() => handleRelease(item)}>
                <Text style={s.releaseBtnText}>Release</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => setShowAddModal(true)}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

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

            <Text style={s.fieldLabel}>Quantity to hold</Text>
            <TextInput
              style={s.fieldInput}
              placeholder="e.g. 5"
              placeholderTextColor={colors.textPlaceholder}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
            <Text style={s.hint}>Held for 10 minutes, then automatically released.</Text>

            <TouchableOpacity
              style={[s.confirmBtn, (!selectedProduct || !quantity || submitting) && { opacity: 0.5 }]}
              onPress={handleCreateReservation}
              disabled={!selectedProduct || !quantity || submitting}
            >
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmText}>Reserve Stock</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  qty: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  countdown: { fontSize: 11, color: colors.warning, fontWeight: '600', marginTop: 2 },
  releaseBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.dangerSurface },
  releaseBtnText: { fontSize: 12, fontWeight: '600', color: colors.danger },
  fab: { position: 'absolute', bottom: 24, right: 16, width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center', paddingHorizontal: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  hint: { fontSize: 11, color: colors.textPlaceholder, marginTop: 6, marginBottom: 20 },
  productRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.borderStrong, marginBottom: 8 },
  productRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  productName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  productStock: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
