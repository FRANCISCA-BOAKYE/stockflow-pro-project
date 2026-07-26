import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

export const COMMON_UNITS = [
  'kg', 'g', 'litres (L)', 'millilitres (ml)', 'pieces (pcs)', 'boxes', 'packs',
  'bags', 'tonnes', 'metres (m)', 'rolls', 'sheets', 'spools', 'cartons', 'dozens', 'crates',
];

export default function UnitPicker({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={s.fieldLabel}>{label || 'Unit *'}</Text>
      <TouchableOpacity style={s.selectBtn} onPress={() => { setShowCustom(false); setShowModal(true); }}>
        <Text style={[s.selectBtnText, value ? { color: colors.textPrimary } : null]}>{value || 'Select a unit'}</Text>
        <Ionicons name="chevron-down-outline" size={14} color={colors.textPlaceholder} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Unit</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
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
                  <Ionicons name="checkmark-circle" size={18} color={value === item ? colors.success : colors.borderStrong} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={{ padding: 16 }}>
              <Text style={s.fieldLabel}>Custom unit name</Text>
              <TextInput style={s.customInput} placeholder="e.g. drums, bundles, sacks" placeholderTextColor={colors.textPlaceholder}
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

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, backgroundColor: colors.surfaceAlt },
  selectBtnText: { fontSize: 14, color: colors.textPlaceholder },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  optionText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  customInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, backgroundColor: colors.surfaceAlt, marginBottom: 16 },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  confirmText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
