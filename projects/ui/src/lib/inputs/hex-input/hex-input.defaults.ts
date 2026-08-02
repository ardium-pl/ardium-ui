import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../../_internal/form-field-component';
import { ArdFormFieldFramePrefixSuffix } from '../../form-field-frame';
import { Nullable } from '../../types/utility.types';
import { CaseTransformerType } from '../input-types';
import { FormElementAppearance, FormElementVariant } from './../../types/theming.types';

export interface ArdHexInputDefaults extends _FormFieldComponentDefaults {
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  placeholder: string;
  case: CaseTransformerType;
  maxDigits: Nullable<number>;
  hideHash: boolean;
  clearable: boolean;
  clearButtonTitle: string;
  inputAttrs: Record<string, any>;
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _hexInputDefaults: ArdHexInputDefaults = {
  ..._formFieldComponentDefaults,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  placeholder: '',
  case: CaseTransformerType.NoChange,
  maxDigits: undefined,
  hideHash: false,
  clearable: false,
  clearButtonTitle: 'Clear',
  inputAttrs: {},
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_HEX_INPUT_DEFAULTS = new InjectionToken<ArdHexInputDefaults>('ard-hex-input-defaults', {
  factory: () => ({
    ..._hexInputDefaults,
  }),
});

export function provideHexInputDefaults(config: Partial<ArdHexInputDefaults>): Provider {
  return { provide: ARD_HEX_INPUT_DEFAULTS, useValue: { ..._hexInputDefaults, ...config } };
}
