import { computed, Directive, HostBinding, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
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
export abstract class _BooleanComponentBase
  extends _NgModelComponentBase
  implements Omit<FormValueControl<boolean>, 'disabled' | 'readonly'>
{
  protected override readonly _DEFAULTS!: _BooleanComponentDefaults;

  protected abstract readonly _componentId: string;
  protected abstract readonly _componentName: string;

  //! events
  /**
   * The event emitter responsible for firing `select` events. Fired when the `selected` state is set to true.
   */
  readonly selectEvent = output<void>({ alias: 'select' });
  /**
   * The event emitter responsible for firing `unselect` events. Fired when the `selected` state is set to false.
   */
  readonly unselectEvent = output<void>({ alias: 'unselect' });

  //! [(value)] two-way binding
  // can be set using a no-value argument
  /**
   * The selection state of the component.
   */
  readonly value = model<boolean>(false);

  protected _setValue(newValue: boolean): void {
    if (this.disabled() || this.readonly()) return;
    this.value.set(newValue);

    if (newValue) this.selectEvent.emit();
    else this.unselectEvent.emit();
  }

  @HostBinding('attr.selected')
  @HostBinding('class.ard-selected')
  get _selectedHostAttribute(): boolean {
    return this.valueAccountingForReverse();
  }

  /**
   * Coercible into a boolean. Useful for cases where the "selected" state is semantically reversed, e.g. "disabled".
   */
  readonly reverseSelected = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  /**
   * The "selected" state, accounting for the `reverseSelected` input.
   */
  readonly valueAccountingForReverse = computed<boolean>(() => (this.reverseSelected() ? !this.value() : this.value()));

  /**
   * Toggles the selected state. Emits all appropriate events.
   */
  toggleSelected() {
    if (this.disabled() || this.readonly()) return;
    this._setValue(!this.value());
  }

  /**
   * Sets the state to "selected". Emits all appropriate events only if the state changes.
   */
  select() {
    if (this.disabled() || this.readonly()) return;
    this._setValue(true);
  }
  /**
   * Sets the state to "unselected". Emits all appropriate events only if the state changes.
   */
  unselect() {
    if (this.disabled() || this.readonly()) return;
    this._setValue(false);
  }
}
