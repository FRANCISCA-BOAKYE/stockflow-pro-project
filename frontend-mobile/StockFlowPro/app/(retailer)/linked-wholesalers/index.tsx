import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';

export default function LinkedWholesalersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await api.get('/links/partners');
      const wholesalers = (res.data || []).filter((p: any) =>
        p.partnerBusiness?.tierType === 'WHOLESALER' || p.requesterBusiness?.tierType === 'WHOLESALER'
      );
      setPartners(wholesalers);
    } catch (e) {
      console.log('Error fetching partners:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleSendRequest = async () => {
    if (!businessId.trim()) { Alert.alert('Missing info', 'Please enter a business ID'); return; }
    setSubmitting(true);
    try {
      await api.post('/links/request', { partnerBusinessId: parseInt(businessId) });
      Alert.alert('Success', 'Link request sent!');
      setShowRequestModal(false);
      setBusinessId('');
      fetchPartners();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (linkId: number) => {
    try {
      await api.post('/links/accept', { linkId });
      Alert.alert('Success', 'Link accepted!');
      fetchPartners();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to accept link');
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Linked Wholesalers</Text>
          <Text style={s.sub}>{partners.length} partners</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowRequestModal(true)}>
          <Ionicons name="add" size={18} color={colors.onPrimary} />
          <Text style={s.addBtnText}>Link</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={partners}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPartners(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color={colors.borderStrong} />
            <Text style={s.emptyText}>No linked wholesalers</Text>
            <Text style={s.emptySub}>Tap Link to connect with a wholesaler</Text>
          </View>
        }
        renderItem={({ item }) => {
          const business = item.partnerBusiness?.tierType === 'WHOLESALER' ? item.partnerBusiness : item.requesterBusiness;
          const isPending = item.status === 'PENDING';
          const isIncoming = item.partnerBusiness?.id === user?.businessId;
          return (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="business-outline" size={18} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{business?.name}</Text>
                <Text style={s.type}>Wholesaler · ID: {business?.id}</Text>
              </View>
              {isPending && isIncoming ? (
                <View style={{ gap: 6 }}>
                  <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(item.id)}>
                    <Text style={s.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <View style={s.pendingBadge}>
                    <Text style={s.pendingText}>Pending</Text>
                  </View>
                </View>
              ) : isPending ? (
                <View style={s.pendingBadge}>
                  <Text style={s.pendingText}>Request sent</Text>
                </View>
              ) : (
                <View style={s.activeBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                  <Text style={s.activeText}>Active</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal visible={showRequestModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRequestModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Link with Wholesaler</Text>
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={s.fieldLabel}>Wholesaler Business ID</Text>
            <TextInput style={s.fieldInput} placeholder="e.g. 2" placeholderTextColor={colors.textPlaceholder}
              value={businessId} onChangeText={setBusinessId} keyboardType="numeric" />
            <Text style={{ fontSize: 11, color: colors.textPlaceholder, marginTop: 6, marginBottom: 24 }}>
              Find the business ID from the marketplace listing
            </Text>
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleSendRequest} disabled={submitting}>
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.confirmBtnText}>Send Link Request</Text>}
            </TouchableOpacity>
          </View>
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
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  addBtnText: { fontSize: 13, color: colors.onPrimary, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.warningSurface, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  type: { fontSize: 11, color: colors.textPlaceholder, marginTop: 2 },
  acceptBtn: { backgroundColor: colors.success, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  acceptBtnText: { fontSize: 11, color: colors.onPrimary, fontWeight: '600' },
  pendingBadge: { backgroundColor: colors.warningSurface, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, alignItems: 'center' },
  pendingText: { fontSize: 10, color: colors.warning, fontWeight: '500' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.successSurface, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  activeText: { fontSize: 11, color: colors.success, fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});