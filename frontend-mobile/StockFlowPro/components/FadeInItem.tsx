import { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface Props {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Wrap a list row to fade + slide + pop into place on first mount, staggered by index. */
export default function FadeInItem({ index = 0, children, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const delay = Math.min(index * 55, 350);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, friction: 7, tension: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, delay, friction: 6, tension: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}
