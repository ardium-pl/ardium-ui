import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  forwardRef,
  Inject,
  input,
  model,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { isDefined, isNull } from 'simple-bool';
import { getUTCDate } from '../../_internal/utils/date.utils';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { _AbstractDateInput } from './abstract-date-input';
import { ARD_DATE_INPUT_DEFAULTS, ArdDateInputDefaults } from './date-input.defaults';
import {
  ArdDateInputDaysViewHeaderTemplateDirective,
  ArdDateInputDayTemplateDirective,
  ArdDateInputFloatingMonthTemplateDirective,
  ArdDateInputMonthsViewHeaderTemplateDirective,
  ArdDateInputMonthTemplateDirective,
  ArdDateInputPrefixTemplateDirective,
  ArdDateInputSuffixTemplateDirective,
  ArdDateInputWeekdayTemplateDirective,
  ArdDateInputYearsViewHeaderTemplateDirective,
  ArdDateInputYearTemplateDirective,
} from './date-input.directives';
import { ArdDateInputDeserializeFn, ArdDateInputMinMaxStrategy, ArdDateInputSerializeFn } from './date-input.types';

@Component({
  standalone: false,
  selector: 'ard-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumDateInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumDateInputComponent,
    },
  ],
})
export class ArdiumDateInputComponent extends _AbstractDateInput<Date> implements AfterViewInit {
  readonly componentId = '008';
  readonly componentName = 'date-input';
  readonly isRangeSelector = false;

  protected override readonly _DEFAULTS!: ArdDateInputDefaults;
  constructor(@Inject(ARD_DATE_INPUT_DEFAULTS) defaults: ArdDateInputDefaults) {
    super(defaults);

    effect(() => {
      const value = this.value();
      const serializer = this.serializeFn();
      this._serializeValueIntoDateInput(value, serializer);
    });
  }

  readonly dateInputValue = model<string>('');

  writeValue(v: Date | null): void {
    if (v instanceof Date) {
      this.value.set(v);
    } else if (!isDefined(v)) {
      this.value.set(null);
    } else {
      console.error(new Error(`ARD-NF0083: <ard-date-input> writeValue expected a Date or null, got "${v}".`));
    }
  }
  protected _isFullValue(_: Date | null): _ is Date {
    return true;
  }
  protected getValueForEmit(): Date | null {
    return this.value();
  }

  //! date input event handlers
  readonly dateInput = viewChild<ElementRef<HTMLInputElement>>('dateInput');

  readonly inputAttrs = input<Record<string, any>>(this._DEFAULTS.inputAttrs);

  readonly inputReadOnly = input<boolean, BooleanLike>(this._DEFAULTS.inputReadOnly, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly minMaxStrategy = input<ArdDateInputMinMaxStrategy>(this._DEFAULTS.minMaxStrategy);
  readonly serializeFn = input<ArdDateInputSerializeFn<Date>>(this._DEFAULTS.serializeFn);
  readonly deserializeFn = input<ArdDateInputDeserializeFn<Date>>(this._DEFAULTS.deserializeFn);

  readonly isDateInputFocused = signal<boolean>(false);
  private readonly _wasDateInputChanged = signal<boolean>(false);

  onDateInputFocus(event: FocusEvent): void {
    this.onFocus(event);

    if (this.disabled() || this.readonly()) return;

    this.isDateInputFocused.set(true);
    this._wasDateInputChanged.set(false);
  }
  onDateInputBlur(event: FocusEvent): void {
    this.onBlur(event);

    if (this.disabled() || this.readonly()) return;

    this._processDateInputText(this.dateInputValue());

    if (!this.isDateInputFocused()) return;

    this.isDateInputFocused.set(false);
  }
  onDateInputEnter(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this.close();
    this.blur();
    this.focus();
  }
  private _processDateInputText(value: string): void {
    let date = this.deserializeFn()(value, this.value());

    if (this.minMaxStrategy() === ArdDateInputMinMaxStrategy.Adjust && date) {
      const min = this.min();
      const max = this.max();

      // min and max are always in UTC when they are set, so we need to convert the date to UTC for comparison
      date = getUTCDate(date.getFullYear(), date.getMonth(), date.getDate());

      if (min && date < min) {
        date = min;
      } else if (max && date > max) {
        date = max;
      }
      // convert the date back to local time if the UTC mode is off
      if (!this._UTCAfterInit()) {
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      }

      if (date.toISOString() !== this.value()?.toISOString()) {
        this.value.set(date);
      }
      return;
    }

    // deserialized date should always be in local time, so we need to convert it to UTC if the UTC mode is on
    if (date && this._UTCAfterInit()) {
      date = getUTCDate(date.getFullYear(), date.getMonth(), date.getDate());
    }

    if (date?.toISOString() !== this.value()?.toISOString()) {
      this.value.set(date);
    }
  }
  private _setDateInputAttributes() {
    const input = this.dateInput()?.nativeElement;
    if (!input) return;
    const attributes: Record<string, string> = {
      type: 'text',
      autocorrect: 'off',
      autocapitalize: 'off',
      autocomplete: 'off',
      ...this.inputAttrs(),
    };

    for (const key of Object.keys(attributes)) {
      input.setAttribute(key, attributes[key]);
    }
  }

  onDateInputInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.dateInputValue.set(v);
  }
  private _serializeValueIntoDateInput(value: Date | null, serializer: ArdDateInputSerializeFn<Date>): void {
    this.dateInputValue.set(serializer(value));
  }

  readonly shouldDisplayPlaceholder = computed(() => {
    if (this.isDateInputFocused() && this.dateInputValue()) return false;
    return isNull(this.value());
  });
  readonly shouldDisplayValue = computed(() => {
    if (this.isDateInputFocused()) return false;
    return this.value() instanceof Date;
  });
  readonly shouldDisplayDateInput = computed(() => {
    return !this.inputReadOnly() && !this.shouldDisplayValue() && this.isDateInputFocused();
  });

  //! hooks
  ngAfterViewInit(): void {
    this._setDateInputAttributes();
  }

  override onGeneralClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    super.onGeneralClick(event);
    this.dateInput()?.nativeElement.focus();

    if (this.isOpen()) {
      this.close();
    }
  }

  readonly prefixTemplate = contentChild(ArdDateInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdDateInputSuffixTemplateDirective);

  readonly calendarDaysViewHeaderTemplate = contentChild(ArdDateInputDaysViewHeaderTemplateDirective);
  readonly calendarYearsViewHeaderTemplate = contentChild(ArdDateInputYearsViewHeaderTemplateDirective);
  readonly calendarMonthsViewHeaderTemplate = contentChild(ArdDateInputMonthsViewHeaderTemplateDirective);
  readonly calendarWeekdayTemplate = contentChild(ArdDateInputWeekdayTemplateDirective);
  readonly calendarFloatingMonthTemplate = contentChild(ArdDateInputFloatingMonthTemplateDirective);
  readonly calendarYearTemplate = contentChild(ArdDateInputYearTemplateDirective);
  readonly calendarMonthTemplate = contentChild(ArdDateInputMonthTemplateDirective);
  readonly calendarDayTemplate = contentChild(ArdDateInputDayTemplateDirective);
}
