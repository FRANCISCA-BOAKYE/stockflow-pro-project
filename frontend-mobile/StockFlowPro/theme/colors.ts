export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textPlaceholder: string;
  primary: string;
  primaryDark: string;
  primarySurface: string;
  onPrimary: string;
  purple: string;
  purpleDark: string;
  purpleSurface: string;
  success: string;
  successText: string;
  successSurface: string;
  danger: string;
  dangerText: string;
  dangerSurface: string;
  warning: string;
  warningText: string;
  warningSurface: string;
  info: string;
  infoText: string;
  infoSurface: string;
  cyan: string;
  cyanSurface: string;
  pink: string;
  pinkSurface: string;
  shadow: string;
  overlay: string;
  statusBar: 'light' | 'dark';
}

// Unchanged from the app's existing look — every screen already uses these exact hexes.
export const lightColors: ThemeColors = {
  bg: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  surfaceRaised: '#FFFFFF',
  border: '#F3F4F6',
  borderStrong: '#E5E7EB',
  textPrimary: '#0F172A',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textPlaceholder: '#9CA3AF',
  primary: '#1A56DB',
  primaryDark: '#1E429F',
  primarySurface: '#EFF6FF',
  onPrimary: '#FFFFFF',
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  purpleSurface: '#F5F3FF',
  success: '#059669',
  successText: '#065F46',
  successSurface: '#ECFDF5',
  danger: '#DC2626',
  dangerText: '#991B1B',
  dangerSurface: '#FEF2F2',
  warning: '#C27803',
  warningText: '#92400E',
  warningSurface: '#FFFBEB',
  info: '#4F46E5',
  infoText: '#3730A3',
  infoSurface: '#EEF2FF',
  cyan: '#0891B2',
  cyanSurface: '#ECFEFF',
  pink: '#DB2777',
  pinkSurface: '#FDF2F8',
  shadow: '#1A56DB',
  overlay: 'rgba(15,23,42,0.4)',
  statusBar: 'dark',
};

// Tuned for real contrast and richness, not just an inverted palette — deep
// brand-tinted navy rather than pure black, lifted accent tones so they still
// read as blue/purple/green/red/amber against a dark surface (AA-friendly).
export const darkColors: ThemeColors = {
  bg: '#0A0E1A',
  surface: '#141B2E',
  surfaceAlt: '#1B2338',
  surfaceRaised: '#1E273D',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  textPrimary: '#F1F5F9',
  textSecondary: '#C3CBDC',
  textMuted: '#8A96B0',
  textPlaceholder: '#6B7690',
  primary: '#4C82F7',
  primaryDark: '#2F5FD8',
  primarySurface: 'rgba(76,130,247,0.16)',
  onPrimary: '#FFFFFF',
  purple: '#A78BFA',
  purpleDark: '#8B5CF6',
  purpleSurface: 'rgba(167,139,250,0.16)',
  success: '#34D399',
  successText: '#6EE7B7',
  successSurface: 'rgba(52,211,153,0.14)',
  danger: '#F87171',
  dangerText: '#FCA5A5',
  dangerSurface: 'rgba(248,113,113,0.14)',
  warning: '#FBBF24',
  warningText: '#FCD34D',
  warningSurface: 'rgba(251,191,36,0.14)',
  info: '#818CF8',
  infoText: '#A5B4FC',
  infoSurface: 'rgba(129,140,248,0.14)',
  cyan: '#22D3EE',
  cyanSurface: 'rgba(34,211,238,0.14)',
  pink: '#F472B6',
  pinkSurface: 'rgba(244,114,182,0.14)',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.6)',
  statusBar: 'light',
};
