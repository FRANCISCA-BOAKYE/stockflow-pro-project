import { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { MONTHLY_PRICE_USD } from '../../constants/subscriptionPlans';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { space, radius } from '../../theme/spacing';
import { type } from '../../theme/typography';
import GradientHero from '../../components/GradientHero';
import Card from '../../components/Card';
import Button from '../../components/Button';

const getPlansForTier = (tier?: string) => {
  const prices = MONTHLY_PRICE_USD[tier || 'RETAILER'] || MONTHLY_PRICE_USD.RETAILER;
  return [{ name: 'Standard', price: prices.STANDARD }, { name: 'Premium', price: prices.PREMIUM }];
};

export default function TrialExpired() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
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
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <GradientHero paddingTop={56} paddingBottom={64} bubbles dotGrid>
          <View style={s.heroContent}>
            <View style={s.iconBox}>
              <Ionicons name="time-outline" size={32} color="#FBBF24" />
            </View>
            <Text style={s.heroTitle}>Your trial has ended</Text>
            <Text style={s.heroSubtitle}>{user?.businessName}'s 14-day free trial has ended.</Text>
          </View>
        </GradientHero>

        <Card style={s.card} radiusSize="xl">
          <View style={s.safeBox}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.safeTitle}>Your data is completely safe</Text>
              <Text style={s.safeText}>Nothing has been deleted. All your materials, products, transactions, and credit records are exactly as you left them. Full access returns the moment you subscribe.</Text>
            </View>
          </View>

          <Text style={s.sectionLabel}>Choose a plan to continue</Text>
          {PLANS.map((plan, i) => (
            <View key={plan.name} style={[s.planCard, i === 1 && s.planCardPremium]}>
              <View>
                <Text style={[s.planName, i === 1 && { color: colors.onPrimary }]}>{plan.name}</Text>
                {i === 1 && <Text style={s.popularText}>Most popular</Text>}
              </View>
              <Text style={[s.planPrice, i === 1 && { color: colors.onPrimary }]}>${plan.price}<Text style={s.perMonth}>/mo</Text></Text>
            </View>
          ))}

          <Button title="Subscribe on website" onPress={handleSubscribe} icon="card-outline" iconPosition="left" style={{ marginTop: space[3], width: '100%' }} />
          <Button title="Log out" onPress={handleLogout} variant="ghost" style={{ width: '100%' }} />
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingBottom: space[8] },

  heroContent: { alignItems: 'center', zIndex: 1 },
  iconBox: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(251,191,36,0.16)',
    alignItems: 'center', justifyContent: 'center', marginBottom: space[3],
  },
  heroTitle: { ...type.h1, fontSize: 22, color: '#FFFFFF' },
  heroSubtitle: { ...type.bodySm, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4, paddingHorizontal: space[6] },

  card: { marginHorizontal: space[4], marginTop: -24, gap: space[4] },

  safeBox: {
    flexDirection: 'row', backgroundColor: colors.successSurface, borderRadius: radius.lg,
    padding: space[4], width: '100%', borderWidth: 0.5, borderColor: colors.success + '33',
  },
  safeTitle: { ...type.bodySm, fontWeight: '700', color: colors.successText, marginBottom: 3 },
  safeText: { fontSize: 12, color: colors.successText, lineHeight: 17 },

  sectionLabel: { ...type.bodySm, fontWeight: '600', color: colors.textPrimary, alignSelf: 'flex-start' },

  planCard: {
    width: '100%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4],
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 0.5, borderColor: colors.border,
  },
  planCardPremium: { backgroundColor: colors.primary, borderColor: colors.primary },
  planName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  popularText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  perMonth: { fontSize: 11, fontWeight: '400', color: colors.textPlaceholder },
});
