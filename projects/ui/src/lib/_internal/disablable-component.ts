import { Directive, HostBinding, input, linkedSignal } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';

export interface _DisablableComponentDefaults {
  readonly: boolean;
  disabled: boolean;
}
export const _disablableComponentDefaults: _DisablableComponentDefaults = {
  readonly: false,
  disabled: false,
};

@Directive()
export abstract class _DisablableComponentBase implements FormUiControl<unknown> {
  constructor(protected readonly _DEFAULTS: _DisablableComponentDefaults) {}
  //! no value arguments
  /**
   * Whether the component is read-only. Defines the `readonly` host attribute and `ard-readonly` host class. Coercible into a boolean.
   */
  // @ts-expect-error to keep typed transform, but adhere to the FormValueControl interface
  readonly readonly = input<boolean, BooleanLike>(this._DEFAULTS.readonly, { transform: v => coerceBooleanProperty(v) });
  readonly _readonly = linkedSignal<boolean>(() => this.readonly());

  /**
   * Whether the component is disabled. Defines the `disabled` host attribute and `ard-disabled` host class. Coercible into a boolean.
   */
  // @ts-expect-error to keep typed transform, but adhere to the FormValueControl interface
  readonly disabled = input<boolean, BooleanLike>(this._DEFAULTS.disabled, { transform: v => coerceBooleanProperty(v) });

  @HostBinding('attr.readonly')
  @HostBinding('class.ard-readonly')
  get _readonlyHostAttribute(): boolean {
    return this.readonly() || this._readonly();
  }
  @HostBinding('attr.disabled')
  @HostBinding('class.ard-disabled')
  get _disabledHostAttribute(): boolean {
    return this.disabled();
  }
}