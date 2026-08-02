import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../../_internal/form-field-component';
import { ArdFormFieldFramePrefixSuffix } from '../../form-field-frame';
import { OneAxisAlignment } from './../../types/alignment.types';
import { FormElementAppearance, FormElementVariant } from './../../types/theming.types';
import { ArdNumberInputMinMaxBehavior } from './number-input.types';

export interface ArdNumberInputDefaults extends _FormFieldComponentDefaults {
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  placeholder: string;
  alignText: OneAxisAlignment;
  inputAttrs: Record<string, any>;
  min: number;
  max: number;
  minMaxBehavior: ArdNumberInputMinMaxBehavior;
  maxDecimalPlaces: number;
  fixedDecimalPlaces: boolean;
  decimalSeparator: string;
  allowFloat: boolean;
  noButtons: boolean;
  stepSize: number;
  keepFocusOnQuickChangeButton: boolean;
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _numberInputDefaults: ArdNumberInputDefaults = {
  ..._formFieldComponentDefaults,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  placeholder: '',
  alignText: OneAxisAlignment.Center,
  inputAttrs: {},
  min: 0,
  max: Infinity,
  minMaxBehavior: ArdNumberInputMinMaxBehavior.AdjustOnBlur,
  maxDecimalPlaces: Infinity,
  fixedDecimalPlaces: false,
  decimalSeparator: '.',
  allowFloat: false,
  noButtons: false,
  stepSize: 1,
  keepFocusOnQuickChangeButton: true,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_NUMBER_INPUT_DEFAULTS = new InjectionToken<ArdNumberInputDefaults>('ard-number-input-defaults', {
  factory: () => ({
    ..._numberInputDefaults,
  }),
});

export function provideNumberInputDefaults(config: Partial<ArdNumberInputDefaults>): Provider {
  return { provide: ARD_NUMBER_INPUT_DEFAULTS, useValue: { ..._numberInputDefaults, ...config } };
}
