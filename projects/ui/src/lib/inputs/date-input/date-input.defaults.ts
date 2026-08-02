import { InjectionToken, Provider, Type } from '@angular/core';
import { _FormFieldComponentDefaults, _formFieldComponentDefaults } from '../../_internal/form-field-component';
import { ArdCalendarFilterFn, ArdCalendarView, PartialDateRange } from '../../calendar/calendar.types';
import { DropdownPanelAppearance, DropdownPanelVariant } from '../../dropdown-panel';
import { ArdFormFieldFramePrefixSuffix } from '../../form-field-frame';
import { ComponentColor } from '../../types/colors.types';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { Nullable } from '../../types/utility.types';
import {
    DEFAULT_DATE_INPUT_DESERIALIZE_FN,
    DEFAULT_DATE_INPUT_SERIALIZE_FN,
    DEFAULT_DATE_RANGE_INPUT_SERIALIZE_FN,
} from './date-input.serializers';
import { ArdDateInputDeserializeFn, ArdDateInputMinMaxStrategy, ArdDateInputSerializeFn } from './date-input.types';

export interface ArdDateInputDefaults extends _FormFieldComponentDefaults {
  inputAttrs: Record<string, any>;
  placeholder: string;
  serializeFn: ArdDateInputSerializeFn<Date>;
  rangeSerializeFn: ArdDateInputSerializeFn<PartialDateRange>;
  deserializeFn: ArdDateInputDeserializeFn<Date>;
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  color: ComponentColor;
  compact: boolean;
  dropdownAppearance: DropdownPanelAppearance;
  dropdownVariant: DropdownPanelVariant;
  minMaxStrategy: ArdDateInputMinMaxStrategy;
  startView: Nullable<ArdCalendarView>;
  inputReadOnly: boolean;
  calendarDisabled: boolean;
  calendarHidden: boolean;
  // calendar defaults
  activeView: ArdCalendarView;
  activeYear: number;
  activeMonth: number;
  firstWeekday: number;
  multipleYearPageChangeModifier: number;
  numberOfCalendars: number;
  min: Date | null;
  max: Date | null;
  filter: ArdCalendarFilterFn | null;
  UTC: boolean;
  hideFloatingMonth: boolean;
  // template customizations
  calendarDaysViewHeaderDateFormat: string;
  calendarYearsViewHeaderDateFormat: string;
  calendarMonthsViewHeaderDateFormat: string;
  calendarWeekdayDateFormat: string;
  calendarWeekdayTitleDateFormat: string;
  calendarFloatingMonthDateFormat: string;
  calendarFloatingMonthTitleDateFormat: string;
  calendarYearDateFormat: string;
  calendarMonthDateFormat: string;
  calendarDayDateFormat: string;
  acceptButtonText: string;
  cancelButtonText: string;
  PrefixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
  SuffixComponent?: Type<ArdFormFieldFramePrefixSuffix>;
}

const _dateInputDefaults: ArdDateInputDefaults = {
  ..._formFieldComponentDefaults,
  inputAttrs: {},
  placeholder: '',
  serializeFn: DEFAULT_DATE_INPUT_SERIALIZE_FN,
  rangeSerializeFn: DEFAULT_DATE_RANGE_INPUT_SERIALIZE_FN,
  deserializeFn: DEFAULT_DATE_INPUT_DESERIALIZE_FN,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  color: ComponentColor.Primary,
  compact: false,
  dropdownAppearance: DropdownPanelAppearance.Outlined,
  dropdownVariant: DropdownPanelVariant.Rounded,
  minMaxStrategy: ArdDateInputMinMaxStrategy.Adjust,
  startView: undefined,
  inputReadOnly: false,
  calendarDisabled: false,
  calendarHidden: false,
  // calendar defaults
  activeView: ArdCalendarView.Days,
  activeYear: new Date().getFullYear(),
  activeMonth: new Date().getMonth(),
  firstWeekday: 1,
  multipleYearPageChangeModifier: 5,
  numberOfCalendars: 2,
  min: null,
  max: null,
  filter: null,
  UTC: false,
  hideFloatingMonth: false,
  // template customizations
  calendarDaysViewHeaderDateFormat: 'MMM yyyy',
  calendarYearsViewHeaderDateFormat: 'yyyy',
  calendarMonthsViewHeaderDateFormat: 'yyyy',
  calendarWeekdayDateFormat: 'EEEEE',
  calendarWeekdayTitleDateFormat: 'EEEE',
  calendarFloatingMonthDateFormat: 'LLL',
  calendarFloatingMonthTitleDateFormat: 'LLLL',
  calendarYearDateFormat: 'yyyy',
  calendarMonthDateFormat: 'MMM',
  calendarDayDateFormat: 'd',
  acceptButtonText: 'Accept',
  cancelButtonText: 'Cancel',
  PrefixComponent: undefined,
  SuffixComponent: undefined,
};

export const ARD_DATE_INPUT_DEFAULTS = new InjectionToken<ArdDateInputDefaults>('ard-date-input-defaults', {
  factory: () => ({ ..._dateInputDefaults }),
});

export function provideDateInputDefaults(config: Partial<ArdDateInputDefaults>): Provider {
  return { provide: ARD_DATE_INPUT_DEFAULTS, useValue: { ..._dateInputDefaults, ...config } };
}
