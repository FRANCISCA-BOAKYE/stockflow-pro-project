import { useCallback, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Themed bottom-sheet replacement for Alert.alert() confirmations.
 * Usage:
 *   const { confirm, element } = useConfirmSheet();
 *   const ok = await confirm({ title: 'Delete material', message: '...', destructive: true, confirmLabel: 'Delete' });
 *   if (ok) { ...perform the action... }
 *   return (<>...{element}</>)
 */
export function useConfirmSheet() {
  const { colors } = useThemeColors();
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setOpts(options);
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpts(null);
  };

  const element = (
    <Modal visible={!!opts} transparent animationType="fade" onRequestClose={() => settle(false)}>
      <TouchableOpacity style={s(colors).backdrop} activeOpacity={1} onPress={() => settle(false)}>
        <TouchableOpacity activeOpacity={1} style={s(colors).sheet}>
          {opts?.icon && (
            <View style={[s(colors).iconBox, { backgroundColor: opts.destructive ? colors.dangerSurface : colors.primarySurface }]}>
              <Ionicons name={opts.icon} size={22} color={opts.destructive ? colors.danger : colors.primary} />
            </View>
          )}
          <Text style={s(colors).title}>{opts?.title}</Text>
          {opts?.message ? <Text style={s(colors).message}>{opts.message}</Text> : null}
          <View style={s(colors).row}>
            <TouchableOpacity style={s(colors).cancelBtn} onPress={() => settle(false)}>
              <Text style={s(colors).cancelText}>{opts?.cancelLabel || 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s(colors).confirmBtn, { backgroundColor: opts?.destructive ? colors.danger : colors.primary }]}
              onPress={() => settle(true)}
            >
              <Text style={s(colors).confirmText}>{opts?.confirmLabel || 'Confirm'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return { confirm, element };
}

const s = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surfaceRaised, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  message: { fontSize: 13.5, color: colors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' },
  cancelBtn: { flex: 1, height: 48, borderRadius: 6, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  confirmBtn: { flex: 1, height: 48, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
