import { InjectionToken, Provider, Type } from '@angular/core';
import { StarColor } from '../star.types';
import { ArdRatingDisplayStar } from './rating-display.directives';

export interface ArdRatingDisplayDefaults {
  color: StarColor;
  max: number;
  value: number;
  StarIconComponent?: Type<ArdRatingDisplayStar>;
}

const _ratingDisplayDefaults: ArdRatingDisplayDefaults = {
  color: StarColor.Gold,
  max: 5,
  value: 0,
  StarIconComponent: undefined,
};

export const ARD_RATING_DISPLAY_DEFAULTS = new InjectionToken<ArdRatingDisplayDefaults>('ard-rating-display-defaults', {
  factory: () => ({
    ..._ratingDisplayDefaults,
  }),
});

export function provideRatingDisplayDefaults(config: Partial<ArdRatingDisplayDefaults>): Provider {
  return { provide: ARD_RATING_DISPLAY_DEFAULTS, useValue: { ..._ratingDisplayDefaults, ...config } };
}
