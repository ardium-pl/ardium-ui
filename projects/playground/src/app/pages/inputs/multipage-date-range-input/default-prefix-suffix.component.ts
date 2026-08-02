import { Component } from '@angular/core';
import {
    ArdiumMultipageDateRangeInputModule,
    provideDateInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-multipage-date-range-input-default-prefix',
  template: `📅`,
  standalone: true,
})
export class MultipageDateRangeInputDefaultPrefixComponent {}

@Component({
  selector: 'app-multipage-date-range-input-default-prefix-component',
  template: `<ard-multipage-date-range-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumMultipageDateRangeInputModule],
  providers: [
    provideDateInputDefaults({
      PrefixComponent: MultipageDateRangeInputDefaultPrefixComponent as any,
    }),
  ],
})
export class MultipageDateRangeInputDefaultPrefixDemoComponent {}
