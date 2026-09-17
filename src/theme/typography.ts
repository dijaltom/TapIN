import {Platform} from 'react-native';

export const FontFamily = {
  // Use SF Pro on iOS (system font, premium feel)
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  semiBold: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
};

export const LineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.7,
};

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 2.0,
};

export const Typography = {
  hero: {
    fontSize: FontSize['3xl'],
    fontWeight: '700' as const,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  },
  h1: {
    fontSize: FontSize['2xl'],
    fontWeight: '700' as const,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontSize: FontSize.xl,
    fontWeight: '600' as const,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontSize: FontSize.lg,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: '400' as const,
    lineHeight: FontSize.base * LineHeight.normal,
  },
  bodyMedium: {
    fontSize: FontSize.base,
    fontWeight: '500' as const,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: '400' as const,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600' as const,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  mono: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.sm,
  },
};
