import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

export default function RetailerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/reports/dashboard');
      setData(res.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 401) {
        await clearAuth();
        router.replace('/(auth)/login');
      } else {
        setError('Could not load dashboard. Pull down to retry.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const kpis = [
    {
      label: 'TOTAL PRODUCTS',
      value: data?.totalProducts ?? '—',
      sub: 'in inventory',
      icon: 'cube-outline',
      iconBg: '#EFF6FF',
      iconColor: '#1A56DB',
    },
    {
      label: 'LOW STOCK',
      value: data?.lowStockCount ?? '—',
      sub: 'need restocking',
      icon: 'warning-outline',
      iconBg: '#FFFBEB',
      iconColor: '#C27803',
    },
    {
      label: "TODAY'S SALES",
      value: data?.todaySalesUsd != null
        ? `$${data.todaySalesUsd.toFixed(2)}`
        : '—',
      sub: 'revenue',
      icon: 'receipt-outline',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      label: 'CREDIT OWED',
      value: data?.totalCreditOwedByCustomers != null
        ? `$${data.totalCreditOwedByCustomers.toFixed(2)}`
        : '—',
      sub: 'outstanding',
      icon: 'wallet-outline',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
    },
  ];

  const quickActions = [
    { label: 'New sale', icon: 'cart-outline', bg: '#EFF6FF', color: '#1A56DB', route: '/(retailer)/pos' },
    { label: 'Products', icon: 'cube-outline', bg: '#ECFDF5', color: '#059669', route: '/(retailer)/products' },
    { label: 'Credit', icon: 'wallet-outline', bg: '#FFFBEB', color: '#C27803', route: '/(retailer)/credit' },
    { label: 'More', icon: 'ellipsis-horizontal-outline', bg: '#F3F4F6', color: '#6B7280', route: '/(retailer)/more' },
  ];

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#1A56DB" />
        <Text style={s.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.page}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchDashboard(); }}
            tintColor="#1A56DB"
          />
        }
      >
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.userName}>{user?.name ?? 'User'}</Text>
              <Text style={s.bizName}>
                {data?.businessName ?? user?.businessName} · Retailer
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              {(data?.subscriptionStatus ?? user?.subscriptionStatus) === 'TRIAL' && (
                <View style={s.trialPill}>
                  <Text style={s.trialText}>TRIAL</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={s.heroLabel}>Today's revenue</Text>
            <Text style={s.heroAmount}>
              {data?.todaySalesUsd != null
                ? `$${data.todaySalesUsd.toFixed(2)}`
                : '$0.00'}
            </Text>
          </View>
        </View>

        <View style={s.body}>
          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.kpiGrid}>
            {kpis.map((k, i) => (
              <View key={i} style={s.kpiCard}>
                <View style={[s.kpiIcon, { backgroundColor: k.iconBg }]}>
                  <Ionicons name={k.icon as any} size={17} color={k.iconColor} />
                </View>
                <Text style={s.kpiLabel}>{k.label}</Text>
                <Text style={s.kpiValue}>{k.value}</Text>
                <Text style={s.kpiSub}>{k.sub}</Text>
              </View>
            ))}
          </View>

          {(data?.overdueAccountsCount ?? 0) > 0 && (
            <TouchableOpacity
              style={s.alertCard}
              onPress={() => router.push('/(retailer)/credit' as any)}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#C27803" />
              <Text style={s.alertText}>
                {data.overdueAccountsCount} overdue credit account
                {data.overdueAccountsCount > 1 ? 's' : ''} — tap to review
              </Text>
            </TouchableOpacity>
          )}

          <Text style={s.sectionTitle}>Quick actions</Text>
          <View style={s.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={s.actionCard}
                onPress={() => router.push(a.route as any)}
              >
                <View style={[s.actionIcon, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon as any} size={18} color={a.color} />
                </View>
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent transactions</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {[
            { name: 'Walk-in sale', time: 'Today · 9:41 AM · Cash', amount: '+$84.50', positive: true },
            { name: 'Stock replenishment', time: 'Yesterday · 3:12 PM', amount: '-$640.00', positive: false },
            { name: 'Walk-in sale', time: 'Yesterday · 11:05 AM · Card', amount: '+$32.00', positive: true },
          ].map((t, i) => (
            <View key={i} style={[s.txn, { marginBottom: i < 2 ? 6 : 0 }]}>
              <View style={[s.txnIcon, { backgroundColor: t.positive ? '#ECFDF5' : '#F8FAFC' }]}>
                <Ionicons
                  name={t.positive ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={16}
                  color={t.positive ? '#059669' : '#64748B'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.txnName}>{t.name}</Text>
                <Text style={s.txnTime}>{t.time}</Text>
              </View>
              <Text style={[s.txnAmount, { color: t.positive ? '#059669' : '#0F172A' }]}>
                {t.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  hero: { backgroundColor: '#1A56DB', padding: 20, paddingTop: 24, paddingBottom: 40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2, letterSpacing: -0.3 },
  bizName: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  trialPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9 },
  trialText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  heroLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  heroAmount: { fontSize: 30, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  body: { padding: 14, marginTop: -20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { fontSize: 12, color: '#DC2626', flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  kpiCard: { width: '47.5%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', padding: 14 },
  kpiIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiLabel: { fontSize: 9, color: '#64748B', fontWeight: '500', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  kpiSub: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBEB', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(194,120,3,0.2)', padding: 12, marginBottom: 16 },
  alertText: { fontSize: 12, color: '#C27803', fontWeight: '500', flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#0F172A', marginBottom: 10, marginTop: 4 },
  seeAll: { fontSize: 11, color: '#1A56DB', fontWeight: '500' },
  actionsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 13, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', padding: 12, alignItems: 'center', gap: 5 },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 9, fontWeight: '500', color: '#64748B', textAlign: 'center' },
  txn: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  txnIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txnName: { fontSize: 12, fontWeight: '600', color: '#0F172A' },
  txnTime: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  txnAmount: { fontSize: 13, fontWeight: '700' },
});