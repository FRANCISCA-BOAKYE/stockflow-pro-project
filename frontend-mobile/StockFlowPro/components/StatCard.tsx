import { useMemo } from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space, radius } from '../theme/spacing';
import { type, tabularNums } from '../theme/typography';
import { useCountUp } from '../hooks/useCountUp';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface StatCardProps {
  icon: IoniconName;
  iconColor: string;
  iconBg: string;
  /** null/undefined renders as '—' (data not loaded yet). */
  value: number | string | null | undefined;
  label: string;
  sub?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Overrides prefix/suffix/decimals — e.g. pass useCurrency()'s `format` for money KPIs so the animated number keeps its currency formatting. */
  formatValue?: (n: number) => string;
  style?: StyleProp<ViewStyle>;
}

/** KPI tile — icon, animated value, label. Replaces each dashboard's duplicated `kpiCard` style. */
export default function StatCard({
  icon, iconColor, iconBg, value, label, sub, prefix = '', suffix = '', decimals = 0, formatValue, style,
}: StatCardProps) {
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const numeric = typeof value === 'number' ? value : undefined;
  const animated = useCountUp(numeric);

  let display: string;
  if (value == null) display = '—';
  else if (typeof value === 'string') display = value;
  else if (formatValue) display = formatValue(animated);
  else display = `${prefix}${animated.toFixed(decimals)}${suffix}`;

  return (
    <View style={[s.card, style]}>
      <View style={[s.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={s.label} numberOfLines={1}>{label}</Text>
      <Text style={[s.value, tabularNums]} numberOfLines={1}>{display}</Text>
      {sub ? <Text style={s.sub} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,
  iconCircle: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    marginBottom: space[3],
  },
  label: { ...type.micro, color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 4 },
  value: { ...type.h1, color: colors.textPrimary, letterSpacing: -0.3 },
  sub: { ...type.micro, color: colors.textPlaceholder, marginTop: 2, textTransform: 'none' as const },
});
