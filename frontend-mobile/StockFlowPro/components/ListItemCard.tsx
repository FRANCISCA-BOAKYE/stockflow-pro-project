import { useMemo } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space, radius } from '../theme/spacing';
import { type } from '../theme/typography';
import { UrgencyStatus, urgencyBorder } from './StatusIndicator';
import PressableScale from './PressableScale';

interface ListItemCardProps {
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  status?: UrgencyStatus;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** Unified list row — replaces the per-screen reimplementation of the urgency-accent card pattern. */
export default function ListItemCard({ leading, title, subtitle, trailing, status = 'neutral', onPress, style }: ListItemCardProps) {
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const content = (
    <View style={[s.card, urgencyBorder(status, colors), style]}>
      {leading}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale onPress={onPress} haptic scaleTo={0.97}>
      {content}
    </PressableScale>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: space[3],
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  body: { flex: 1 },
  title: { ...type.body, fontWeight: '600' as const, color: colors.textPrimary },
  subtitle: { ...type.bodySm, color: colors.textMuted, marginTop: 2 },
});
