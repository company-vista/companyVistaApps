import { s } from './responsive';

export const font = {
  xs: s(8),
  sm: s(9),
  base: s(12),
  md: s(13),
  lg: s(14),
  xl: s(15),
  xxl: s(16),
  title: s(17),
  heading: s(17),
  hero: s(20),
  display: s(22),
  large: s(24),
} as const;

export type FontSize = keyof typeof font;
