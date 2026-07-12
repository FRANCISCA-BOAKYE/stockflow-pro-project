import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { MONTHLY_PRICE_USD, featuresForPlan } from '../constants/subscriptionPlans';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const tier = user?.tierType || 'RETAILER';
  const plan = user?.subscriptionPlan || 'STANDARD';
  const status = user?.subscriptionStatus || 'TRIAL';
  const prices = MONTHLY_PRICE_USD[tier] || MONTHLY_PRICE_USD.RETAILER;
  const features = featuresForPlan(tier, plan);

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    TRIAL: { color: '#C27803', bg: '#FFFBEB', label: 'Free trial active' },
    ACTIVE: { color: '#059669', bg: '#ECFDF5', label: 'Active subscription' },
    EXPIRED: { color: '#DC2626', bg: '#FEF2F2', label: 'Trial expired' },
  };
  const sc = statusConfig[status] || statusConfig.TRIAL;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={s.title}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Current plan */}
        <View style={s.planCard}>
          <View style={s.planTop}>
            <View>
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
              <Ionicons name="time-outline" size={14} color="#C27803" />
              <Text style={s.trialText}>Your 14-day free trial is active. No payment required yet.</Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>What's included</Text>
          {features.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#059669" />
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
            <TouchableOpacity style={s.upgradeBtn} onPress={() => Linking.openURL('https://stockflowpro-web.netlify.app/pricing')}>
              <Ionicons name="arrow-up-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={s.upgradeBtnText}>Upgrade on web</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pay */}
        {status === 'EXPIRED' && (
          <TouchableOpacity style={s.payBtn} onPress={() => Linking.openURL('https://stockflowpro-web.netlify.app/trial-expired')}>
            <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={s.payBtnText}>Subscribe now on web</Text>
          </TouchableOpacity>
        )}

        <View style={s.note}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
          <Text style={s.noteText}>Your data is always safe — even if your subscription expires, nothing is deleted.</Text>
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
  planCard: { backgroundColor: '#1A56DB', borderRadius: 20, padding: 20, gap: 12 },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 3 },
  planName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  planPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 36, fontWeight: '800', color: '#fff' },
  priceUnit: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  trialBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 10 },
  trialText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: '#374151' },
  upgradeDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  upgradePrice: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  upgradeBtn: { backgroundColor: '#1A56DB', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  upgradeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  payBtn: { backgroundColor: '#DC2626', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12 },
  noteText: { fontSize: 12, color: '#065F46', flex: 1, lineHeight: 18 },
});