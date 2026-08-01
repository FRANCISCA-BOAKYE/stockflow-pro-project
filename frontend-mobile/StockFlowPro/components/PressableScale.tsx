import { useRef } from 'react';
import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props extends Omit<PressableProps, 'style'> {
  scaleTo?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Drop-in replacement for TouchableOpacity with a bold, visible press-squish + bounce-back. */
export default function PressableScale({
  scaleTo = 0.9,
  haptic = false,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={(e) => {
        Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, friction: 4, tension: 180 }).start();
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3.5, tension: 160 }).start();
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
