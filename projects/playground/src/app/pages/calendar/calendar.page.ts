import { Component, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { Logger } from '../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage {
  selectedDate: Date = new Date();

  eventsCalendarDate: Date | null = null;
  eventsCalendarDateUTC: Date | null = null;

  readonly dateControl = new FormControl<Date | null>(null);

  constructor(private LoggerService: Logger) {}
  log = this.LoggerService.log;

  minDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30);
  maxDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30);
  minDate2 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-02T00:00:00.000Z`);
  maxDate2 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-26T12:00:00.000Z`);
  minDate3 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-02T00:00:00.000`);
  maxDate3 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-26T02:00:00.000`);

  filterFn = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

  readonly formModel = signal({
    value1: null as Date | null,
  });
  readonly signalForm = form(this.formModel);
}
