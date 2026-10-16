import { TemplateComponent } from 'dist/ui';
import { isDate, isNumber } from 'simple-bool';

export const ArdCalendarView = {
  Days: 'days',
  Months: 'months',
  Years: 'years',
} as const;
export type ArdCalendarView = (typeof ArdCalendarView)[keyof typeof ArdCalendarView];

export const ArdMultiCalendarLocation = {
  Only: 'only',
  Left: 'left',
  Inner: 'inner',
  Right: 'right',
} as const;
export type ArdMultiCalendarLocation = (typeof ArdMultiCalendarLocation)[keyof typeof ArdMultiCalendarLocation];

export class DateRange {
  constructor(
    public from: Date,
    public to: Date
  ) {}
}
export class PartialDateRange {
  constructor(
    public from: Date,
    public to: Date | null
  ) {}
}
export function isDateRange(v: unknown): v is DateRange {
  return !!v && typeof v === 'object' && 'from' in v && isDate(v.from) && 'to' in v && isDate(v.to);
}
export function isAnyDateRange(v: unknown): v is PartialDateRange {
  return !!v && typeof v === 'object' && 'from' in v && isDate(v.from) && 'to' in v && (isDate(v.to) || v.to === null);
}

export interface YearRange {
  from: number;
  to: number;
}
export function isYearRange(v: unknown): v is YearRange {
  return !!v && typeof v === 'object' && 'from' in v && isNumber(v.from) && 'to' in v && isNumber(v.to);
}

export type ArdCalendarFilterFn = (date: Date) => boolean;

//! template contexts
export interface CalendarYearsViewHeaderContext {
  nextPage: () => void;
  prevPage: () => void;
  openMonthsView: () => void;
  openDaysView: () => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  hideNextPageButton: boolean;
  hidePreviousPageButton: boolean;
  yearRange: YearRange;
  dateRange: DateRange;
  $implicit: DateRange;
}

export interface CalendarMonthsViewHeaderContext {
  nextPage: () => void;
  prevPage: () => void;
  openDaysView: () => void;
  openYearsView: () => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  hideNextPageButton: boolean;
  hidePreviousPageButton: boolean;
  year: number;
  date: Date;
  $implicit: number;
}

export interface CalendarDaysViewHeaderContext {
  nextMonth: () => void;
  prevMonth: () => void;
  nextYear: () => void;
  prevYear: () => void;
  openYearsView: () => void;
  openMonthsView: () => void;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
  hideNextPageButton: boolean;
  hidePreviousPageButton: boolean;
  year: number;
  month: number;
  $implicit: Date;
}

export interface CalendarWeekdayContext {
  dayIndex: number;
  date: Date;
  $implicit: Date;
}

export interface CalendarFloatingMonthContext {
  month: number;
  date: Date;
  $implicit: Date;
}

export interface CalendarYearContext {
  value: number;
  date: Date;
  $implicit: Date;
  select: (year: number) => void;
}

export interface CalendarMonthContext {
  month: number;
  date: Date;
  $implicit: Date;
  select: (month: number | Date) => void;
}

export interface CalendarDayContext {
  value: number;
  date: Date;
  $implicit: number;
  select: (day: number | Date) => void;
}

export interface CalendarActionButtonsContext {
  cancel: () => void;
  apply: () => void;
  reset: () => void;
}

export interface ArdCalendarDaysViewHeader extends TemplateComponent<CalendarDaysViewHeaderContext> {}
export interface ArdCalendarMonthsViewHeader extends TemplateComponent<CalendarMonthsViewHeaderContext> {}
export interface ArdCalendarYearsViewHeader extends TemplateComponent<CalendarYearsViewHeaderContext> {}
export interface ArdCalendarWeekday extends TemplateComponent<CalendarWeekdayContext> {}
export interface ArdCalendarFloatingMonth extends TemplateComponent<CalendarFloatingMonthContext> {}
export interface ArdCalendarYear extends TemplateComponent<CalendarYearContext> {}
export interface ArdCalendarMonth extends TemplateComponent<CalendarMonthContext> {}
export interface ArdCalendarDay extends TemplateComponent<CalendarDayContext> {}