import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView, Platform, ScrollView, Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import Svg, { Rect, Polygon, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      await setAuth(data);
      const tierRoute: Record<string, string> = {
        MANUFACTURER: '/(manufacturer)/dashboard',
        WHOLESALER: '/(wholesaler)/dashboard',
        RETAILER: '/(retailer)/dashboard',
      };
      if (data.subscriptionStatus === 'EXPIRED') {
        router.replace('/(auth)/trial-expired');
      } else {
        router.replace(tierRoute[data.tierType] as any);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Dark hero top */}
          <View style={s.hero}>
            <View style={s.bubbleTopRight} />
            <View style={s.bubbleBottomLeft} />
            <View style={s.grid} />
            <View style={s.logoBox}>
              <Logo />
              <Text style={s.brand}>StockFlow Pro</Text>
              <Text style={s.tagline}>Supply chain, connected.</Text>
            </View>
          </View>

          {/* Form card */}
          <View style={s.formCard}>
            <Text style={s.formTitle}>Welcome back</Text>
            <Text style={s.formSub}>Sign in to your business account</Text>

            <View style={s.field}>
              <Text style={s.label}>Email address</Text>
              <View style={[s.inputRow, emailFocused && s.inputFocused]}>
                <Ionicons name="mail-outline" size={17} color={emailFocused ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  style={s.input}
                  placeholder="you@business.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            <View style={s.field}>
              <Text style={s.label}>Password</Text>
              <View style={[s.inputRow, passwordFocused && s.inputFocused]}>
                <Ionicons name="lock-closed-outline" size={17} color={passwordFocused ? '#1A56DB' : '#9CA3AF'} style={{ marginRight: 10 }} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={s.btnText}>Sign in</Text>
                  <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>New to StockFlow Pro?</Text>
              <View style={s.dividerLine} />
            </View>
<TouchableOpacity style={s.signupHint} onPress={() => Linking.openURL('https://stockflowpro-web.netlify.app/signup')}>
  <Ionicons name="globe-outline" size={14} color="#1A56DB" />
  <Text style={s.signupText}>Sign up at <Text style={s.signupLink}>stockflowpro-web.netlify.app</Text></Text>
</TouchableOpacity>
          </View>

          {/* Features */}
          <View style={s.features}>
            {[
              { icon: 'shield-checkmark-outline', text: '14-day free trial', color: '#059669' },
              { icon: 'lock-closed-outline', text: 'Data always safe', color: '#1A56DB' },
              { icon: 'flash-outline', text: 'Real-time sync', color: '#C27803' },
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

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  scroll: { flexGrow: 1 },

  hero: {
    backgroundColor: '#0F172A',
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  bubbleTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  bubbleBottomLeft: {
    position: 'absolute', bottom: -40, left: -40,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  grid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.03,
  },
  logoBox: { alignItems: 'center', zIndex: 1 },
  brand: { fontSize: 26, fontWeight: '800', color: '#ffffff', marginTop: 14, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 5 },

  formCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 16,
  },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  formSub: { fontSize: 13, color: '#6B7280', marginBottom: 24 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#F8FAFC',
  },
  inputFocused: { borderColor: '#1A56DB', backgroundColor: '#ffffff' },
  input: { fontSize: 14, color: '#0F172A', flex: 1 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FEF2F2', borderRadius: 10,
    padding: 12, marginBottom: 14,
    borderWidth: 0.5, borderColor: '#FECACA',
  },
  errorText: { fontSize: 12, color: '#DC2626', flex: 1 },

  btn: {
    backgroundColor: '#1A56DB',
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#1A56DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20, marginBottom: 14 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: '#E5E7EB' },
  dividerText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },

  signupHint: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  signupText: { fontSize: 12, color: '#6B7280' },
  signupLink: { color: '#1A56DB', fontWeight: '600' },

  features: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 20, paddingHorizontal: 20, paddingBottom: 32, flexWrap: 'wrap',
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  featureText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
});