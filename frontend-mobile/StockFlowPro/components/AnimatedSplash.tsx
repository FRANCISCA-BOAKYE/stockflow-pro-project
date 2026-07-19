import { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated, Easing } from 'react-native';

const LOGO = require('../assets/splash-icon.png');

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(10)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(90, [
      Animated.parallel([
        Animated.timing(ring1, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.timing(textOpacity, {
      toValue: 1, duration: 420, delay: 520, useNativeDriver: true,
    }).start();
    Animated.timing(textTranslate, {
      toValue: 0, duration: 420, delay: 520, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0, duration: 320, useNativeDriver: true,
      }).start(() => onFinish());
    }, 1750);

    return () => clearTimeout(timer);
  }, []);

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.35, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.4, 3.4] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.22, 0] });

  return (
    <Animated.View style={[styles.page, { opacity: containerOpacity }]} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={[styles.ring, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
        <Animated.View style={[styles.ring, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
        <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: textOpacity, transform: [{ translateY: textTranslate }] }]}>
          StockFlow Pro
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  page: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  logo: { width: 132, height: 132, borderRadius: 30 },
  title: { marginTop: 22, fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
});
