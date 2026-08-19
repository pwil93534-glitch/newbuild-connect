import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  semibold: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  xs: 16,
  sm: 18,
  base: 20,
  md: 24,
  lg: 26,
  xl: 30,
  '2xl': 36,
  '3xl': 42,
} as const;

export const TextStyles = {
  h1: { fontSize: FontSize['3xl'], fontWeight: FontWeight.bold, lineHeight: LineHeight['3xl'] },
  h2: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, lineHeight: LineHeight['2xl'] },
  h3: { fontSize: FontSize.xl, fontWeight: FontWeight.semibold, lineHeight: LineHeight.xl },
  h4: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, lineHeight: LineHeight.lg },
  h5: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, lineHeight: LineHeight.md },
  bodyLarge: { fontSize: FontSize.md, fontWeight: FontWeight.regular, lineHeight: LineHeight.md },
  body: { fontSize: FontSize.base, fontWeight: FontWeight.regular, lineHeight: LineHeight.base },
  bodySmall: { fontSize: FontSize.sm, fontWeight: FontWeight.regular, lineHeight: LineHeight.sm },
  caption: { fontSize: FontSize.xs, fontWeight: FontWeight.regular, lineHeight: LineHeight.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, lineHeight: LineHeight.sm },
  button: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, lineHeight: LineHeight.md },
} as const;
