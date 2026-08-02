import { Component } from '@angular/core';
import {
    ArdiumInputModule,
    provideInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-input-default-prefix',
  template: `★`,
  standalone: true,
})
export class InputDefaultPrefixComponent {}

@Component({
  selector: 'app-input-default-prefix-component',
  template: `<ard-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumInputModule],
  providers: [
    provideInputDefaults({
      PrefixComponent: InputDefaultPrefixComponent as any,
    }),
  ],
})
export class InputDefaultPrefixDemoComponent {}
