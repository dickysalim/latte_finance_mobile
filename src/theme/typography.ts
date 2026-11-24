import type { TextStyle } from 'react-native';

import { palette } from './colors';

/** Font family names registered in src/theme/fonts.ts. One file per weight, so no fontWeight. */
export const fontFamily = {
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  bodyExtraBold: 'PlusJakartaSans_800ExtraBold',
  headingMedium: 'Outfit_500Medium',
  headingSemiBold: 'Outfit_600SemiBold',
  headingBold: 'Outfit_700Bold',
} as const;

export const type = {
  display: {
    fontFamily: fontFamily.headingBold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.4,
    color: palette.textHeading,
  },
  title: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
    color: palette.textHeading,
  },
  headline: {
    fontFamily: fontFamily.headingSemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: palette.textHeading,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textBody,
  },
  bodyStrong: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textHeading,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.textBody,
  },
  button: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 18,
    color: palette.textHint,
  },
  error: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: palette.error,
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
