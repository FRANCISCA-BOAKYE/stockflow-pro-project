import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function MyListingScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPremium, setIsPremium] = useState(user?.subscriptionPlan === 'PREMIUM');
  const [form, setForm] = useState({
    headline: '', description: '', deliveryTerms: '', creditTerms: '',
    location: '', contactEmail: user?.email || '', contactPhone: '',
  });

  useEffect(() => {
    api.get('/marketplace/my-listing')
      .then(res => {
        const data = res.data;
        if (data && data.exists !== false) {
          setForm({
            headline: data.headline || '',
            description: data.description || '',
            deliveryTerms: data.deliveryTerms || '',
            creditTerms: data.creditTerms || '',
            location: data.location || '',
            contactEmail: data.contactEmail || user?.email || '',
            contactPhone: data.contactPhone || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.headline.trim() || !form.location.trim() || !form.contactEmail.trim()) {
      Alert.alert('Missing info', 'Headline, location and contact email are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/marketplace/listing', form);
      setIsPremium(true);
      Alert.alert('Success', 'Your business is now listed on the marketplace.');
      router.back();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || '';
      if (msg.toLowerCase().includes('premium')) {
        setIsPremium(false);
      } else {
        Alert.alert('Error', msg || 'Could not save your listing.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#1A56DB" /></View>;

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View>
          <Text style={s.title}>Marketplace Listing</Text>
          <Text style={s.sub}>Let other businesses find and link with you</Text>
        </View>
      </View>

      {!isPremium ? (
        <View style={s.upgradeBox}>
          <Ionicons name="lock-closed-outline" size={32} color="#C27803" />
          <Text style={s.upgradeTitle}>Premium feature</Text>
          <Text style={s.upgradeText}>Listing your business on the marketplace requires a Premium subscription.</Text>
          <TouchableOpacity style={s.upgradeBtn} onPress={() => Linking.openURL('https://phenomenal-blini-7b80dd.netlify.app/pricing')}>
            <Text style={s.upgradeBtnText}>View plans</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
          {[
            { label: 'Headline *', key: 'headline', placeholder: 'e.g. Quality baked goods, wholesale supply' },
            { label: 'Description', key: 'description', placeholder: 'What you offer, capacity, specialties...', multiline: true },
            { label: 'Delivery terms', key: 'deliveryTerms', placeholder: 'e.g. Nationwide delivery, 3-5 business days' },
            { label: 'Credit terms', key: 'creditTerms', placeholder: 'e.g. 14-day credit for verified partners' },
            { label: 'Location *', key: 'location', placeholder: 'e.g. Spintex, Accra' },
            { label: 'Contact email *', key: 'contactEmail', placeholder: 'you@business.com', keyboard: 'email-address' },
            { label: 'Contact phone', key: 'contactPhone', placeholder: '+233...' },
          ].map(field => (
            <View key={field.key} style={{ marginBottom: 16 }}>
              <Text style={s.fieldLabel}>{field.label}</Text>
              <TextInput
                style={[s.fieldInput, field.multiline && { height: 90, textAlignVertical: 'top' }]}
                placeholder={field.placeholder}
                placeholderTextColor="#9CA3AF"
                value={(form as any)[field.key]}
                onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                keyboardType={(field.keyboard as any) || 'default'}
                multiline={field.multiline}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.confirmBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnText}>Save & Publish</Text>}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F0F4F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 16, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  body: { padding: 16, paddingBottom: 60 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  fieldInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#fff' },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  upgradeBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  upgradeTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  upgradeText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  upgradeBtn: { backgroundColor: '#1A56DB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
