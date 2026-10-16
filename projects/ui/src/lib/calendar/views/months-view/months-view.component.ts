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
import { ArdMultiCalendarLocation, CalendarMonthContext, CalendarMonthsViewHeaderContext } from '../../calendar.types';
import { isYearOutOfRange } from '../years-view/years-view.helpers';
import { ComponentColor } from './../../../types/colors.types';
import { getCalendarMonthsArray } from './months-view.helpers';

const TODAY = new Date();

@Component({
  standalone: false,
  selector: 'ard-months-view',
  templateUrl: './months-view.component.html',
  styleUrl: './months-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthsViewComponent implements AfterViewInit {
  protected readonly _DEFAULTS = inject(ARD_CALENDAR_DEFAULTS);

  readonly tabIndex = input.required<number>();
  readonly readOnly = input.required<boolean>();
  readonly disabled = input.required<boolean>();

  readonly autoFocus = input.required<boolean>();

  readonly _isUsingKeyboard = input.required<boolean>();

  @HostListener('mousemove')
  onMouseMove(): void {
    if (this._isUsingKeyboard()) return;
    if (this.highlightedMonth()) this.triggerHighlightMonth.emit(null);
  }

  ngAfterViewInit(): void {
    if (!this.autoFocus()) return;
    this.focus();
    this.triggerHighlightMonth.emit(0);
  }

  readonly color = input.required<ComponentColor>();

  readonly activeYear = input.required<number>();
  readonly activeMonth = input.required<number>();

  readonly selectedDate = input.required<Date | null>();
  readonly selectedDateEnd = input.required<Date | null>();

  readonly rangeSelectionMode = input.required<boolean>();

  readonly UTC = input.required<boolean>();

  readonly min = input.required<Date | undefined>();
  readonly max = input.required<Date | undefined>();

  readonly multiCalendarLocation = input.required<ArdMultiCalendarLocation>();

  readonly monthsArray = computed(() => getCalendarMonthsArray(this.activeYear(), this.min(), this.max()));

  readonly currentAriaLabel = computed(() => {
    const month = this.highlightedMonth();
    if (month === null) {
      return '';
    }
    return new Date(this.activeYear(), month, 1).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    });
  });

  //! outputs
  readonly triggerOpenYearsView = output<void>();
  readonly triggerOpenDaysView = output<void>();

  readonly focusEvent = output<FocusEvent>({ alias: 'focus' });
  readonly blurEvent = output<FocusEvent>({ alias: 'blur' });

  readonly triggerSelectMonth = output<number>();
  readonly triggeChangeYear = output<number>();

  readonly triggerHighlightMonth = output<number | null>();
  readonly triggerHighlightNextMonth = output<number>();
  readonly triggerHighlightPreviousMonth = output<number>();
  readonly triggerHighlightFirstMonth = output<void>();
  readonly triggerHighlightLastMonth = output<void>();
  readonly triggerHighlightSameMonthPreviousPage = output<boolean>();
  readonly triggerHighlightSameMonthNextPage = output<boolean>();

  //! calendar entry hover & click
  readonly highlightedMonth = input.required<number | null>();

  readonly highlightedMonthDate = computed<Date | null>(() => {
    const month = this.highlightedMonth();
    if (isNull(month)) return null;
    return new Date(this.activeYear(), month, 2);
  });

  onCalendarMonthMouseover(month: number): void {
    if (this._isUsingKeyboard()) return;
    if (this.disabled() || this.readOnly()) return;

    this.triggerHighlightMonth.emit(month);
  }

  onCalendarMonthClick(month: number): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerSelectMonth.emit(month);
  }

  onMonthGridFocus(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightMonth.emit(0);
  }
  onMonthGridBlur(): void {
    if (this.disabled() || this.readOnly()) return;
    this.triggerHighlightMonth.emit(null);
  }
  onMonthGridClick(): void {
    if (this.disabled() || this.readOnly()) return;
    if (this.highlightedMonth() !== null) return;
    this.triggerHighlightMonth.emit(0);
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

    const month = this.highlightedMonth();
    if (isNull(month)) return;
    this.triggerSelectMonth.emit(month);
  }
  //highlight the entry one line below
  private _onArrowDownPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightNextMonth.emit(4); //4 months per line
  }
  //highlight the entry one line above
  private _onArrowUpPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightPreviousMonth.emit(4); //4 months per line
  }
  //highlight next entry
  private _onArrowRightPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightNextMonth.emit(1);
  }
  //highlight previous entry
  private _onArrowLeftPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightPreviousMonth.emit(1);
  }
  //highlight first entry on the page
  private _onHomePress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightFirstMonth.emit();
  }
  //highlight last entry on the page
  private _onEndPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightLastMonth.emit();
  }
  //alone: highlight same entry on the next page
  //with alt: highlight same entry multiple pages after (10 pages)
  private _onPageDownPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightSameMonthNextPage.emit(event.altKey);
  }
  //alone: highlight same entry on the previous page
  //with alt: highlight same entry multiple pages before (10 pages)
  private _onPageUpPress(event: KeyboardEvent): void {
    event.preventDefault();
    this.triggerHighlightSameMonthPreviousPage.emit(event.altKey);
  }

  //! helpers
  isMonthToday(month: number): boolean {
    return this.activeYear() === TODAY.getFullYear() && month === TODAY.getMonth();
  }
  isMonthSelected(month: number | Date | null): boolean {
    if (month instanceof Date) month = month.getMonth();
    const isStartDateSelected = this.isMonthSelectedStart(month);

    if (this.rangeSelectionMode()) {
      const isEndDateSelected = this.isMonthSelectedEnd(month);
      return isStartDateSelected || isEndDateSelected;
    }
    return isStartDateSelected;
  }
  isMonthSelectedStart(month: number | Date | null): boolean {
    if (month instanceof Date) month = month.getMonth();
    const selected = this.selectedDate();
    const { year, month: selectedMonth } = getDateComponents(selected, this.UTC());
    const isStartDateSelected = selected !== null && this.activeYear() === year && month === selectedMonth;

    return isStartDateSelected;
  }
  isMonthSelectedEnd(month: number | Date | null): boolean {
    if (month instanceof Date) month = month.getMonth();
    const selected = this.selectedDateEnd();
    const { year, month: selectedMonth } = getDateComponents(selected, this.UTC());
    const isEndDateSelected = selected !== null && this.activeYear() === year && month === selectedMonth;

    return isEndDateSelected;
  }
  isMonthBetweenSelectedRange(month: number | Date | null): boolean {
    if (!this.rangeSelectionMode()) return false;
    if (month instanceof Date) month = month.getMonth();
    const selected = this.selectedDate();
    const selectedEnd = this.selectedDateEnd();
    if (selected === null || selectedEnd === null || selected >= selectedEnd) return false;
    return this._isMonthBetweenDates(month!, selected, selectedEnd);
  }
  isMonthBetweenSelectedHighlighted(month: number | Date | null): boolean {
    if (!this.rangeSelectionMode() || this.selectedDateEnd()) return false;
    if (month instanceof Date) month = month.getMonth();
    const selected = this.selectedDate();
    const highlightedEnd = this.highlightedMonthDate();
    if (selected === null || highlightedEnd === null || selected >= highlightedEnd) return false;
    return this._isMonthBetweenDates(month!, selected, highlightedEnd);
  }
  private _isMonthBetweenDates(month: number, startDate: Date, endDate: Date): boolean {
    const { year: startYear, month: startMonth } = getDateComponents(startDate, this.UTC());
    const { year: endYear, month: endMonth } = getDateComponents(endDate, this.UTC());
    return startYear <= this.activeYear() && startMonth <= month && endYear >= this.activeYear() && endMonth >= month;
  }
  isYearOutOfRange(year: number): number {
    return isYearOutOfRange(year, this.min(), this.max());
  }

  //! templates
  readonly monthsViewHeaderTemplate = input.required<TemplateRef<CalendarMonthsViewHeaderContext> | undefined>();
  readonly monthTemplate = input.required<TemplateRef<CalendarMonthContext> | undefined>();

  //! template customizations
  readonly monthsViewHeaderDateFormat = input.required<string>(); // 'YYYY'
  readonly monthDateFormat = input.required<string>(); // 'MMM'

  //! template contexts
  readonly monthsViewHeaderContext = computed(
    (): CalendarMonthsViewHeaderContext => ({
      nextPage: () => {
        this.triggeChangeYear.emit(this.activeYear() + 1);
      },
      prevPage: () => {
        this.triggeChangeYear.emit(this.activeYear() - 1);
      },
      openYearsView: () => {
        this.triggerOpenYearsView.emit();
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
      canGoToNextPage: !this.isYearOutOfRange(this.activeYear() + 1),
      canGoToPreviousPage: !this.isYearOutOfRange(this.activeYear() - 1),
      hideNextPageButton:
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Left ||
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
      hidePreviousPageButton:
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Right ||
        this.multiCalendarLocation() === ArdMultiCalendarLocation.Inner,
      year: this.activeYear(),
      date: getUTCDate(this.activeYear(), 0, 2), // second day of month to prevent timezone issues
      $implicit: this.activeYear(),
    })
  );

  readonly monthContext = computed(() => (month: number): CalendarMonthContext => {
    const date = getUTCDate(this.activeYear(), month, 2); // second day of month to prevent timezone issues
    return {
      month,
      date,
      $implicit: date,
      select: (month: number | Date) => {
        if (month instanceof Date) month = month.getMonth();
        this.triggerSelectMonth.emit(month);
      },
    };
  });

  //! template components
  readonly monthsViewHeaderComponent = this._DEFAULTS.MonthsViewHeaderComponent;
  readonly monthComponent = this._DEFAULTS.MonthComponent;

  readonly monthsViewHeaderComponentInputs = contextToInputs(this.monthsViewHeaderContext, this.monthsViewHeaderComponent);
  readonly monthComponentInputs = contextToInputs(this.monthContext, this.monthComponent);
}
