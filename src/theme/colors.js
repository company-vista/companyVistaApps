import { useAppSelector } from '../store/hooks';
export const appThemes = {
    light: {
        mode: 'light',
        // Backgrounds
        background: '#F8F9FA',
        backgroundGradient: ['#CCFBF1', '#F1F5F9'],
        authBackground: '#0F172A',

        // Surfaces & Cards
        surface: '#FFFFFF',
        surfaceAlt: '#ECFEFF',
        cardHighlight: '#FFFFFF',
        cardElevated: '#FFFFFF', // Translucency remove karke solid rakha hai cleaner look ke liye
        sheet: '#F1F5F9',

        // Text Hierarchy
        text: '#0F172A',          // Primary Text
        textOnDark: '#F8FAFC',    // Text on Dark Backgrounds
        muted: '#475569',         // Secondary Text (slate-600)
        subtle: '#94A3B8',        // Tertiary / Captions / Disabled Text (slate-400)

        // Borders & Inputs
        border: '#E2E8F0',
        inputBorder: '#CBD5E1',
        inputBackground: '#FFFFFF',
        inputText: '#0F172A',
        inputPlaceholder: '#94A3B8',

        // Brand & Primary Actions (Teal Theme)
        primary: '#14B8A6',       // Main Brand / Action Color (teal-500)
        primaryText: '#042F2E',   // Text on soft primary surfaces
        accent: '#0F766E',        // Solid Deep Accent (teal-700)
        accentSoft: '#CCFBF1',    // Light Teal Background (teal-100)

        // Buttons (Aligned with Teal Primary Palette)
        buttonBackground: '#0D9488', // Primary Teal Action Button (teal-600)
        buttonText: '#FFFFFF',       // Clean White Text on Teal Button
        // Agar Gold/Yellow button intentionally rakhna tha, to ye try karein:
        // buttonBackground: '#EAB308',
        // buttonText: '#0F172A',

        // Navigation & States
        activeNav: '#E0F2FE',
        danger: '#DC2626',
        skeleton: '#E2E8F0',
        shadow: '#0F172A',
        backdrop: 'rgba(15, 23, 42, 0.4)',
    },
    dark: {
        mode: 'dark',
        background: '#000',
        authBackground: '#020617',
        surface: '#06080ecb',
        surfaceAlt: '#164e63',
        cardHighlight: '#1E1E1E',
        cardElevated: '#0D1B2A',
        sheet: '#111827',
        text: '#f8fafcf1',
        textOnDark: '#000',
        muted: '#8f98a1',
        subtle: '#94a3b8',
        border: '#33415575',
        inputBorder: '#475569',
        inputBackground: '#020617',
        inputText: '#f8fafc',
        inputPlaceholder: '#94a3b8',
        primary: '#abcec8',
        primaryText: '#042f2e',
        buttonBackground: '#c9a84c',
        buttonText: '#042f2e',
        accent: '#5eead5e1',
        accentSoft: '#134e4a',
        activeNav: '#134e4a',
        danger: '#ef4444',
        skeleton: '#334155',
        shadow: '#000000',
        backdrop: 'rgba(2, 6, 23, 0.62)',
    },
};
export function useThemeColors() {
    const mode = useAppSelector(state => state.theme.mode);
    return appThemes[mode];
}
