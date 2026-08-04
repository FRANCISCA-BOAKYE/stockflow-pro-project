import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, RefreshControl, TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useCurrency } from '../../hooks/useCurrency';
import { useCountUp } from '../../hooks/useCountUp';
import { ThemeColors } from '../../theme/colors';
import { space, radius } from '../../theme/spacing';
import { type, tabularNums } from '../../theme/typography';
import { SkeletonRow } from '../../components/Skeleton';
import FadeInItem from '../../components/FadeInItem';
import GradientHero from '../../components/GradientHero';
import StatCard from '../../components/StatCard';
import ListItemCard from '../../components/ListItemCard';
import EmptyState from '../../components/EmptyState';
import ScreenBackground from '../../components/ScreenBackground';

export default function WholesalerDashboard() {
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
    return 14 - daysElapsed;
  })();

  const heroAmountAnim = useCountUp(Number(data?.totalCreditOwedByRetailers ?? 0));

  const kpis = [
    { label: 'Warehouse stock', value: data?.totalStockItems, sub: 'items', icon: 'archive-outline' as const, iconBg: colors.primarySurface, iconColor: colors.primary },
    { label: 'Credit owed', value: data?.totalCreditOwedByRetailers, sub: 'by retailers', icon: 'wallet-outline' as const, iconBg: colors.dangerSurface, iconColor: colors.danger, formatValue: (n: number) => format(n) },
    { label: "Today's sales", value: data?.todaySalesUsd, sub: 'revenue', icon: 'trending-up-outline' as const, iconBg: colors.successSurface, iconColor: colors.success, formatValue: (n: number) => format(n) },
    { label: 'Active retailers', value: data?.activeRetailers, sub: 'partners', icon: 'people-outline' as const, iconBg: colors.warningSurface, iconColor: colors.warning },
  ];

  const quickActions = [
    { label: 'Warehouse', icon: 'archive-outline' as const, bg: colors.primarySurface, color: colors.primary, route: '/(wholesaler)/warehouse' },
    { label: 'Sell', icon: 'cart-outline' as const, bg: colors.successSurface, color: colors.success, route: '/(wholesaler)/pos' },
    { label: 'Credit', icon: 'wallet-outline' as const, bg: colors.dangerSurface, color: colors.danger, route: '/(wholesaler)/credit' },
    { label: 'Invoices', icon: 'receipt-outline' as const, bg: colors.warningSurface, color: colors.warning, route: '/invoices' },
  ];

  if (loading) return (
    <ScreenBackground style={s.page}>
      <View style={s.loadingHeader}>
        <Text style={s.loadingTitle}>Dashboard</Text>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </ScreenBackground>
  );

  return (
    <ScreenBackground style={s.page}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboard(); }} tintColor={colors.primary} />}
      >
        <GradientHero paddingTop={24} paddingBottom={44} paddingHorizontal={space[5]}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.greeting}>{getGreeting()}</Text>
              <Text style={s.userName}>{user?.name ?? 'User'}</Text>
              <Text style={s.bizName}>{data?.businessName ?? user?.businessName} · Wholesaler</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initials}</Text>
              </View>
              {(data?.subscriptionStatus ?? user?.subscriptionStatus) === 'TRIAL' && (
                <View style={s.trialPill}><Text style={s.trialText}>TRIAL</Text></View>
              )}
            </View>
          </View>
          <View style={{ marginTop: space[2] }}>
            <Text style={s.heroLabel}>Credit outstanding</Text>
            <Text style={[s.heroAmount, tabularNums]}>
              {format(heroAmountAnim)}
            </Text>
          </View>
        </GradientHero>

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
              <StatCard key={i} {...k} style={{ width: '47.5%' }} />
            ))}
          </View>

          <Text style={s.sectionTitle}>Quick actions</Text>
          <View style={s.actionsGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} style={s.actionCard} onPress={() => a.route && router.push(a.route as any)}>
                <View style={[s.actionIcon, { backgroundColor: a.bg }]}>
                  <Ionicons name={a.icon} size={18} color={a.color} />
                </View>
                <Text style={s.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent activity</Text>
          </View>
          {(data?.recentActivity ?? []).length === 0 ? (
            <EmptyState icon="time-outline" title="No recent activity" message="Sales and credit activity will show up here." />
          ) : (
            <View style={{ gap: space[2] }}>
              {data?.recentActivity?.map((t: any, i: number) => (
                <FadeInItem key={i} index={i}>
                  <ListItemCard
                    leading={
                      <View style={[s.txnIcon, { backgroundColor: t.positive ? colors.successSurface : colors.surfaceAlt }]}>
                        <Ionicons name={t.positive ? 'checkmark-circle-outline' : 'arrow-down-outline'} size={16} color={t.positive ? colors.success : colors.textMuted} />
                      </View>
                    }
                    title={t.msg || t.name}
                    subtitle={`${t.time} · by ${t.by}`}
                    trailing={<Text style={[s.txnDetail, tabularNums]}>{t.amount || t.detail}</Text>}
                  />
                </FadeInItem>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, },
  loadingHeader: { backgroundColor: colors.surface, padding: space[4], paddingBottom: space[3], borderBottomWidth: 0.5, borderBottomColor: colors.border },
  loadingTitle: { ...type.h1, color: colors.textPrimary },

  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { ...type.caption, color: 'rgba(255,255,255,0.6)', marginBottom: 3 },
  userName: { ...type.h1, color: '#fff', marginBottom: 2, letterSpacing: -0.3 },
  bizName: { ...type.micro, color: 'rgba(255,255,255,0.5)' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  trialPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: 9 },
  trialText: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  heroLabel: { ...type.micro, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  heroAmount: { fontSize: 30, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },

  body: { padding: space[4], marginTop: -24 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dangerSurface, borderRadius: radius.md, padding: space[3], marginBottom: space[3] },
  errorText: { fontSize: 12, color: colors.danger, flex: 1 },
  trialCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.warningSurface, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.warning + '40', padding: space[3], marginBottom: space[3] },
  trialCardText: { fontSize: 12, color: colors.warning, fontWeight: '500', flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], marginBottom: space[4] },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space[3] },
  sectionTitle: { ...type.bodySm, fontWeight: '600', color: colors.textPrimary, marginBottom: space[3], marginTop: 4 },
  actionsGrid: { flexDirection: 'row', gap: space[2], marginBottom: space[5] },
  actionCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[3],
    alignItems: 'center', gap: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  actionIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 9, fontWeight: '500', color: colors.textMuted, textAlign: 'center' },
  txnIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txnDetail: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
});
