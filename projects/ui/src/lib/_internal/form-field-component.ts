import { Directive, input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormUiControl } from '@angular/forms/signals';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { ArdFormFieldControl } from '../form-field/form-field-child.token';
import { _NgModelComponentBase, _NgModelComponentDefaults, _ngModelComponentDefaults } from './ngmodel-component';

export interface _FormFieldComponentDefaults extends _NgModelComponentDefaults {
  required: boolean | undefined;
}

export const _formFieldComponentDefaults: _FormFieldComponentDefaults = {
  ..._ngModelComponentDefaults,
  required: undefined,
};

/**
 * Common code for components which implement the ControlValueAccessor.
 *
 * **Warning**: `writeValue` function should be implemented on the child component!
 */
@Directive()
export abstract class _FormFieldComponentBase
  extends _NgModelComponentBase
  implements ControlValueAccessor, ArdFormFieldControl, Omit<FormUiControl<any>, 'disabled' | 'readonly'>
{
  protected override readonly _DEFAULTS!: _FormFieldComponentDefaults;

  // @ts-expect-error to keep typed transform, but adhere to the ArdFormFieldControl interface
  readonly required = input<boolean, BooleanLike>(false, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly isSuccess = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
}
