import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCurrency } from '../../hooks/useCurrency';
import { ThemeColors } from '../../theme/colors';
import { SkeletonRow } from '../../components/Skeleton';

export default function ManufacturerDashboard() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { colors } = useThemeColors();
  const { format } = useCurrency();
  const s = useMemo(() => makeStyles(colors), [colors]);
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

  const trialDaysLeft = (() => {
    const startedAt = data?.trialStartedAt ?? user?.trialStartedAt;
    if (!startedAt) return null;
    const start = new Date(startedAt);
    const daysElapsed = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
    const left = 14 - daysElapsed;
    return left;
  })();

  const kpis = [
    { label: 'RAW MATERIALS', value: data?.totalMaterials ?? '—', sub: 'in stock', icon: 'flask-outline', iconBg: colors.primarySurface, iconColor: colors.primary },
    { label: 'LOW STOCK', value: data?.lowStockCount ?? '—', sub: 'need restocking', icon: 'warning-outline', iconBg: colors.warningSurface, iconColor: colors.warning },
    { label: 'PRODUCTION RUNS', value: data?.productionRunsThisMonth ?? '—', sub: 'this month', icon: 'construct-outline', iconBg: colors.successSurface, iconColor: colors.success },
    { label: 'CREDIT OWED', value: format(Number(data?.totalCreditOwedByWholesalers ?? 0)), sub: 'by wholesalers', icon: 'wallet-outline', iconBg: colors.dangerSurface, iconColor: colors.danger },
  ];

  const quickActions = [
    { label: 'Production', icon: 'construct-outline', bg: colors.primarySurface, color: colors.primary, route: '/(manufacturer)/production' },
    { label: 'Materials', icon: 'flask-outline', bg: colors.successSurface, color: colors.success, route: '/(manufacturer)/materials' },
    { label: 'Dispatch', icon: 'cube-outline', bg: colors.warningSurface, color: colors.warning, route: '/(manufacturer)/dispatch' },
    { label: 'Credit', icon: 'wallet-outline', bg: colors.dangerSurface, color: colors.danger, route: '/(manufacturer)/credit' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={s.page}>
        <View style={s.header}>
          <Text style={s.title}>Dashboard</Text>
        </View>
        <View style={{ padding: 12, gap: 8 }}>
          {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
        </View>
      </SafeAreaView>
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
            tintColor={colors.primary}
          />
        }
      >
        <View style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.userName}>{user?.name ?? 'User'}</Text>
              <Text style={s.bizName}>
                {data?.businessName ?? user?.businessName} · Manufacturer
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
            <Text style={s.heroLabel}>Credit outstanding</Text>
            <Text style={s.heroAmount}>
              {format(Number(data?.totalCreditOwedByWholesalers ?? 0))}
            </Text>
          </View>
        </View>

        <View style={s.body}>
          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {(data?.subscriptionStatus ?? user?.subscriptionStatus) === 'TRIAL' && trialDaysLeft !== null && trialDaysLeft <= 4 && trialDaysLeft > 0 && (
            <TouchableOpacity style={s.trialCard} onPress={() => router.push('/subscription' as any)}>
              <Ionicons name="time-outline" size={16} color={colors.warning} />
              <Text style={s.trialCardText}>
                Trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} — tap to view plans
              </Text>
            </TouchableOpacity>
          )}

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
            <TouchableOpacity style={s.alertCard}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
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
                onPress={() => a.route && router.push(a.route as any)}
              >
                <View style={[s.actionIcon, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon as any} size={18} color={a.color} />
                </View>
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent activity</Text>
          </View>
          {(data?.recentActivity ?? []).length === 0 ? (
            <View style={s.emptyActivity}>
              <Ionicons name="time-outline" size={24} color={colors.borderStrong} />
              <Text style={s.emptyActivityText}>No recent activity</Text>
            </View>
          ) : (
            data?.recentActivity?.map((t: any, i: number) => (
              <View key={i} style={[s.txn, { marginBottom: i < (data.recentActivity.length - 1) ? 6 : 0 }]}>
                <View style={[s.txnIcon, { backgroundColor: t.positive ? colors.successSurface : colors.surfaceAlt }]}>
                  <Ionicons
                    name={t.positive ? 'checkmark-circle-outline' : 'arrow-down-outline'}
                    size={16}
                    color={t.positive ? colors.success : colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.txnName}>{t.name}</Text>
                  <Text style={s.txnTime}>{t.time} · by {t.by}</Text>
                </View>
                <Text style={s.txnDetail}>{t.detail}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  hero: { backgroundColor: colors.primary, padding: 20, paddingTop: 24, paddingBottom: 40 },
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
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dangerSurface, borderRadius: 10, padding: 10, marginBottom: 12 },
  errorText: { fontSize: 12, color: colors.danger, flex: 1 },
  trialCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningSurface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.warning + '40', padding: 12, marginBottom: 12 },
  trialCardText: { fontSize: 12, color: colors.warning, fontWeight: '500', flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  kpiCard: { width: '47.5%', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, padding: 14 },
  kpiIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiLabel: { fontSize: 9, color: colors.textMuted, fontWeight: '500', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 },
  kpiSub: { fontSize: 10, color: colors.textPlaceholder, marginTop: 2 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningSurface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.warning + '33', padding: 12, marginBottom: 16 },
  alertText: { fontSize: 12, color: colors.warning, fontWeight: '500', flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 10, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 13, borderWidth: 0.5, borderColor: colors.border, padding: 12, alignItems: 'center', gap: 5 },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 9, fontWeight: '500', color: colors.textMuted, textAlign: 'center' },
  txn: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 0.5, borderColor: colors.border, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  txnIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txnName: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  txnTime: { fontSize: 10, color: colors.textPlaceholder, marginTop: 1 },
  txnDetail: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
  emptyActivity: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyActivityText: { fontSize: 13, color: colors.textPlaceholder },
});
