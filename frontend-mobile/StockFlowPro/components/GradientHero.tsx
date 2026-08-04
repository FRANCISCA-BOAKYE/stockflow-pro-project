import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DotGrid from './DotGrid';
import { useThemeColors } from '../hooks/useThemeColors';

interface GradientHeroProps {
  children: React.ReactNode;
  paddingTop?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
  bubbles?: boolean;
  dotGrid?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Navy gradient hero shell (dot-grid texture + soft bubble blobs) shared by the
 * auth screens and role dashboards — pass header content in as children.
 */
export default function GradientHero({
  children,
  paddingTop = 60,
  paddingBottom = 50,
  paddingHorizontal = 0,
  bubbles = true,
  dotGrid = true,
  style,
}: GradientHeroProps) {
  const { colors } = useThemeColors();
  return (
    <LinearGradient
      colors={colors.heroGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop, paddingBottom }, style]}
    >
      {bubbles && <View style={styles.bubbleTopRight} />}
      {bubbles && <View style={styles.bubbleBottomLeft} />}
      {dotGrid && <DotGrid style={styles.grid} color="rgba(255,255,255,0.08)" />}
      <View style={[styles.content, { paddingHorizontal }]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', position: 'relative' },
  bubbleTopRight: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(59,130,246,0.14)',
  },
  bubbleBottomLeft: {
    position: 'absolute', bottom: -40, left: -40,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { width: '100%', zIndex: 1 },
});
