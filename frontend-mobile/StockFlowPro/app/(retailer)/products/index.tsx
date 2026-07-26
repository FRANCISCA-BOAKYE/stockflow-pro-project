import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../services/api';
import UnitPicker from '../../../components/UnitPicker';
import ImagePickerAvatar from '../../../components/ImagePickerAvatar';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';

const LOW_STOCK = 10;

const CATEGORY_PRESETS = [
  'Toiletries', 'Beverages', 'Snacks & Confectionery', 'Household',
  'Dairy & Eggs', 'Personal Care', 'Cleaning Supplies', 'Stationery',
  'Frozen Foods', 'Bakery', 'Canned & Packaged Foods', 'Baby Products',
];

export default function ProductsScreen() {
  const { token } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({ name: '', categoryId: '', priceUsd: '', quantity: '', minThreshold: '', unit: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get(`/retailer/products${search ? `?search=${search}` : ''}`),
        api.get('/retailer/categories'),
      ]);
      setProducts(prodRes.data?.content || prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (e) {
      console.log('Error fetching products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async () => {
    if (!form.name || !form.priceUsd || !form.quantity || !form.unit) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    setAddLoading(true);
    try {
      const body: any = {
        name: form.name,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        priceUsd: parseFloat(form.priceUsd),
        quantity: parseInt(form.quantity),
        minThreshold: form.minThreshold ? parseInt(form.minThreshold) : 10,
        unit: form.unit,
      };
      if (newProductImage) body.imageBase64 = newProductImage;
      await api.post('/retailer/products', body);
      setLastAdded(form.name);
      // Keep the modal open (and the category selected) so multiple items can be
      // added back-to-back instead of reopening the modal for each one.
      setForm(f => ({ ...f, name: '', priceUsd: '', quantity: '', minThreshold: '', unit: '' }));
      setNewProductImage(null);
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateProductImage = async (productId: number, dataUri: string) => {
    await api.put(`/retailer/products/${productId}/image`, { imageBase64: dataUri });
    fetchData();
  };

  const handleAddCategory = async (name: string) => {
    if (!name.trim()) return;
    if (categories.some((c: any) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      Alert.alert('Already exists', `"${name.trim()}" is already one of your categories.`);
      return;
    }
    setAddingCategory(true);
    try {
      const res = await api.post('/retailer/categories', { name: name.trim() });
      setCategories(prev => [...prev, res.data]);
      setForm(f => ({ ...f, categoryId: String(res.data.id) }));
      setNewCategoryName('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Could not add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.categoryName === selectedCategory;
    return matchSearch && matchCat;
  });

  const lowCount = products.filter(p => p.isLowStock || p.quantity < LOW_STOCK).length;

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <View>
          <Text style={s.title}>Products</Text>
          <Text style={s.sub}>{products.length} items in inventory</Text>
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
          <TextInput style={s.searchInput} placeholder="Search products..." placeholderTextColor={colors.textPlaceholder}
            value={search} onChangeText={setSearch} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['All', ...categories.map((c: any) => c.name)].map(cat => (
              <TouchableOpacity key={cat} style={[s.chip, selectedCategory === cat && s.chipActive]} onPress={() => setSelectedCategory(cat)}>
                <Text style={[s.chipText, selectedCategory === cat && s.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No products yet</Text>
              <Text style={s.emptySub}>Tap + to add your first product</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.isLowStock || item.quantity < LOW_STOCK;
            return (
              <View style={s.card}>
                <ImagePickerAvatar
                  imageUri={item.imageBase64}
                  onChange={(uri) => handleUpdateProductImage(item.id, uri)}
                  size={40}
                  placeholderIcon="cube-outline"
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sku}>{item.categoryName || 'Uncategorized'} · {item.unit}</Text>
                  <Text style={[s.stock, isLow && { color: colors.danger }]}>{item.quantity} {item.unit} in stock</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.price}>${Number(item.priceUsd).toFixed(2)}</Text>
                  <View style={[s.badge, isLow ? s.badgeRed : s.badgeGreen]}>
                    <Text style={[s.badgeText, isLow ? s.badgeTextRed : s.badgeTextGreen]}>
                      {isLow ? 'Low' : 'OK'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </View>

      <TouchableOpacity style={s.fab} onPress={() => { setLastAdded(''); setShowAddModal(true); }}>
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Product</Text>
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
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <ImagePickerAvatar imageUri={newProductImage} onChange={(uri) => setNewProductImage(uri)} size={72} placeholderIcon="cube-outline" />
            </View>
            {[
              { label: 'Product name *', key: 'name', placeholder: 'e.g. Coca Cola 500ml' },
              { label: 'Price (USD) *', key: 'priceUsd', placeholder: '1.50', keyboard: 'decimal-pad' },
              { label: 'Quantity *', key: 'quantity', placeholder: '100', keyboard: 'numeric' },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '10', keyboard: 'numeric' },
            ].map((field, i) => (
              <View key={field.key}>
                {i === 2 && (
                  <UnitPicker value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))} label="Unit *" />
                )}
                <View style={{ marginBottom: 16 }}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={s.fieldInput}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textPlaceholder}
                    value={(form as any)[field.key]}
                    onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                    keyboardType={(field.keyboard as any) || 'default'}
                  />
                </View>
              </View>
            ))}

            <View style={{ marginBottom: 16 }}>
              <Text style={s.fieldLabel}>Category</Text>
              {categories.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {categories.map((cat: any) => (
                      <TouchableOpacity key={cat.id} style={[s.chip, form.categoryId === String(cat.id) && s.chipActive]}
                        onPress={() => setForm(f => ({ ...f, categoryId: String(cat.id) }))}>
                        <Text style={[s.chipText, form.categoryId === String(cat.id) && s.chipTextActive]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}

              <Text style={s.presetLabel}>Add a category — pick a suggestion or type your own</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORY_PRESETS
                    .filter(p => !categories.some((c: any) => c.name.toLowerCase() === p.toLowerCase()))
                    .map(preset => (
                      <TouchableOpacity key={preset} style={s.presetChip} onPress={() => handleAddCategory(preset)} disabled={addingCategory}>
                        <Ionicons name="add" size={12} color={colors.primary} />
                        <Text style={s.presetChipText}>{preset}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[s.fieldInput, { flex: 1 }]}
                  placeholder="Custom category name"
                  placeholderTextColor={colors.textPlaceholder}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity style={s.addCategoryBtn} onPress={() => handleAddCategory(newCategoryName)} disabled={addingCategory}>
                  {addingCategory ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="add" size={18} color={colors.onPrimary} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddProduct} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add Product'}</Text>}
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
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 0.5, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.onPrimary, fontWeight: '500' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  sku: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  stock: { fontSize: 11, color: colors.success, fontWeight: '500', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: colors.successSurface },
  badgeRed: { backgroundColor: colors.dangerSurface },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: colors.successText },
  badgeTextRed: { color: colors.dangerText },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
  bulkHint: { fontSize: 11, color: colors.textPlaceholder, marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.successSurface, borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: colors.successText, flex: 1 },
  presetLabel: { fontSize: 11, color: colors.textPlaceholder, marginBottom: 8 },
  presetChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.primarySurface, borderWidth: 0.5, borderColor: colors.primary + '40' },
  presetChipText: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  addCategoryBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
