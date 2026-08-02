import { InjectionToken, Provider, Type } from '@angular/core';
import { ArdFormFieldFramePrefixSuffix } from '../../form-field-frame';
import { _simpleInputComponentDefaults, _SimpleInputComponentDefaults } from '../_simple-input-base';

export interface ArdInputDefaults extends _SimpleInputComponentDefaults {
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _inputDefaults: ArdInputDefaults = {
  ..._simpleInputComponentDefaults,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_SIMPLE_INPUT_DEFAULTS = new InjectionToken<ArdInputDefaults>('ard-input-defaults', {
  factory: () => ({
    ..._inputDefaults,
  }),
});

export function provideInputDefaults(config: Partial<ArdInputDefaults>): Provider {
  return { provide: ARD_SIMPLE_INPUT_DEFAULTS, useValue: { ..._inputDefaults, ...config } };
}
