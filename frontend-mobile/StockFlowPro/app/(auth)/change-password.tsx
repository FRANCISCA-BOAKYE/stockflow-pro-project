import { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { TIER_DASHBOARD_ROUTES } from '../../constants/routes';
import { useThemeColors } from '../../hooks/useThemeColors';
import { ThemeColors } from '../../theme/colors';
import PressableScale from '../../components/PressableScale';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One capital letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (? _ ! @ #)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordChecklist({ password, colors }: { password: string; colors: ThemeColors }) {
  return (
    <View style={{ gap: 4, marginTop: 2, marginBottom: 4 }}>
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password);
        return (
          <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={passed ? 'checkmark-circle' : 'close-circle-outline'} size={13} color={passed ? colors.success : colors.borderStrong} />
            <Text style={{ fontSize: 11, color: passed ? colors.success : colors.textPlaceholder }}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword.trim()) { setError('Enter the temporary password you were given.'); return; }
    const failedRule = PASSWORD_RULES.find(rule => !rule.test(newPassword));
    if (failedRule) { setError(`Password needs: ${failedRule.label.toLowerCase()}.`); return; }
    if (newPassword !== confirmPassword) { setError('New password and confirmation do not match.'); return; }
    setError('');
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Could not update your password.');
      setSaving(false);
      return;
    }
    // The backend password change already succeeded at this point — any
    // failure below is just local bookkeeping and shouldn't be shown as an
    // error (the old temporary password won't work as "current" anymore).
    try {
      await updateUser({ mustChangePassword: false });
    } catch {}
    router.replace((TIER_DASHBOARD_ROUTES[user?.tierType ?? ''] ?? '/(auth)/login') as any);
    setSaving(false);
  };

  return (
    <SafeAreaView style={s.page}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.iconCircle}>
            <Ionicons name="key-outline" size={26} color={colors.primary} />
          </View>
          <Text style={s.title}>Set a new password</Text>
          <Text style={s.sub}>You're signing in with a temporary password — set one only you know before continuing.</Text>

          <View style={s.field}>
            <Text style={s.label}>Temporary password</Text>
            <TextInput
              style={s.input}
              placeholder="The password you were given"
              placeholderTextColor={colors.textPlaceholder}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>New password</Text>
            <TextInput
              style={s.input}
              placeholder="Choose a new password"
              placeholderTextColor={colors.textPlaceholder}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <PasswordChecklist password={newPassword} colors={colors} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Confirm new password</Text>
            <TextInput
              style={s.input}
              placeholder="Re-enter your new password"
              placeholderTextColor={colors.textPlaceholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <PressableScale style={[s.btn, saving && { opacity: 0.7 }]} onPress={handleSubmit} disabled={saving} haptic>
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.btnText}>Set password & continue</Text>}
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 28, lineHeight: 19 },
  field: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5, borderColor: colors.borderStrong, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
  },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.dangerSurface, borderRadius: 10,
    padding: 12, marginBottom: 14,
  },
  errorText: { fontSize: 12, color: colors.danger, flex: 1 },
  btn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  btnText: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
});
