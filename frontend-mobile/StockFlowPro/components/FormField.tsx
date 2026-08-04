import { useMemo, useState } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';
import { ThemeColors } from '../theme/colors';
import { space, radius } from '../theme/spacing';
import { type } from '../theme/typography';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: IoniconName;
  error?: string;
  rightElement?: React.ReactNode;
}

/** Labeled icon input with focus state — extracted from login.tsx so every form/modal shares one field style. */
export default function FormField({ label, icon, error, rightElement, style, onFocus, onBlur, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputRow, focused && s.inputFocused]}>
        {icon && (
          <Ionicons name={icon} size={17} color={focused ? colors.primary : colors.textPlaceholder} style={{ marginRight: 10 }} />
        )}
        <TextInput
          style={[s.input, style]}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...inputProps}
        />
        {rightElement}
      </View>
      {error ? (
        <View style={s.errorBox}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => ({
  field: { marginBottom: space[4] },
  label: {
    ...type.caption, color: colors.textSecondary, marginBottom: 7,
    textTransform: 'uppercase' as const, letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    borderWidth: 1.5, borderColor: colors.borderStrong,
    borderRadius: radius.lg, paddingHorizontal: space[4], paddingVertical: 13,
    backgroundColor: colors.surfaceAlt,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.surface },
  input: { ...type.body, color: colors.textPrimary, flex: 1, paddingVertical: 0 },
  errorBox: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6,
    backgroundColor: colors.dangerSurface, borderRadius: radius.md,
    padding: space[3], marginTop: space[2],
    borderWidth: 0.5, borderColor: colors.danger + '40',
  },
  errorText: { ...type.caption, color: colors.danger, flex: 1 },
});
