import { InjectionToken, Provider, Type } from '@angular/core';
import { _simpleInputComponentDefaults, _SimpleInputComponentDefaults } from '../_simple-input-base';
import { ArdInputPlaceholder, ArdInputPrefix, ArdInputSuffix } from './input.directives';

export interface ArdInputDefaults extends _SimpleInputComponentDefaults {
  PrefixComponent?: Type<ArdInputPrefix>;
  SuffixComponent?: Type<ArdInputSuffix>;
  PlaceholderComponent?: Type<ArdInputPlaceholder>;
}

const _inputDefaults: ArdInputDefaults = {
  ..._simpleInputComponentDefaults,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
  PlaceholderComponent: undefined,
};

export const ARD_SIMPLE_INPUT_DEFAULTS = new InjectionToken<ArdInputDefaults>('ard-input-defaults', {
  factory: () => ({
    ..._inputDefaults,
  }),
});

export function provideInputDefaults(config: Partial<ArdInputDefaults>): Provider {
  return { provide: ARD_SIMPLE_INPUT_DEFAULTS, useValue: { ..._inputDefaults, ...config } };
}
