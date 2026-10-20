import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  Inject,
  model,
  OnChanges,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { roundToPrecision } from 'more-rounding';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { _AbstractSlider } from './abstract-slider';
import { ARD_SLIDER_DEFAULTS, ArdSliderDefaults } from './slider.defaults';
import { SliderTooltipContext } from './slider.types';

@Component({
  standalone: false,
  selector: 'ard-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumSliderComponent extends _AbstractSlider<number> implements OnChanges {
  readonly componentId = '105';
  readonly componentName = 'slider';

  protected override readonly _DEFAULTS!: ArdSliderDefaults;
  constructor(@Inject(ARD_SLIDER_DEFAULTS) defaults: ArdSliderDefaults) {
    super(defaults);
  }

  //! value input & output
  readonly unnormalizedValue = signal<number>(0);
  readonly value = model<number>(0);

  protected _setValue(v: number): void {
    this.unnormalizedValue.set(v);
    this.value.set(v);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const value = changes['value'].currentValue;
      if (value === this.unnormalizedValue()) {
        return;
      }
      this._setValue(value);
    }
  }

  //! tooltip updater
  protected readonly _tooltipValue = computed<string>(() => {
    const v = this.value();
    const formatFn = this.tooltipFormatFn();

    const tooltipValue = String(formatFn?.(v) ?? v);
    return tooltipValue;
  });

  readonly tooltipContext = computed<SliderTooltipContext>(() => {
    return {
      value: this._tooltipValue(),
      $implicit: this._tooltipValue(),
    };
  });
  readonly tooltipComponent = this._DEFAULTS.TooltipComponent;

  readonly tooltipComponentInputs = contextToInputs(this.tooltipContext, this.tooltipComponent);

  //! writeValue
  protected _cleanupValueAfterMinMaxStepChange(): void {
    const v = this.value();
    const clampedValue = this._clampValue(v);
    if (clampedValue !== v) {
      this._setValue(clampedValue);
    }
  }

  //! methods for programmatic manipulation
  reset(): void {
    this._setValue(this.min());
  }
  increment(steps = 1): void {
    this._offset(steps, false);
  }
  decrement(steps = 1): void {
    this._offset(-steps, false);
  }

  //! event handlers
  onTrackHitboxPointerDown(event: MouseEvent | TouchEvent): void {
    if (this.disabled() || this.readonly()) return;
    this._writeValueFromEvent(event);
    this.onPointerDownOnHandle(event);
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onPointerMove(event: MouseEvent | TouchEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (!this._shouldCheckForMovement) return;
    this._writeValueFromEvent(event);
  }

  //! position calculators
  protected _percentValueToValue(percent: number): number {
    const minMaxDifference = Math.abs(this.min() - this.max());
    const newVal = percent * minMaxDifference + this.min();
    //round to 9 decimal places to avoid floating point arithmetic errors
    //9 is an arbitrary number that just works well. ¯\_(ツ)_/¯
    return roundToPrecision(newVal, 9);
  }

  protected readonly _handlePositions = computed<[number, number]>(() => {
    const minMaxDifference = Math.abs(this.min() - this.max());
    const percentPosition = (this.value() - this.min()) / minMaxDifference;
    return [percentPosition, percentPosition];
  });
}
