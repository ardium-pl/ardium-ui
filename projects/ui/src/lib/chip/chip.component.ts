import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation, computed, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { SimpleOneAxisAlignment } from '../types/alignment.types';
import { ComponentColor } from '../types/colors.types';
import { DecorationElementAppearance, FormElementVariant } from '../types/theming.types';
import { _DisablableComponentBase } from './../_internal/disablable-component';
import { ARD_CHIP_DEFAULTS, ArdChipDefaults } from './chip.defaults';

@Component({
  standalone: false,
  selector: 'ard-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumChipComponent extends _DisablableComponentBase {
  protected override readonly _DEFAULTS!: ArdChipDefaults;
  constructor(@Inject(ARD_CHIP_DEFAULTS) defaults: ArdChipDefaults) {
    super(defaults);
  }

  //! appearance
  readonly contentAlignment = input<SimpleOneAxisAlignment>(this._DEFAULTS.contentAlignment);
  readonly appearance = input<DecorationElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly wrapperClasses = input<string>('');

  readonly ngClasses = computed(() =>
    [
      this.wrapperClasses(),
      `ard-chip-align-${this.contentAlignment()}`,
      `ard-variant-${this.variant()}`,
      `ard-appearance-${this.appearance()}`,
      `ard-color-${this.color()}`,
      this.compact() ? 'ard-compact' : '',
    ].join(' ')
  );
}
