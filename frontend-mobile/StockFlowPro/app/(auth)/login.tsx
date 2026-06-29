import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import Svg, { Rect, Polygon, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
const API_BASE_URL = 'https://stockflow-backend-qwpt.onrender.com';

const TEST_ACCOUNTS = [
  { tier: 'MANUFACTURER', email: 'francisca@acme.com', color: '#1A56DB', bg: '#EFF6FF' },
  { tier: 'RETAILER', email: 'amara@brightmart.com', color: '#059669', bg: '#ECFDF5' },
  { tier: 'WHOLESALER', email: 'kwame@apex.com', color: '#C27803', bg: '#FFFBEB' },
];

const Logo = () => (
  <Svg width="72" height="72" viewBox="0 0 90 90">
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

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
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
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.page}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoBox}>
          <Logo />
          <Text style={s.brand}>StockFlow Pro</Text>
          <Text style={s.tagline}>Sign in to your account</Text>
        </View>

        <View style={s.card}>
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <View style={s.inputRow}>
              <Ionicons name="mail-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput style={s.input} placeholder="you@business.com" placeholderTextColor="#9CA3AF"
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput style={[s.input, { flex: 1 }]} placeholder="Enter your password" placeholderTextColor="#9CA3AF"
                value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#DC2626" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign in</Text>}
          </TouchableOpacity>
        </View>

        <View style={s.cheatSheet}>
          <Text style={s.cheatTitle}>Dev access — tap to fill</Text>
          {TEST_ACCOUNTS.map(acc => (
            <TouchableOpacity key={acc.tier} style={s.cheatRow}
              onPress={() => { setEmail(acc.email); setPassword('Password123!'); }}>
              <View style={[s.tierBadge, { backgroundColor: acc.bg }]}>
                <Text style={[s.tierText, { color: acc.color }]}>{acc.tier}</Text>
              </View>
              <Text style={s.cheatEmail}>{acc.email}</Text>
            </TouchableOpacity>
          ))}
          <Text style={s.cheatHint}>All passwords: Password123!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  scroll: { padding: 20, paddingTop: 40 },
  logoBox: { alignItems: 'center', marginBottom: 28 },
  brand: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  tagline: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 14, color: '#0F172A', flex: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10, marginBottom: 12 },
  errorText: { fontSize: 12, color: '#DC2626', flex: 1 },
  btn: { backgroundColor: '#1A56DB', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cheatSheet: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cheatTitle: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  cheatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  tierBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 20 },
  tierText: { fontSize: 10, fontWeight: '600' },
  cheatEmail: { fontSize: 12, color: '#6B7280', fontFamily: 'monospace' },
  cheatHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 10 },
});