import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  ViewEncapsulation
} from '@angular/core';
import { coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { SimpleComponentColor } from '../types/colors.types';
import { ARD_PROGRESS_BAR_DEFAULTS } from './progress-bar.defaults';
import { ProgressBarMode, ProgressBarSize, ProgressBarVariant } from './progress-bar.types';

@Component({
  standalone: false,
  selector: 'ard-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumProgressBarComponent {
  protected readonly _DEFAULTS = inject(ARD_PROGRESS_BAR_DEFAULTS);

  readonly value = input<number, NumberLike>(this._DEFAULTS.value, { transform: v => coerceNumberProperty(v, this._DEFAULTS.value) });
  readonly bufferValue = input<number, NumberLike>(this._DEFAULTS.bufferValue, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.bufferValue),
  });

  //! appearance
  readonly color = input<SimpleComponentColor>(this._DEFAULTS.color);
  readonly variant = input<ProgressBarVariant>(this._DEFAULTS.variant);
  readonly size = input<ProgressBarSize>(this._DEFAULTS.size);
  readonly mode = input<ProgressBarMode>(this._DEFAULTS.mode);

  readonly ngClasses = computed<string>(() =>
    [
      `ard-variant-${this.variant()}`,
      `ard-color-${this.color()}`,
      `ard-progress-bar__size-${this.size()}`,
      `ard-progress-bar__mode-${this.mode()}`,
    ].join(' ')
  );

  //! error detection
  constructor() {
    effect(() => {
      if (this.mode() === ProgressBarMode.Buffer && this.size() === ProgressBarSize.Auto) {
        console.error(
          new Error(
            `ARD-NF4010: Forbidden param combination in <ard-progress-bar>: cannot use 'mode="buffer"' and 'size="auto"' at the same time.`
          )
        );
      }
    });
  }

  //! bar styling
  readonly cssVariables = computed<string>(() => {
    if (this.mode() === ProgressBarMode.Indeterminate || this.mode() === ProgressBarMode.Query) {
      return '--ard-_progress-bar-main: 0;';
    }
    const mainVariable = `--ard-_progress-bar-main: ${this.value()}%;`;
    if (this.mode() === ProgressBarMode.Buffer) {
      return mainVariable + `--ard-_progress-bar-buffer: ${this.bufferValue()}%;`;
    }
    return mainVariable;
  });
}
