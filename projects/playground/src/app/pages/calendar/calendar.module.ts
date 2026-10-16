import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { ArdiumCalendarModule } from '../../../../../ui/src/public-api';
import { CalendarPage } from './calendar.page';

@NgModule({
  declarations: [CalendarPage],
  imports: [CommonModule, FormsModule, ArdiumCalendarModule, ReactiveFormsModule, FormField],
})
export class CalendarModule {}
