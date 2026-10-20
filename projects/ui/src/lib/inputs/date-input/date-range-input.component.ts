import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Inject,
  input,
  output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { isDate, isNull, isObject } from 'simple-bool';
import { DateRange, isDateRange, PartialDateRange } from '../../calendar';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { _AbstractDateInput } from './abstract-date-input';
import { ARD_DATE_INPUT_DEFAULTS, ArdDateInputDefaults } from './date-input.defaults';
import { ArdDateInputSerializeFn } from './date-input.types';
import {
  ArdDateRangeInputDaysViewHeaderTemplateDirective,
  ArdDateRangeInputDayTemplateDirective,
  ArdDateRangeInputFloatingMonthTemplateDirective,
  ArdDateRangeInputMonthsViewHeaderTemplateDirective,
  ArdDateRangeInputMonthTemplateDirective,
  ArdDateRangeInputPrefixTemplateDirective,
  ArdDateRangeInputSuffixTemplateDirective,
  ArdDateRangeInputWeekdayTemplateDirective,
  ArdDateRangeInputYearsViewHeaderTemplateDirective,
  ArdDateRangeInputYearTemplateDirective,
} from './date-range-input.directives';

@Component({
  standalone: false,
  selector: 'ard-date-range-input',
  templateUrl: './date-range-input.component.html',
  styleUrls: ['./date-range-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumDateRangeInputComponent,
    },
  ],
})
export class ArdiumDateRangeInputComponent extends _AbstractDateInput<DateRange, PartialDateRange> {
  readonly componentId = '009';
  readonly componentName = 'date-range-input';
  readonly isRangeSelector = true;

  protected override readonly _DEFAULTS!: ArdDateInputDefaults;
  constructor(@Inject(ARD_DATE_INPUT_DEFAULTS) defaults: ArdDateInputDefaults) {
    super(defaults);
  }

  override onGeneralClick(event: MouseEvent): void {
    super.onGeneralClick(event);
    this.toggle();
  }

  readonly partialValueChange = output<PartialDateRange>();

  readonly serializeFn = input<ArdDateInputSerializeFn<PartialDateRange>>(this._DEFAULTS.rangeSerializeFn);

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['value']) {
      const value = changes['value'].currentValue;
      if (
        value !== null &&
        (!isObject(value) || !('from' in value) || !('to' in value) || !isDate(value['from']) || !isDate(value['to']))
      ) {
        console.error(
          new Error(
            `ARD-NF0093: <ard-date-range-input> [writeValue] expected a { from: Date, to: Date } object or null, got "${value}".`
          )
        );
      }
    }
  }
  protected _isFullValue(value: PartialDateRange | null): value is DateRange {
    return !!value?.from && !!value?.to;
  }
  protected getValueForEmit(): DateRange | null {
    const value = this.partialValue();
    if (this._isFullValue(value)) {
      return new DateRange(value.from, value.to);
    }
    return null;
  }

  readonly shouldDisplayPlaceholder = computed(() => {
    return isNull(this.partialValue());
  });
  readonly shouldDisplayValue = computed(() => {
    return isDateRange(this.partialValue());
  });
  readonly shouldDisplayDateInput = computed(() => false);

  readonly prefixTemplate = contentChild(ArdDateRangeInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdDateRangeInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  readonly calendarDaysViewHeaderTemplate = contentChild(ArdDateRangeInputDaysViewHeaderTemplateDirective);
  readonly calendarYearsViewHeaderTemplate = contentChild(ArdDateRangeInputYearsViewHeaderTemplateDirective);
  readonly calendarMonthsViewHeaderTemplate = contentChild(ArdDateRangeInputMonthsViewHeaderTemplateDirective);
  readonly calendarWeekdayTemplate = contentChild(ArdDateRangeInputWeekdayTemplateDirective);
  readonly calendarFloatingMonthTemplate = contentChild(ArdDateRangeInputFloatingMonthTemplateDirective);
  readonly calendarYearTemplate = contentChild(ArdDateRangeInputYearTemplateDirective);
  readonly calendarMonthTemplate = contentChild(ArdDateRangeInputMonthTemplateDirective);
  readonly calendarDayTemplate = contentChild(ArdDateRangeInputDayTemplateDirective);
}
