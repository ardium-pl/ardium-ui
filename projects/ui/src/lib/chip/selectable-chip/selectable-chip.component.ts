import { ChangeDetectionStrategy, Component, computed, forwardRef, Inject, input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { SimpleOneAxisAlignment } from '../../types/alignment.types';
import { ComponentColor } from '../../types/colors.types';
import { DecorationElementAppearance, FormElementVariant } from '../../types/theming.types';
import { _BooleanComponentBase } from './../../_internal/boolean-component';
import { ARD_SELECTABLE_CHIP_DEFAULTS, ArdSelectableChipDefaults } from './selectable-chip.defaults';

@Component({
  standalone: false,
  selector: 'ard-selectable-chip',
  templateUrl: './selectable-chip.component.html',
  styleUrls: ['../chip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumSelectableChipComponent),
      multi: true,
    },
  ],
})
export class ArdiumSelectableChipComponent extends _BooleanComponentBase implements ControlValueAccessor {
  protected override readonly _DEFAULTS!: ArdSelectableChipDefaults;
  constructor(@Inject(ARD_SELECTABLE_CHIP_DEFAULTS) defaults: ArdSelectableChipDefaults) {
    super(defaults);
  }

  protected readonly _componentId = '111';
  protected readonly _componentName = 'selectable-chip';

  readonly chipTitle = input<string>(this._DEFAULTS.chipTitle);
  readonly hideSelectionIcon = input<boolean, BooleanLike>(this._DEFAULTS.hideSelectionIcon, {
    transform: v => coerceBooleanProperty(v),
  });

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
