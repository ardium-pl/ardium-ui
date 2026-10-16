import { Component, input } from '@angular/core';
import { ArdCheckboxIcon, ArdiumCheckboxModule, provideCheckboxDefaults } from '../../../../../ui/src/public-api';


@Component({
  selector: 'app-checkbox-default-icon',
  template: `{{ selected() ? '☑' : '☐' }}`,
  standalone: true,
})
export class DefaultCheckboxIcon implements ArdCheckboxIcon {
  readonly selected = input<boolean>(false);
}

@Component({
  selector: 'app-checkbox-default-component',
  template: ` <ard-checkbox>Default Checkbox</ard-checkbox> `,
  standalone: true,
  imports: [ArdiumCheckboxModule],
  providers: [provideCheckboxDefaults({
    CheckboxIconComponent: DefaultCheckboxIcon,
  })],
})
export class CheckboxDefaultComponent {}