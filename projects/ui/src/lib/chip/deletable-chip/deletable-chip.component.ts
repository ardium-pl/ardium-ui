import {
    ChangeDetectionStrategy,
    Component,
    computed,
    forwardRef,
    Inject,
    input,
    output,
    ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { _FocusableComponentBase } from '../../_internal/focusable-component';
import { SimpleOneAxisAlignment } from '../../types/alignment.types';
import { ComponentColor } from '../../types/colors.types';
import { DecorationElementAppearance, FormElementVariant } from '../../types/theming.types';
import { ARD_DELETABLE_CHIP_DEFAULTS, ArdDeletableChipDefaults } from './deletable-chip.defaults';

@Component({
  standalone: false,
  selector: 'ard-deletable-chip',
  templateUrl: './deletable-chip.component.html',
  styleUrls: ['../chip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumDeletableChipComponent),
      multi: true,
    },
  ],
})
export class ArdiumDeletableChipComponent extends _FocusableComponentBase {
  protected override readonly _DEFAULTS!: ArdDeletableChipDefaults;
  constructor(@Inject(ARD_DELETABLE_CHIP_DEFAULTS) defaults: ArdDeletableChipDefaults) {
    super(defaults);
  }

  readonly deleteButtonTitle = input<string>(this._DEFAULTS.deleteButtonTitle);

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

  //! events
  readonly deleteEvent = output<MouseEvent>({ alias: 'delete' });

  emitDelete(event: MouseEvent) {
    if (this.disabled() || this.readonly()) return;
    this.deleteEvent.emit(event);
  }
}
