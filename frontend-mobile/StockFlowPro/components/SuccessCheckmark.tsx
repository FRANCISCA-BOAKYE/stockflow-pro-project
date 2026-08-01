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

/** Brief animated checkmark overlay for a completed sale/payment — call onDone to chain into whatever should happen next (e.g. showing the invoice details). */
export default function SuccessCheckmark({ visible, message, onDone, durationMs = 800 }: Props) {
  const { colors } = useThemeColors();
  const scale = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    ring.setValue(0);
    opacity.setValue(0);

    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    Animated.timing(ring, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onDone());
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const ringScale = ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.9] });
  const ringOpacity = ring.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity, backgroundColor: colors.overlay }]}>
        <View style={styles.center}>
          <Animated.View style={[styles.ring, { backgroundColor: colors.success, transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.circle, { backgroundColor: colors.success, transform: [{ scale }] }]}>
            <Ionicons name="checkmark" size={44} color="#FFFFFF" />
          </Animated.View>
          {message ? (
            <Animated.Text style={[styles.message, { opacity }]}>{message}</Animated.Text>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 88, height: 88, borderRadius: 44 },
  circle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  message: { marginTop: 16, fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
