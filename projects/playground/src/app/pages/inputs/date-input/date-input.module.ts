import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumDateInputModule } from 'projects/ui/src/public-api';
import { DateInputPage } from './date-input.page';
import { DateInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';

@NgModule({
  declarations: [DateInputPage],
  imports: [ArdiumDateInputModule, ReactiveFormsModule, DateInputDefaultPrefixDemoComponent],
})
export class DateInputModule {}
