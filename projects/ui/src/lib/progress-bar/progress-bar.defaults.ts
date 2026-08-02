import { InjectionToken, Provider } from '@angular/core';
import { SimpleComponentColor } from './../types/colors.types';
import { ProgressBarMode, ProgressBarSize, ProgressBarVariant } from './progress-bar.types';

export interface ArdProgressBarDefaults {
  value: number;
  bufferValue: number;
  color: SimpleComponentColor;
  variant: ProgressBarVariant;
  size: ProgressBarSize;
  mode: ProgressBarMode;
}

const _progressBarDefaults: ArdProgressBarDefaults = {
  value: 0,
  bufferValue: 0,
  color: SimpleComponentColor.Primary,
  variant: ProgressBarVariant.Pill,
  size: ProgressBarSize.Default,
  mode: ProgressBarMode.Determinate,
};

export const ARD_PROGRESS_BAR_DEFAULTS = new InjectionToken<ArdProgressBarDefaults>('ard-progress-bar-defaults', {
  factory: () => ({
    ..._progressBarDefaults,
  }),
});

export function provideProgressBarDefaults(config: Partial<ArdProgressBarDefaults>): Provider {
  return { provide: ARD_PROGRESS_BAR_DEFAULTS, useValue: { ..._progressBarDefaults, ...config } };
}
