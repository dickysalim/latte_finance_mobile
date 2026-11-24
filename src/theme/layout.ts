export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** 8 for inputs and buttons, 12 for cards, full for pills. */
export const radius = {
  md: 8,
  lg: 12,
  full: 9999,
} as const;

export const shadows = {
  card: '0 1px 2px rgba(17, 24, 39, 0.05)',
} as const;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const maxContentWidth = 440;
export const controlHeight = 48;
