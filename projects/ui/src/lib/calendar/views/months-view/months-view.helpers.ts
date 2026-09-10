import { getUTCDate } from '@ardium-pl/devkit';
import { isDefined } from 'simple-bool';
import { CalendarArrayItem } from '../../calendar.internal-types';

export function isMonthOutOfRange(month: number, year: number, min: Date | null, max: Date | null): number {
  const dateForMinComparison = getUTCDate(year, month + 1, 0); // last day of month
  if (isDefined(min) && dateForMinComparison < min) return -1;

  const dateForMaxComparison = getUTCDate(year, month, 1); // first day of month
  if (isDefined(max) && dateForMaxComparison > max) return 1;

  return 0;
}

export function getCalendarMonthsArray(year: number, min: Date | null, max: Date | null): CalendarArrayItem[] {
  const months: CalendarArrayItem[] = [];
  for (let month = 0; month < 12; month++) {
    const monthData: CalendarArrayItem = {
      value: month,
      valueDate: new Date(year, month, 2),
      disabled: !!isMonthOutOfRange(month, year, min, max),
    };
    months.push(monthData);
  }
  return months;
}
