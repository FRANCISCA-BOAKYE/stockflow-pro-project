import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space } from '../theme/spacing';
import { type } from '../theme/typography';
import Button from './Button';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IoniconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Themed empty/zero-state block — was previously just a blank list or bare "No items" text. */
export default function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.wrap}>
      <View style={s.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.textPlaceholder} />
      </View>
      <Text style={s.title}>{title}</Text>
      {message ? <Text style={s.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: space[5] }} />
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  wrap: { alignItems: 'center' as const, justifyContent: 'center' as const, paddingVertical: space[10], paddingHorizontal: space[6] },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    backgroundColor: colors.surfaceAlt, marginBottom: space[4],
  },
  title: { ...type.h2, color: colors.textPrimary, marginBottom: 4, textAlign: 'center' as const },
  message: { ...type.bodySm, color: colors.textMuted, textAlign: 'center' as const },
});
