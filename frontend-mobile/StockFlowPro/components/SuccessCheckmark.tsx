import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useThemeColors';

interface Props {
  visible: boolean;
  message?: string;
  onDone: () => void;
  durationMs?: number;
}

const CONFETTI_COUNT = 14;
const CONFETTI_COLORS = ['success', 'primary', 'warning', 'purple', 'pink', 'cyan'] as const;

/** Big, unmissable celebration overlay for a completed sale/payment — checkmark pop, double ring pulse, and a confetti burst. Call onDone to chain into whatever should happen next. */
export default function SuccessCheckmark({ visible, message, onDone, durationMs = 1400 }: Props) {
  const { colors } = useThemeColors();
  const scale = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const messageTranslate = useRef(new Animated.Value(10)).current;
  const confetti = useRef(Array.from({ length: CONFETTI_COUNT }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    ring1.setValue(0);
    ring2.setValue(0);
    opacity.setValue(0);
    messageTranslate.setValue(10);
    confetti.forEach(v => v.setValue(0));

    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
    Animated.timing(ring1, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(ring2, { toValue: 1, duration: 900, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(messageTranslate, { toValue: 0, duration: 350, delay: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    Animated.stagger(18, confetti.map(v =>
      Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    )).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onDone());
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.4] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 3.2] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity, backgroundColor: colors.overlay }]}>
        <View style={styles.center}>
          {confetti.map((v, i) => {
            const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
            const distance = 90 + (i % 3) * 26;
            const tx = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
            const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance] });
            const confettiOpacity = v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });
            const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${(i % 2 === 0 ? 1 : -1) * 220}deg`] });
            const colorKey = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
            return (
              <Animated.View
                key={i}
                style={[
                  styles.confetti,
                  {
                    backgroundColor: colors[colorKey],
                    opacity: confettiOpacity,
                    borderRadius: i % 3 === 0 ? 6 : 2,
                    transform: [{ translateX: tx }, { translateY: ty }, { rotate }],
                  },
                ]}
              />
            );
          })}

          <Animated.View style={[styles.ring, { backgroundColor: colors.success, transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />
          <Animated.View style={[styles.ring, { backgroundColor: colors.success, transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
          <Animated.View style={[styles.circle, { backgroundColor: colors.success, transform: [{ scale }] }]}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </Animated.View>
          {message ? (
            <Animated.Text style={[styles.message, { opacity, transform: [{ translateY: messageTranslate }] }]}>{message}</Animated.Text>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
  circle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', width: 9, height: 9 },
  message: { marginTop: 20, fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
});
