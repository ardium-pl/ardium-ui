import { InjectionToken, Provider, Type } from '@angular/core';
import { ArdStarIcon } from './star.directives';
import { StarColor, StarFillMode } from './star.types';

export interface ArdStarDefaults {
  color: StarColor;
  filled: StarFillMode | boolean;
  StarIconComponent?: Type<ArdStarIcon>;
}

const _starDefaults: ArdStarDefaults = {
  color: StarColor.Gold,
  filled: StarFillMode.None,
  StarIconComponent: undefined,
};

export const ARD_STAR_DEFAULTS = new InjectionToken<ArdStarDefaults>('ard-star-defaults', {
  factory: () => ({
    ..._starDefaults,
  }),
});

export function provideStarDefaults(config: Partial<ArdStarDefaults>): Provider {
  return { provide: ARD_STAR_DEFAULTS, useValue: { ..._starDefaults, ...config } };
}
