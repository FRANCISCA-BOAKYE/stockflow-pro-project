import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import UnitPicker from '../../../components/UnitPicker';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { useCurrency } from '../../../hooks/useCurrency';
import { ThemeColors } from '../../../theme/colors';
import { StatusIndicator, urgencyBorder } from '../../../components/StatusIndicator';
import { SkeletonRow } from '../../../components/Skeleton';

const LOW_THRESHOLD = 20;

export default function WarehouseScreen() {
  const { colors } = useThemeColors();
  const { country, format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [stock, setStock] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: '', unit: '', quantity: '', minThreshold: '', priceUsd: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastAdded, setLastAdded] = useState('');

  const fetchStock = useCallback(async () => {
    try {
      const res = await api.get('/wholesaler/stock');
      setStock(res.data || []);
    } catch (e) {
      console.log('Error fetching stock:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const handleAddProduct = async () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Product name is required';
    if (!form.unit) errors.unit = 'Please select a unit';
    if (!form.quantity) errors.quantity = 'Quantity is required';
    if (!form.priceUsd) errors.priceUsd = 'Price is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setAddLoading(true);
    try {
      await api.post('/wholesaler/products', {
        name: form.name,
        unit: form.unit,
        quantity: parseInt(form.quantity),
        minThreshold: form.minThreshold ? parseInt(form.minThreshold) : 20,
        priceUsd: parseFloat(form.priceUsd),
      });
      setLastAdded(form.name);
      setForm({ name: '', unit: '', quantity: '', minThreshold: '', priceUsd: '' });
      fetchStock();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = stock.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = stock.filter(i => i.quantity < LOW_THRESHOLD).length;

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Warehouse</Text>
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
        <View>
          <Text style={s.title}>Warehouse</Text>
          <Text style={s.sub}>{stock.length} products in stock</Text>
        </View>
        {lowCount > 0 && (
          <View style={s.alertPill}>
            <Ionicons name="warning-outline" size={12} color={colors.warning} />
            <Text style={s.alertPillText}>{lowCount} low</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textPlaceholder} style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search warehouse stock..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStock(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="archive-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No stock yet</Text>
              <Text style={s.emptySub}>Tap + to add products to your warehouse</Text>
              <TouchableOpacity style={s.emptyActionBtn} onPress={() => { setLastAdded(''); setFieldErrors({}); setShowAddModal(true); }}>
                <Ionicons name="add" size={16} color={colors.onPrimary} />
                <Text style={s.emptyActionBtnText}>Add product</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity < (item.minThreshold || LOW_THRESHOLD);
            return (
              <View style={[s.card, urgencyBorder(isLow ? 'warning' : 'ok', colors), isLow && { paddingLeft: 11 }]}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? colors.dangerSurface : colors.primarySurface }]}>
                  <Ionicons name={isLow ? 'warning-outline' : 'archive-outline'} size={18} color={isLow ? colors.danger : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.unit}>{item.unit}</Text>
                  <Text style={[s.qty, isLow && { color: colors.danger }]}>
                    {item.quantity} {item.unit} in stock
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {item.priceUsd != null && (
                    <Text style={s.price}>{format(Number(item.priceUsd))}</Text>
                  )}
                  <StatusIndicator status={isLow ? 'warning' : 'ok'} label={isLow ? 'Low stock' : 'In stock'} />
                </View>
              </View>
            );
          }}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => { setLastAdded(''); setFieldErrors({}); setShowAddModal(true); }}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add to Warehouse</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            {lastAdded ? (
              <View style={s.addedBanner}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={s.addedBannerText}>"{lastAdded}" added. Keep adding more, or tap ✕ when done.</Text>
              </View>
            ) : (
              <Text style={s.bulkHint}>Tip: this stays open after each save so you can add several items in a row.</Text>
            )}
            {[
              { label: 'Product name *', key: 'name', placeholder: 'e.g. Coca Cola Crate' },
              { label: 'Quantity *', key: 'quantity', placeholder: '100', keyboard: 'numeric' },
              { label: 'Price per unit *', key: 'priceUsd', placeholder: '25.00', keyboard: 'decimal-pad', isMoney: true },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '20', keyboard: 'numeric' },
            ].map((field, i) => (
              <View key={field.key}>
                {i === 1 && (
                  <View style={{ marginBottom: 16 }}>
                    <UnitPicker value={form.unit} onChange={v => { setForm(f => ({ ...f, unit: v })); setFieldErrors(er => ({ ...er, unit: '' })); }} label="Unit *" />
                    {!!fieldErrors.unit && <Text style={s.fieldError}>{fieldErrors.unit}</Text>}
                  </View>
                )}
                <View style={{ marginBottom: 16 }}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  {field.isMoney ? (
                    <View style={s.moneyInputRow}>
                      <Text style={s.moneyPrefix}>{country.currencySymbol}</Text>
                      <TextInput
                        style={s.moneyInput}
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.textPlaceholder}
                        value={(form as any)[field.key]}
                        onChangeText={v => { setForm(f => ({ ...f, [field.key]: v })); setFieldErrors(er => ({ ...er, [field.key]: '' })); }}
                        keyboardType={(field.keyboard as any) || 'default'}
                      />
                    </View>
                  ) : (
                    <TextInput
                      style={s.fieldInput}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.textPlaceholder}
                      value={(form as any)[field.key]}
                      onChangeText={v => { setForm(f => ({ ...f, [field.key]: v })); setFieldErrors(er => ({ ...er, [field.key]: '' })); }}
                      keyboardType={(field.keyboard as any) || 'default'}
                    />
                  )}
                  {!!(fieldErrors as any)[field.key] && <Text style={s.fieldError}>{(fieldErrors as any)[field.key]}</Text>}
                </View>
              </View>
            ))}
            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddProduct} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add to Warehouse'}</Text>}
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
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warningSurface, borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: colors.warning + '33' },
  alertPillText: { fontSize: 11, color: colors.warning, fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  unit: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  qty: { fontSize: 11, color: colors.success, fontWeight: '500', marginTop: 2 },
  price: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  fab: {
    position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: colors.shadow, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }
      : { elevation: 6 }),
  },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder },
  emptyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 16, marginTop: 8 },
  emptyActionBtnText: { fontSize: 13, color: colors.onPrimary, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  fieldError: { fontSize: 11, color: colors.danger, marginTop: 4 },
  moneyInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, backgroundColor: colors.surfaceAlt },
  moneyPrefix: { paddingLeft: 12, fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  moneyInput: { flex: 1, padding: 12, fontSize: 14, color: colors.textPrimary },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  bulkHint: { fontSize: 11, color: colors.textPlaceholder, marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.successSurface, borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: colors.successText, flex: 1 },
});