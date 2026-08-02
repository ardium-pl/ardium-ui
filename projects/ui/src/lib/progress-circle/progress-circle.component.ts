import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { SimpleComponentColor } from '../types/colors.types';
import { ARD_PROGRESS_CIRCLE_DEFAULTS } from './progress-circle.defaults';
import { ArdProgressCircleValueTemplateDirective } from './progress-circle.directive';
import { ProgressCircleAppearance, ProgressCircleValueContext, ProgressCircleVariant } from './progress-circle.types';

@Component({
  standalone: false,
  selector: 'ard-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: ['./progress-circle.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumProgressCircleComponent {
  protected readonly _DEFAULTS = inject(ARD_PROGRESS_CIRCLE_DEFAULTS);

  readonly value = input<number, NumberLike>(this._DEFAULTS.value, { transform: v => coerceNumberProperty(v, this._DEFAULTS.value) });
  readonly max = input<number, NumberLike>(this._DEFAULTS.max, { transform: v => coerceNumberProperty(v, this._DEFAULTS.max) });

  readonly percentValue = computed<number>(() => (this.value() / this.max()) * 100);

  //! appearance
  readonly appearance = input<ProgressCircleAppearance>(this._DEFAULTS.appearance);
  readonly color = input<SimpleComponentColor>(this._DEFAULTS.color);
  readonly variant = input<ProgressCircleVariant>(this._DEFAULTS.variant);

  readonly hideValue = input<boolean, BooleanLike>(this._DEFAULTS.hideValue, { transform: v => coerceBooleanProperty(v) });
  readonly reverse = input<boolean, BooleanLike>(this._DEFAULTS.reverse, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed<string>(() =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-progress-circle-variant-${this.variant()}`,
      `ard-color-${this.color()}`,
      this.hideValue() ? 'ard-progress-circle-hide-value' : '',
      this.reverse() ? 'ard-progress-circle-reversed' : '',
    ].join(' ')
  );

  readonly fillPercentVariable = computed<string>(() => {
    const fillAmount = this.reverse() ? 100 - this.percentValue() : this.percentValue();
    return `--ard-_progress-circle-fill-amount: ${fillAmount}%`;
  });

  //! templates
  readonly valueTemplate = contentChild<TemplateRef<ArdProgressCircleValueTemplateDirective>>(TemplateRef);

  readonly getValueContext = computed<ProgressCircleValueContext>(() => ({
    value: this.value(),
    percentValue: this.percentValue(),
    max: this.max(),
    $implicit: this.percentValue(),
  }));

  readonly valueComponent = this._DEFAULTS.ValueComponent;
  readonly valueComponentInputs = contextToInputs(this.getValueContext, this.valueComponent);
}
