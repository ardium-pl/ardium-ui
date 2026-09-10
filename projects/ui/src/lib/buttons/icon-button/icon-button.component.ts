import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation, computed, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { _FocusableComponentBase } from '../../_internal/focusable-component';
import { ButtonType } from '../../types/button.types';
import { ComponentColor } from '../../types/colors.types';
import { ARD_ICON_BUTTON_DEFAULTS, ArdIconButtonDefaults } from './icon-button.defaults';

@Component({
  standalone: false,
  selector: 'ard-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.ard-button-with-pointer-events-when-disabled]': 'pointerEventsWhenDisabled()',
  },
})
export class ArdiumIconButtonComponent extends _FocusableComponentBase {
  protected override readonly _DEFAULTS!: ArdIconButtonDefaults;
  constructor(@Inject(ARD_ICON_BUTTON_DEFAULTS) defaults: ArdIconButtonDefaults) {
    super(defaults);
  }

  readonly wrapperClasses = input<string>('');

  readonly type = input<ButtonType>(this._DEFAULTS.type);

  readonly ariaLabel = input<string>('');

  //! button settings
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly lightColoring = input<boolean, BooleanLike>(this._DEFAULTS.lightColoring, {
    transform: v => coerceBooleanProperty(v),
  });
  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly pointerEventsWhenDisabled = input<boolean, BooleanLike>(this._DEFAULTS.pointerEventsWhenDisabled, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly ngClasses = computed(() =>
    [
      'ard-appearance-transparent',
      `ard-color-${this.disabled() ? ComponentColor.None : this.color()}`,
      this.lightColoring() ? `ard-light-coloring` : '',
      this.compact() ? 'ard-compact' : '',
      this.pointerEventsWhenDisabled() ? 'ard-icon-button-with-pointer-events-when-disabled' : '',
    ].join(' ')
  );
}
