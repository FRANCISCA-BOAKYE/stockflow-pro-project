import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { MONTHLY_PRICE_USD } from '../../constants/subscriptionPlans';

const getPlansForTier = (tier?: string) => {
  const prices = MONTHLY_PRICE_USD[tier || 'RETAILER'] || MONTHLY_PRICE_USD.RETAILER;
  return [{ name: 'Standard', price: prices.STANDARD }, { name: 'Premium', price: prices.PREMIUM }];
};

export default function TrialExpired() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const PLANS = getPlansForTier(user?.tierType);

  const handleSubscribe = () => {
    Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/pricing');
  };

  const handleLogout = async () => {
    await clearAuth();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.iconBox}>
          <Ionicons name="time-outline" size={36} color="#C27803" />
        </View>
        <Text style={s.title}>Your trial has ended</Text>
        <Text style={s.subtitle}>{user?.businessName}'s 14-day free trial has ended.</Text>

        <View style={s.safeBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#059669" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={s.safeTitle}>Your data is completely safe</Text>
            <Text style={s.safeText}>Nothing has been deleted. All your materials, products, transactions, and credit records are exactly as you left them. Full access returns the moment you subscribe.</Text>
          </View>
        </View>

        <Text style={s.sectionLabel}>Choose a plan to continue</Text>
        {PLANS.map((plan, i) => (
          <View key={plan.name} style={[s.planCard, i === 1 && s.planCardPremium]}>
            <View>
              <Text style={[s.planName, i === 1 && { color: '#fff' }]}>{plan.name}</Text>
              {i === 1 && <Text style={s.popularText}>Most popular</Text>}
            </View>
            <Text style={[s.planPrice, i === 1 && { color: '#fff' }]}>${plan.price}<Text style={s.perMonth}>/mo</Text></Text>
          </View>
        ))}

        <TouchableOpacity style={s.subscribeBtn} onPress={handleSubscribe}>
          <Ionicons name="card-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={s.subscribeBtnText}>Subscribe on website</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutBtnText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  body: { padding: 24, paddingTop: 60, gap: 14, alignItems: 'center' },
  iconBox: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 8 },
  safeBox: { flexDirection: 'row', backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, width: '100%', borderWidth: 0.5, borderColor: 'rgba(5,150,105,0.2)' },
  safeTitle: { fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 3 },
  safeText: { fontSize: 12, color: '#047857', lineHeight: 17 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A', alignSelf: 'flex-start', marginTop: 8 },
  planCard: { width: '100%', backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  planCardPremium: { backgroundColor: '#1A56DB', borderColor: '#1A56DB' },
  planName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  popularText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  perMonth: { fontSize: 11, fontWeight: '400', color: '#9CA3AF' },
  subscribeBtn: { backgroundColor: '#1A56DB', borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 10 },
  subscribeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logoutBtn: { padding: 10 },
  logoutBtnText: { color: '#9CA3AF', fontSize: 13 },
});