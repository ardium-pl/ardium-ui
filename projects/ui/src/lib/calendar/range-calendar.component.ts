import {
  ChangeDetectionStrategy,
  Component,
  effect,
  Inject,
  model,
  output,
  untracked,
  ViewEncapsulation
} from '@angular/core';
import { isDate, isDefined, isObject } from 'simple-bool';
import { ARD_FORM_FIELD_CONTROL } from '../form-field/form-field-child.token';
import { _AbstractCalendar } from './abstract-calendar';
import { ARD_CALENDAR_DEFAULTS, ArdCalendarDefaults } from './calendar.defaults';
import { DateRange, PartialDateRange } from './calendar.types';

@Component({
  standalone: false,
  selector: 'ard-range-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumRangeCalendarComponent,
    },
  ],
})
export class ArdiumRangeCalendarComponent extends _AbstractCalendar<DateRange, PartialDateRange> {
  readonly componentId = '200';
  readonly componentName = 'calendar';
  readonly isRangeSelector = true;


  constructor(@Inject(ARD_CALENDAR_DEFAULTS) defaults: ArdCalendarDefaults) {
    super(defaults);

    effect(() => {
      const start = this.selectionStart();
      const end = this.selectionEnd();

      if (!isDefined(start)) {
        this.value.set(null);
        return;
      }
      if (!isDefined(end)) {
        this.startSelection.emit(start);
      }
      // avoid re-emitting same value
      const value = untracked(() => this.value());
      if (value && value.from.valueOf() === start.valueOf() && value.to?.valueOf() === end?.valueOf()) {
        return;
      }
      this.value.set(new PartialDateRange(start, end));
      if (end) {
        this._emitChange();
      }
    });
  }

  readonly value = model<PartialDateRange | null>(null);

  readonly startSelection = output<Date>();

  readonly endDate = this.selectionEnd.asReadonly();

  override writeValue(v: any): void {
    if (isObject(v) && 'from' in v && 'to' in v && isDate(v['from']) && isDate(v['to'])) {
      this.selectionStart.set(v['from']);
      this.selectionEnd.set(v['to']);
    } else if (!isDefined(v)) {
      this.selectionStart.set(null);
      this.selectionEnd.set(null);
    } else {
      console.error(
        new Error(`ARD-NF2003: <ard-range-calendar> [writeValue] expected a { from: Date, to: Date } object or null, got "${v}".`)
      );
    }
  }

  protected override getValueForEmit(): DateRange | null {
    const value = this.value();
    if (!value || !isDefined(value.from) || !isDefined(value.to)) return null;
    return new DateRange(value.from, value.to);
  }
}
