import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../_internal/form-field-component';
import { DropdownPanelAppearance, DropdownPanelVariant } from '../dropdown-panel';
import { ArdFormFieldFramePrefixSuffix } from '../form-field-frame';
import { searchFunctions } from '../search-functions';
import { ArdPanelPosition, CompareWithFn, GroupByFn, SearchFn } from '../types/item-storage.types';
import { Nullable } from '../types/utility.types';
import { FormElementAppearance, FormElementVariant } from './../types/theming.types';
import { AddCustomFn } from './select.types';

export interface ArdSelectDefaults extends _FormFieldComponentDefaults {
  valueFrom: string;
  labelFrom: string;
  disabledFrom: string;
  groupLabelFrom: string | GroupByFn;
  groupDisabledFrom: string;
  childrenFrom: string;
  placeholder: string;
  searchPlaceholder: string;
  clearButtonTitle: string;
  dropdownPosition: ArdPanelPosition;
  noItemsFoundText: string;
  addCustomOptionText: string;
  loadingPlaceholderText: string;
  inputAttrs: Record<string, any>;
  isLoading: boolean;
  deferValueWrites: boolean | null;
  itemsAlreadyGrouped: boolean;
  invertDisabled: boolean;
  noGroupActions: boolean;
  autoHighlightFirst: boolean;
  autoFocus: boolean;
  keepOpen: boolean;
  hideSelected: boolean;
  noBackspaceClear: boolean;
  sortMultipleValues: boolean;
  searchCaseSensitive: boolean;
  keepSearchAfterSelect: boolean;
  maxSelectedItems: number;
  itemDisplayLimit: number;
  searchFn: SearchFn;
  compareWith: Nullable<CompareWithFn>;
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  dropdownPanelWidth: Nullable<number | string>;
  dropdownPanelHeight: Nullable<number | string>;
  dropdownPanelMinWidth: Nullable<number | string>;
  dropdownPanelMinHeight: Nullable<number | string>;
  dropdownPanelMaxWidth: Nullable<number | string>;
  dropdownPanelMaxHeight: Nullable<number | string>;
  dropdownAppearance: Nullable<DropdownPanelAppearance>;
  dropdownVariant: Nullable<DropdownPanelVariant>;
  multiselectable: boolean;
  clearable: boolean;
  searchable: boolean;
  addCustom: boolean | AddCustomFn<any> | AddCustomFn<Promise<any>>;
    PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
    SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _selectDefaults: ArdSelectDefaults = {
  ..._formFieldComponentDefaults,
  valueFrom: 'value',
  labelFrom: 'label',
  disabledFrom: 'disabled',
  groupLabelFrom: 'group',
  groupDisabledFrom: 'disabled',
  childrenFrom: 'children',
  searchFn: searchFunctions.byLabel,
  clearButtonTitle: 'Clear',
  noItemsFoundText: 'No items found.',
  addCustomOptionText: 'Add option',
  loadingPlaceholderText: 'Loading...',
  placeholder: '',
  searchPlaceholder: '',
  dropdownPosition: ArdPanelPosition.Auto,
  inputAttrs: {},
  isLoading: false,
  deferValueWrites: null,
  itemsAlreadyGrouped: false,
  invertDisabled: false,
  noGroupActions: false,
  autoHighlightFirst: false,
  autoFocus: false,
  keepOpen: false,
  hideSelected: false,
  noBackspaceClear: false,
  sortMultipleValues: false,
  searchCaseSensitive: false,
  keepSearchAfterSelect: false,
  maxSelectedItems: Infinity,
  itemDisplayLimit: Infinity,
  compareWith: undefined,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  dropdownPanelWidth: undefined,
  dropdownPanelHeight: undefined,
  dropdownPanelMinWidth: 'max-content',
  dropdownPanelMinHeight: undefined,
  dropdownPanelMaxWidth: undefined,
  dropdownPanelMaxHeight: undefined,
  dropdownAppearance: undefined,
  dropdownVariant: undefined,
  multiselectable: false,
  clearable: false,
  searchable: false,
  addCustom: false,
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_SELECT_DEFAULTS = new InjectionToken<ArdSelectDefaults>('ard-select-defaults', {
  factory: () => ({ ..._selectDefaults }),
});

export function provideSelectDefaults(config: Partial<ArdSelectDefaults>): Provider {
  return { provide: ARD_SELECT_DEFAULTS, useValue: { ..._selectDefaults, ...config } };
}
