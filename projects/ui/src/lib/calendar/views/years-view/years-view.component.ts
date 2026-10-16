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
import { isNull } from 'simple-bool';
import { contextToInputs } from '../../../_internal/utils/context-to-inputs';
import { getDateComponents, getUTCDate } from '../../../_internal/utils/date.utils';
import { ARD_CALENDAR_DEFAULTS } from '../../calendar.defaults';
import {
  ArdMultiCalendarLocation,
  CalendarYearContext,
  CalendarYearsViewHeaderContext,
  DateRange,
  YearRange,
} from '../../calendar.types';
import { getCalendarYearsArray, isYearOutOfRange } from './years-view.helpers';

const TODAY = new Date();

@Component({
  standalone: false,
  selector: 'ard-years-view',
  templateUrl: './years-view.component.html',
  styleUrl: './years-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearsViewComponent implements AfterViewInit {
  protected readonly _DEFAULTS = inject(ARD_CALENDAR_DEFAULTS);

  readonly tabIndex = input.required<number>();
  readonly readOnly = input.required<boolean>();
  readonly disabled = input.required<boolean>();

  readonly autoFocus = input.required<boolean>();

  readonly _isUsingKeyboard = input.required<boolean>();

  @HostListener('mousemove')
  onMouseMove(): void {
    if (this._isUsingKeyboard()) return;
    if (this.highlightedYear()) this.triggerHighlightYear.emit(null);
  }

  ngAfterViewInit(): void {
    if (!this.autoFocus()) return;
    this.focus();
    this.triggerHighlightYear.emit(this.currentYearRangeStart());
  }

  readonly selectedDate = input.required<Date | null>();
  readonly selectedDateEnd = input.required<Date | null>();

  readonly rangeSelectionMode = input.required<boolean>();

  readonly UTC = input.required<boolean>();

  readonly min = input.required<Date | null>();
  readonly max = input.required<Date | null>();

  readonly multiCalendarLocation = input.required<ArdMultiCalendarLocation>();

  readonly currentYearRangeStart = input.required<number>();
  readonly multipleYearPageSize = input.required<number>();
  readonly yearsArray = computed(() =>
    getCalendarYearsArray(this.currentYearRangeStart(), this.multipleYearPageSize(), this.min(), this.max())
  );

  readonly currentAriaLabel = computed(() => {
    return this.highlightedYear()?.toString() ?? '';
  });

  //! outputs
  readonly triggerOpenMonthsView = output<void>();
  readonly triggerOpenDaysView = output<void>();

  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  readonly triggerSelectYear = output<number>();
  readonly triggerChangeYearsViewPage = output<number>();

  readonly triggerHighlightYear = output<number | null>();
  readonly triggerHighlightNextYear = output<number>();
  readonly triggerHighlightPreviousYear = output<number>();
  readonly triggerHighlightFirstYear = output<void>();
  readonly triggerHighlightLastYear = output<void>();
  readonly triggerHighlightSameYearPreviousPage = output<boolean>();
  readonly triggerHighlightSameYearNextPage = output<boolean>();

  //! calendar entry hover & click
  readonly highlightedYear = input.required<number | null>();

  readonly highlightedYearDate = computed<Date | null>(() => {
    const year = this.highlightedYear();
    if (isNull(year)) return null;
    return new Date(year, 0, 1);
  });

  onCalendarYearMouseover(year: number): void {
    if (this._isUsingKeyboard() || this.disabled() || this.readOnly()) return;

    this.triggerHighlightYear.emit(year);
  }
  onCalendarYearClick(year: number): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerSelectYear.emit(year);
  }
  onYearGridFocus(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightFirstYear.emit();
  }
  onYearGridBlur(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightYear.emit(null);
  }
  onYearGridClick(): void {
    if (this.disabled() || this.readOnly()) return;
    if (this.highlightedYear() !== null) return;
    this.triggerHighlightFirstYear.emit();
  }

  //! helpers
  isYearToday(year: number): boolean {
    return year === TODAY.getFullYear();
  }
  isYearSelected(year: number | Date | null): boolean {
    if (year instanceof Date) year = year.getFullYear();
    const isStartDateSelected = this.isYearSelectedStart(year);

    if (this.rangeSelectionMode()) {
      const isEndDateSelected = this.isYearSelectedEnd(year);
      return isStartDateSelected || isEndDateSelected;
    }
    return isStartDateSelected;
  }
  isYearSelectedStart(year: number | Date | null): boolean {
    if (year instanceof Date) year = year.getFullYear();
    const selected = this.selectedDate();
    const { year: selectedYear } = getDateComponents(selected, this.UTC());
    const isStartDateSelected = selected !== null && year === selectedYear;

    return isStartDateSelected;
  }
  isYearSelectedEnd(year: number | Date | null): boolean {
    if (year instanceof Date) year = year.getFullYear();
    const selected = this.selectedDateEnd();
    const { year: selectedYear } = getDateComponents(selected, this.UTC());
    const isEndDateSelected = selected !== null && year === selectedYear;

    return isEndDateSelected;
  }
  isYearBetweenSelectedRange(year: number | Date | null): boolean {
    if (!this.rangeSelectionMode()) return false;
    if (year instanceof Date) year = year.getFullYear();
    const selected = this.selectedDate();
    const selectedEnd = this.selectedDateEnd();
    if (selected === null || selectedEnd === null || selected >= selectedEnd) return false;
    return this._isYearBetweenDates(year!, selected, selectedEnd);
  }
  isYearBetweenSelectedHighlighted(year: number | Date | null): boolean {
    if (!this.rangeSelectionMode() || this.selectedDateEnd()) return false;
    if (year instanceof Date) year = year.getFullYear();
    const selected = this.selectedDate();
    const highlightedEnd = this.highlightedYearDate();
    if (selected === null || highlightedEnd === null || selected >= highlightedEnd) return false;
    return this._isYearBetweenDates(year!, selected, highlightedEnd);
  }
  private _isYearBetweenDates(year: number, startDate: Date, endDate: Date): boolean {
    const { year: startYear } = getDateComponents(startDate, this.UTC());
    const { year: endYear } = getDateComponents(endDate, this.UTC());
    return startYear <= year && endYear >= year;
  }
  isYearOutOfRange(year: number): number {
    return isYearOutOfRange(year, this.min(), this.max());
  }

  //! focusing
  readonly focusableElement = viewChild.required<ElementRef<HTMLElement>>('focusableElement');

  focus(): void {
    this.focusableElement().nativeElement.focus();
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

    const year = this.highlightedYear();
    if (isNull(year)) return;

    this.triggerSelectYear.emit(year);
  }
  //highlight the entry one line below
  private _onArrowDownPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightNextYear.emit(4); //4 years per line
  }
  //highlight the entry one line above
  private _onArrowUpPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightPreviousYear.emit(4); //4 years per line
  }
  //highlight next entry
  private _onArrowRightPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightNextYear.emit(1);
  }
  //highlight previous entry
  private _onArrowLeftPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightPreviousYear.emit(1);
  }
  //highlight first entry on the page
  private _onHomePress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightFirstYear.emit();
  }
  //highlight last entry on the page
  private _onEndPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightLastYear.emit();
  }
  //alone: highlight same entry on the previous page
  //with alt: highlight same entry multiple pages before
  private _onPageUpPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightSameYearPreviousPage.emit(event.altKey);
  }
  //alone: highlight same entry on the next page
  //with alt: highlight same entry multiple pages after
  private _onPageDownPress(event: KeyboardEvent): void {
    event.preventDefault();

    this.triggerHighlightSameYearNextPage.emit(event.altKey);
  }

  //! templates
  readonly yearsViewHeaderTemplate = input.required<TemplateRef<CalendarYearsViewHeaderContext> | undefined>();
  readonly yearTemplate = input.required<TemplateRef<CalendarYearContext> | undefined>();

  //! template customizations
  readonly yearsViewHeaderDateFormat = input.required<string>(); // 'YYYY'
  readonly yearDateFormat = input.required<string>(); // 'YYYY'

  //! template contexts
  readonly yearsViewHeaderContext = computed<CalendarYearsViewHeaderContext>(() => {
    const yearRangeStart = this.currentYearRangeStart();
    const yearRangeEnd = yearRangeStart + 23;
    const dateRange: DateRange = new DateRange(
      getUTCDate(yearRangeStart, 0, 2), // second day of month to prevent timezone issues
      getUTCDate(yearRangeEnd, 0, 2)
    );
    const yearRange: YearRange = {
      from: yearRangeStart,
      to: yearRangeEnd,
    };
    return {
      nextPage: () => {
        this.triggerChangeYearsViewPage.emit(1);
      },
      prevPage: () => {
        this.triggerChangeYearsViewPage.emit(-1);
      },
      openMonthsView: () => {
        this.triggerOpenMonthsView.emit();
      },
      openDaysView: () => {
        this.triggerOpenDaysView.emit();
      },
      onFocus: (event: FocusEvent) => {
        this.focusEvent.emit(event);
      },
      onBlur: (event: FocusEvent) => {
        this.blurEvent.emit(event);
      },
      canGoToNextPage: !this.isYearOutOfRange(yearRangeEnd + 1),
      canGoToPreviousPage: !this.isYearOutOfRange(yearRangeStart - 1),
      hideNextPageButton:
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Left ||
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
      hidePreviousPageButton:
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Right ||
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
      yearRange: yearRange,
      dateRange,
      $implicit: dateRange,
    };
  });
  readonly yearContext = computed<(year: number) => CalendarYearContext>(() => {
    return (year: number) => {
      const date = getUTCDate(year, 1, 2); // second day of month to prevent timezone issues
      return {
        value: year,
        date,
        $implicit: date,
        select: (year: number) => {
          this.triggerSelectYear.emit(year);
        },
      };
    };
  });

  //! template components
  readonly yearsViewHeaderComponent = this._DEFAULTS.YearsViewHeaderComponent;
  readonly yearComponent = this._DEFAULTS.YearComponent;

  readonly yearsViewHeaderComponentInputs = contextToInputs(this.yearsViewHeaderContext, this.yearsViewHeaderComponent);
  readonly yearComponentInputs = contextToInputs(this.yearContext, this.yearComponent);
}
