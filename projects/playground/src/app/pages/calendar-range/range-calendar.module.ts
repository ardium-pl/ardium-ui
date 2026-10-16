import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumRangeCalendarModule } from '../../../../../ui/src/public-api';
import { RangeCalendarPage } from './range-calendar.page';

@NgModule({
  declarations: [RangeCalendarPage],
  imports: [CommonModule, FormsModule, ArdiumRangeCalendarModule],
})
export class RangeCalendarModule {}
