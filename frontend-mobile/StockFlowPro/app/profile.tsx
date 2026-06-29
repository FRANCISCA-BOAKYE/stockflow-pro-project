import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const getTeamForTier = (tier?: string) => {
  if (tier === 'MANUFACTURER') {
    return [
      { id: '1', name: 'You', role: 'Company Admin', email: 'you@business.com', isCurrentUser: true },
      { id: '2', name: 'James Mensah', role: 'Production Supervisor', email: 'production@business.com', isCurrentUser: false },
      { id: '3', name: 'Grace Owusu', role: 'Store Keeper', email: 'store@business.com', isCurrentUser: false },
      { id: '4', name: 'Kwesi Appiah', role: 'POS Operator', email: 'pos@business.com', isCurrentUser: false },
    ];
  }
  if (tier === 'WHOLESALER') {
    return [
      { id: '1', name: 'You', role: 'Warehouse Admin', email: 'you@business.com', isCurrentUser: true },
      { id: '2', name: 'James Mensah', role: 'Receiving Staff', email: 'receiving@business.com', isCurrentUser: false },
      { id: '3', name: 'Grace Owusu', role: 'Sales Staff', email: 'sales@business.com', isCurrentUser: false },
    ];
  }
  return [
    { id: '1', name: 'You', role: 'Shop Owner', email: 'you@business.com', isCurrentUser: true },
    { id: '2', name: 'Grace Owusu', role: 'Shop Staff', email: 'staff@business.com', isCurrentUser: false },
  ];
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const TEAM_MEMBERS = getTeamForTier(user?.tierType);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSave = () => {
    Alert.alert('Profile updated', 'Your changes have been saved.');
    setEditing(false);
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Profile</Text>
          <Text style={s.sub}>Account & team management</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          {editing ? (
            <View style={{ flex: 1, gap: 8 }}>
              <TextInput style={s.editInput} value={name} onChangeText={setName} placeholder="Full name" />
              <TextInput style={s.editInput} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user?.name || 'User'}</Text>
              <Text style={s.userEmail}>{user?.email}</Text>
              <Text style={s.userRole}>{user?.role} · {user?.businessName}</Text>
            </View>
          )}
          <TouchableOpacity style={s.editBtn} onPress={() => editing ? handleSave() : setEditing(true)}>
            <Ionicons name={editing ? 'checkmark-outline' : 'pencil-outline'} size={16} color={editing ? '#059669' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>Team members with access</Text>
        <View style={s.teamCard}>
          {TEAM_MEMBERS.map((member, i) => (
            <View key={member.id} style={[s.memberRow, i < TEAM_MEMBERS.length - 1 && s.memberBorder]}>
              <View style={s.memberAvatar}>
                <Text style={s.memberAvatarText}>{member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.memberName}>{member.name} {member.isCurrentUser && '(You)'}</Text>
                <Text style={s.memberEmail}>{member.email}</Text>
              </View>
              <View style={[s.roleBadge, member.isCurrentUser && s.adminBadge]}>
                <Text style={[s.roleBadgeText, member.isCurrentUser && s.adminBadgeText]}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.inviteBtn} onPress={() => Alert.alert('Invite', 'Invite a team member by email — coming soon.')}>
          <Ionicons name="person-add-outline" size={16} color="#1A56DB" style={{ marginRight: 6 }} />
          <Text style={s.inviteBtnText}>Invite team member</Text>
        </TouchableOpacity>
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
  body: { padding: 12, gap: 16, paddingBottom: 100 },
  profileCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#1A56DB', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  userRole: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  editInput: { borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 8, padding: 8, fontSize: 13 },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  teamCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  memberBorder: { borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontSize: 12, fontWeight: '700', color: '#1A56DB' },
  memberName: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  memberEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  roleBadge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
  adminBadge: { backgroundColor: '#EFF6FF' },
  roleBadgeText: { fontSize: 10, fontWeight: '500', color: '#6B7280' },
  adminBadgeText: { color: '#1A56DB' },
  inviteBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: '#1A56DB' },
  inviteBtnText: { fontSize: 14, fontWeight: '600', color: '#1A56DB' },
});