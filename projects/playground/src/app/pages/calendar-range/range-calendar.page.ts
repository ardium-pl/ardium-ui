import { Component } from '@angular/core';
import { DateRange } from '../../../../../ui/src/public-api';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-range-calendar',
  templateUrl: './range-calendar.page.html',
  styleUrls: ['./range-calendar.page.scss'],
})
export class RangeCalendarPage {
  selectedDate: DateRange = new DateRange(new Date(), new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 5));

  eventsCalendarDate: DateRange | null = null;
  eventsCalendarDateUTC: DateRange | null = null;

  constructor(private LoggerService: Logger) {}
  log = this.LoggerService.log;

  minDate = new Date(new Date().getFullYear() - 3, 2, 8);
  maxDate = new Date(new Date().getFullYear() + 3, 9, 15);

  filterFn = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
}
