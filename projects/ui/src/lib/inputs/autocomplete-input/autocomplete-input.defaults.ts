import { InjectionToken, Provider, Type } from '@angular/core';
import { DropdownPanelAppearance, DropdownPanelVariant } from '../../dropdown-panel/dropdown-panel.types';
import { ArdFormFieldFramePrefixSuffix } from '../../form-field-frame';
import { Nullable } from '../../types/utility.types';
import { _SimpleInputComponentDefaults, _simpleInputComponentDefaults } from '../_simple-input-base';

export interface ArdAutocompleteInputDefaults extends _SimpleInputComponentDefaults {
  suggValueFrom: string;
  suggLabelFrom: string;
  suggestionsLoadingText: string;
  charlist: string | undefined;
  charlistCaseInsensitive: boolean;
  dropdownAppearance: Nullable<DropdownPanelAppearance>;
  dropdownVariant: Nullable<DropdownPanelVariant>;
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _inputDefaults: ArdAutocompleteInputDefaults = {
  ..._simpleInputComponentDefaults,
  suggValueFrom: 'value',
  suggLabelFrom: 'label',
  suggestionsLoadingText: 'Loading...',
  charlist: undefined,
  charlistCaseInsensitive: false,
  dropdownAppearance: undefined,
  dropdownVariant: undefined,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_AUTOCOMPLETE_INPUT_DEFAULTS = new InjectionToken<ArdAutocompleteInputDefaults>('ard-autocomplete-input-defaults', {
  factory: () => ({
    ..._inputDefaults,
  }),
});

export function provideAutocompleteInputDefaults(config: Partial<ArdAutocompleteInputDefaults>): Provider {
  return { provide: ARD_AUTOCOMPLETE_INPUT_DEFAULTS, useValue: { ..._inputDefaults, ...config } };
}
