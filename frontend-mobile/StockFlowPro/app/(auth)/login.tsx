import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { TIER_DASHBOARD_ROUTES } from '../../constants/routes';
import Svg, { Rect, Polygon, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import { space, radius } from '../../theme/spacing';
import { type } from '../../theme/typography';
import GradientHero from '../../components/GradientHero';
import FormField from '../../components/FormField';
import Button from '../../components/Button';

const Logo = () => (
  <Svg width="80" height="80" viewBox="0 0 90 90">
    <Rect x="3" y="3" width="84" height="84" rx="20" fill="#0F172A" />
    <Polygon points="45,22 66,33 66,55 45,66 24,55 24,33" fill="none" stroke="#1A56DB" strokeWidth="0.5" opacity="0.5" />
    <Defs>
      <LinearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#1A56DB" />
      </LinearGradient>
      <LinearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#1E3A8A" />
      </LinearGradient>
    </Defs>
    <Polygon points="45,22 66,33 45,44 24,33" fill="url(#g1)" opacity="0.8" />
    <Polygon points="24,33 45,44 45,66 24,55" fill="url(#g2)" opacity="0.6" />
    <Polygon points="66,33 45,44 45,66 66,55" fill="#1A56DB" opacity="0.4" />
    <Path d="M71 16 L72 19 L75 20 L72 21 L71 24 L70 21 L67 20 L70 19 Z" fill="#60A5FA" opacity="0.8" />
    <Circle cx="45" cy="44" r="4" fill="white" opacity="0.9" />
    <Circle cx="45" cy="44" r="2" fill="#1A56DB" />
  </Svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      await setAuth(data);
      if (data.subscriptionStatus === 'EXPIRED') {
        router.replace('/(auth)/trial-expired');
      } else {
        router.replace((TIER_DASHBOARD_ROUTES[data.tierType] ?? '/(auth)/login') as any);
      }
    } catch (err: any) {
      if (err.code === 'ECONNABORTED') {
        setError('Server is waking up — please try again in a few seconds.');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <GradientHero>
            <View style={s.logoBox}>
              <Logo />
              <Text style={s.brand}>StockFlow Pro</Text>
              <Text style={s.tagline}>Supply chain, connected.</Text>
            </View>
          </GradientHero>

          {/* Form card */}
          <View style={s.formCard}>
            <Text style={s.formTitle}>Welcome back</Text>
            <Text style={s.formSub}>Sign in to your business account</Text>

            <FormField
              label="Email address"
              icon="mail-outline"
              placeholder="you@business.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <FormField
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color={colors.textPlaceholder} />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={s.forgotLink}
              onPress={() => Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/forgot-password')}
            >
              <Text style={s.forgotLinkText}>Forgot password?</Text>
            </TouchableOpacity>

            {error ? (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button title="Sign in" onPress={handleLogin} loading={loading} icon="arrow-forward-outline" />

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>New to StockFlow Pro?</Text>
              <View style={s.dividerLine} />
            </View>
            <TouchableOpacity style={s.signupHint} onPress={() => Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/signup')}>
              <Ionicons name="globe-outline" size={14} color={colors.primary} />
              <Text style={s.signupText}>Sign up at <Text style={s.signupLink}>phenomenal-blini-7b80dd.netlify.app</Text></Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={s.features}>
            {[
              { icon: 'shield-checkmark-outline', text: '14-day free trial', color: colors.success },
              { icon: 'lock-closed-outline', text: 'Data always safe', color: colors.primary },
              { icon: 'flash-outline', text: 'Real-time sync', color: colors.warning },
            ].map(f => (
              <View key={f.text} style={s.feature}>
                <Ionicons name={f.icon as any} size={14} color={f.color} />
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },

  logoBox: { alignItems: 'center', zIndex: 1 },
  brand: { fontSize: 26, fontWeight: '800', color: '#ffffff', marginTop: 14, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 5 },

  formCard: {
    backgroundColor: colors.surface,
    marginHorizontal: space[4],
    marginTop: -24,
    borderRadius: radius.xl,
    padding: space[6],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: space[4],
  },
  formTitle: { ...type.display, fontSize: 22, color: colors.textPrimary, marginBottom: 4 },
  formSub: { ...type.bodySm, color: colors.textMuted, marginBottom: space[6] },

  forgotLink: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 14 },
  forgotLinkText: { fontSize: 12.5, color: colors.primary, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.dangerSurface, borderRadius: radius.md,
    padding: space[3], marginBottom: space[4],
    borderWidth: 0.5, borderColor: colors.danger + '40',
  },
  errorText: { fontSize: 12, color: colors.danger, flex: 1 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space[5], marginBottom: space[4] },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: colors.borderStrong },
  dividerText: { fontSize: 11, color: colors.textPlaceholder, fontWeight: '500' },

  signupHint: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  signupText: { fontSize: 12, color: colors.textMuted },
  signupLink: { color: colors.primary, fontWeight: '600' },

  features: {
    flexDirection: 'row', justifyContent: 'center',
    gap: space[5], paddingHorizontal: space[5], paddingBottom: space[8], flexWrap: 'wrap',
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featureText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});
