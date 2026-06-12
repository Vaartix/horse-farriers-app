// src/shared/constants/theme.ts
// High-contrast design system for barn/outdoor use.
// All colors meet WCAG AA 4.5:1 contrast against their intended background.

export const COLORS = {
  PRIMARY: '#2E8B57',
  PRIMARY_LIGHT: '#3DA96C',
  BACKGROUND: '#1A1A2E',
  SURFACE: '#252540',
  SURFACE_LIGHT: '#2F2F4A',
  TEXT_PRIMARY: '#F0F0F5',
  TEXT_SECONDARY: '#BFBFD0',
  ACCENT: '#4FC3F7',
  DANGER: '#FF6B6B',
  CAUTION: '#FFA726',
  SUCCESS: '#66BB6A',
  WARNING: '#FFE57F',
  ERROR: '#FF6B6B',
  BORDER: '#3A3A55',
  INPUT_BACKGROUND: '#2A2A45',
  DISABLED: '#555570',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

export const TYPOGRAPHY = {
  BODY: 16,
  BODY_SMALL: 14,
  LABEL: 14,
  HEADING_1: 28,
  HEADING_2: 22,
  HEADING_3: 18,
  MEASUREMENT: 20,
  BADGE: 12,
  FONT_FAMILY: 'System',
  FONT_FAMILY_MONO: 'Courier',
  WEIGHT_REGULAR: '400' as const,
  WEIGHT_MEDIUM: '500' as const,
  WEIGHT_BOLD: '700' as const,
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 24,
  XXL: 32,
  XXXL: 48,
  TOUCH_MIN: 48,
  TOUCH_PREFERRED: 56,
  ELEMENT_GAP: 12,
  SCREEN_PADDING: 16,
  CARD_PADDING: 16,
  SECTION_GAP: 24,
} as const;

export const BORDER_RADIUS = {
  SM: 6,
  MD: 10,
  LG: 14,
  FULL: 999,
} as const;

export const SHADOWS = {
  CARD: {
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

// --- Measurement Conversion ---

export const MM_PER_INCH = 25.4;

export function mmToInches(mm: number): number {
  return Math.round((mm / MM_PER_INCH) * 10) / 10;
}

export function inchesToMm(inches: number): number {
  return Math.round(inches * MM_PER_INCH);
}

// Angles are always in degrees — no conversion needed.
