import { computed, Directive, input, Signal } from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { ButtonType } from '../types/button.types';
import { ComponentColor } from '../types/colors.types';
import { _ButtonBaseDefaults } from './_button-base.defaults';
import { ButtonAppearance } from './general-button.types';

@Directive()
export abstract class _ButtonBase {
  readonly wrapperClasses = input<string>('');

  constructor(protected readonly _DEFAULTS: _ButtonBaseDefaults) {}

  readonly type = input<ButtonType>(this._DEFAULTS.type);

  readonly ariaLabel = input<string>('');

  //! button settings
  readonly appearance = input<ButtonAppearance>(this._DEFAULTS.appearance);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly lightColoring = input<boolean, BooleanLike>(this._DEFAULTS.lightColoring, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });
  readonly disabled = input<boolean, BooleanLike>(this._DEFAULTS.disabled, { transform: v => coerceBooleanProperty(v) });

  readonly tabIndex = computed(() => (this.disabled() ? -1 : this._tabIndex()));
  readonly _tabIndex = input<number, NumberLike>(this._DEFAULTS.tabIndex, {
    alias: 'tabIndex',
    transform: v => coerceNumberProperty(v, 0),
  });

  readonly pointerEventsWhenDisabled = input<boolean, BooleanLike>(this._DEFAULTS.pointerEventsWhenDisabled, {
    transform: v => coerceBooleanProperty(v),
  });

  abstract readonly ngClasses: Signal<string>;
}
