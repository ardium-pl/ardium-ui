import { InjectionToken, Provider, Type } from '@angular/core';
import { _booleanComponentDefaults, _BooleanComponentDefaults } from '../../_internal/boolean-component';
import { StarColor } from '../star.types';
import { ClickStrategy } from './../../types/utility.types';
import { ArdStarButtonStarIcon } from './star-button.directives';

export interface ArdStarButtonDefaults extends _BooleanComponentDefaults {
  clickStrategy: ClickStrategy;
  color: StarColor;
  StarIconComponent?: Type<ArdStarButtonStarIcon>;
}

const _starButtonDefaults: ArdStarButtonDefaults = {
  ..._booleanComponentDefaults,
  clickStrategy: ClickStrategy.Default,
  color: StarColor.Gold,
  StarIconComponent: undefined,
};

export const ARD_STAR_BUTTON_DEFAULTS = new InjectionToken<ArdStarButtonDefaults>('ard-star-button-defaults', {
  factory: () => ({
    ..._starButtonDefaults,
  }),
});

export function provideStarButtonDefaults(config: Partial<ArdStarButtonDefaults>): Provider {
  return { provide: ARD_STAR_BUTTON_DEFAULTS, useValue: { ..._starButtonDefaults, ...config } };
}
