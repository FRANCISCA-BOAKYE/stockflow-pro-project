import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

const TIER_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  MANUFACTURER: { color: '#1A56DB', bg: '#EFF6FF', icon: 'construct-outline' },
  WHOLESALER: { color: '#C27803', bg: '#FFFBEB', icon: 'archive-outline' },
  RETAILER: { color: '#059669', bg: '#ECFDF5', icon: 'storefront-outline' },
};

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One capital letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character (? _ ! @ #)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordChecklist({ password }: { password: string }) {
  return (
    <View style={{ gap: 4, marginTop: -2 }}>
      {PASSWORD_RULES.map(rule => {
        const passed = rule.test(password);
        return (
          <View key={rule.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={passed ? 'checkmark-circle' : 'close-circle-outline'} size={13} color={passed ? '#059669' : '#D1D5DB'} />
            <Text style={{ fontSize: 11, color: passed ? '#059669' : '#9CA3AF' }}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, clearAuth, updateUser, updateToken } = useAuthStore();
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

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)/login'); } }
    ]);
  };

  const tier = user?.tierType || 'RETAILER';
  const tc = TIER_CONFIG[tier] || TIER_CONFIG.RETAILER;
  const initials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
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
                autoFocus
              />
              <TouchableOpacity style={s.editSaveBtn} onPress={saveName} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setEditing(false)} disabled={saving}>
                <Ionicons name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.nameRow}>
              <Text style={s.userName}>{user?.name || 'User'}</Text>
              <TouchableOpacity onPress={startEditing} style={s.nameEditBtn}>
                <Ionicons name="pencil-outline" size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={s.userEmail}>{user?.email}</Text>
          <View style={[s.tierBadge, { backgroundColor: tc.bg }]}>
            <Ionicons name={tc.icon as any} size={12} color={tc.color} />
            <Text style={[s.tierBadgeText, { color: tc.color }]}>{tier}</Text>
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
        </View>

        {/* Sub-accounts */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Team members</Text>
          {loading ? (
            <ActivityIndicator color="#1A56DB" style={{ marginVertical: 12 }} />
          ) : subAccounts.length === 0 ? (
            <Text style={s.emptyText}>No sub-accounts yet. Invite team members from the web dashboard.</Text>
          ) : (
            subAccounts.map((acc: any, i: number) => (
              <View key={i} style={s.memberRow}>
                <View style={s.memberIcon}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.memberName}>{acc.role}</Text>
                  <Text style={s.memberEmail}>{acc.email}</Text>
                </View>
                <View style={[s.activeDot, { backgroundColor: acc.isActive ? '#059669' : '#9CA3AF' }]} />
              </View>
            ))
          )}
        </View>

        {/* Security */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Security</Text>
          <TouchableOpacity style={s.actionRow} onPress={openEmailModal}>
            <Ionicons name="mail-outline" size={18} color="#1A56DB" style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Change email</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionRow, { borderTopWidth: 0.5, borderTopColor: '#F3F4F6' }]} onPress={openPasswordModal}>
            <Ionicons name="lock-closed-outline" size={18} color="#1A56DB" style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Change password</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={s.section}>
          <TouchableOpacity style={s.actionRow} onPress={() => router.push('/subscription' as any)}>
            <Ionicons name="card-outline" size={18} color="#1A56DB" style={{ marginRight: 12 }} />
            <Text style={s.actionText}>Subscription & billing</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionRow, { borderTopWidth: 0.5, borderTopColor: '#F3F4F6' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 12 }} />
            <Text style={[s.actionText, { color: '#DC2626' }]}>Log out</Text>
            <Ionicons name="chevron-forward-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEmailModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEmailModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Change Email</Text>
            <TouchableOpacity onPress={() => setShowEmailModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={s.fieldLabel}>Current password</Text>
              <TextInput style={s.fieldInput} placeholder="Enter current password" placeholderTextColor="#9CA3AF"
                value={emailPassword} onChangeText={setEmailPassword} secureTextEntry />
            </View>
            <View>
              <Text style={s.fieldLabel}>New email</Text>
              <TextInput style={s.fieldInput} placeholder="new@email.com" placeholderTextColor="#9CA3AF"
                value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
            <Text style={s.modalNote}>We'll email both your old and new address to confirm this change.</Text>
            <TouchableOpacity style={[s.modalConfirmBtn, savingEmail && { opacity: 0.7 }]} onPress={saveEmail} disabled={savingEmail}>
              {savingEmail ? <ActivityIndicator color="#fff" /> : <Text style={s.modalConfirmText}>Update Email</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={showPasswordModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPasswordModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16, gap: 14 }}>
            <View>
              <Text style={s.fieldLabel}>Current password</Text>
              <TextInput style={s.fieldInput} placeholder="Enter current password" placeholderTextColor="#9CA3AF"
                value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={s.fieldLabel}>New password</Text>
              <TextInput style={s.fieldInput} placeholder="At least 8 characters" placeholderTextColor="#9CA3AF"
                value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <PasswordChecklist password={newPassword} />
            </View>
            <View>
              <Text style={s.fieldLabel}>Confirm new password</Text>
              <TextInput style={s.fieldInput} placeholder="Re-enter new password" placeholderTextColor="#9CA3AF"
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
            </View>
            <Text style={s.modalNote}>We'll email you to confirm this change.</Text>
            <TouchableOpacity style={[s.modalConfirmBtn, savingPassword && { opacity: 0.7 }]} onPress={savePassword} disabled={savingPassword}>
              {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={s.modalConfirmText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff', marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  userName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 10, marginTop: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameEditBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '100%', paddingHorizontal: 24 },
  editInput: { flex: 1, borderWidth: 1, borderColor: '#1A56DB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: '#0F172A' },
  editSaveBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  editCancelBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  tierBadgeText: { fontSize: 12, fontWeight: '600' },
  section: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  memberIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 13, fontWeight: '500', color: '#0F172A' },
  memberEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  activeDot: { width: 8, height: 8, borderRadius: 4 },
  emptyText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionText: { flex: 1, fontSize: 14, color: '#0F172A', fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  modalNote: { fontSize: 11.5, color: '#9CA3AF' },
  modalConfirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});