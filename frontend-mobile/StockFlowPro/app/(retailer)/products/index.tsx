import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, SafeAreaView, ActivityIndicator,
  Alert, Modal, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../services/api';

const LOW_STOCK = 10;

const CATEGORY_PRESETS = [
  'Toiletries', 'Beverages', 'Snacks & Confectionery', 'Household',
  'Dairy & Eggs', 'Personal Care', 'Cleaning Supplies', 'Stationery',
  'Frozen Foods', 'Bakery', 'Canned & Packaged Foods', 'Baby Products',
];

export default function ProductsScreen() {
  const { token } = useAuthStore();
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
      await api.post('/retailer/products', {
        name: form.name,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        priceUsd: parseFloat(form.priceUsd),
        quantity: parseInt(form.quantity),
        minThreshold: form.minThreshold ? parseInt(form.minThreshold) : 10,
        unit: form.unit,
      });
      setLastAdded(form.name);
      // Keep the modal open (and the category selected) so multiple items can be
      // added back-to-back instead of reopening the modal for each one.
      setForm(f => ({ ...f, name: '', priceUsd: '', quantity: '', minThreshold: '', unit: '' }));
      fetchData();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to add product');
    } finally {
      setAddLoading(false);
    }
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
      <ActivityIndicator size="large" color="#1A56DB" />
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
            <Ionicons name="warning-outline" size={12} color="#C27803" />
            <Text style={s.alertPillText}>{lowCount} low</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        <View style={s.searchRow}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={s.searchInput} placeholder="Search products..." placeholderTextColor="#9CA3AF"
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1A56DB" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={40} color="#D1D5DB" />
              <Text style={s.emptyText}>No products yet</Text>
              <Text style={s.emptySub}>Tap + to add your first product</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.isLowStock || item.quantity < LOW_STOCK;
            return (
              <View style={s.card}>
                <View style={[s.cardIcon, { backgroundColor: isLow ? '#FEF2F2' : '#EFF6FF' }]}>
                  <Ionicons name="cube-outline" size={18} color={isLow ? '#DC2626' : '#1A56DB'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.sku}>{item.categoryName || 'Uncategorized'} · {item.unit}</Text>
                  <Text style={[s.stock, isLow && { color: '#DC2626' }]}>{item.quantity} {item.unit} in stock</Text>
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
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Product</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalBody}>
            {lastAdded ? (
              <View style={s.addedBanner}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={s.addedBannerText}>"{lastAdded}" added. Keep adding more, or tap ✕ when done.</Text>
              </View>
            ) : (
              <Text style={s.bulkHint}>Tip: this stays open after each save so you can add several items in a row.</Text>
            )}
            {[
              { label: 'Product name *', key: 'name', placeholder: 'e.g. Coca Cola 500ml' },
              { label: 'Price (USD) *', key: 'priceUsd', placeholder: '1.50', keyboard: 'decimal-pad' },
              { label: 'Quantity *', key: 'quantity', placeholder: '100', keyboard: 'numeric' },
              { label: 'Unit *', key: 'unit', placeholder: 'e.g. bottle, kg, crate' },
              { label: 'Min threshold', key: 'minThreshold', placeholder: '10', keyboard: 'numeric' },
            ].map(field => (
              <View key={field.key} style={{ marginBottom: 16 }}>
                <Text style={s.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={s.fieldInput}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  keyboardType={(field.keyboard as any) || 'default'}
                />
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
                        <Ionicons name="add" size={12} color="#1A56DB" />
                        <Text style={s.presetChipText}>{preset}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </ScrollView>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={[s.fieldInput, { flex: 1 }]}
                  placeholder="Custom category name"
                  placeholderTextColor="#9CA3AF"
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                />
                <TouchableOpacity style={s.addCategoryBtn} onPress={() => handleAddCategory(newCategoryName)} disabled={addingCategory}>
                  {addingCategory ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="add" size={18} color="#fff" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[s.confirmBtn, addLoading && { opacity: 0.7 }]} onPress={handleAddProduct} disabled={addLoading}>
              {addLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmText}>{lastAdded ? 'Add Another' : 'Add Product'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  alertPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 0.5, borderColor: 'rgba(194,120,3,0.2)' },
  alertPillText: { fontSize: 11, color: '#C27803', fontWeight: '500' },
  body: { flex: 1, padding: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', borderRadius: 12, paddingHorizontal: 12, marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 13, color: '#374151' },
  chip: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#fff', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  chipActive: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  chipText: { fontSize: 12, color: '#374151' },
  chipTextActive: { color: '#fff', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  sku: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  stock: { fontSize: 11, color: '#059669', fontWeight: '500', marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 10, fontWeight: '500' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextRed: { color: '#991B1B' },
  fab: { position: 'absolute', bottom: 90, right: 16, width: 50, height: 50, backgroundColor: '#1A56DB', borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#1A56DB', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalBody: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bulkHint: { fontSize: 11, color: '#9CA3AF', marginBottom: 16, fontStyle: 'italic' },
  addedBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginBottom: 16 },
  addedBannerText: { fontSize: 11, color: '#065F46', flex: 1 },
  presetLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  presetChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#EFF6FF', borderWidth: 0.5, borderColor: '#BFDBFE' },
  presetChipText: { fontSize: 11, color: '#1A56DB', fontWeight: '500' },
  addCategoryBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center' },
});