import { computed, Directive, HostBinding, input, Input, output, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { _NgModelComponentBase, _ngModelComponentDefaults, _NgModelComponentDefaults } from './ngmodel-component';

export interface _BooleanComponentDefaults extends _NgModelComponentDefaults {
  reverseSelected: boolean;
}
export const _booleanComponentDefaults: _BooleanComponentDefaults = { ..._ngModelComponentDefaults, reverseSelected: false };

/**
 * Common code for components, which only operate on the "selected" state.
 */
@Directive()
export abstract class _BooleanComponentBase extends _NgModelComponentBase implements ControlValueAccessor {
  protected override readonly _DEFAULTS!: _BooleanComponentDefaults;

  protected abstract readonly _componentId: string;
  protected abstract readonly _componentName: string;

  //! control value accessor
  writeValue(v: any): void {
    this._selected = v;
  }
  //emitter function
  /**
   * Emits all select-state-related events.
   */
  protected _emitChange() {
    this._onChangeRegistered?.(this.selected());

    if (this.selected()) this.selectEvent.emit(null);
    else this.unselectEvent.emit(null);

    this.selectedChange.emit(this.selected());
    this.changeEvent.emit(this.selected());
  }

  //! events
  /**
   * The event emitter responsible for firing `select` events. Fired when the `selected` state is set to true.
   */
  readonly selectEvent = output<null>({ alias: 'select' });
  /**
   * The event emitter responsible for firing `unselect` events. Fired when the `selected` state is set to false.
   */
  readonly unselectEvent = output<null>({ alias: 'unselect' });
  /**
   * The event emitter responsible for firing `change` events. Fired when the `selected` state is changed.
   */
  readonly changeEvent = output<boolean>({ alias: 'change' });

  //! [(selected)] two-way binding
  // can be set using a no-value argument
  readonly selected = signal<boolean>(false);
  /**
   * The selection state of the component. Coercible into a boolean.
   */
  @Input('selected')
  set _selected(v: any) {
    this.selected.set(coerceBooleanProperty(v));
  }
  @HostBinding('attr.selected')
  @HostBinding('class.ard-selected')
  get _selectedHostAttribute(): boolean {
    return this.selectedAccountingForReverse();
  }
  /**
   * The event emitter responsible for firing `selectedChange` events. Fired when the `selected` state is changed.
   */
  readonly selectedChange = output<boolean>();

  /**
   * The reverse of the `selected` state. Coercible into a boolean. Useful for cases where the "selected" state is semantically reversed, e.g. "disabled".
   */
  readonly reverseSelected = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  /**
   * The "selected" state, accounting for the `reverseSelected` input.
   */
  readonly selectedAccountingForReverse = computed<boolean>(() => (this.reverseSelected() ? !this.selected() : this.selected()));

  /**
   * Toggles the selected state. Emits all appropriate events.
   */
  toggleSelected() {
    if (this.disabled() || this.readonly()) return;
    this.selected.update(v => !v);
    this._emitChange();
    this._emitTouched();
  }

  /**
   * Sets the state to "selected". Emits all appropriate events only if the state changes.
   */
  select() {
    if (this.disabled() || this.readonly()) return;
    this.selected.set(true);
    this._emitChange();
    this._emitTouched();
  }
  /**
   * Sets the state to "unselected". Emits all appropriate events only if the state changes.
   */
  unselect() {
    if (this.disabled() || this.readonly()) return;
    this.selected.set(false);
    this._emitChange();
    this._emitTouched();
  }
}
