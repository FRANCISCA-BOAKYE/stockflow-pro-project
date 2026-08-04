import { View, StyleSheet, SafeAreaView, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../hooks/useThemeColors';
import DotGrid from './DotGrid';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  texture?: boolean;
}

/**
 * Drop-in replacement for `<SafeAreaView style={s.page}>` — gives every
 * screen a subtle gradient + dot-grid wash instead of a flat solid color,
 * so nothing reads as a plain white/blank page. Screens using this should
 * drop `backgroundColor` from their `page` style (the gradient supplies it).
 */
export default function ScreenBackground({ children, style, texture = true }: Props) {
  const { colors, isDark } = useThemeColors();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={colors.bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {texture && (
        <DotGrid
          style={StyleSheet.absoluteFill}
          color={isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.025)'}
          spacing={28}
          dotRadius={1}
        />
      )}
      <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
});
