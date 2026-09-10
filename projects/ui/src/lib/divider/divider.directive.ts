import { computed, Directive, inject, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { OneAxisAlignmentOrientational } from '../types/alignment.types';
import { ARD_DIVIDER_DEFAULTS } from './divider.defaults';
import { ArdDividerVariant } from './divider.types';

@Directive({
  selector: '[ard-divider]',
  standalone: false,
  host: {
    role: 'separator',
    '[class]': 'ngClasses()',
  },
})
export class ArdiumDividerDirective {
  protected readonly _DEFAULTS = inject(ARD_DIVIDER_DEFAULTS);

  readonly vertical = input<boolean, BooleanLike>(this._DEFAULTS.vertical, { transform: v => coerceBooleanProperty(v) });
  readonly flexItem = input<boolean, BooleanLike>(this._DEFAULTS.flexItem, { transform: v => coerceBooleanProperty(v) });

  readonly textAlign = input<OneAxisAlignmentOrientational>(this._DEFAULTS.textAlign);
  readonly variant = input<ArdDividerVariant>(this._DEFAULTS.variant);

  readonly ngClasses = computed<string>(() =>
    [
      'ard-divider',
      this.vertical() ? 'ard-divider__vertical' : 'ard-divider__horizontal',
      this.flexItem() ? 'ard-divider__flex-item' : '',
      `ard-divider__text-align-${this.textAlign()}`,
      `ard-divider__${this.variant()}`,
    ].join(' ')
  );
}


@Directive({
  standalone: true,
  host: {
    role: 'separator',
    '[class]': 'ngClasses()',
  },
})
export class ArdiumDividerDirectiveStandalone extends ArdiumDividerDirective {}