import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { contextToInputs } from '../../../_internal/utils/context-to-inputs';
import { createDate, getDateComponents, getUTCDate } from '../../../_internal/utils/date.utils';
import { ARD_CALENDAR_DEFAULTS } from '../../calendar.defaults';
import {
  ArdMultiCalendarLocation,
  CalendarDayContext,
  CalendarDaysViewHeaderContext,
  CalendarFloatingMonthContext,
  CalendarWeekdayContext,
} from '../../calendar.types';
import { isMonthOutOfRange } from '../months-view/months-view.helpers';
import { getCalendarDayData, getCalendarWeekdayArray } from './days-view.helpers';

const TODAY = new Date();

@Component({
  standalone: false,
  selector: 'ard-days-view',
  templateUrl: './days-view.component.html',
  styleUrl: './days-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DaysViewComponent implements AfterViewInit {
  protected readonly _DEFAULTS = inject(ARD_CALENDAR_DEFAULTS);

  readonly tabIndex = input.required<number>();
  readonly readOnly = input.required<boolean>();
  readonly disabled = input.required<boolean>();

  readonly autoFocus = input.required<boolean>();

  readonly _isUsingKeyboard = input.required<boolean>();

  @HostListener('mousemove')
  onMouseMove(): void {
    if (this._isUsingKeyboard()) return;
    if (this.highlightedDay()) this.triggerHighlightDay.emit(null);
  }

  ngAfterViewInit(): void {
    if (!this.autoFocus()) return;
    this.focus();
    this.triggerHighlightDay.emit(1);
  }

  //! active year/month
  readonly activeYear = input.required<number>();
  readonly activeMonth = input.required<number>();

  readonly selectedDate = input.required<Date | null>();
  readonly selectedDateEnd = input.required<Date | null>();

  readonly rangeSelectionMode = input.required<boolean>();

  readonly UTC = input.required<boolean>();

  readonly min = input.required<Date | undefined>();
  readonly max = input.required<Date | undefined>();

  readonly multiCalendarLocation = input.required<ArdMultiCalendarLocation>();

  readonly isDayFilteredOut = input.required<(day: number, month?: number, year?: number) => boolean>();

  readonly highlightedDay = input.required<number | null>();

  readonly highlightedDayDate = computed<Date | null>(() => {
    const day = this.highlightedDay();
    if (day === null) return null;
    return createDate(this.activeYear(), this.activeMonth(), day, this.UTC());
  });

  //! focusing
  readonly focusableElement = viewChild.required<ElementRef<HTMLElement>>('focusableElement');

  focus(): void {
    this.focusableElement().nativeElement.focus();
  }

  //! calendar data
  readonly firstWeekday = input.required<number>();
  readonly staticHeight = input.required<boolean>();
  readonly hideFloatingMonth = input.required<boolean>();

  readonly activeCalendarData = computed(() =>
    getCalendarDayData(
      this.activeYear(),
      this.activeMonth(),
      this.firstWeekday(),
      this.min(),
      this.max(),
      this.staticHeight(),
      !this.hideFloatingMonth()
    )
  );

  readonly reserveTopRow = computed<boolean>(() => !this.hideFloatingMonth() && this.activeCalendarData().leadingSpaces < 3);

  readonly weekdayArray = computed(() => getCalendarWeekdayArray(this.firstWeekday()));

  isDaySelected(day: number | Date | null): boolean {
    if (day instanceof Date) day = day.getDate();
    const isStartDateSelected = this.isDaySelectedStart(day);

    if (this.rangeSelectionMode()) {
      const isEndDateSelected = this.isDaySelectedEnd(day);
      return isStartDateSelected || isEndDateSelected;
    }
    return isStartDateSelected;
  }
  isDaySelectedStart(day: number | Date | null): boolean {
    if (day instanceof Date) day = day.getDate();
    const selected = this.selectedDate();
    const { year, month, date } = getDateComponents(selected, this.UTC());
    const isStartDateSelected = selected !== null && this.activeYear() === year && this.activeMonth() === month && day === date;

    return isStartDateSelected;
  }
  isDaySelectedEnd(day: number | Date | null): boolean {
    if (day instanceof Date) day = day.getDate();
    const selected = this.selectedDateEnd();
    const { year, month, date } = getDateComponents(selected, this.UTC());
    const isEndDateSelected = selected !== null && this.activeYear() === year && this.activeMonth() === month && day === date;

    return isEndDateSelected;
  }
  isDayBetweenSelectedRange(day: number | Date | null): boolean {
    if (!this.rangeSelectionMode()) return false;
    if (day instanceof Date) day = day.getDate();
    const selected = this.selectedDate();
    const selectedEnd = this.selectedDateEnd();
    if (selected === null || selectedEnd === null || selected >= selectedEnd) return false;
    return this._isDayBetweenDates(day!, selected, selectedEnd);
  }
  isDayBetweenSelectedHighlighted(day: number | Date | null): boolean {
    if (!this.rangeSelectionMode() || this.selectedDateEnd()) return false;
    if (day instanceof Date) day = day.getDate();
    const selected = this.selectedDate();
    const highlightedEnd = this.highlightedDayDate();
    if (selected === null || highlightedEnd === null || selected >= highlightedEnd) return false;
    return this._isDayBetweenDates(day!, selected, highlightedEnd);
  }
  private _isDayBetweenDates(day: number, startDate: Date, endDate: Date): boolean {
    const date = createDate(this.activeYear(), this.activeMonth(), day, this.UTC());
    return date >= startDate && date <= endDate;
  }

  readonly currentAriaLabel = computed(() => {
    const day = this.highlightedDay();
    if (day === null) {
      return '';
    }
    return new Date(this.activeYear(), this.activeMonth(), day).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  //! outputs
  readonly triggerOpenYearsView = output<void>();
  readonly triggerOpenMonthsView = output<void>();

  readonly triggerSelectDay = output<number | null>();
  readonly triggerChangeMonth = output<number | null>();
  readonly triggerChangeYear = output<number | null>();

  readonly triggerHighlightDay = output<number | null>();
  readonly triggerHighlightNextDay = output<number>();
  readonly triggerHighlightPreviousDay = output<number>();
  readonly triggerHighlightFirstDay = output<void>();
  readonly triggerHighlightLastDay = output<void>();
  readonly triggerHighlightSameDayPreviousPage = output<boolean>();
  readonly triggerHighlightSameDayNextPage = output<boolean>();

  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  onCalendarDayMouseover(day: number | null): void {
    if (this._isUsingKeyboard()) return;
    if (this.disabled() || this.readOnly()) return;
    if (day && this.isDayFilteredOut()(day)) return;

    this.triggerHighlightDay.emit(day);
  }
  onCalendarDayClick(day: number | null): void {
    if (this.disabled() || this.readOnly()) return;
    if (day === null) return;
    if (this.isDayFilteredOut()(day)) return;

    this.triggerHighlightDay.emit(day);
    this.focus();
    this.triggerSelectDay.emit(day);
  }
  onDayGridFocus(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightFirstDay.emit();
  }
  onDayGridBlur(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightDay.emit(null);
  }
  onDayGridClick(): void {
    if (this.disabled() || this.readOnly()) return;
    if (this.highlightedDay() !== null) return;
    this.triggerHighlightFirstDay.emit();
  }

  //! helpers
  isDayToday(day: number | null): boolean {
    return this.activeYear() === TODAY.getFullYear() && this.activeMonth() === TODAY.getMonth() && day === TODAY.getDate();
  }
  isMonthOutOfRange(month: number): number {
    return isMonthOutOfRange(month, this.activeYear(), this.min(), this.max());
  }

  //! keyboard controls
  onMainGridKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.readOnly()) return;
    switch (event.code) {
      case 'Space':
      case 'Enter':
        this._onEnterPress(event);
        break;
      case 'ArrowUp':
        this._onArrowUpPress(event);
        break;
      case 'ArrowDown':
        this._onArrowDownPress(event);
        break;
      case 'ArrowLeft':
        this._onArrowLeftPress(event);
        break;
      case 'ArrowRight':
        this._onArrowRightPress(event);
        break;
      case 'Home':
        this._onHomePress(event);
        break;
      case 'End':
        this._onEndPress(event);
        break;
      case 'PageUp':
        this._onPageUpPress(event);
        break;
      case 'PageDown':
        this._onPageDownPress(event);
        break;

      default:
        return;
    }
  }
  //select currently selected entry
  private _onEnterPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerSelectDay.emit(this.highlightedDay());
  }
  //highlight the entry one line below
  private _onArrowDownPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightNextDay.emit(7);
  }
  //highlight the entry one line above
  private _onArrowUpPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightPreviousDay.emit(7);
  }
  //highlight next entry
  private _onArrowRightPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightNextDay.emit(1);
  }
  //highlight previous entry
  private _onArrowLeftPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightPreviousDay.emit(1);
  }
  //highlight first entry on the page
  private _onHomePress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightFirstDay.emit();
  }
  //highlight last entry on the page
  private _onEndPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightLastDay.emit();
  }
  //alone: highlight same entry on the next page
  //with alt: highlight same entry multiple pages after (12 pages)
  private _onPageDownPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightSameDayNextPage.emit(event.altKey);
  }
  //alone: highlight same entry on the previous page
  //with alt: highlight same entry multiple pages before (12 pages)
  private _onPageUpPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightSameDayPreviousPage.emit(event.altKey);
  }

  //! templates
  readonly daysViewHeaderTemplate = input.required<TemplateRef<CalendarDaysViewHeaderContext> | undefined>();
  readonly floatingMonthTemplate = input.required<TemplateRef<CalendarFloatingMonthContext> | undefined>();
  readonly weekdayTemplate = input.required<TemplateRef<CalendarWeekdayContext> | undefined>();
  readonly dayTemplate = input.required<TemplateRef<CalendarDayContext> | undefined>();

  //! template customizations
  readonly daysViewHeaderDateFormat = input.required<string>(); // 'MMM YYYY'
  readonly weekdayDateFormat = input.required<string>(); // 'EEEEE'
  readonly weekdayTitleDateFormat = input.required<string>(); // 'EEEE'
  readonly floatingMonthDateFormat = input.required<string>(); // 'LLL'
  readonly floatingMonthTitleDateFormat = input.required<string>(); // 'LLLL'
  readonly dayDateFormat = input.required<string>(); // 'D'

  //! template contexts
  readonly daysViewHeaderContext = computed<CalendarDaysViewHeaderContext>(() => ({
    nextMonth: () => {
      this.triggerChangeMonth.emit(this.activeMonth() + 1);
    },
    prevMonth: () => {
      this.triggerChangeMonth.emit(this.activeMonth() - 1);
    },
    nextYear: () => {
      this.triggerChangeYear.emit(this.activeYear() + 1);
    },
    prevYear: () => {
      this.triggerChangeYear.emit(this.activeYear() - 1);
    },
    openYearsView: () => {
      this.triggerOpenYearsView.emit();
    },
    openMonthsView: () => {
      this.triggerOpenMonthsView.emit();
    },
    onFocus: (event: FocusEvent) => {
      this.focusEvent.emit(event);
    },
    onBlur: (event: FocusEvent) => {
      this.blurEvent.emit(event);
    },
    canGoToNextPage: !this.isMonthOutOfRange(this.activeMonth() + 1),
    canGoToPreviousPage: !this.isMonthOutOfRange(this.activeMonth() - 1),
    hideNextPageButton:
      this.multiCalendarLocation() === ArdMultiCalendarLocation.Left ||
      this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
    hidePreviousPageButton:
      this.multiCalendarLocation() === ArdMultiCalendarLocation.Right ||
      this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
    year: this.activeYear(),
    month: this.activeMonth(),
    $implicit: getUTCDate(this.activeYear(), this.activeMonth(), 2), // second day of month to prevent timezone issues
  }));

  readonly weekdayContext = computed<(dayIndex: number) => CalendarWeekdayContext>(() => (dayIndex: number) => {
    // create a date object for the given day index (0 = Sunday, 1 = Monday, etc.)
    // add 4 because January 4, 1970 is a Sunday
    const date = getUTCDate(1970, 0, 4 + dayIndex);
    return {
      dayIndex,
      date,
      $implicit: date,
    };
  });

  readonly floatingMonthContext = computed<CalendarFloatingMonthContext>(() => {
    const date = getUTCDate(this.activeYear(), this.activeMonth(), 2); // second day of month to prevent timezone issues
    return {
      month: this.activeMonth(),
      date,
      $implicit: date,
    };
  });

  readonly dayContext = computed<(day: number) => CalendarDayContext>(() => (day: number) => {
    const date = getUTCDate(this.activeYear(), this.activeMonth(), day);
    return {
      value: day,
      date,
      $implicit: day,
      select: (dayOrDate: number | Date) => {
        this.triggerSelectDay.emit(dayOrDate instanceof Date ? dayOrDate.getDate() : dayOrDate);
      },
    };
  });

  //! template components
  readonly daysViewHeaderComponent = this._DEFAULTS.DaysViewHeaderComponent;
  readonly weekdayComponent = this._DEFAULTS.WeekdayComponent;
  readonly floatingMonthComponent = this._DEFAULTS.FloatingMonthComponent;
  readonly dayComponent = this._DEFAULTS.DayComponent;

  readonly daysViewHeaderComponentInputs = contextToInputs(this.daysViewHeaderContext, this.daysViewHeaderComponent);
  readonly weekdayComponentInputs = contextToInputs(this.weekdayContext, this.weekdayComponent);
  readonly floatingMonthComponentInputs = contextToInputs(this.floatingMonthContext, this.floatingMonthComponent)
  readonly dayComponentInputs = contextToInputs(this.dayContext, this.dayComponent);
}
