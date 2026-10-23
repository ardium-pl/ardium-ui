import { computed, Directive, input, OnDestroy, OnInit, output } from '@angular/core';
import { FormUiControl } from '@angular/forms/signals';
import { coerceBooleanProperty, trackBoundControl } from '@ardium-pl/devkit';
import { TakeChance as Random } from 'take-chance';
import { _FocusableComponentBase, _focusableComponentDefaults, _FocusableComponentDefaults } from './focusable-component';

export interface _NgModelComponentDefaults extends _FocusableComponentDefaults {}

export const _ngModelComponentDefaults: _NgModelComponentDefaults = {
  ..._focusableComponentDefaults,
};

/**
 * Common code for components which implement the ControlValueAccessor.
 */
@Directive()
export abstract class _NgModelComponentBase
  extends _FocusableComponentBase
  implements OnInit, OnDestroy, Omit<FormUiControl<unknown>, 'disabled' | 'readonly'>
{
  protected override readonly _DEFAULTS!: _NgModelComponentDefaults;

  /**
   * @deprecated Use `[valueChange]` instead.
   */
  readonly change = output<never>();

  //! event handlers
  override onFocus(event: FocusEvent): void {
    this._shouldEmitTouched = false;
    super.onFocus(event);
  }

  protected _shouldEmitTouched = false;
  override onBlur(event: FocusEvent) {
    this._shouldEmitTouched = true;
    super.onBlur(event);

    setTimeout(() => {
      // if the component is immediately focused back (i.e. when changing focus between elements within the component)
      // the touched event will not be fired
      if (!this._shouldEmitTouched) return;
      this._emitTouched();
    }, 0);
  }

  protected _emitTouched(): void {
    this.touch.emit();
  }

  readonly touch = output<void>();
  
  //! control value accessor functions for peace of mind
  registerOnChange() {}
  registerOnTouched() {}
  writeValue(v: any) {}

  //! form field related
  readonly invalid = input<boolean>(false);
  readonly touched = input<boolean>(false);
  readonly required = input<boolean>(false);

  readonly control = trackBoundControl(this);

  ngOnInit(): void {
    this.control.init();
  }

  readonly htmlId = input<string>(Random.id());
  readonly name = input<string>('');

  readonly _hasError = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'hasError',
  });
  readonly hasError = computed<boolean>(
    () => this._hasError() ?? ((this.touched() || this.control.touched()) && (this.invalid() || this.control.invalid()))
  );

  ngOnDestroy(): void {
    this.control.destroy();
  }
}
