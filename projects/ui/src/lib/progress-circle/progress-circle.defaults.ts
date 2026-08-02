import { InjectionToken, Provider, Type } from '@angular/core';
import { SimpleComponentColor } from '../types/colors.types';
import { ArdProgressCircleValueComponent, ProgressCircleAppearance, ProgressCircleVariant } from './progress-circle.types';

export interface ArdProgressCircleDefaults {
  value: number;
  max: number;
  color: SimpleComponentColor;
  appearance: ProgressCircleAppearance;
  variant: ProgressCircleVariant;
  hideValue: boolean;
  reverse: boolean;
  ValueComponent?: Type<ArdProgressCircleValueComponent>;
}

const _progressCircleDefaults: ArdProgressCircleDefaults = {
  value: 0,
  max: 100,
  color: SimpleComponentColor.Primary,
  appearance: ProgressCircleAppearance.Transparent,
  variant: ProgressCircleVariant.Full,
  hideValue: false,
  reverse: false,
  ValueComponent: undefined,
};

export const ARD_PROGRESS_CIRCLE_DEFAULTS = new InjectionToken<ArdProgressCircleDefaults>('ard-progress-circle-defaults', {
  factory: () => ({
    ..._progressCircleDefaults,
  }),
});

export function provideProgressCircleDefaults(config: Partial<ArdProgressCircleDefaults>): Provider {
  return { provide: ARD_PROGRESS_CIRCLE_DEFAULTS, useValue: { ..._progressCircleDefaults, ...config } };
}
