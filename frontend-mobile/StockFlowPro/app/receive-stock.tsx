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
import { useCurrency } from '../hooks/useCurrency';
import { ThemeColors } from '../theme/colors';
import { StatusIndicator, urgencyBorder } from '../components/StatusIndicator';
import { SkeletonRow } from '../components/Skeleton';
import { showToast } from '../components/toast';

const PAYMENT_MODES = ['CASH', 'CARD', 'MOBILE_MONEY', 'CREDIT'];

export default function ReceiveStockScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const { country } = useCurrency();
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateQuantity = (delta: number) => {
    setForm(f => {
      const current = parseInt(f.quantity || '0', 10) || 0;
      return { ...f, quantity: String(Math.max(0, current + delta)) };
    });
    setFieldErrors(fe => ({ ...fe, quantity: '' }));
  };

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
    const errors: Record<string, string> = {};
    if (!form.quantity || parseInt(form.quantity, 10) <= 0) errors.quantity = 'Enter a quantity received';
    if (!form.amountUsd) errors.amountUsd = 'Enter the total cost';
    if (!selectedPartner) errors.partner = 'Select which manufacturer this stock is from';
    if (form.paymentMode === 'CREDIT' && !form.dueDate.trim()) errors.dueDate = 'Enter a due date for credit payment';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
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
      showToast(`${form.quantity} units of ${selectedProduct.name} received!`);
      setShowModal(false);
      setForm({ quantity: '', amountUsd: '', paymentMode: 'CASH', dueDate: '' });
      setFieldErrors({});
      setSelectedProduct(null);
      setSelectedPartner(null);
      fetchStock();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Receive stock failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Receive Stock</Text>
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
              <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(wholesaler)/warehouse' as any)}>
                <Ionicons name="add-circle-outline" size={16} color={colors.onPrimary} style={{ marginRight: 6 }} />
                <Text style={s.emptyBtnText}>Go to warehouse</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < (item.minThreshold || 20);
            return (
              <TouchableOpacity
                style={[s.card, urgencyBorder(isLow ? 'warning' : 'ok', colors), isLow && { paddingLeft: 11 }]}
                onPress={() => { setSelectedProduct(item); setSelectedPartner(null); setFieldErrors({}); setShowModal(true); }}
              >
                <View style={[s.cardIcon, { backgroundColor: isLow ? colors.dangerSurface : colors.primarySurface }]}>
                  <Ionicons name="archive-outline" size={18} color={isLow ? colors.danger : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit}</Text>
                  <Text style={[s.stock, isLow && { color: colors.danger }]}>{item.quantity} in stock</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <StatusIndicator status={isLow ? 'warning' : 'ok'} label={isLow ? 'Low' : 'In stock'} />
                  <View style={s.receiveBtn}>
                    <Ionicons name="add" size={14} color={colors.primary} />
                    <Text style={s.receiveBtnText}>Receive</Text>
                  </View>
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
              <View style={s.stepperRow}>
                <TouchableOpacity style={s.stepBtn} onPress={() => updateQuantity(-1)}>
                  <Ionicons name="remove" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={s.stepNum}>{form.quantity || '0'}</Text>
                <TouchableOpacity style={[s.stepBtn, s.stepBtnBlue]} onPress={() => updateQuantity(1)}>
                  <Ionicons name="add" size={18} color={colors.onPrimary} />
                </TouchableOpacity>
              </View>
              {!!fieldErrors.quantity && <Text style={s.errorText}>{fieldErrors.quantity}</Text>}
            </View>
            <View>
              <Text style={s.fieldLabel}>Total cost *</Text>
              <View style={[s.fieldInputRow, fieldErrors.amountUsd && { borderColor: colors.danger }]}>
                <Text style={s.currencyPrefix}>{country.currencySymbol}</Text>
                <TextInput style={s.fieldInputInner} placeholder="e.g. 2500.00" placeholderTextColor={colors.textPlaceholder}
                  value={form.amountUsd} onChangeText={v => { setForm(f => ({ ...f, amountUsd: v })); setFieldErrors(fe => ({ ...fe, amountUsd: '' })); }} keyboardType="decimal-pad" />
              </View>
              {!!fieldErrors.amountUsd && <Text style={s.errorText}>{fieldErrors.amountUsd}</Text>}
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
              {!!fieldErrors.partner && <Text style={s.errorText}>{fieldErrors.partner}</Text>}
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
                  value={form.dueDate} onChangeText={v => { setForm(f => ({ ...f, dueDate: v })); setFieldErrors(fe => ({ ...fe, dueDate: '' })); }} />
                {!!fieldErrors.dueDate && <Text style={s.errorText}>{fieldErrors.dueDate}</Text>}
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
                <TouchableOpacity style={s.emptyBtn} onPress={() => { setShowPartnerModal(false); router.push('/marketplace' as any); }}>
                  <Ionicons name="storefront-outline" size={16} color={colors.onPrimary} style={{ marginRight: 6 }} />
                  <Text style={s.emptyBtnText}>Go to marketplace</Text>
                </TouchableOpacity>
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
  emptyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, marginTop: 8 },
  emptyBtnText: { color: colors.onPrimary, fontSize: 13, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  fieldInputInner: { flex: 1, padding: 12, fontSize: 14, color: colors.textPrimary },
  currencyPrefix: { paddingLeft: 12, color: colors.textMuted, fontWeight: '600' },
  errorText: { fontSize: 11, color: colors.danger, marginTop: 4 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 0.5, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  stepBtnBlue: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepNum: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, minWidth: 40, textAlign: 'center' },
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