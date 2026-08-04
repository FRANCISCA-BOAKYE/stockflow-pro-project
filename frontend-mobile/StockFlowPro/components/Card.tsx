import { useMemo } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space, radius } from '../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  padding?: number;
  radiusSize?: keyof typeof radius;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Shared themed surface with a consistent radius/shadow — replaces the ad hoc "flat View + thin border" pattern repeated per screen. */
export default function Card({ children, padding = space[5], radiusSize = 'xl', elevated = true, style }: CardProps) {
  const { colors, isDark } = useThemeColors();
  const s = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={[s.card, { padding, borderRadius: radius[radiusSize] }, elevated && s.elevated, style]}>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors, isDark: boolean) => ({
  card: {
    backgroundColor: colors.surface,
  } as ViewStyle,
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.4 : 0.08,
    shadowRadius: 24,
    elevation: 8,
  } as ViewStyle,
});
