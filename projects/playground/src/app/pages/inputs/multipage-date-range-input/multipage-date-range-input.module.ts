import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumMultipageDateRangeInputModule } from 'projects/ui/src/public-api';
import { MultipageDateRangeInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { MultipageDateRangeInputPage } from './multipage-date-range-input.page';

@NgModule({
  declarations: [MultipageDateRangeInputPage],
  imports: [ArdiumMultipageDateRangeInputModule, ReactiveFormsModule, MultipageDateRangeInputDefaultPrefixDemoComponent],
})
export class MultipageDateRangeInputModule {}
