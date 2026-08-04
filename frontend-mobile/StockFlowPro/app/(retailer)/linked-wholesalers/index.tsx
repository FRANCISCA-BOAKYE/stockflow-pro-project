import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { ThemeColors } from '../../../theme/colors';
import { StatusIndicator } from '../../../components/StatusIndicator';
import { SkeletonRow } from '../../../components/Skeleton';
import { showToast } from '../../../components/toast';
import ListItemCard from '../../../components/ListItemCard';
import EmptyState from '../../../components/EmptyState';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';

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
      showToast('Link request sent!');
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
      showToast('Link accepted!');
      fetchPartners();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Failed to accept link');
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Linked Wholesalers</Text>
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
          <EmptyState icon="people-outline" title="No linked wholesalers" message="Tap Link to connect with a wholesaler" />
        }
        renderItem={({ item }) => {
          const business = item.partnerBusiness?.tierType === 'WHOLESALER' ? item.partnerBusiness : item.requesterBusiness;
          const isPending = item.status === 'PENDING';
          const isIncoming = item.partnerBusiness?.id === user?.businessId;
          return (
            <ListItemCard
              status={isPending ? 'warning' : 'ok'}
              leading={
                <View style={s.cardIcon}>
                  <Ionicons name="business-outline" size={18} color={colors.warning} />
                </View>
              }
              title={business?.name}
              subtitle={`Wholesaler · ID: ${business?.id}`}
              trailing={
                isPending && isIncoming ? (
                  <View style={{ gap: 6, alignItems: 'flex-end' }}>
                    <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(item.id)}>
                      <Text style={s.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <StatusIndicator status="warning" label="Pending" />
                  </View>
                ) : isPending ? (
                  <StatusIndicator status="warning" label="Request sent" />
                ) : (
                  <StatusIndicator status="ok" label="Active" />
                )
              }
            />
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
            <FormField
              label="Wholesaler Business ID"
              placeholder="e.g. 2"
              value={businessId}
              onChangeText={setBusinessId}
              keyboardType="numeric"
            />
            <Text style={{ fontSize: 11, color: colors.textPlaceholder, marginTop: -8, marginBottom: 24 }}>
              Find the business ID from the marketplace listing
            </Text>
            <Button title="Send Link Request" onPress={handleSendRequest} loading={submitting} />
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
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.warningSurface, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: colors.success, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  acceptBtnText: { fontSize: 11, color: colors.onPrimary, fontWeight: '600' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
});