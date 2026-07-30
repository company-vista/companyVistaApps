import { useAppSelector } from '../store/hooks';

export const appThemes = {
  light: {
    mode: 'light',
    background: '#F1F5F9', // f8fafc
    backgroundGradient: ['#ccfbf1', '#f1f5f9'] as const,
    authBackground: '#0f172a',
    surface: '#ffffff',
    surfaceAlt: '#ecfeff',
    sheet: '#f1f5f9',
    text: '#0F172A',
    textOnDark: '#f8fafc',
    muted: '#64748b',
    subtle: '#94a3b8',
    border: '#e5e7ebe5',
    inputBorder: '#334155',
    inputBackground: '#111827',
    inputText: '#f8fafc',
    inputPlaceholder: '#64748b',
    primary: '#14b8a6',
    primaryText: '#042f2e',
    buttonBackground: '#276897',
    buttonText: '#ffffff',
    accent: '#0f766dbb',
    accentSoft: '#ccfbf1',
    activeNav: '#fff3eb',
    danger: '#dc2626',
    skeleton: '#e5e7eb',
    shadow: '#000000',
    backdrop: 'rgba(15, 23, 42, 0.28)',
  },
  dark: {
    mode: 'dark',
    background: '#0f172a',
    authBackground: '#020617',
    surface: '#111827',
    surfaceAlt: '#164e63',
    sheet: '#111827',
    text: '#f8fafc',
    textOnDark: '#f8fafc',
    muted: '#cbd5e1',
    subtle: '#94a3b8',
    border: '#334155',
    inputBorder: '#475569',
    inputBackground: '#020617',
    inputText: '#f8fafc',
    inputPlaceholder: '#94a3b8',
    primary: '#abcec8',
    primaryText: '#042f2e',
    buttonBackground: '#234d6f',
    buttonText: '#042f2e',
    accent: '#5eead4',
    accentSoft: '#134e4a',
    activeNav: '#134e4a',
    danger: '#ef4444',
    skeleton: '#334155',
    shadow: '#000000',
    backdrop: 'rgba(2, 6, 23, 0.62)',
  },
} as const;

export type AppTheme = typeof appThemes.light | typeof appThemes.dark;

export function useThemeColors() {
  const mode = useAppSelector(state => state.theme.mode);

  return appThemes[mode];
}
