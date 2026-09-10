import { computed, Directive, input } from '@angular/core';
import { Validators } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, trackBoundControl } from '@ardium-pl/devkit';
import { TakeChance as Random } from 'take-chance';
import { ARD_FORM_FIELD_CONTROL, ArdFormFieldControl } from './form-field-child.token';

@Directive({
  standalone: false,
  selector:
    'ard-form-field > input, ard-form-field > textarea, ard-form-field > select, ard-horizontal-form-field > input, ard-horizontal-form-field > textarea, ard-horizontal-form-field > select',
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumFormFieldNativeInputAdapterDirective,
    },
  ],
  host: {
    '[class.ard-has-error]': 'hasError()',
    '[class.ard-is-success]': 'isSuccess()',
  },
})
export class ArdiumFormFieldNativeInputAdapterDirective implements ArdFormFieldControl {
  readonly _required = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'required',
  });
  readonly required = computed<boolean>(
    () =>
      this._required() ??
      !!(this.control.validators()?.includes(Validators.required) || this.control.validators()?.includes(Validators.requiredTrue))
  );

  readonly isSuccess = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly disabled = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! form field related
  readonly control = trackBoundControl(this, { attachValueAccessor: false });

  ngOnInit(): void {
    this.control.init();
  }

  readonly htmlId = input<string>(Random.id());

  readonly _hasError = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'hasError',
  });
  readonly hasError = computed<boolean>(() => this._hasError() ?? (this.control.touched() && this.control.invalid()));

  ngOnDestroy(): void {
    this.control.destroy();
  }
}
