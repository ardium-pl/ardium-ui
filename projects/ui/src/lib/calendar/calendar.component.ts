import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  Inject,
  model,
  ViewEncapsulation
} from '@angular/core';
import { isDefined } from 'simple-bool';
import { ARD_FORM_FIELD_CONTROL } from '../form-field/form-field-child.token';
import { _AbstractCalendar } from './abstract-calendar';
import { ARD_CALENDAR_DEFAULTS, ArdCalendarDefaults } from './calendar.defaults';

@Component({
  standalone: false,
  selector: 'ard-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumCalendarComponent,
    },
  ],
})
export class ArdiumCalendarComponent extends _AbstractCalendar<Date> {
  readonly componentId = '200';
  readonly componentName = 'calendar';
  readonly isRangeSelector = false;

  constructor(@Inject(ARD_CALENDAR_DEFAULTS) defaults: ArdCalendarDefaults) {
    super(defaults);

    effect(() => {
      const v = this.selectionStart();
      if (!isDefined(v)) {
        return;
      }
      this.value.set(v);
      this._emitChange();
    });
  }

  readonly value = model<Date | null>(null);

  readonly endDate = computed<null>(() => null);

  override writeValue(v: any): void {
    if (v instanceof Date) {
      this.selectionStart.set(v);
    } else if (!isDefined(v)) {
      this.selectionStart.set(null);
    } else {
      console.error(new Error(`ARD-NF2003: <ard-calendar> [writeValue] expected a Date or null, got "${v}".`));
    }
  }

  protected getValueForEmit(): Date | null {
    return this.value();
  }
}
