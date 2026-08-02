import { InjectionToken, Provider, Type } from '@angular/core';
import { _FocusableComponentDefaults, _focusableComponentDefaults } from '../_internal/focusable-component';
import { FormElementAppearance, FormElementVariant } from './../types/theming.types';
import { ArdFormFieldFramePrefixSuffix } from './form-field-frame.types';

export interface ArdFormFieldFrameDefaults extends _FocusableComponentDefaults {
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _formFieldFrameDefaults: ArdFormFieldFrameDefaults = {
  ..._focusableComponentDefaults,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_FORM_FIELD_FRAME_DEFAULTS = new InjectionToken<ArdFormFieldFrameDefaults>('ard-form-field-frame-defaults', {
  factory: () => ({
    ..._formFieldFrameDefaults,
  }),
});

export function provideFormFieldFrameDefaults(config: Partial<ArdFormFieldFrameDefaults>): Provider {
  return { provide: ARD_FORM_FIELD_FRAME_DEFAULTS, useValue: { ..._formFieldFrameDefaults, ...config } };
}
