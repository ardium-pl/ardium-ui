
export const ProgressBarSize = {
  Default: 'default',
  Auto: 'auto',
} as const;
export type ProgressBarSize = (typeof ProgressBarSize)[keyof typeof ProgressBarSize];

export const ProgressBarAppearance = {
  Colorless: 'colorless',
  Colored: 'colored',
} as const;
export type ProgressBarAppearance = (typeof ProgressBarAppearance)[keyof typeof ProgressBarAppearance];

export const ProgressBarVariant = {
  Sharp: 'sharp',
  Pill: 'pill',
} as const;
export type ProgressBarVariant = (typeof ProgressBarVariant)[keyof typeof ProgressBarVariant];

export const ProgressBarMode = {
  Determinate: 'determinate',
  Indeterminate: 'indeterminate',
  Buffer: 'buffer',
  Query: 'query',
} as const;
export type ProgressBarMode = (typeof ProgressBarMode)[keyof typeof ProgressBarMode];
