import { computed, Directive, input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { coerceBooleanProperty, trackBoundControl } from '@ardium-pl/devkit';
import { TakeChance as Random } from 'take-chance';
import { Nullable } from '../types/utility.types';
import { _FocusableComponentBase, _focusableComponentDefaults, _FocusableComponentDefaults } from './focusable-component';

export interface _NgModelComponentDefaults extends _FocusableComponentDefaults {}

export const _ngModelComponentDefaults: _NgModelComponentDefaults = {
  ..._focusableComponentDefaults,
};

/**
 * Common code for components which implement the ControlValueAccessor.
 *
 * **Warning**: `writeValue` function should be implemented on the child component!
 */
@Directive()
export abstract class _NgModelComponentBase extends _FocusableComponentBase implements ControlValueAccessor, OnInit, OnDestroy {
  protected override readonly _DEFAULTS!: _NgModelComponentDefaults;

  //! control value accessor
  protected _onChangeRegistered!: (_: any) => void;
  protected _onTouchedRegistered!: () => void;
  /**
   * Registers a function to handle touched state. Required by ControlValueAccessor.
   * @param fn The function to register.
   */
  registerOnTouched(fn: () => void): void {
    this._onTouchedRegistered = fn;
  }
  /**
   * Registers a function to handle value change. Required by ControlValueAccessor.
   * @param fn The function to register.
   */
  registerOnChange(fn: (_: any) => void): void {
    this._onChangeRegistered = fn;
  }
  /**
   * Sets the component's disabled state. Required by ControlValueAccessor.
   * @param isDisabled the new disabled state.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /**
   * Writes the a new value into the component. Required by ControlValueAccessor.
   * @abstract
   * @param v The new value to write.
   */
  abstract writeValue(v: any): void; //* abstract

  /**
   * Writes the a new value into the component. Required by ControlValueAccessor.
   * @abstract
   * @param v The new value to write.
   */
  protected abstract _emitChange(): void; //* abstract

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
    this._onTouchedRegistered?.();
  }

  //! form field related
  readonly control = trackBoundControl(this);

  ngOnInit(): void {
    this.control.init();
  }

  readonly htmlId = input<string>(Random.id());
  readonly htmlName = input<Nullable<string>>(undefined);

  readonly _hasError = input<boolean | undefined, any>(undefined, {
    transform: v => coerceBooleanProperty(v),
    alias: 'hasError',
  });
  readonly hasError = computed<boolean>(() => this._hasError() ?? (this.control.touched() && this.control.invalid()));

  ngOnDestroy(): void {
    this.control.destroy();
  }
}
