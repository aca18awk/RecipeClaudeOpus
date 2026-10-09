/**
 * App colour palette for light and dark mode.
 * Text/background pairs are chosen to meet WCAG AA contrast (4.5:1 for body text).
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1F1A17',
    background: '#FBF7F3',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1E9E1',
    textSecondary: '#5E554F',
    border: '#D9CEC4',
    /** Edges of inputs and controls; meets 3:1 non-text contrast (WCAG 1.4.11). */
    borderStrong: '#857970',
    tint: '#A8401A',
    onTint: '#FFFFFF',
    tintSoft: '#F8E3D8',
    danger: '#B3261E',
    onDanger: '#FFFFFF',
    overlay: 'rgba(20, 16, 14, 0.5)',
    inverseBackground: '#2B2522',
    inverseText: '#FFFFFF',
    inverseTint: '#FFB59A',
    easyBackground: '#D6F0DB',
    easyText: '#14532D',
    easyDot: '#2E9F4E',
    mediumBackground: '#FCE8BD',
    mediumText: '#6E4300',
    mediumDot: '#E2A21A',
    hardBackground: '#F9D6D2',
    hardText: '#8C1D18',
    hardDot: '#D93A2F',
  },
  dark: {
    text: '#F5EFEA',
    background: '#14110F',
    backgroundElement: '#221D1A',
    backgroundSelected: '#302925',
    textSecondary: '#C2B7AE',
    border: '#4A403A',
    borderStrong: '#8A7D74',
    tint: '#F49A70',
    onTint: '#1F1A17',
    tintSoft: '#45291D',
    danger: '#FFB4AB',
    onDanger: '#4A0E09',
    overlay: 'rgba(0, 0, 0, 0.6)',
    inverseBackground: '#EDE5DF',
    inverseText: '#1F1A17',
    inverseTint: '#A8401A',
    easyBackground: '#1C3A25',
    easyText: '#A9E5B6',
    easyDot: '#4CC26E',
    mediumBackground: '#47340E',
    mediumText: '#F8D68D',
    mediumDot: '#F0B53A',
    hardBackground: '#4B1D19',
    hardText: '#F7B8B0',
    hardDot: '#F0574B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeColors = { [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 14,
  large: 20,
  pill: 999,
} as const;

/** Minimum touch target size (Android recommends 48dp, iOS 44pt). */
export const MinTouchSize = 48;

/** System text-size multiplier above which side-by-side layouts stack vertically. */
export const LargeTextScale = 1.35;

export const MaxContentWidth = 800;
