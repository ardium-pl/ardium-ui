import { Component, input } from '@angular/core';
import { ArdiumProgressCircleModule, ArdProgressCircleValueComponent, provideProgressCircleDefaults } from 'projects/ui/src/public-api';

@Component({
  standalone: true,
  selector: 'app-progress-circle-value-default',
  template: `%{{ percentValue() }}%`,
})
export class ProgressCircleValueDefault implements ArdProgressCircleValueComponent {
  readonly percentValue = input<number>(0);
}

@Component({
  standalone: true,
  selector: 'app-progress-circle-value-default-component',
  template: `<ard-progress-circle [value]="40" variant="ring" />`,
  imports: [ArdiumProgressCircleModule],
  providers: [
    provideProgressCircleDefaults({
      ValueComponent: ProgressCircleValueDefault,
    }),
  ],
})
export class ProgressCircleValueDefaultComponent {}
