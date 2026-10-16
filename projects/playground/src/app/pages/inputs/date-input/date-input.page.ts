import { Component, computed, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ArdiumDateInputComponent } from '../../../../../../ui/src/public-api';
import { Logger } from '../../../services/logger.service';

@Component({
  standalone: false,
  selector: 'app-date-input',
  templateUrl: './date-input.page.html',
  styleUrl: './date-input.page.scss',
})
export class DateInputPage {
  readonly logger = inject(Logger);
  log = this.logger.log;

  readonly MIN = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-02T00:00:00`);
  readonly MAX = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-26T00:00:00`);
  readonly MIN2 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-02T00:00:00Z`);
  readonly MAX2 = new Date(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-26T00:00:00Z`);

  readonly formControl = new FormControl<Date | null>(new Date('2024-01-01'));

  readonly selectedYear = signal<number | null>(null);
  readonly selectedMonth = signal<number | null>(null);

  onMonthSelect(month: number, dateInput: ArdiumDateInputComponent): void {
    this.selectedMonth.set(month);
    dateInput.close();
  }

  readonly yearMonthValue = computed<Date | null>(() => {
    const year = this.selectedYear();
    const month = this.selectedMonth();
    if (year === null || month === null) return null;
    return new Date(year, month, 1);
  });

  readonly yearMonthSerializer = (date: Date | null): string => {
    if (date === null) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  };
}
