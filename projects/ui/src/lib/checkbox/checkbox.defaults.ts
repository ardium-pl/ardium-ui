import { InjectionToken, Provider, Type } from '@angular/core';
import { _booleanComponentDefaults, _BooleanComponentDefaults } from '../_internal/boolean-component';
import { SimpleComponentColor } from './../types/colors.types';
import { ArdCheckboxIcon, ArdCheckboxLabel } from './checkbox.types';

export interface ArdCheckboxDefaults extends _BooleanComponentDefaults {
  color: SimpleComponentColor;
  unselectedColor: SimpleComponentColor;
  CheckboxIconComponent?: Type<ArdCheckboxIcon>;
  LabelComponent?: Type<ArdCheckboxLabel>;
}

const _checkboxDefaults: ArdCheckboxDefaults = {
  ..._booleanComponentDefaults,
  color: SimpleComponentColor.Primary,
  unselectedColor: SimpleComponentColor.None,
  CheckboxIconComponent: undefined,
  LabelComponent: undefined,
};

export const ARD_CHECKBOX_DEFAULTS = new InjectionToken<ArdCheckboxDefaults>('ard-checkbox-defaults', {
  factory: () => ({
    ..._checkboxDefaults,
  }),
});

export function provideCheckboxDefaults(config: Partial<ArdCheckboxDefaults>): Provider {
  return { provide: ARD_CHECKBOX_DEFAULTS, useValue: { ..._checkboxDefaults, ...config } };
}
