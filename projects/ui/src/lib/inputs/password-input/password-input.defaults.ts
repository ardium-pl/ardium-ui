import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../../_internal/form-field-component';
import { FormElementAppearance, FormElementVariant } from './../../types/theming.types';
import { Nullable } from './../../types/utility.types';
import {
  ArdPassowrdInputPlaceholder,
  ArdPasswordInputPrefix,
  ArdPasswordInputRevealButton,
  ArdPasswordInputSuffix,
} from './password-input.directives';

export interface ArdPasswordInputDefaults extends _FormFieldComponentDefaults {
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  placeholder: string;
  revealable: boolean;
  holdToReveal: boolean;
  autoHideTimeoutMs: Nullable<number>;
  revealed: boolean;
  inputAttrs: Record<string, any>;
  PrefixComponent?: Type<ArdPasswordInputPrefix>;
  SuffixComponent?: Type<ArdPasswordInputSuffix>;
  PlaceholderComponent?: Type<ArdPassowrdInputPlaceholder>;
  RevealButtonComponent?: Type<ArdPasswordInputRevealButton>;
}

const _passwordInputDefaults: ArdPasswordInputDefaults = {
  ..._formFieldComponentDefaults,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  placeholder: '',
  revealable: true,
  holdToReveal: false,
  autoHideTimeoutMs: undefined,
  revealed: false,
  inputAttrs: {},
  PrefixComponent: undefined,
  SuffixComponent: undefined,
  PlaceholderComponent: undefined,
  RevealButtonComponent: undefined,
};

export const ARD_PASSWORD_INPUT_DEFAULTS = new InjectionToken<ArdPasswordInputDefaults>('ard-password-input-defaults', {
  factory: () => ({
    ..._passwordInputDefaults,
  }),
});

export function providePasswordInputDefaults(config: Partial<ArdPasswordInputDefaults>): Provider {
  return { provide: ARD_PASSWORD_INPUT_DEFAULTS, useValue: { ..._passwordInputDefaults, ...config } };
}
