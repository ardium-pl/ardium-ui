import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../../_internal/form-field-component';
import { StarColor } from '../star.types';
import { ArdRatingInputStarButton } from './rating-input.directives';

export interface ArdRatingInputDefaults extends _FormFieldComponentDefaults {
  color: StarColor;
  max: number;
  StarButtonComponent?: Type<ArdRatingInputStarButton>;
}

const _ratingInputDefaults: ArdRatingInputDefaults = {
  ..._formFieldComponentDefaults,
  color: StarColor.Gold,
  max: 5,
  StarButtonComponent: undefined,
};

export const ARD_RATING_INPUT_DEFAULTS = new InjectionToken<ArdRatingInputDefaults>('ard-rating-input-defaults', {
  factory: () => ({
    ..._ratingInputDefaults,
  }),
});

export function provideRatingInputDefaults(config: Partial<ArdRatingInputDefaults>): Provider {
  return { provide: ARD_RATING_INPUT_DEFAULTS, useValue: { ..._ratingInputDefaults, ...config } };
}
