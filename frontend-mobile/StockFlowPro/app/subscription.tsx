import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const PLANS = [
  { name: 'Standard', price: 17, features: ['Up to 500 products', 'Basic reporting', 'Email support', 'POS system', 'Credit tracking'] },
  { name: 'Premium', price: 30, features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'POS system', 'Credit tracking', 'Marketplace listing', 'Multi-user access'] },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Subscription</Text>
          <Text style={s.sub}>Manage your plan</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.currentCard}>
          <View style={s.currentTop}>
            <View>
              <Text style={s.currentLabel}>Current plan</Text>
              <Text style={s.currentPlan}>{user?.subscriptionPlan || 'STANDARD'}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: user?.subscriptionStatus === 'TRIAL' ? '#FFFBEB' : '#ECFDF5' }]}>
              <Text style={[s.statusText, { color: user?.subscriptionStatus === 'TRIAL' ? '#C27803' : '#059669' }]}>
                {user?.subscriptionStatus || 'TRIAL'}
              </Text>
            </View>
          </View>
          {user?.subscriptionStatus === 'TRIAL' && (
            <View style={s.trialBox}>
              <Ionicons name="time-outline" size={14} color="#C27803" />
              <Text style={s.trialText}>Trial active — upgrade to keep access after trial ends</Text>
            </View>
          )}
        </View>

        <Text style={s.sectionLabel}>Available plans</Text>
        {PLANS.map((plan, i) => (
          <View key={plan.name} style={[s.planCard, i === 1 && s.planCardPremium]}>
            {i === 1 && (
              <View style={s.popularBadge}>
                <Text style={s.popularText}>Most popular</Text>
              </View>
            )}
            <View style={s.planTop}>
              <Text style={[s.planName, i === 1 && { color: '#fff' }]}>{plan.name}</Text>
              <View>
                <Text style={[s.planPrice, i === 1 && { color: '#fff' }]}>${plan.price}</Text>
                <Text style={[s.planPer, i === 1 && { color: 'rgba(255,255,255,0.7)' }]}>/month</Text>
              </View>
            </View>
            {plan.features.map(f => (
              <View key={f} style={s.featureRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={i === 1 ? 'rgba(255,255,255,0.8)' : '#059669'} />
                <Text style={[s.featureText, i === 1 && { color: 'rgba(255,255,255,0.9)' }]}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[s.selectBtn, i === 1 && s.selectBtnPremium]}
              onPress={() => Alert.alert('Upgrade', `Upgrade to ${plan.name} for $${plan.price}/month?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => Alert.alert('Success', 'Contact support to complete upgrade.') }
              ])}
            >
              <Text style={[s.selectBtnText, i === 1 && { color: '#1A56DB' }]}>
                {user?.subscriptionPlan === plan.name.toUpperCase() ? 'Current plan' : `Upgrade to ${plan.name}`}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { padding: 12, gap: 12, paddingBottom: 100 },
  currentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 12 },
  currentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  currentPlan: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  trialBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10 },
  trialText: { fontSize: 12, color: '#C27803', flex: 1 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', gap: 10 },
  planCardPremium: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  popularBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20 },
  popularText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  planTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  planPrice: { fontSize: 24, fontWeight: '700', color: '#0F172A', textAlign: 'right' },
  planPer: { fontSize: 11, color: '#6B7280', textAlign: 'right' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: '#374151' },
  selectBtn: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 4 },
  selectBtnPremium: { backgroundColor: '#fff' },
  selectBtnText: { fontSize: 14, fontWeight: '600', color: '#374151' },
});