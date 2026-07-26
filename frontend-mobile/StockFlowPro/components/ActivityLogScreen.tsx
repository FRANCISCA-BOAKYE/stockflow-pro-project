import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

const ACTION_ICONS_MAP = (colors: ThemeColors): Record<string, { icon: string; color: string; bg: string }> => ({
  SALE: { icon: 'cash-outline', color: colors.success, bg: colors.successSurface },
  DISPATCH: { icon: 'car-outline', color: colors.primary, bg: colors.primarySurface },
  PRODUCTION: { icon: 'cog-outline', color: colors.purpleDark, bg: colors.purpleSurface },
  CREDIT_PAYMENT: { icon: 'wallet-outline', color: colors.success, bg: colors.successSurface },
  CREDIT_DELETE: { icon: 'trash-outline', color: colors.danger, bg: colors.dangerSurface },
});

export function ActivityLogScreen() {
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const ACTION_ICONS = useMemo(() => ACTION_ICONS_MAP(colors), [colors]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLog = useCallback(async () => {
    try {
      const res = await api.get('/activity-log?size=50');
      setEntries(res.data?.content || []);
    } catch (e) {
      console.log('Error fetching activity log:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Team Activity</Text>
          <Text style={s.sub}>Every sale, dispatch, and money action your team recorded</Text>
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLog(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="list-outline" size={40} color={colors.borderStrong} />
            <Text style={s.emptyText}>No activity yet</Text>
            <Text style={s.emptySub}>Sales, dispatches, and credit actions will show up here as your team records them</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = ACTION_ICONS[item.actionType] || { icon: 'ellipse-outline', color: colors.textMuted, bg: colors.border };
          return (
            <View style={s.card}>
              <View style={[s.icon, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={17} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.description}>{item.description}</Text>
                <View style={s.metaRow}>
                  <Text style={s.actorName}>{item.actorName}</Text>
                  {item.actorIsSubAccount && (
                    <View style={s.subBadge}>
                      <Text style={s.subBadgeText}>Sub-account</Text>
                    </View>
                  )}
                  <Text style={s.time}> · {new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              </View>
              {item.amountUsd != null && (
                <Text style={s.amount}>${Number(item.amountUsd).toFixed(2)}</Text>
              )}
            </View>
          );
        }}
      />
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
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  description: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 3 },
  actorName: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  time: { fontSize: 11, color: colors.textPlaceholder },
  subBadge: { backgroundColor: colors.warningSurface, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1, marginLeft: 6 },
  subBadgeText: { fontSize: 9, color: colors.warningText, fontWeight: '700' },
  amount: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySub: { fontSize: 13, color: colors.textPlaceholder, textAlign: 'center' },
});
