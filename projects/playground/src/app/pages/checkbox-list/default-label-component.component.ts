import { Component, input } from '@angular/core';
import {
  ArdCheckboxListLabelComponent,
  ArdiumCheckboxListModule,
  provideCheckboxDefaults,
  provideCheckboxListDefaults,
} from 'projects/ui/src/public-api';
import { DefaultCheckboxIcon } from '../checkbox/checkbox-default-component.component';

@Component({
  selector: 'app-checkbox-list-default-label',
  template: `:{{ label() }}:`,
  standalone: true,
})
export class CheckboxListDefaultLabelComponent implements ArdCheckboxListLabelComponent {
  readonly label = input<string>('');
}

@Component({
  selector: 'app-checkbox-list-default-label-component',
  template: `<ard-checkbox-list [items]="items" />`,
  standalone: true,
  imports: [ArdiumCheckboxListModule],
  providers: [
    provideCheckboxListDefaults({
      LabelComponent: CheckboxListDefaultLabelComponent,
    }),
    provideCheckboxDefaults({
      CheckboxIconComponent: DefaultCheckboxIcon,
    }),
  ],
})
export class CheckboxListDefaultLabelDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}
