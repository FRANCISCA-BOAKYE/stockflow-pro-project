import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  useColorScheme, StatusBar, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

interface DashboardData {
  businessName?: string;
  tierType?: string;
  subscriptionStatus?: string;
  totalProducts?: number;
  lowStockCount?: number;
  todaySalesUsd?: number;
  totalCreditOwedByCustomers?: number;
  overdueAccountsCount?: number;
}

export default function RetailerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const c = dark ? DARK : LIGHT;

  const [data, setData] = useState<DashboardData | null>(null);
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
      iconName: 'box',
      iconBg: dark ? '#1A2A4A' : '#EFF6FF',
      iconColor: '#1A56DB',
    },
    {
      label: 'LOW STOCK',
      value: data?.lowStockCount ?? '—',
      sub: 'need restocking',
      iconName: 'alert-triangle',
      iconBg: dark ? '#2A1F0A' : '#FFFBEB',
      iconColor: '#C27803',
    },
    {
      label: "TODAY'S SALES",
      value: data?.todaySalesUsd != null
        ? `$${data.todaySalesUsd.toFixed(2)}`
        : '—',
      sub: 'revenue',
      iconName: 'receipt',
      iconBg: dark ? '#0A2018' : '#ECFDF5',
      iconColor: '#0E9F6E',
    },
    {
      label: 'CREDIT OWED',
      value: data?.totalCreditOwedByCustomers != null
        ? `$${data.totalCreditOwedByCustomers.toFixed(2)}`
        : '—',
      sub: 'outstanding',
      iconName: 'credit-card',
      iconBg: dark ? '#2A0A0A' : '#FEF2F2',
      iconColor: '#DC2626',
    },
  ];

  const quickActions = [
    { label: 'New sale', icon: 'shopping-cart', bg: dark ? '#1A2A4A' : '#EFF6FF', color: '#1A56DB', route: '/(retailer)/pos' },
    { label: 'Stock in', icon: 'package', bg: dark ? '#0A2018' : '#ECFDF5', color: '#0E9F6E', route: null },
    { label: 'Invoices', icon: 'file-invoice', bg: dark ? '#2A1F0A' : '#FFFBEB', color: '#C27803', route: '/(shared)/invoices' },
    { label: 'Credit', icon: 'users', bg: dark ? '#2A0A0A' : '#FEF2F2', color: '#DC2626', route: '/(retailer)/credit' },
  ];

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: c.bg }]}>
        <ActivityIndicator size="large" color="#1A56DB" />
        <Text style={[s.loadingText, { color: c.text2 }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[s.page, { backgroundColor: c.bg }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'light-content'} backgroundColor="#1A56DB" />
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
        {/* ── Hero ── */}
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
            <Text style={s.revenueLabel}>Today's revenue</Text>
            <Text style={s.revenueAmount}>
              {data?.todaySalesUsd != null
                ? `$${data.todaySalesUsd.toFixed(2)}`
                : '$0.00'}
            </Text>
          </View>
        </View>

        <View style={[s.body]}>
          {error ? (
            <View style={[s.errorBox, { backgroundColor: dark ? '#2A0A0A' : '#FEF2F2' }]}>
              <Text style={[s.errorText, { color: '#DC2626' }]}>{error}</Text>
            </View>
          ) : null}

          {/* ── KPI Grid ── */}
          <View style={s.kpiGrid}>
            {kpis.map((k, i) => (
              <View key={i} style={[s.kpiCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={[s.kpiIcon, { backgroundColor: k.iconBg }]}>
                  <Text style={{ color: k.iconColor, fontSize: 15 }}>
                    {k.iconName === 'box' ? '▣' :
                     k.iconName === 'alert-triangle' ? '△' :
                     k.iconName === 'receipt' ? '≡' : '▤'}
                  </Text>
                </View>
                <Text style={[s.kpiLabel, { color: c.text2 }]}>{k.label}</Text>
                <Text style={[s.kpiValue, { color: c.text1 }]}>{k.value}</Text>
                <Text style={[s.kpiSub, { color: c.text3 }]}>{k.sub}</Text>
              </View>
            ))}
          </View>

          {/* ── Overdue alert ── */}
          {(data?.overdueAccountsCount ?? 0) > 0 && (
            <TouchableOpacity
              style={[s.alertCard, { backgroundColor: dark ? '#2A1F0A' : '#FFFBEB', borderColor: 'rgba(194,120,3,0.2)' }]}
              onPress={() => router.push('/(retailer)/credit' as any)}
            >
              <Text style={[s.alertText, { color: '#C27803' }]}>
                {data!.overdueAccountsCount} overdue credit account
                {data!.overdueAccountsCount! > 1 ? 's' : ''} — tap to review
              </Text>
            </TouchableOpacity>
          )}

          {/* ── Quick actions ── */}
          <Text style={[s.sectionTitle, { color: c.text1 }]}>Quick actions</Text>
          <View style={s.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[s.actionCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => a.route && router.push(a.route as any)}
              >
                <View style={[s.actionIcon, { backgroundColor: a.bg }]}>
                  <Text style={{ fontSize: 16, color: a.color }}>
                    {i === 0 ? '🛒' : i === 1 ? '📦' : i === 2 ? '🧾' : '👥'}
                  </Text>
                </View>
                <Text style={[s.actionLabel, { color: c.text2 }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Recent transactions ── */}
          <View style={[s.sectionHeader, { marginTop: 20 }]}>
            <Text style={[s.sectionTitle, { color: c.text1 }]}>Recent transactions</Text>
            <TouchableOpacity>
              <Text style={s.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {[
            { name: 'Bolt Co. Order', time: 'Today · 9:41 AM · Cash', amount: '+$1,200.00', positive: true },
            { name: 'Stock replenishment', time: 'Yesterday · 3:12 PM', amount: '-$640.00', positive: false },
            { name: 'Walk-in sale', time: 'Yesterday · 11:05 AM · Card', amount: '+$84.50', positive: true },
          ].map((t, i) => (
            <View key={i} style={[s.txn, { backgroundColor: c.surface, borderColor: c.border, marginBottom: i < 2 ? 6 : 0 }]}>
              <View style={[s.txnIcon, { backgroundColor: t.positive ? (dark ? '#0A2018' : '#ECFDF5') : c.surface2 }]}>
                <Text style={{ fontSize: 14, color: t.positive ? '#0E9F6E' : c.text2 }}>
                  {t.positive ? '↙' : '↗'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.txnName, { color: c.text1 }]}>{t.name}</Text>
                <Text style={[s.txnTime, { color: c.text3 }]}>{t.time}</Text>
              </View>
              <Text style={[s.txnAmount, { color: t.positive ? '#0E9F6E' : c.text1 }]}>
                {t.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const LIGHT = {
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  surface2: '#F8FAFC',
  border: 'rgba(0,0,0,0.07)',
  text1: '#0F172A',
  text2: '#64748B',
  text3: '#94A3B8',
};
const DARK = {
  bg: '#0B1220',
  surface: '#141E2E',
  surface2: '#1C2840',
  border: 'rgba(255,255,255,0.06)',
  text1: '#F1F5F9',
  text2: '#94A3B8',
  text3: '#475569',
};

const s = StyleSheet.create({
  page: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  hero: {
    backgroundColor: '#1A56DB',
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 3, letterSpacing: 0.3 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2, letterSpacing: -0.3 },
  bizName: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  trialPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9,
  },
  trialText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  revenueLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  revenueAmount: { fontSize: 30, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  body: { padding: 14, marginTop: -20 },
  errorBox: { borderRadius: 12, padding: 12, marginBottom: 12 },
  errorText: { fontSize: 12, textAlign: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  kpiCard: {
    width: '47.5%',
    borderRadius: 16, borderWidth: 0.5,
    padding: 14,
  },
  kpiIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  kpiSub: { fontSize: 10, marginTop: 2 },
  alertCard: {
    borderRadius: 12, borderWidth: 0.5,
    padding: 12, marginBottom: 16,
  },
  alertText: { fontSize: 12, fontWeight: '500', lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  seeAll: { fontSize: 11, color: '#1A56DB', fontWeight: '500' },
  actionsGrid: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  actionCard: {
    flex: 1, borderRadius: 13, borderWidth: 0.5,
    padding: 12, alignItems: 'center', gap: 5,
  },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 9, fontWeight: '500', textAlign: 'center' },
  txn: {
    borderRadius: 12, borderWidth: 0.5,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  txnIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txnName: { fontSize: 12, fontWeight: '600' },
  txnTime: { fontSize: 10, marginTop: 1 },
  txnAmount: { fontSize: 13, fontWeight: '700', marginLeft: 'auto' },
});