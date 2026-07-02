import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, Alert, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';

export default function LinkedWholesalersScreen() {
  const router = useRouter();
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
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send request');
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
      Alert.alert('Error', e?.response?.data?.message || 'Failed to accept link');
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Linked Wholesalers</Text>
          <Text style={s.sub}>{partners.length} partners</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowRequestModal(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={s.addBtnText}>Link</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={partners}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPartners(); }} tintColor="#1A56DB" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="people-outline" size={40} color="#D1D5DB" />
            <Text style={s.emptyText}>No linked wholesalers</Text>
            <Text style={s.emptySub}>Tap Link to connect with a wholesaler</Text>
          </View>
        }
        renderItem={({ item }) => {
          const business = item.partnerBusiness?.tierType === 'WHOLESALER' ? item.partnerBusiness : item.requesterBusiness;
          const isPending = item.status === 'PENDING';
          return (
            <View style={s.card}>
              <View style={s.cardIcon}>
                <Ionicons name="business-outline" size={18} color="#C27803" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{business?.name}</Text>
                <Text style={s.type}>Wholesaler · ID: {business?.id}</Text>
              </View>
              {isPending ? (
                <View style={{ gap: 6 }}>
                  <TouchableOpacity style={s.acceptBtn} onPress={() => handleAccept(item.id)}>
                    <Text style={s.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <View style={s.pendingBadge}>
                    <Text style={s.pendingText}>Pending</Text>
                  </View>
                </View>
              ) : (
                <View style={s.activeBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <Text style={s.activeText}>Active</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      <Modal visible={showRequestModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRequestModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Link with Wholesaler</Text>
            <TouchableOpacity onPress={() => setShowRequestModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <Text style={s.fieldLabel}>Wholesaler Business ID</Text>
            <TextInput style={s.fieldInput} placeholder="e.g. 2" placeholderTextColor="#9CA3AF"
              value={businessId} onChangeText={setBusinessId} keyboardType="numeric" />
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6, marginBottom: 24 }}>
              Find the business ID from the marketplace listing
            </Text>
            <TouchableOpacity style={[s.confirmBtn, submitting && { opacity: 0.7 }]} onPress={handleSendRequest} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Send Link Request</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1A56DB', borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  addBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  type: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  acceptBtn: { backgroundColor: '#059669', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  acceptBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  pendingBadge: { backgroundColor: '#FFFBEB', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, alignItems: 'center' },
  pendingText: { fontSize: 10, color: '#C27803', fontWeight: '500' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ECFDF5', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
  activeText: { fontSize: 11, color: '#059669', fontWeight: '500' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});