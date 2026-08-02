import { Component, input } from '@angular/core';
import { ArdFormFieldFramePrefixSuffix, ArdiumSelectModule, provideSelectDefaults } from 'projects/ui/src/public-api';

@Component({
  selector: 'app-select-default-prefix',
  template: `:{{ isFocused() ? 'open' : 'closed' }}:`,
  standalone: true,
})
export class SelectDefaultPrefixComponent implements ArdFormFieldFramePrefixSuffix {
  readonly isFocused = input<boolean>(false);
}

@Component({
  selector: 'app-select-default-prefix-component',
  template: `<ard-select [items]="items" />`,
  standalone: true,
  imports: [ArdiumSelectModule],
  providers: [
    provideSelectDefaults({
      PrefixComponent: SelectDefaultPrefixComponent,
    }),
  ],
})
export class SelectDefaultPrefixDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}
