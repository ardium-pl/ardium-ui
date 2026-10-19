import { InjectionToken, Signal } from '@angular/core';

export interface ArdFormFieldControl {
  invalid: Signal<boolean> | (() => boolean) | boolean;
  touched: Signal<boolean> | (() => boolean) | boolean;
  isSuccess?: Signal<boolean> | (() => boolean) | boolean;
  disabled?: Signal<boolean> | (() => boolean) | boolean;
  htmlId: Signal<string> | (() => string) | string;
  // removed for now
  // will bring back when I figure out how (and if) to pass it onto the label
  // required?: Signal<boolean> | (() => boolean) | boolean;
}

export const ARD_FORM_FIELD_CONTROL = new InjectionToken<ArdFormFieldControl>('ard-form-field-control');
