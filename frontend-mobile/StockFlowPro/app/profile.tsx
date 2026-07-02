import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  MANUFACTURER: { color: '#1A56DB', bg: '#EFF6FF', icon: 'construct-outline' },
  WHOLESALER: { color: '#C27803', bg: '#FFFBEB', icon: 'archive-outline' },
  RETAILER: { color: '#059669', bg: '#ECFDF5', icon: 'storefront-outline' },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [subAccounts, setSubAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/sub-accounts')
      .then(res => setSubAccounts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)/login'); } }
    ]);
  };

  const tier = user?.tierType || 'RETAILER';
  const tc = TIER_CONFIG[tier] || TIER_CONFIG.RETAILER;
  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={[s.avatar, { backgroundColor: tc.bg }]}>
            <Text style={[s.avatarText, { color: tc.color }]}>{initials}</Text>
          </View>
          <Text style={s.userName}>{user?.name || 'User'}</Text>
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={[s.tierBadge, { backgroundColor: tc.bg }]}>
            <Ionicons name={tc.icon as any} size={12} color={tc.color} />
            <Text style={[s.tierBadgeText, { color: tc.color }]}>{tier}</Text>
          </View>
        </View>

        {/* Business info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Business</Text>
          {[
            { label: 'Business name', value: user?.businessName },
            { label: 'Plan', value: `${user?.subscriptionPlan} · ${user?.subscriptionStatus}` },
            { label: 'Role', value: user?.role || 'Admin' },
          ].map(item => (
            <View key={item.label} style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue}>{item.value || '—'}</Text>
            </View>
          ))}
        </View>

        {/* Sub-accounts */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Team members</Text>
          {loading ? (
            <ActivityIndicator color="#1A56DB" style={{ marginVertical: 12 }} />
          ) : subAccounts.length === 0 ? (
            <Text style={s.emptyText}>No sub-accounts yet. Invite team members from the web dashboard.</Text>
          ) : (
            subAccounts.map((acc: any, i: number) => (
              <View key={i} style={s.memberRow}>
                <View style={s.memberIcon}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{acc.role}</Text>
                  <Text style={s.memberEmail}>{acc.email}</Text>
                </View>
                <View style={[s.activeDot, { backgroundColor: acc.isActive ? '#059669' : '#9CA3AF' }]} />
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.actionRow} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="card-outline" size={18} color="#1A56DB" style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Subscription & billing</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionRow, { borderTopWidth: 0.5, borderTopColor: '#F3F4F6' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 12 }} />
            <Text style={[s.actionText, { color: '#DC2626' }]}>Log out</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  tierBadgeText: { fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  memberIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  memberEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionText: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },
});