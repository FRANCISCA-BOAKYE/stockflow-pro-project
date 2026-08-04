import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { SkeletonRow } from './Skeleton';
import FadeInItem from './FadeInItem';
import { useConfirmSheet } from './ConfirmSheet';
import { showToast } from './toast';

const ACTION_ICONS_MAP = (colors: ThemeColors): Record<string, { icon: string; color: string; bg: string }> => ({
  SALE: { icon: 'cash-outline', color: colors.success, bg: colors.successSurface },
  DISPATCH: { icon: 'car-outline', color: colors.primary, bg: colors.primarySurface },
  PRODUCTION: { icon: 'cog-outline', color: colors.purpleDark, bg: colors.purpleSurface },
  CREDIT_PAYMENT: { icon: 'wallet-outline', color: colors.success, bg: colors.successSurface },
  CREDIT_DELETE: { icon: 'trash-outline', color: colors.danger, bg: colors.dangerSurface },
  PASSWORD_CHANGE: { icon: 'key-outline', color: colors.warning, bg: colors.warningSurface },
});

function EntryRow({ item, cfg, colors }: { item: any; cfg: { icon: string; color: string; bg: string }; colors: ThemeColors }) {
  return (
    <View style={rowStyles.card}>
      <View style={[rowStyles.icon, { backgroundColor: cfg.bg }]}>
        <Ionicons name={cfg.icon as any} size={17} color={cfg.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.description, { color: colors.textPrimary }]}>{item.description}</Text>
        <View style={rowStyles.metaRow}>
          <Text style={[rowStyles.actorName, { color: colors.textMuted }]}>{item.actorName}</Text>
          {item.actorIsSubAccount && (
            <View style={[rowStyles.subBadge, { backgroundColor: colors.warningSurface }]}>
              <Text style={[rowStyles.subBadgeText, { color: colors.warningText }]}>Sub-account</Text>
            </View>
          )}
          <Text style={[rowStyles.time, { color: colors.textPlaceholder }]}> · {new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      {item.amountUsd != null && (
        <Text style={[rowStyles.amount, { color: colors.textPrimary }]}>${Number(item.amountUsd).toFixed(2)}</Text>
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  card: { backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 13, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 3 },
  actorName: { fontSize: 11, fontWeight: '500' },
  time: { fontSize: 11 },
  subBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 },
  subBadgeText: { fontSize: 9, fontWeight: '700' },
  amount: { fontSize: 13, fontWeight: '700' },
});

export function ActivityLogScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const ACTION_ICONS = useMemo(() => ACTION_ICONS_MAP(colors), [colors]);
  const { confirm, element: confirmSheet } = useConfirmSheet();

  const isOwner = !user?.isSubAccount;

  // Sub-account view: flat list of their own activity only (unchanged from before).
  const [entries, setEntries] = useState<any[]>([]);
  // Owner view: monthly grouped review.
  const [months, setMonths] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [monthEntries, setMonthEntries] = useState<Record<string, any[]>>({});
  const [monthLoading, setMonthLoading] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (isOwner) {
        const res = await api.get('/activity-log/months');
        setMonths(res.data || []);
      } else {
        const res = await api.get('/activity-log?size=50');
        setEntries(res.data?.content || []);
      }
    } catch (e) {
      console.log('Error fetching activity log:', e);
      showToast('Could not load activity — pull down to retry', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOwner]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const monthKey = (m: any) => `${m.year}-${m.month}`;

  const toggleMonth = async (m: any) => {
    const key = monthKey(m);
    if (expanded === key) { setExpanded(null); return; }
    setExpanded(key);
    if (!monthEntries[key]) {
      setMonthLoading(key);
      try {
        const res = await api.get(`/activity-log?year=${m.year}&month=${m.month}&size=100`);
        setMonthEntries(prev => ({ ...prev, [key]: res.data?.content || [] }));
      } catch (e) {
        console.log('Error fetching month activity:', e);
      } finally {
        setMonthLoading(null);
      }
    }
  };

  const handleClear = async (m: any) => {
    const ok = await confirm({
      title: `Clear ${m.label}?`,
      message: "This only hides it from this view — nothing is deleted. StockFlow keeps the full history in the database for compliance. If you ever need it back (e.g. to investigate something), contact support and we'll retrieve it for you.",
      confirmLabel: 'Clear month',
      icon: 'checkmark-done-outline',
    });
    if (!ok) return;
    try {
      await api.post('/activity-log/months/clear', { year: m.year, month: m.month });
      showToast('Month cleared from view', 'success');
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || 'Could not clear this month', 'error');
    }
  };

  if (loading) return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Team Activity</Text>
        </View>
      </View>
      <View style={{ padding: 12, gap: 8 }}>
        {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
      </View>
    </SafeAreaView>
  );

  if (!isOwner) {
    return (
      <SafeAreaView style={s.page}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>My Activity</Text>
            <Text style={s.sub}>Every sale, dispatch, and money action you recorded</Text>
          </View>
        </View>
        <FlatList
          data={entries}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="list-outline" size={40} color={colors.borderStrong} />
              <Text style={s.emptyText}>No activity yet</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <FadeInItem index={index}>
              <View style={s.entryCard}>
                <EntryRow item={item} cfg={ACTION_ICONS[item.actionType] || { icon: 'ellipse-outline', color: colors.textMuted, bg: colors.border }} colors={colors} />
              </View>
            </FadeInItem>
          )}
        />
        {confirmSheet}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Team Activity</Text>
          <Text style={s.sub}>Every sale, dispatch, and money action your team recorded — grouped by month</Text>
        </View>
      </View>

      <FlatList
        data={months}
        keyExtractor={m => monthKey(m)}
        contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="list-outline" size={40} color={colors.borderStrong} />
            <Text style={s.emptyText}>No activity yet</Text>
            <Text style={s.emptySub}>Sales, dispatches, and credit actions will show up here as your team records them</Text>
          </View>
        }
        renderItem={({ item: m, index }) => {
          const key = monthKey(m);
          const isExpanded = expanded === key;
          const isCleared = !!m.clearedAt;
          return (
            <FadeInItem index={index}>
              <View style={s.monthCard}>
                <TouchableOpacity style={s.monthHeader} onPress={() => toggleMonth(m)} activeOpacity={0.7}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.monthLabel}>{m.label}</Text>
                    <View style={s.monthMetaRow}>
                      <Text style={s.monthCount}>{m.entryCount} activit{m.entryCount === 1 ? 'y' : 'ies'}</Text>
                      {isCleared && (
                        <View style={s.clearedPill}>
                          <Ionicons name="checkmark-circle" size={11} color={colors.success} />
                          <Text style={s.clearedPillText}>Cleared {new Date(m.clearedAt).toLocaleDateString()}</Text>
                        </View>
                      )}
                      {!!m.summaryEmailedAt && (
                        <View style={s.emailedPill}>
                          <Ionicons name="mail-outline" size={11} color={colors.primary} />
                          <Text style={s.emailedPillText}>Emailed to you</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={s.monthBody}>
                    {monthLoading === key ? (
                      <View style={{ gap: 8 }}>{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</View>
                    ) : (
                      <View style={{ gap: 10 }}>
                        {(monthEntries[key] || []).map((item: any) => (
                          <EntryRow key={item.id} item={item} cfg={ACTION_ICONS[item.actionType] || { icon: 'ellipse-outline', color: colors.textMuted, bg: colors.border }} colors={colors} />
                        ))}
                      </View>
                    )}
                    {m.canClear && (
                      <TouchableOpacity style={s.clearBtn} onPress={() => handleClear(m)}>
                        <Ionicons name="checkmark-done-outline" size={15} color={colors.primary} />
                        <Text style={s.clearBtnText}>Mark as reviewed & clear</Text>
                      </TouchableOpacity>
                    )}
                    {!m.canClear && !isCleared && (
                      <Text style={s.reviewNote}>This month stays visible for 3 days after it ends before it can be cleared.</Text>
                    )}
                  </View>
                )}
              </View>
            </FadeInItem>
          );
        }}
      />
      {confirmSheet}
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  entryCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 0.5, borderColor: colors.border },
  monthCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  monthMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  monthCount: { fontSize: 11.5, color: colors.textMuted },
  clearedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.successSurface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  clearedPillText: { fontSize: 10, color: colors.successText, fontWeight: '600' },
  emailedPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primarySurface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  emailedPillText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  monthBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 12, borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 14 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.primarySurface, borderRadius: 12, paddingVertical: 11, marginTop: 4 },
  clearBtnText: { fontSize: 12.5, fontWeight: '600', color: colors.primary },
  reviewNote: { fontSize: 11, color: colors.textPlaceholder, fontStyle: 'italic', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
});
