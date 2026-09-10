import { Component, computed, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { AbstractControl, TouchedChangeEvent } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { filter, map, startWith, Subscription } from 'rxjs';
import { ARD_FORM_FIELD_DEFAULTS } from '../form-field.defaults';
import { ARD_ERROR_MAP } from './auto-error.provider';

@Component({
  standalone: false,
  selector: 'ard-auto-error',
  templateUrl: './auto-error.component.html',
  host: {
    '[class.ard-auto-error]': 'true',
    '[class.ard-auto-error-default]': '!left() && !right()',
    '[class.ard-auto-error-left]': 'left() && !right()',
    '[class.ard-auto-error-right]': '!left() && right()',
    '[class.ard-auto-error__no-errors]': 'errorMessages().length === 0',
    '[class.ard-auto-error__has-errors]': 'errorMessages().length > 0',
  },
})
export class ArdiumAutoErrorComponent implements OnDestroy {
  private readonly _errorMap = inject(ARD_ERROR_MAP);
  private readonly _DEFAULTS = inject(ARD_FORM_FIELD_DEFAULTS);

  readonly control = input.required<AbstractControl<any>>();

  readonly onlyFirstError = input<boolean, BooleanLike>(this._DEFAULTS.autoErrorOnlyFirstError, {
    transform: v => coerceBooleanProperty(v),
  });
  private _eventsSub!: Subscription;
  constructor() {
    effect(() => {
      const control = this.control();
      this._eventsSub = control.events
        .pipe(
          startWith(new TouchedChangeEvent(true, control)),
          filter(event => 'touched' in event || 'status' in event),
          map(() => {
            const errors = control.errors;
            if (!errors || !control.touched) {
              return [];
            }
            if (typeof errors === 'object' && Object.keys(errors).length === 0) {
              return [];
            }

            const onlyFirstError = this.onlyFirstError();
            const errorMessages: string[] = [];
            for (const errorType in this._errorMap) {
              if (errorType in errors) {
                const valueOrFn = this._errorMap[errorType];
                if (typeof valueOrFn === 'function') {
                  const result = valueOrFn(errors[errorType]);
                  if (onlyFirstError) {
                    return [result];
                  }
                  errorMessages.push(result);
                } else if (valueOrFn !== undefined) {
                  if (onlyFirstError) {
                    return [valueOrFn];
                  }
                  errorMessages.push(valueOrFn);
                }
              }
            }
            if (errorMessages.length === 0) {
              return [this._errorMap.$fallback || JSON.stringify(errors)];
            }
            return errorMessages;
          })
        )
        .subscribe(errorMessages => {
          this.errorMessages.set(errorMessages);
        });

      () => {
        this._eventsSub.unsubscribe();
      };
    });

    effect(() => {
      if (this.left() && this.right()) {
        console.error(`ARD-NF5150: Cannot align a form field auto-error to both left and right.`);
      }
    });
  }
  ngOnDestroy(): void {
    this._eventsSub?.unsubscribe();
  }

  readonly errorMessages = signal<string[]>([], { equal: (a, b) => a.length === b.length && a.every((v, i) => v === b[i]) });

  readonly hasError = computed<boolean>(() => this.errorMessages().length > 0);

  readonly left = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly right = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
