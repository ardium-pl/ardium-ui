import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumDateRangeInputModule } from 'projects/ui/src/lib/inputs/date-input/date-range-input.module';
import { DateRangeInputPage } from './date-range-input.page';
import { DateRangeInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';

@NgModule({
  declarations: [DateRangeInputPage],
  imports: [ArdiumDateRangeInputModule, ReactiveFormsModule, DateRangeInputDefaultPrefixDemoComponent],
})
export class DateRangeInputModule {}
