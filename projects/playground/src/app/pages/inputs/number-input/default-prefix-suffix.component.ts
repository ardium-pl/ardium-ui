import { Component } from '@angular/core';
import { ArdFormFieldFramePrefixSuffix, ArdiumNumberInputModule, provideNumberInputDefaults } from 'projects/ui/src/public-api';

@Component({
  selector: 'app-number-input-default-prefix',
  template: `🔢`,
  standalone: true,
})
export class NumberInputDefaultPrefixComponent implements ArdFormFieldFramePrefixSuffix {}

@Component({
  selector: 'app-number-input-default-prefix-component',
  template: `<ard-number-input />`,
  standalone: true,
  imports: [ArdiumNumberInputModule],
  providers: [
    provideNumberInputDefaults({
      PrefixComponent: NumberInputDefaultPrefixComponent,
    }),
  ],
})
export class NumberInputDefaultPrefixDemoComponent {}
