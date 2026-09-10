import { AfterViewInit, ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import * as Color from 'color';
import { Nullable } from '../../types/utility.types';
import { ARD_COLOR_DISPLAY_DEFAULTS } from './color-display.defaults';
import { ColorDisplayAppearance } from './color-display.types';

@Component({
  standalone: false,
  selector: 'ard-color-display',
  templateUrl: './color-display.component.html',
  styleUrls: ['./color-display.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumColorDisplayComponent implements AfterViewInit {
  private readonly _DEFAULTS = inject(ARD_COLOR_DISPLAY_DEFAULTS);

  readonly ariaLabel = input<string>(this._DEFAULTS.ariaLabel);

  readonly withLabel = input<boolean, BooleanLike>(this._DEFAULTS.withLabel, { transform: v => coerceBooleanProperty(v) });

  //! appearance
  readonly appearance = input<ColorDisplayAppearance>(this._DEFAULTS.appearance);

  readonly ngClasses = computed((): string => {
    const apprncParts = this.appearance().split(' ');
    return `ard-appearance-${apprncParts[0]} ${apprncParts[1] ? 'ard-with-border' : ''}`;
  });

  //! color
  readonly color = input<Nullable<string>, any>(undefined, { transform: v => Color(v).hex() });

  ngAfterViewInit(): void {
    if (!this.color()) console.warn(`ARD-WA3000: Using <ard-color-display> without specifying the [color] field.`);
  }
}
