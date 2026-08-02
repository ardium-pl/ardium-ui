import { Component } from '@angular/core';
import {
    ArdiumDateInputModule,
    provideDateInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-date-input-default-prefix',
  template: `📅`,
  standalone: true,
})
export class DateInputDefaultPrefixComponent {}

@Component({
  selector: 'app-date-input-default-prefix-component',
  template: `<ard-date-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumDateInputModule],
  providers: [
    provideDateInputDefaults({
      PrefixComponent: DateInputDefaultPrefixComponent as any,
    }),
  ],
})
export class DateInputDefaultPrefixDemoComponent {}
