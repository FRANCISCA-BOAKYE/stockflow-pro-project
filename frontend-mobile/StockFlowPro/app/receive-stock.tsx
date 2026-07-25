import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, Alert,
  ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

const PAYMENT_MODES = ['CASH', 'CARD', 'MOBILE_MONEY', 'CREDIT'];

export default function ReceiveStockScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [stock, setStock] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ quantity: '', amountUsd: '', paymentMode: 'CASH', dueDate: '' });

  const fetchStock = useCallback(async () => {
    try {
      const [stockRes, partnersRes] = await Promise.all([
        api.get('/wholesaler/stock'),
        api.get('/links/partners'),
      ]);
      setStock(stockRes.data || []);
      const manufacturers = (partnersRes.data || []).filter((p: any) =>
        p.status === 'ACTIVE' && (p.partnerBusiness?.tierType === 'MANUFACTURER' || p.requesterBusiness?.tierType === 'MANUFACTURER')
      ).map((p: any) => {
        const m = p.partnerBusiness?.tierType === 'MANUFACTURER' ? p.partnerBusiness : p.requesterBusiness;
        return { id: m.id, name: m.name };
      });
      setPartners(manufacturers);
    } catch (e) {
      console.log('Error fetching stock:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const handleReceive = async () => {
    if (!selectedProduct || !form.quantity || !form.amountUsd) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    if (!selectedPartner) {
      Alert.alert('Missing info', 'Please select which manufacturer this stock is from.');
      return;
    }
    if (form.paymentMode === 'CREDIT' && !form.dueDate.trim()) {
      Alert.alert('Missing info', 'Please enter a due date for credit payment.');
      return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        productId: selectedProduct.id,
        quantity: parseInt(form.quantity),
        amountUsd: parseFloat(form.amountUsd),
        paymentMode: form.paymentMode,
        manufacturerBusinessId: selectedPartner.id,
      };
      if (form.paymentMode === 'CREDIT') body.dueDate = form.dueDate;
      await api.post('/wholesaler/receive', body);
      Alert.alert('Success', `${form.quantity} units of ${selectedProduct.name} received!`);
      setShowModal(false);
      setForm({ quantity: '', amountUsd: '', paymentMode: 'CASH', dueDate: '' });
      setSelectedProduct(null);
      setSelectedPartner(null);
      fetchStock();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Receive stock failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Receive Stock</Text>
          <Text style={s.sub}>Record incoming stock from manufacturers</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.sectionLabel}>Select product to restock</Text>
        <FlatList
          data={stock}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStock(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="archive-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No products yet</Text>
              <Text style={s.emptySub}>Add products to your warehouse first</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < (item.minThreshold || 20);
            return (
              <TouchableOpacity style={s.card} onPress={() => { setSelectedProduct(item); setSelectedPartner(null); setShowModal(true); }}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? colors.dangerSurface : colors.primarySurface }]}>
                  <Ionicons name="archive-outline" size={18} color={isLow ? colors.danger : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit}</Text>
                  <Text style={[s.stock, isLow && { color: colors.danger }]}>{item.quantity} in stock</Text>
                </View>
                <View style={s.receiveBtn}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={s.receiveBtnText}>Receive</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Receive — {selectedProduct?.name}</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            <View>
              <Text style={s.fieldLabel}>Quantity received *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 500" placeholderTextColor={colors.textPlaceholder}
                value={form.quantity} onChangeText={v => setForm(f => ({ ...f, quantity: v }))} keyboardType="numeric" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Total cost (USD) *</Text>
              <TextInput style={s.fieldInput} placeholder="e.g. 2500.00" placeholderTextColor={colors.textPlaceholder}
                value={form.amountUsd} onChangeText={v => setForm(f => ({ ...f, amountUsd: v }))} keyboardType="decimal-pad" />
            </View>
            <View>
              <Text style={s.fieldLabel}>Manufacturer *</Text>
              <TouchableOpacity style={s.partnerPicker} onPress={() => setShowPartnerModal(true)}>
                <Ionicons name="business-outline" size={16} color={colors.textMuted} />
                <Text style={[s.partnerPickerText, !selectedPartner && { color: colors.textPlaceholder }]}>
                  {selectedPartner?.name || 'Select manufacturer'}
                </Text>
                <Ionicons name="chevron-forward-outline" size={16} color={colors.textPlaceholder} />
              </TouchableOpacity>
              {partners.length === 0 && (
                <Text style={{ fontSize: 11, color: colors.textPlaceholder, marginTop: 4 }}>
                  No linked manufacturers yet — link one from Marketplace first.
                </Text>
              )}
            </View>
            <View>
              <Text style={s.fieldLabel}>Payment mode</Text>
              <View style={s.payRow}>
                {PAYMENT_MODES.map(mode => (
                  <TouchableOpacity key={mode} style={[s.payBtn, form.paymentMode === mode && s.payBtnActive]}
                    onPress={() => setForm(f => ({ ...f, paymentMode: mode }))}>
                    <Text style={[s.payBtnText, form.paymentMode === mode && s.payBtnTextActive]}>{mode.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {form.paymentMode === 'CREDIT' && (
              <View>
                <Text style={s.fieldLabel}>Due date *</Text>
                <TextInput style={s.fieldInput} placeholder="e.g. 2026-07-30" placeholderTextColor={colors.textPlaceholder}
                  value={form.dueDate} onChangeText={v => setForm(f => ({ ...f, dueDate: v }))} />
                <Text style={{ fontSize: 11, color: colors.textPlaceholder, marginTop: 4 }}>A credit record will be created for this manufacturer</Text>
              </View>
            )}
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleReceive} disabled={submitting}>
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmBtnText}>Confirm Receive</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={showPartnerModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPartnerModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Manufacturer</Text>
            <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={partners}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 8 }}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="business-outline" size={40} color={colors.borderStrong} />
                <Text style={s.emptyText}>No linked manufacturers</Text>
                <Text style={s.emptySub}>Link with a manufacturer from Marketplace first</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={s.partnerRow} onPress={() => { setSelectedPartner(item); setShowPartnerModal(false); }}>
                <Ionicons name="business-outline" size={16} color={colors.primary} />
                <Text style={s.partnerRowText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
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
  body: { flex: 1, padding: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  unit: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  stock: { fontSize: 11, color: colors.success, fontWeight: '500', marginTop: 2 },
  receiveBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primarySurface, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10 },
  receiveBtnText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  payRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  payBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.border, borderWidth: 0.5, borderColor: colors.border },
  payBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  payBtnText: { fontSize: 12, color: colors.textSecondary },
  payBtnTextActive: { color: colors.onPrimary, fontWeight: '500' },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  partnerPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, backgroundColor: colors.surfaceAlt },
  partnerPickerText: { flex: 1, fontSize: 14, color: colors.textPrimary },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  partnerRowText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
});