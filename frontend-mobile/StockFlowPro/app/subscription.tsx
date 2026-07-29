import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { MONTHLY_PRICE_USD, featuresForPlan } from '../constants/subscriptionPlans';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const tier = user?.tierType || 'RETAILER';
  const plan = user?.subscriptionPlan || 'STANDARD';
  const status = user?.subscriptionStatus || 'TRIAL';
  const prices = MONTHLY_PRICE_USD[tier] || MONTHLY_PRICE_USD.RETAILER;
  const features = featuresForPlan(tier, plan);

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    TRIAL: { color: colors.warning, bg: colors.warningSurface, label: 'Free trial active' },
    ACTIVE: { color: colors.success, bg: colors.successSurface, label: 'Active subscription' },
    EXPIRED: { color: colors.danger, bg: colors.dangerSurface, label: 'Trial expired' },
  };
  const sc = statusConfig[status] || statusConfig.TRIAL;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Current plan */}
        <View style={s.planCard}>
          <View style={s.planTop}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={s.planLabel}>Current plan</Text>
              <Text style={s.planName}>{tier} · {plan}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
              <Text style={[s.statusText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          </View>
          <View style={s.planPrice}>
            <Text style={s.price}>${plan === 'STANDARD' ? prices.STANDARD : prices.PREMIUM}</Text>
            <Text style={s.priceUnit}>/month</Text>
          </View>
          {status === 'TRIAL' && (
            <View style={s.trialBanner}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={s.trialText}>Your 14-day free trial is active. No payment required yet.</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>What's included</Text>
          {features.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade */}
        {plan === 'STANDARD' && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Upgrade to Premium</Text>
            <Text style={s.upgradeDesc}>Get more sub-accounts, advanced reports, delivery scheduling and invoice generation.</Text>
            <View style={s.upgradePrice}>
              <Text style={s.price}>${prices.PREMIUM}</Text>
              <Text style={s.priceUnit}>/month</Text>
            </View>
            <TouchableOpacity style={s.upgradeBtn} onPress={() => Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/pricing')}>
              <Ionicons name="arrow-up-circle-outline" size={16} color={colors.onPrimary} style={{ marginRight: 6 }} />
              <Text style={s.upgradeBtnText}>Upgrade on web</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pay */}
        {status === 'EXPIRED' && (
          <TouchableOpacity style={s.payBtn} onPress={() => Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/trial-expired')}>
            <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.payBtnText}>Subscribe now on web</Text>
          </TouchableOpacity>
        )}

        <View style={s.note}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
          <Text style={s.noteText}>Your data is always safe — even if your subscription expires, nothing is deleted.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  planCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, gap: 12 },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 3 },
  planName: { fontSize: 18, fontWeight: '700', color: colors.onPrimary },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, flexShrink: 0, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '600' },
  planPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 36, fontWeight: '800', color: colors.onPrimary },
  priceUnit: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  trialBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 },
  trialText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1 },
  section: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10, borderWidth: 0.5, borderColor: colors.border },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textPlaceholder, textTransform: 'uppercase', letterSpacing: 0.5 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: colors.textSecondary },
  upgradeDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  upgradePrice: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  upgradeBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  upgradeBtnText: { color: colors.onPrimary, fontSize: 14, fontWeight: '600' },
  payBtn: { backgroundColor: colors.danger, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.successSurface, borderRadius: 12, padding: 12 },
  noteText: { fontSize: 12, color: colors.successText, flex: 1, lineHeight: 18 },
});