import { Component, input } from '@angular/core';
import { ArdCheckboxListLabelComponent, ArdiumCheckboxListModule, provideCheckboxListDefaults } from 'projects/ui/src/public-api';

@Component({
  selector: 'app-checkbox-list-default-label',
  template: `{{ selected() ? '✔ ' : '' }}{{ label() }}`,
  standalone: true,
})
export class CheckboxListDefaultLabelComponent implements ArdCheckboxListLabelComponent {
  readonly label = input<string>('');
  readonly selected = input<boolean>(false);
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
  ],
})
export class CheckboxListDefaultLabelDemoComponent {
  readonly items = ['Apple', 'Banana', 'Pear', 'Starfruit'];
}