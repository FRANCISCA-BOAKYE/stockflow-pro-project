import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { COUNTRIES, getCountry } from '../constants/countries';

interface Props {
  value: string | undefined;
  onChange: (code: string) => void;
}

export default function CountryPicker({ value, onChange }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const current = getCountry(value);

  return (
    <View>
      <TouchableOpacity style={s.selectBtn} onPress={() => setShowModal(true)}>
        <Text style={s.selectBtnText}>{current.name} · {current.currencyCode}</Text>
        <Ionicons name="chevron-down-outline" size={14} color={colors.textPlaceholder} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={s.hint}>Only Ghana has live card payments today — other countries can still track inventory, sales, and cash/mobile-money in their own currency, with card payments coming soon.</Text>
          <FlatList
            data={COUNTRIES}
            keyExtractor={item => item.code}
            contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.optionItem} onPress={() => { onChange(item.code); setShowModal(false); }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.optionText}>{item.name}</Text>
                  <Text style={s.optionSub}>{item.currencyCode} ({item.currencySymbol}){!item.paystackLive ? ' · Card payments coming soon' : ''}</Text>
                </View>
                <Ionicons name="checkmark-circle" size={18} color={value === item.code ? colors.success : colors.borderStrong} />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 12, backgroundColor: colors.surfaceAlt },
  selectBtnText: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  hint: { fontSize: 11.5, color: colors.textMuted, paddingHorizontal: 16, paddingTop: 12, lineHeight: 16 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceAlt, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: colors.border },
  optionText: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  optionSub: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
});
