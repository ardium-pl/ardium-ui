import { getUTCDate } from '@ardium-pl/devkit';
import { isDefined } from 'simple-bool';
import { Nullable } from '../../../types/utility.types';
import { CalendarArrayItem } from '../../calendar.internal-types';

export function getCalendarYearsArray(
  startYear: number,
  yearCount: number,
  min: Nullable<Date>,
  max: Nullable<Date>
): CalendarArrayItem[] {
  return new Array(yearCount)
    .fill(startYear)
    .map((v, i) => ({ value: v + i, valueDate: new Date(v + i, 1, 1), disabled: !!isYearOutOfRange(v + i, min, max) }));
}
export function isYearOutOfRange(year: number, min: Nullable<Date>, max: Nullable<Date>): number {
  const dateForMinComparison = getUTCDate(year, 11, 31);
  if (isDefined(min) && dateForMinComparison < min) return -1;

  const dateForMaxComparison = getUTCDate(year, 0, 1);
  if (isDefined(max) && dateForMaxComparison > max) return 1;

  return 0;
}
