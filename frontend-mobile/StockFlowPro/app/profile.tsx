import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, ThemeMode } from '../store/themeStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { api } from '../services/api';
import CountryPicker from '../components/CountryPicker';
import { showToast } from '../components/toast';

const TIER_ICON: Record<string, string> = {
  MANUFACTURER: 'construct-outline',
  WHOLESALER: 'archive-outline',
  RETAILER: 'storefront-outline',
};

const tierAccent = (tier: string, colors: ThemeColors) => {
  if (tier === 'WHOLESALER') return { color: colors.warning, bg: colors.warningSurface };
  if (tier === 'RETAILER') return { color: colors.success, bg: colors.successSurface };
  return { color: colors.primary, bg: colors.primarySurface };
};

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One capital letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (? _ ! @ #)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordChecklist({ password, colors }: { password: string; colors: ThemeColors }) {
  return (
    <View style={{ gap: 4, marginTop: -2 }}>
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

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth, updateUser, updateToken } = useAuthStore();
  const { colors } = useThemeColors();
  const themeMode = useThemeStore(s => s.mode);
  const setThemeMode = useThemeStore(s => s.setMode);
  const s = useMemo(() => makeStyles(colors), [colors]);

  const [subAccounts, setSubAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailPassword, setEmailPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api.get('/auth/sub-accounts')
      .then(res => setSubAccounts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    setNameInput(user?.name || '');
    setEditing(true);
  };

  const saveName = async () => {
    if (!nameInput.trim()) { Alert.alert('Name required', 'Your name cannot be empty.'); return; }
    setSaving(true);
    try {
      await api.put('/auth/profile', { name: nameInput.trim() });
      await updateUser({ name: nameInput.trim() });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Could not update your name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openEmailModal = () => {
    setEmailPassword('');
    setNewEmail(user?.email || '');
    setShowEmailModal(true);
  };

  const saveEmail = async () => {
    if (!emailPassword.trim()) { Alert.alert('Missing info', 'Enter your current password.'); return; }
    if (!newEmail.trim() || !newEmail.includes('@')) { Alert.alert('Missing info', 'Enter a valid new email.'); return; }
    setSavingEmail(true);
    try {
      const res = await api.post('/auth/change-email', {
        currentPassword: emailPassword, newEmail: newEmail.trim(),
      });
      await updateToken(res.data.token);
      await updateUser({ email: res.data.email });
      setShowEmailModal(false);
      Alert.alert('Email updated', 'Your account email has been changed.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Could not update your email.');
    } finally {
      setSavingEmail(false);
    }
  };

  const openPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const savePassword = async () => {
    if (!currentPassword.trim()) { Alert.alert('Missing info', 'Enter your current password.'); return; }
    const failedRule = PASSWORD_RULES.find(rule => !rule.test(newPassword));
    if (failedRule) { Alert.alert('Weak password', `Password needs: ${failedRule.label.toLowerCase()}.`); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Mismatch', 'New password and confirmation do not match.'); return; }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setShowPasswordModal(false);
      Alert.alert('Password updated', 'Your account password has been changed.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e?.response?.data?.message || 'Could not update your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const saveCountry = async (code: string) => {
    try {
      await api.put('/auth/country', { country: code });
      await updateUser({ country: code });
      showToast('Country updated');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Could not update your country.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)/login'); } }
    ]);
  };

  const tier = user?.tierType || 'RETAILER';
  const tierIcon = TIER_ICON[tier] || TIER_ICON.RETAILER;
  const tc = tierAccent(tier, colors);
  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={s.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={[s.avatar, { backgroundColor: tc.bg }]}>
            <Text style={[s.avatarText, { color: tc.color }]}>{initials}</Text>
          </View>
          {editing ? (
            <View style={s.editRow}>
              <TextInput
                style={s.editInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                placeholderTextColor={colors.textPlaceholder}
                autoFocus
              />
              <TouchableOpacity style={s.editSaveBtn} onPress={saveName} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color={colors.onPrimary} /> : <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
              </TouchableOpacity>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setEditing(false)} disabled={saving}>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.nameRow}>
              <Text style={s.userName}>{user?.name || 'User'}</Text>
              <TouchableOpacity onPress={startEditing} style={s.nameEditBtn}>
                <Ionicons name="pencil-outline" size={14} color={colors.textPlaceholder} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={[s.tierBadge, { backgroundColor: tc.bg }]}>
            <Ionicons name={tierIcon as any} size={12} color={tc.color} />
            <Text style={[s.tierBadgeText, { color: tc.color }]}>{tier}</Text>
          </View>
        </View>

        {/* Appearance */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Appearance</Text>
          <View style={s.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = themeMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.themeOption, active && s.themeOptionActive]}
                  onPress={() => setThemeMode(opt.value)}
                >
                  <Ionicons name={opt.icon as any} size={18} color={active ? colors.onPrimary : colors.textSecondary} />
                  <Text style={[s.themeOptionText, active && s.themeOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Business info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Business</Text>
          {[
            { label: 'Business name', value: user?.businessName },
            { label: 'Plan', value: `${user?.subscriptionPlan} · ${user?.subscriptionStatus}` },
            { label: 'Role', value: user?.role || 'Admin' },
          ].map(item => (
            <View key={item.label} style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue}>{item.value || '—'}</Text>
            </View>
          ))}
          <View style={{ marginTop: 10 }}>
            <Text style={s.infoLabel}>Country & currency</Text>
            <View style={{ marginTop: 6 }}>
              <CountryPicker value={user?.country} onChange={saveCountry} />
            </View>
          </View>
        </View>

        {/* Sub-accounts */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Team members</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : subAccounts.length === 0 ? (
            <Text style={s.emptyText}>No sub-accounts yet. Invite team members from the web dashboard.</Text>
          ) : (
            subAccounts.map((acc: any, i: number) => (
              <View key={i} style={s.memberRow}>
                <View style={s.memberIcon}>
                  <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{acc.role}</Text>
                  <Text style={s.memberEmail}>{acc.email}</Text>
                </View>
                <View style={[s.activeDot, { backgroundColor: acc.isActive ? colors.success : colors.textPlaceholder }]} />
              </View>
            ))
          )}
        </View>

        {/* Security */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Security</Text>
          <TouchableOpacity style={s.actionRow} onPress={openEmailModal}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Change email</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionRow, s.actionRowDivider]} onPress={openPasswordModal}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Change password</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.actionRow} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="card-outline" size={18} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Subscription & billing</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionRow, s.actionRowDivider]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 12 }} />
            <Text style={[s.actionText, { color: colors.danger }]}>Log out</Text>
            <Ionicons name="chevron-forward-outline" size={16} color={colors.textPlaceholder} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEmailModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEmailModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Change Email</Text>
            <TouchableOpacity onPress={() => setShowEmailModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={s.fieldLabel}>Current password</Text>
              <TextInput style={s.fieldInput} placeholder="Enter current password" placeholderTextColor={colors.textPlaceholder}
                value={emailPassword} onChangeText={setEmailPassword} secureTextEntry />
            </View>
            <View>
              <Text style={s.fieldLabel}>New email</Text>
              <TextInput style={s.fieldInput} placeholder="new@email.com" placeholderTextColor={colors.textPlaceholder}
                value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
            <Text style={s.modalNote}>We'll email both your old and new address to confirm this change.</Text>
            <TouchableOpacity style={[s.modalConfirmBtn, savingEmail && { opacity: 0.7 }]} onPress={saveEmail} disabled={savingEmail}>
              {savingEmail ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.modalConfirmText}>Update Email</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={showPasswordModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPasswordModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={s.fieldLabel}>Current password</Text>
              <TextInput style={s.fieldInput} placeholder="Enter current password" placeholderTextColor={colors.textPlaceholder}
                value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={s.fieldLabel}>New password</Text>
              <TextInput style={s.fieldInput} placeholder="At least 8 characters" placeholderTextColor={colors.textPlaceholder}
                value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <PasswordChecklist password={newPassword} colors={colors} />
            </View>
            <View>
              <Text style={s.fieldLabel}>Confirm new password</Text>
              <TextInput style={s.fieldInput} placeholder="Re-enter new password" placeholderTextColor={colors.textPlaceholder}
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            </View>
            <Text style={s.modalNote}>We'll email you to confirm this change.</Text>
            <TouchableOpacity style={[s.modalConfirmBtn, savingPassword && { opacity: 0.7 }]} onPress={savePassword} disabled={savingPassword}>
              {savingPassword ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.modalConfirmText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.surface, padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: colors.surface, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  userEmail: { fontSize: 13, color: colors.textMuted, marginBottom: 10, marginTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameEditBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%', paddingHorizontal: 24 },
  editInput: { flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: colors.textPrimary },
  editSaveBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  editCancelBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  tierBadgeText: { fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: colors.surface, marginHorizontal: 12, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: colors.border },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textPlaceholder, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surfaceAlt, borderWidth: 0.5, borderColor: colors.border },
  themeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeOptionText: { fontSize: 11.5, fontWeight: '600', color: colors.textSecondary },
  themeOptionTextActive: { color: colors.onPrimary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, color: colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  memberIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  memberEmail: { fontSize: 11, color: colors.textPlaceholder, marginTop: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { fontSize: 12, color: colors.textPlaceholder, textAlign: 'center', paddingVertical: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionRowDivider: { borderTopWidth: 0.5, borderTopColor: colors.border },
  actionText: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt },
  modalNote: { fontSize: 11.5, color: colors.textPlaceholder },
  modalConfirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  modalConfirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
