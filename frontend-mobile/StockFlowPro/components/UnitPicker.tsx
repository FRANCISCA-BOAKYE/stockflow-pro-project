import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const COMMON_UNITS = [
  'kg', 'g', 'litres (L)', 'millilitres (ml)', 'pieces (pcs)', 'boxes', 'packs',
  'bags', 'tonnes', 'metres (m)', 'rolls', 'sheets', 'spools', 'cartons', 'dozens', 'crates',
];

export default function UnitPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.fieldLabel}>{label || 'Unit *'}</Text>
      <TouchableOpacity style={s.selectBtn} onPress={() => { setShowCustom(false); setShowModal(true); }}>
        <Text style={[s.selectBtnText, value ? { color: '#0F172A' } : null]}>{value || 'Select a unit'}</Text>
        <Ionicons name="chevron-down-outline" size={14} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Unit</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {!showCustom ? (
            <FlatList
              data={[...COMMON_UNITS, 'Other (type your own)']}
              keyExtractor={item => item}
              contentContainerStyle={{ padding: 16, gap: 8 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.optionItem} onPress={() => {
                  if (item === 'Other (type your own)') { setShowCustom(true); return; }
                  onChange(item); setShowModal(false);
                }}>
                  <Text style={s.optionText}>{item}</Text>
                  <Ionicons name="checkmark-circle" size={18} color={value === item ? '#059669' : '#E5E7EB'} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={s.fieldLabel}>Custom unit name</Text>
              <TextInput style={s.customInput} placeholder="e.g. drums, bundles, sacks" placeholderTextColor="#9CA3AF"
                value={customValue} onChangeText={setCustomValue} autoFocus />
              <TouchableOpacity style={s.confirmBtn} onPress={() => {
                if (!customValue.trim()) return;
                onChange(customValue.trim()); setShowModal(false); setShowCustom(false); setCustomValue('');
              }}>
                <Text style={s.confirmText}>Use this unit</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#F8FAFC' },
  selectBtnText: { fontSize: 14, color: '#9CA3AF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' },
  optionText: { fontSize: 14, color: '#0F172A', fontWeight: '500' },
  customInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: 16 },
  confirmBtn: { backgroundColor: '#1A56DB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
