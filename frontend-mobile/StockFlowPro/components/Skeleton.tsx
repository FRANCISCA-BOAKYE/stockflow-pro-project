import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';

interface Props {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** A pulsing gray placeholder block — use in place of a spinner for list rows/cards. */
export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: Props) {
  const { colors } = useThemeColors();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: colors.surfaceAlt, opacity: pulse },
        style,
      ]}
    />
  );
}

/** A skeleton shaped like a standard list row (thumbnail + two lines + trailing value). */
export function SkeletonRow() {
  const { colors } = useThemeColors();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
      backgroundColor: colors.surface, borderRadius: 16, borderWidth: 0.5, borderColor: colors.border,
    }}>
      <Skeleton width={44} height={44} borderRadius={10} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={13} />
        <Skeleton width="40%" height={11} />
      </View>
      <Skeleton width={50} height={14} />
    </View>
  );
}
