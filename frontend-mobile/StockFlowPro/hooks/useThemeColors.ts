import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';

export function useThemeColors(): { colors: ThemeColors; isDark: boolean } {
  const mode = useThemeStore(s => s.mode);
  const systemScheme = useColorScheme();

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}
