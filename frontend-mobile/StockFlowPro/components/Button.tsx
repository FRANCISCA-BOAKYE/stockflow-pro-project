import { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space, radius } from '../theme/spacing';
import { type } from '../theme/typography';
import PressableScale from './PressableScale';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IoniconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Primary/secondary/ghost/danger button on top of PressableScale — replaces one-off TouchableOpacity + button style blocks. */
export default function Button({
  title, onPress, variant = 'primary', icon, iconPosition = 'right',
  loading = false, disabled = false, style,
}: ButtonProps) {
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const textColor = variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;

  return (
    <PressableScale
      style={[s.base, s[variant], (disabled || loading) && s.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      haptic
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={s.row}>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={18} color={textColor} style={{ marginRight: 8 }} />}
          <Text style={[s.text, { color: textColor }]}>{title}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={18} color={textColor} style={{ marginLeft: 8 }} />}
        </View>
      )}
    </PressableScale>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  base: {
    borderRadius: radius.lg, padding: space[4],
    alignItems: 'center' as const, justifyContent: 'center' as const,
  } as ViewStyle,
  row: { flexDirection: 'row' as const, alignItems: 'center' as const },
  text: { ...type.h2 },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  } as ViewStyle,
  ghost: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  danger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
  disabled: { opacity: 0.6 },
});
