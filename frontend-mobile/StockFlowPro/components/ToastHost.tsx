import { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '../hooks/useThemeColors';
import { registerToastListener } from './toast';

const HAPTIC_FOR_TYPE = {
  success: Haptics.NotificationFeedbackType.Success,
  error: Haptics.NotificationFeedbackType.Error,
  info: Haptics.NotificationFeedbackType.Warning,
} as const;

const ICONS = { success: 'checkmark-circle', error: 'alert-circle', info: 'information-circle' } as const;

/** Mounted once at the root. Anywhere else in the app, call showToast(msg) to trigger it. */
export default function ToastHost() {
  const { colors } = useThemeColors();
  const [item, setItem] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    registerToastListener((message, type) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setItem({ message, type });
      Haptics.notificationAsync(HAPTIC_FOR_TYPE[type]).catch(() => {});
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 60 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setItem(null));
      }, 2200);
    });
    return () => registerToastListener(null);
  }, []);

  if (!item) return null;

  const tint = item.type === 'success' ? colors.success : item.type === 'error' ? colors.danger : colors.info;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        s.container,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Animated.View style={[s.toast, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
        <Ionicons name={ICONS[item.type]} size={18} color={tint} />
        <Text style={[s.text, { color: colors.textPrimary }]} numberOfLines={2}>{item.message}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, bottom: 110, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 0.5, paddingVertical: 12, paddingHorizontal: 16,
    maxWidth: 420, width: '100%',
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } } : { elevation: 6 }),
  },
  text: { flex: 1, fontSize: 13.5, fontWeight: '600' },
});
