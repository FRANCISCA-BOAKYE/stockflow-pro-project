import { View, Text } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';

export type UrgencyStatus = 'ok' | 'warning' | 'danger' | 'neutral';

/**
 * "Signal strip" pattern: a small dot + muted label instead of a colored
 * pill badge on every row — reserves strong color for rows that actually
 * need attention, so a list doesn't turn into a wall of colored chips.
 */
export function StatusIndicator({ status, label }: { status: UrgencyStatus; label: string }) {
  const { colors } = useThemeColors();
  const dotColor = status === 'ok' ? colors.success
    : status === 'warning' ? colors.warning
    : status === 'danger' ? colors.danger
    : colors.info;
  const textColor = status === 'warning' ? colors.warning
    : status === 'danger' ? colors.danger
    : colors.textMuted;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
      <Text style={{ fontSize: 11, fontWeight: '500', color: textColor }}>{label}</Text>
    </View>
  );
}

/** Spread onto a card/row style to add the left "scan line" for urgent states only. */
export function urgencyBorder(status: UrgencyStatus, colors: ThemeColors) {
  if (status === 'ok' || status === 'neutral') return { borderLeftWidth: 0 };
  const color = status === 'warning' ? colors.warning : colors.danger;
  return { borderLeftWidth: 3, borderLeftColor: color };
}
