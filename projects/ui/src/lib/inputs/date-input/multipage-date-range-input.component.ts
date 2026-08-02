import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  forwardRef,
  Inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { isDate, isDefined, isNull, isObject } from 'simple-bool';
import { ArdMultiCalendarLocation, DateRange, isDateRange, PartialDateRange } from '../../calendar';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { _AbstractDateInput } from './abstract-date-input';
import { ARD_DATE_INPUT_DEFAULTS, ArdDateInputDefaults } from './date-input.defaults';
import { ArdDateInputSerializeFn } from './date-input.types';
import {
  ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective,
  ArdMultipageDateRangeInputDayTemplateDirective,
  ArdMultipageDateRangeInputFloatingMonthTemplateDirective,
  ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective,
  ArdMultipageDateRangeInputMonthTemplateDirective,
  ArdMultipageDateRangeInputPrefixTemplateDirective,
  ArdMultipageDateRangeInputSuffixTemplateDirective,
  ArdMultipageDateRangeInputWeekdayTemplateDirective,
  ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective,
  ArdMultipageDateRangeInputYearTemplateDirective,
} from './multipage-date-range-input.directives';

type CalendarDataItem = { location: ArdMultiCalendarLocation; activeDate: Date; highlightedDay: number | null };

@Component({
  standalone: false,
  selector: 'ard-multipage-date-range-input',
  templateUrl: './multipage-date-range-input.component.html',
  styleUrls: ['./multipage-date-range-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumMultipageDateRangeInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumMultipageDateRangeInputComponent,
    },
  ],
})
export class ArdiumMultipageDateRangeInputComponent extends _AbstractDateInput<DateRange, PartialDateRange> {
  readonly componentId = '012';
  readonly componentName = 'multipage-date-range-input';
  readonly isRangeSelector = true;

  protected override readonly _DEFAULTS!: ArdDateInputDefaults;
  constructor(@Inject(ARD_DATE_INPUT_DEFAULTS) defaults: ArdDateInputDefaults) {
    super(defaults);
  }

  readonly serializeFn = input<ArdDateInputSerializeFn<PartialDateRange>>(this._DEFAULTS.rangeSerializeFn);

  readonly highlightedDate = signal<Date | null>(null);

  readonly numberOfCalendars = input<number, NumberLike>(this._DEFAULTS.numberOfCalendars, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.numberOfCalendars);
      if (!Number.isInteger(value) || value < 1) {
        console.error(
          new Error(`ARD-NF0082: [numberOfCalendars] must be a positive integer, got "${value}". Using default value instead.`)
        );
        return this._DEFAULTS.numberOfCalendars;
      }
      return value;
    },
  });

  readonly calendarDataArray = computed<CalendarDataItem[]>(() =>
    new Array(this.numberOfCalendars()).fill(undefined).map((_, i, arr) => {
      const activeDate = new Date(this.activeYear(), this.activeMonth() + i, 1);
      const highlighted = this.highlightedDate();
      let highlightedDay: number | null = null;
      if (isNull(highlighted)) {
        highlightedDay = null;
      } else {
        if (
          activeDate.getFullYear() < highlighted.getFullYear() ||
          (activeDate.getFullYear() === highlighted.getFullYear() && activeDate.getMonth() < highlighted.getMonth())
        ) {
          highlightedDay = 32;
        } else if (
          activeDate.getFullYear() > highlighted.getFullYear() ||
          (activeDate.getFullYear() === highlighted.getFullYear() && activeDate.getMonth() > highlighted.getMonth())
        ) {
          highlightedDay = 0;
        } else {
          highlightedDay = highlighted.getDate();
        }
      }
      return {
        location:
          arr.length === 1
            ? ArdMultiCalendarLocation.Only
            : i === 0
              ? ArdMultiCalendarLocation.Left
              : i === arr.length - 1
                ? ArdMultiCalendarLocation.Right
                : ArdMultiCalendarLocation.Inner,
        activeDate,
        highlightedDay,
      };
    })
  );

  override onGeneralClick(event: MouseEvent): void {
    super.onGeneralClick(event);
    this.toggle();
  }

  onActivePageChange(newPage: { year: number; month: number }, index: number): void {
    if (this.disabled() || this.readonly()) return;

    const newDate = new Date(newPage.year, newPage.month, 1);
    newDate.setMonth(newDate.getMonth() - index);
    this.activeYear.set(newDate.getFullYear());
    this.activeMonth.set(newDate.getMonth());
  }
  onHighlightDate(date: Date | null) {
    if (this.disabled() || this.readonly()) return;
    this.highlightedDate.set(date);
  }

  override writeValue(v: any): void {
    if (isObject(v) && 'from' in v && 'to' in v && isDate(v['from']) && isDate(v['to'])) {
      this.value.set({ from: v['from'], to: v['to'] });
    } else if (!isDefined(v)) {
      this.value.set(null);
    } else {
      console.error(
        new Error(
          `ARD-NF0123: <ard-multipage-date-range-input> [writeValue] expected a { from: Date, to: Date } object or null, got "${v}".`
        )
      );
    }
  }
  protected _isFullValue(value: PartialDateRange | null): value is DateRange {
    return !!value?.from && !!value?.to;
  }
  protected getValueForEmit(): DateRange | null {
    const value = this.value();
    if (this._isFullValue(value)) {
      return new DateRange(value.from, value.to);
    }
    return null;
  }

  readonly shouldDisplayPlaceholder = computed(() => {
    return isNull(this.value());
  });
  readonly shouldDisplayValue = computed(() => {
    return isDateRange(this.value());
  });
  readonly shouldDisplayDateInput = computed(() => false);

  readonly prefixTemplate = contentChild(ArdMultipageDateRangeInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdMultipageDateRangeInputSuffixTemplateDirective);

  readonly calendarDaysViewHeaderTemplate = contentChild(ArdMultipageDateRangeInputDaysViewHeaderTemplateDirective);
  readonly calendarYearsViewHeaderTemplate = contentChild(ArdMultipageDateRangeInputYearsViewHeaderTemplateDirective);
  readonly calendarMonthsViewHeaderTemplate = contentChild(ArdMultipageDateRangeInputMonthsViewHeaderTemplateDirective);
  readonly calendarWeekdayTemplate = contentChild(ArdMultipageDateRangeInputWeekdayTemplateDirective);
  readonly calendarFloatingMonthTemplate = contentChild(ArdMultipageDateRangeInputFloatingMonthTemplateDirective);
  readonly calendarYearTemplate = contentChild(ArdMultipageDateRangeInputYearTemplateDirective);
  readonly calendarMonthTemplate = contentChild(ArdMultipageDateRangeInputMonthTemplateDirective);
  readonly calendarDayTemplate = contentChild(ArdMultipageDateRangeInputDayTemplateDirective);
}
