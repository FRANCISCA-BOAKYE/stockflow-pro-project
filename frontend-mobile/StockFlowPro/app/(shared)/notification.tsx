import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NOTIFICATIONS = [
  { id: '1', title: 'Low stock alert', body: 'Steel Rods 6mm is below reorder level (240 / 300 kg)', time: '2 min ago', type: 'warning', read: false },
  { id: '2', title: 'Payment received', body: 'Apex Distributors paid $42,000 for INV-001', time: '1 hour ago', type: 'success', read: false },
  { id: '3', title: 'New order', body: 'Bright Mart placed a bulk order of $2,800', time: '3 hours ago', type: 'info', read: false },
  { id: '4', title: 'Credit overdue', body: 'Sunrise Wholesale credit of $68,000 is overdue', time: 'Yesterday', type: 'error', read: true },
  { id: '5', title: 'Production complete', body: 'Production run #24 completed — 500 units of Steel Bracket A', time: 'Yesterday', type: 'success', read: true },
  { id: '6', title: 'New marketplace listing', body: 'Your listing has been approved and is now live', time: '2 days ago', type: 'info', read: true },
];

const TYPE_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  warning: { bg: '#FFFBEB', color: '#C27803', icon: 'warning-outline' },
  success: { bg: '#ECFDF5', color: '#059669', icon: 'checkmark-circle-outline' },
  info: { bg: '#EFF6FF', color: '#1A56DB', icon: 'information-circle-outline' },
  error: { bg: '#FEF2F2', color: '#DC2626', icon: 'alert-circle-outline' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Notifications</Text>
          <Text style={s.sub}>{unreadCount} unread</Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={s.markBtn} onPress={markAllRead}>
            <Text style={s.markBtnText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const t = TYPE_MAP[item.type];
          return (
            <TouchableOpacity
              style={[s.card, !item.read && s.cardUnread]}
              onPress={() => setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))}
            >
              <View style={[s.icon, { backgroundColor: t.bg }]}>
                <Ionicons name={t.icon as any} size={20} color={t.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.titleRow}>
                  <Text style={s.notifTitle}>{item.title}</Text>
                  {!item.read && <View style={s.dot} />}
                </View>
                <Text style={s.body}>{item.body}</Text>
                <Text style={s.time}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  markBtn: { marginLeft: 'auto', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#EFF6FF', borderRadius: 20 },
  markBtnText: { fontSize: 12, color: '#1A56DB', fontWeight: '500' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  cardUnread: { borderColor: '#1A56DB', borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1A56DB' },
  body: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  time: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
});