import {
    computed,
    contentChild,
    Directive,
    HostListener,
    input,
    linkedSignal,
    model,
    ModelSignal,
    OnChanges,
    output,
    Signal,
    signal,
    SimpleChanges,
    viewChild
} from '@angular/core';
import {
    BooleanLike,
    coerceBooleanProperty,
    coerceDateOnlyProperty,
    coerceNumberProperty,
    getUTCDate,
    NumberLike,
} from '@ardium-pl/devkit';
import { roundFromZero, roundToMultiple } from 'more-rounding';
import { isDefined, isNull } from 'simple-bool';
import { _FormFieldComponentBase } from '../_internal/form-field-component';
import { createDate } from '../_internal/utils/date.utils';
import { ComponentColor } from '../types/colors.types';
import { ArdCalendarDefaults } from './calendar.defaults';
import {
    ArdCalendarDaysViewHeaderTemplateDirective,
    ArdCalendarDayTemplateDirective,
    ArdCalendarFloatingMonthTemplateDirective,
    ArdCalendarMonthsViewHeaderTemplateDirective,
    ArdCalendarMonthTemplateDirective,
    ArdCalendarWeekdayTemplateDirective,
    ArdCalendarYearsViewHeaderTemplateDirective,
    ArdCalendarYearTemplateDirective,
} from './calendar.directives';
import { _CalendarTemplateRepositoryDirective } from './calendar.internal-directives';
import { ArdCalendarFilterFn, ArdCalendarView, ArdMultiCalendarLocation } from './calendar.types';
import { DaysViewComponent } from './views/days-view/days-view.component';
import { isDayOutOfRange } from './views/days-view/days-view.helpers';
import { MonthsViewComponent } from './views/months-view/months-view.component';
import { isMonthOutOfRange } from './views/months-view/months-view.helpers';
import { YearsViewComponent } from './views/years-view/years-view.component';
import { isYearOutOfRange } from './views/years-view/years-view.helpers';

@Directive({})
export abstract class _AbstractCalendar<T, PT = T> extends _FormFieldComponentBase implements OnChanges {
  abstract readonly componentId: string;
  abstract readonly componentName: string;

  abstract readonly isRangeSelector: boolean;

  protected override readonly _DEFAULTS!: ArdCalendarDefaults;
  constructor(defaults: ArdCalendarDefaults) {
    super(defaults);
  }

  readonly TODAY = computed<Date>(() =>
    createDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.UTC())
  );

  //! appearance
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly ngClasses = computed((): string => [`ard-color-${this.color()}`].join(' '));

  //! active view
  readonly activeView = model<ArdCalendarView>(this._DEFAULTS.activeView);
  readonly activeYear = model<number>(this._DEFAULTS.activeYear);
  readonly activeMonth = model<number>(this._DEFAULTS.activeMonth);
  readonly activePageChange = output<{ year: number; month: number }>();

  readonly firstWeekday = input<number, NumberLike>(this._DEFAULTS.firstWeekday, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.firstWeekday);
      if (!Number.isInteger(value)) {
        console.error(
          new Error(
            `ARD-NF${this.componentId}1A: [firstWeekday] must be a positive integer, got "${value}". Using default value instead.`
          )
        );
        return this._DEFAULTS.firstWeekday;
      }
      if (value < 0 || value > 6) {
        console.error(
          new Error(
            `ARD-NF${this.componentId}1B: [firstWeekday] must be between 0 and 6, got "${value}". Using modulo operator to adjust the value.`
          )
        );
      }
      return value % 7;
    },
  });

  readonly multipleYearPageChangeModifier = input<number, NumberLike>(this._DEFAULTS.multipleYearPageChangeModifier, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.multipleYearPageChangeModifier);
      if (!Number.isInteger(value) || value < 1) {
        console.error(
          new Error(
            `ARD-NF${this.componentId}2: [multipleYearPageChangeModifier] must be a positive integer, got "${value}". Using default value instead.`
          )
        );
        return this._DEFAULTS.multipleYearPageChangeModifier;
      }
      return value;
    },
  });
  readonly multipleYearOffset = input<number, NumberLike>(this._DEFAULTS.multipleYearOffset, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.multipleYearOffset);
      if (!Number.isInteger(value) || value < 0) {
        console.error(
          new Error(
            `ARD-NF${this.componentId}3: [multipleYearOffset] must be a non-negative integer, got "${value}". Using default value instead.`
          )
        );
        return this._DEFAULTS.multipleYearOffset;
      }
      return value;
    },
  });
  readonly multipleYearPageSize = input<number, NumberLike>(this._DEFAULTS.multipleYearPageSize, {
    transform: v => {
      const value = coerceNumberProperty(v, this._DEFAULTS.multipleYearPageSize);
      if (!Number.isInteger(value) || value < 1) {
        console.error(
          new Error(
            `ARD-NF${this.componentId}5: [multipleYearPageSize] must be a positive integer, got "${value}". Using default value instead.`
          )
        );
        return this._DEFAULTS.multipleYearPageSize;
      }
      return value;
    },
  });

  readonly multiCalendarLocation = input<ArdMultiCalendarLocation>(this._DEFAULTS.multiCalendarLocation);

  readonly autoFocus = input<boolean, BooleanLike>(this._DEFAULTS.autoFocus, { transform: v => coerceBooleanProperty(v) });
  readonly staticHeight = input<boolean, BooleanLike>(this._DEFAULTS.staticHeight, { transform: v => coerceBooleanProperty(v) });
  readonly hideFloatingMonth = input<boolean, BooleanLike>(this._DEFAULTS.hideFloatingMonth, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly daysViewComponent = viewChild.required(DaysViewComponent);
  readonly monthsViewComponent = viewChild.required(MonthsViewComponent);
  readonly yearsViewComponent = viewChild.required(YearsViewComponent);

  openDaysView(): void {
    this.activeView.set(ArdCalendarView.Days);
    setTimeout(() => {
      this.daysViewComponent().focus();
    }, 0);
  }
  openMonthsView(): void {
    this.activeView.set(ArdCalendarView.Months);
    setTimeout(() => {
      this.monthsViewComponent().focus();
    }, 0);
  }
  openYearsView(): void {
    this.activeView.set(ArdCalendarView.Years);
    setTimeout(() => {
      this.yearsViewComponent().focus();
    }, 0);
  }

  //! value
  readonly selectionStart = signal<Date | null>(null);
  readonly selectionEnd = signal<Date | null>(null);

  abstract readonly endDate: Signal<Date | null>;

  abstract readonly value: ModelSignal<PT | null>;

  readonly yearSelect = output<number>();
  readonly monthSelect = output<number>();

  readonly min = input<Date | null, any>(this._DEFAULTS.min, {
    transform: v => (v === null ? null : coerceDateOnlyProperty(v, this._DEFAULTS.min, true)),
  });
  readonly max = input<Date | null, any>(this._DEFAULTS.max, {
    transform: v => (v === null ? null : coerceDateOnlyProperty(v, this._DEFAULTS.max, true)),
  });

  readonly UTC = input<boolean, BooleanLike>(this._DEFAULTS.UTC, { transform: v => coerceBooleanProperty(v) });
  private readonly _UTCAfterInit = signal<boolean>(this._DEFAULTS.UTC);

  readonly filter = input<ArdCalendarFilterFn | null>(this._DEFAULTS.filter);

  abstract override writeValue(v: any): void;

  protected override _emitChange(): void {
    this._onChangeRegistered?.(this.getValueForEmit());
  }

  protected abstract getValueForEmit(): T | null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['UTC']) {
      if (changes['UTC'].firstChange) {
        this._UTCAfterInit.set(changes['UTC'].currentValue);
      } else {
        console.error(
          `ARD-NF${this.componentId}4: <ard-${this.componentName}>'s [UTC] attribute should not be changed dynamically. This change will be ignored.`
        );
      }
    }
    if (changes['value']) {
      this.writeValue(changes['value'].currentValue);
    }
  }

  private _emitActivePageChange(): void {
    this.activePageChange.emit({ year: this.activeYear(), month: this.activeMonth() });
  }
  private _emitHighlightedDate(): void {
    const day = this.highlightedDay();
    if (!day) return;
    const date = createDate(this.activeYear(), this.activeMonth(), day, this.UTC());
    this.highlightDayEvent.emit(date);
  }

  //! selecting days
  isDayOutOfRange(day: number, month: number = this.activeMonth(), year: number = this.activeYear()): number {
    const dayDate = getUTCDate(year, month, day);
    return isDayOutOfRange(dayDate, this.min(), this.max());
  }
  readonly isDayFilteredOut = computed(() => {
    return (day: number, month: number = this.activeMonth(), year: number = this.activeYear()): boolean => {
      return this.filter()?.(createDate(year, month, day, this.UTC())) ?? false;
    };
  });
  selectDay(day: number | Date | null): void {
    const startValue = this.selectionStart();
    // reset selection
    if (isNull(day)) {
      if (!isDefined(startValue)) return;

      this.selectionStart.set(null);
      this.selectionEnd.set(null);
      return;
    }

    if (day instanceof Date) day = day.getDate();
    // check if day is out of range or filtered out
    if ((day && this.isDayOutOfRange(day)) || this.isDayFilteredOut()(day)) return;

    // range selection logic
    const endValue = this.selectionEnd();
    const newDate = createDate(this.activeYear(), this.activeMonth(), day, this.UTC());
    if (this.isRangeSelector) {
      // select end date
      if (isDefined(startValue) && !isDefined(endValue) && newDate > startValue) {
        this.selectionEnd.set(newDate);
        return;
      }
      // reset end date and start a new selection
      this.selectionEnd.set(null);
    }
    // avoid setting the same date again
    if (
      startValue &&
      startValue.getFullYear() === this.activeYear() &&
      startValue.getMonth() === this.activeMonth() &&
      startValue.getDate() === day
    ) {
      return;
    }
    this.selectionStart.set(newDate);
  }
  selectCurrentlyHighlightedDay(): void {
    if (!isDefined(this.highlightedDay())) return;

    this.selectDay(this.highlightedDay());
  }

  //! highlighting days
  readonly highlightedDay = model<number | null>(null);

  readonly highlightDayEvent = output<Date>({ alias: 'highlightDay' });

  setHighlightedDay(day: number | null, month: number = this.activeMonth(), year: number = this.activeYear()): void {
    if (isNull(day)) {
      this.highlightedDay.update(() => day);
      this._emitHighlightedDate();
      return;
    }
    const date = createDate(year, month, day, this.UTC());
    const outOfRange = this.isDayOutOfRange(day, month, year);

    if (outOfRange === -1) {
      this._highlightMinDay();
      return;
    }
    if (outOfRange === 1) {
      this._highlightMaxDay();
      return;
    }

    this.highlightedDay.update(() => date.getDate());

    if (date.getFullYear() !== this.activeYear()) {
      this.activeYear.set(date.getFullYear());
    }
    if (date.getMonth() !== this.activeMonth()) {
      this.activeMonth.set(date.getMonth());
    }
    this._emitHighlightedDate();
    this._emitActivePageChange();
  }

  private _highlightMinDay(): void {
    const min = this.min();
    if (!isDefined(min)) return;

    this.activeYear.set(min.getFullYear());
    this.activeMonth.set(min.getMonth());
    this.highlightedDay.set(min.getDate());
    this._emitHighlightedDate();
    this._emitActivePageChange();
  }
  private _highlightMaxDay(): void {
    const max = this.max();
    if (!isDefined(max)) return;

    this.activeYear.set(max.getFullYear());
    this.activeMonth.set(max.getMonth());
    this.highlightedDay.set(max.getDate());
    this._emitHighlightedDate();
    this._emitActivePageChange();
  }

  highlightNextDay(offset = 1): void {
    const currentDay = this.highlightedDay();
    const newDay = isDefined(currentDay) ? currentDay + offset : 1;
    this.setHighlightedDay(newDay);
  }
  highlightPreviousDay(offset = 1): void {
    this.highlightNextDay(offset * -1);
  }
  highlightFirstDay(): void {
    this.setHighlightedDay(1);
  }
  highlightLastDay(): void {
    const daysInMonth = createDate(this.activeYear(), this.activeMonth() + 1, 0, this.UTC()).getDate();
    this.setHighlightedDay(daysInMonth);
  }
  highlightSameDayNextMonth(): void {
    const month = this.activeMonth();
    const year = this.activeYear();
    const newMonth = month + 1;
    const newYear = year + Math.floor(newMonth / 12);
    this.setHighlightedDay(this.highlightedDay(), newMonth % 12, newYear);
  }
  highlightSameDayPreviousMonth(): void {
    const month = this.activeMonth();
    const year = this.activeYear();
    const newMonth = month - 1;
    const newYear = year + Math.floor(newMonth / 12);
    this.setHighlightedDay(this.highlightedDay(), newMonth % 12, newYear);
  }
  highlightSameDayNextYear(): void {
    this.setHighlightedDay(this.highlightedDay(), this.activeMonth(), this.activeYear() + 1);
  }
  highlightSameDayPreviousYear(): void {
    this.setHighlightedDay(this.highlightedDay(), this.activeMonth(), this.activeYear() - 1);
  }

  //! selecting months
  isMonthSelected(month: number | Date): boolean {
    if (month instanceof Date) month = month.getMonth();
    return (
      this.selectionStart() !== null &&
      this.activeYear() === this.selectionStart()?.getFullYear() &&
      month === this.selectionStart()?.getMonth()
    );
  }
  isMonthOutOfRange(month: number, year: number = this.activeYear()): number {
    return isMonthOutOfRange(month, year, this.min(), this.max());
  }
  changeMonth(newMonth: number | null): boolean {
    if (isNull(newMonth)) {
      this.activeMonth.set(this.TODAY().getMonth());
      this._emitActivePageChange();
      return true;
    }

    if (this.isMonthOutOfRange(newMonth)) return false;

    if (newMonth > 11) {
      this.activeYear.update(v => v + 1);
      this.activeMonth.set(0);
    } else if (newMonth < 0) {
      this.activeYear.update(v => v - 1);
      this.activeMonth.set(11);
    } else {
      this.activeMonth.set(newMonth);
    }
    this._emitActivePageChange();

    return true;
  }
  selectMonth(newMonth: number | null): void {
    if (isNull(newMonth) || this.isMonthOutOfRange(newMonth)) return;

    const wasSuccessful = this.changeMonth(newMonth);
    if (!wasSuccessful) return;

    this.openDaysView();
    this.monthSelect.emit(newMonth);
  }
  selectCurrentlyHighlightedMonth(): void {
    if (!isDefined(this.highlightedMonth())) return;

    this.selectMonth(this.highlightedMonth()!);
  }

  //! highlighting months
  private readonly _highlightedMonth = signal<number | null>(null);
  readonly highlightedMonth = this._highlightedMonth.asReadonly();

  setHighlightedMonth(month: number | null, year: number = this.activeYear()): void {
    if (isNull(month)) {
      this._highlightedMonth.update(() => month);
      return;
    }
    const date = createDate(year, month, 15, this.UTC());
    const outOfRange = this.isMonthOutOfRange(month, year);

    if (outOfRange === -1) {
      this._highlightMinMonth();
      return;
    }
    if (outOfRange === 1) {
      this._highlightMaxMonth();
      return;
    }

    this._highlightedMonth.update(() => date.getMonth());

    if (date.getFullYear() !== this.activeYear()) {
      this.activeYear.set(date.getFullYear());
      this._emitActivePageChange();
    }
  }

  private _highlightMinMonth(): void {
    const min = this.min();
    if (!isDefined(min)) return;

    this.activeYear.set(min.getFullYear());
    this._emitActivePageChange();
    this._highlightedMonth.set(min.getMonth());
  }
  private _highlightMaxMonth(): void {
    const max = this.max();
    if (!isDefined(max)) return;

    this.activeYear.set(max.getFullYear());
    this._emitActivePageChange();
    this._highlightedMonth.set(max.getMonth());
  }

  highlightNextMonth(offset = 1): void {
    const currentMonth = this.highlightedMonth();
    const newMonth = isDefined(currentMonth) ? currentMonth + offset : 0;
    this.setHighlightedMonth(newMonth);
  }
  highlightPreviousMonth(offset = 1): void {
    this.highlightNextMonth(offset * -1);
  }
  highlightFirstMonth(): void {
    this.setHighlightedMonth(0);
  }
  highlightLastMonth(): void {
    this.setHighlightedMonth(11);
  }
  highlightSameMonthNextYear(multiple: boolean): void {
    this.setHighlightedMonth(this.highlightedMonth(), this.activeYear() + (multiple ? 10 : 1));
  }
  highlightSameMonthPreviousYear(multiple: boolean): void {
    this.setHighlightedMonth(this.highlightedMonth(), this.activeYear() - (multiple ? 10 : 1));
  }

  //! selecting years
  isYearSelected(year: number | Date): boolean {
    if (year instanceof Date) year = year.getFullYear();
    return this.selectionStart() !== null && year === this.selectionStart()?.getFullYear();
  }
  isYearOutOfRange(year: number): number {
    return isYearOutOfRange(year, this.min(), this.max());
  }
  changeYear(year: number | null): boolean {
    if (isNull(year)) {
      this.activeYear.set(this.TODAY().getFullYear());
      this._emitActivePageChange();
      return true;
    }

    if (this.isYearOutOfRange(year)) return false;

    this.activeYear.set(year);
    this._emitActivePageChange();

    return true;
  }
  selectYear(year: number | Date | null): void {
    if (isNull(year)) return;
    if (year instanceof Date) year = year.getFullYear();

    const wasSuccessful = this.changeYear(year);
    if (!wasSuccessful) return;

    this.openMonthsView();
    this.yearSelect.emit(year);
  }
  selectCurrentlyHighlightedYear(): void {
    if (!isDefined(this.highlightedYear())) return;

    this.selectYear(this.highlightedYear()!);
  }

  //! highlighting years
  private readonly __highlightedYear = signal<number | null>(null);
  readonly highlightedYear = this.__highlightedYear.asReadonly();

  readonly currentYearRangeStart = linkedSignal<number>(() => {
    // align to a multiple of 4 and subtract offset
    const rangeStartForCurrentYear =
      this.TODAY().getFullYear() - (this.TODAY().getFullYear() % 4) - this.multipleYearOffset() * 4;

    const activeYear = this.activeYear();

    const offset =
      roundToMultiple(activeYear - rangeStartForCurrentYear + 1, this.multipleYearPageSize(), 'up') - this.multipleYearPageSize(); // check how many n-year pages need to be turned

    return rangeStartForCurrentYear + offset;
  });

  setHighlightedYear(year: number | null): void {
    if (isNull(year)) {
      this.__highlightedYear.update(() => year);
      return;
    }
    const date = createDate(year, 0, 1, this.UTC());
    const outOfRange = this.isYearOutOfRange(year);

    if (outOfRange === -1) {
      this._highlightMinYear();
      return;
    }
    if (outOfRange === 1) {
      this._highlightMaxYear();
      return;
    }

    const newYear = date.getFullYear();
    this.__highlightedYear.update(() => newYear);

    if (newYear < this.currentYearRangeStart() || newYear >= this.currentYearRangeStart() + this.multipleYearPageSize()) {
      // round the offset away from zero: 0.1 -> 1, -0.1 -> -1
      // this is to ensure the range start is always shifted by n years
      const offset = roundFromZero((newYear - this.currentYearRangeStart()) / this.multipleYearPageSize());
      this.currentYearRangeStart.update(v => v + offset * this.multipleYearPageSize());
    }
  }

  changeYearsViewPage(offset: number): void {
    const newYearRangeStart = this.currentYearRangeStart() + offset * this.multipleYearPageSize();
    this.currentYearRangeStart.set(newYearRangeStart);
  }

  private _highlightMinYear(): void {
    const min = this.min();
    if (!isDefined(min)) return;

    this.__highlightedYear.set(min.getFullYear());
  }
  private _highlightMaxYear(): void {
    const max = this.max();
    if (!isDefined(max)) return;

    this.__highlightedYear.set(max.getFullYear());
  }

  highlightNextYear(offset = 1): void {
    const currentYear = this.highlightedYear();
    const newYear = isDefined(currentYear) ? currentYear + offset : null;
    this.setHighlightedYear(newYear);
  }
  highlightPreviousYear(offset = 1): void {
    this.highlightNextYear(offset * -1);
  }
  highlightFirstYear(): void {
    this.setHighlightedYear(this.currentYearRangeStart());
  }
  highlightLastYear(): void {
    this.setHighlightedYear(this.currentYearRangeStart() + this.multipleYearPageSize() - 1);
  }
  highlightSameYearNextPage(multiple: boolean): void {
    const year = this.highlightedYear() ?? this.currentYearRangeStart();
    this.setHighlightedYear(year + (multiple ? this.multipleYearPageChangeModifier() : 1) * this.multipleYearPageSize());
  }
  highlightSameYearPreviousPage(multiple: boolean): void {
    const year = this.highlightedYear() ?? this.currentYearRangeStart();
    this.setHighlightedYear(year - (multiple ? this.multipleYearPageChangeModifier() : 1) * this.multipleYearPageSize());
  }

  //! internals
  readonly _isUsingKeyboard = signal<boolean>(false);
  @HostListener('document:mousemove')
  onDocumentMousemove(): void {
    this._isUsingKeyboard.set(false);
  }
  @HostListener('document:keydown')
  onDocumentKeydown(): void {
    this._isUsingKeyboard.set(true);
  }

  //! templates
  readonly templateRepository = contentChild(_CalendarTemplateRepositoryDirective);

  readonly yearsViewHeaderTemplate = contentChild(ArdCalendarYearsViewHeaderTemplateDirective);
  readonly monthsViewHeaderTemplate = contentChild(ArdCalendarMonthsViewHeaderTemplateDirective);
  readonly daysViewHeaderTemplate = contentChild(ArdCalendarDaysViewHeaderTemplateDirective);
  readonly floatingMonthTemplate = contentChild(ArdCalendarFloatingMonthTemplateDirective);
  readonly yearTemplate = contentChild(ArdCalendarYearTemplateDirective);
  readonly monthTemplate = contentChild(ArdCalendarMonthTemplateDirective);
  readonly dayTemplate = contentChild(ArdCalendarDayTemplateDirective);
  readonly weekdayTemplate = contentChild(ArdCalendarWeekdayTemplateDirective);

  //! template customizations
  readonly daysViewHeaderDateFormat = input<string>(this._DEFAULTS.daysViewHeaderDateFormat); // 'MMM YYYY'
  readonly yearsViewHeaderDateFormat = input<string>(this._DEFAULTS.yearsViewHeaderDateFormat); // 'YYYY'
  readonly monthsViewHeaderDateFormat = input<string>(this._DEFAULTS.monthsViewHeaderDateFormat); // 'YYYY'
  readonly weekdayDateFormat = input<string>(this._DEFAULTS.weekdayDateFormat); // 'EEEEE'
  readonly weekdayTitleDateFormat = input<string>(this._DEFAULTS.weekdayTitleDateFormat); // 'EEEE'
  readonly floatingMonthDateFormat = input<string>(this._DEFAULTS.floatingMonthDateFormat); // 'LLL'
  readonly floatingMonthTitleDateFormat = input<string>(this._DEFAULTS.floatingMonthTitleDateFormat); // 'LLLL'
  readonly yearDateFormat = input<string>(this._DEFAULTS.yearDateFormat); // 'YYYY'
  readonly monthDateFormat = input<string>(this._DEFAULTS.monthDateFormat); // 'MMM'
  readonly dayDateFormat = input<string>(this._DEFAULTS.dayDateFormat); // 'D'
}
