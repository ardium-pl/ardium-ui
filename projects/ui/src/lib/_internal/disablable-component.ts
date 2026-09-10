import { Directive, HostBinding, Input, signal } from '@angular/core';
import { coerceBooleanProperty } from '@ardium-pl/devkit';

export interface _DisablableComponentDefaults {
  readonly: boolean;
  disabled: boolean;
}
export const _disablableComponentDefaults: _DisablableComponentDefaults = {
  readonly: false,
  disabled: false,
};

@Directive()
export abstract class _DisablableComponentBase {
  constructor(protected readonly _DEFAULTS: _DisablableComponentDefaults) {}
  //! no value arguments
  /**
   * Whether the component is read-only. Defines the `readonly` host attribute and `ard-readonly` host class. Coercible into a boolean.
   */
  readonly readonly = signal<boolean>(this._DEFAULTS.readonly);
  @Input('readonly')
  set _readonly(v: any) {
    this.readonly.set(coerceBooleanProperty(v));
  }

  /**
   * Whether the component is disabled. Defines the `disabled` host attribute and `ard-disabled` host class. Coercible into a boolean.
   */
  readonly disabled = signal<boolean>(this._DEFAULTS.disabled);
  @Input('disabled')
  set _disabled(v: any) {
    this.disabled.set(coerceBooleanProperty(v));
  }

  @HostBinding('attr.readonly')
  @HostBinding('class.ard-readonly')
  get _readonlyHostAttribute(): boolean {
    return this.readonly();
  }
  @HostBinding('attr.disabled')
  @HostBinding('class.ard-disabled')
  get _disabledHostAttribute(): boolean {
    return this.disabled();
  }
}
