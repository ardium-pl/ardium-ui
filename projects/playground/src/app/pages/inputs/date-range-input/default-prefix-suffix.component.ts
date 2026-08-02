import { Component } from '@angular/core';
import { ArdiumDateRangeInputModule } from 'projects/ui/src/lib/inputs/date-input/date-range-input.module';
import { provideDateInputDefaults } from 'projects/ui/src/public-api';

@Component({
  selector: 'app-date-range-input-default-prefix',
  template: `📅`,
  standalone: true,
})
export class DateRangeInputDefaultPrefixComponent {}

@Component({
  selector: 'app-date-range-input-default-prefix-component',
  template: `<ard-date-range-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumDateRangeInputModule],
  providers: [
    provideDateInputDefaults({
      PrefixComponent: DateRangeInputDefaultPrefixComponent as any,
    }),
  ],
})
export class DateRangeInputDefaultPrefixDemoComponent {}
