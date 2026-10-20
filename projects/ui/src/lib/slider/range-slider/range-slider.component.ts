import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  Inject,
  input,
  model,
  OnInit,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { coerceNumberProperty, NumberLike } from '@ardium-pl/devkit';
import { roundToPrecision } from 'more-rounding';
import { isNumber, isObject } from 'simple-bool';
import { _AbstractSlider } from '../abstract-slider';
import { ARD_SLIDER_DEFAULTS, ArdSliderDefaults } from '../slider.defaults';
import { SliderRange, SliderTooltipContext } from '../slider.types';
import { ArdRangeSelectionBehavior } from './range-slider.types';

@Component({
  standalone: false,
  selector: 'ard-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumRangeSliderComponent extends _AbstractSlider<SliderRange> implements OnInit {
  readonly componentId = '106';
  readonly componentName = 'range-slider';

  protected override readonly _DEFAULTS!: ArdSliderDefaults;
  constructor(@Inject(ARD_SLIDER_DEFAULTS) defaults: ArdSliderDefaults) {
    super(defaults);
  }

  readonly unnormalizedValue = signal<SliderRange>({ from: -Number.MIN_SAFE_INTEGER, to: Number.MIN_SAFE_INTEGER });
  readonly value = model<SliderRange>({ from: -Number.MIN_SAFE_INTEGER, to: Number.MIN_SAFE_INTEGER });

  protected _setValue(v: SliderRange): void {
    this.unnormalizedValue.set(v);
    this.value.set(this._normalizeSliderRange(v));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const value = changes['value'].currentValue;
      if (
        this._isValidObject(value) &&
        ((value.from === this.unnormalizedValue().from && value.to === this.unnormalizedValue().to) ||
          (value.from === this.unnormalizedValue().to && value.to === this.unnormalizedValue().from))
      ) {
        return;
      }
      this._setValue(value);
    }
  }

  //! writeValue
  private _isValidObject(v: any): v is SliderRange {
    return isObject(v) && isNumber(v['from']) && isNumber(v['to']);
  }
  private _normalizeSliderRange(v: SliderRange): SliderRange {
    if (v.from <= v.to) return v;
    return { from: v.to, to: v.from };
  }
  protected _cleanupValueAfterMinMaxStepChange(): void {
    const v = this.unnormalizedValue();
    if (!this._isValidObject(v)) {
      this.reset();
      return;
    }
    const fromClamped = this._clampValue(v.from);
    const toClamped = this._clampValue(v.to);
    const value = this._normalizeSliderRange({ from: fromClamped, to: toClamped });

    if (value.from === this.unnormalizedValue().from && value.to === this.unnormalizedValue().to) {
      return;
    }
    this._setValue(value);
  }

  readonly selectionBehavior = input<ArdRangeSelectionBehavior>(this._DEFAULTS.selectionBehavior);
  readonly minimumDistance = input<number, NumberLike>(this._DEFAULTS.minimumDistance, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.minimumDistance),
  });

  //! tooltip updater
  protected readonly _tooltipValue = computed<SliderRange<string>>(() => {
    const v = this.unnormalizedValue();
    const formatFn = this.tooltipFormatFn();

    const tooltipValue = {
      from: String(formatFn(v.from)),
      to: String(formatFn(v.to)),
    };
    return tooltipValue;
  });

  readonly tooltipContexts = computed<SliderRange<SliderTooltipContext>>(() => {
    return {
      from: {
        value: this._tooltipValue().from,
        $implicit: this._tooltipValue().from,
      },
      to: {
        value: this._tooltipValue().to,
        $implicit: this._tooltipValue().to,
      },
    };
  });

  //! methods for programmatic manipulation
  reset(): void {
    if (this.disabled() || this.readonly()) return;
    this._setValue({ from: -this.min(), to: this.max() });
  }

  //! track overlay getters
  readonly trackOverlayLeft = computed(() => {
    return Math.min(...this._handlePositions()) * 100 + '%';
  });
  readonly trackOverlayWidth = computed(() => {
    return Math.abs(this._handlePositions()[0] - this._handlePositions()[1]) * 100 + '%';
  });

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
    if (!this._bodyHasClass) {
      this._bodyHasClass = true;
      this.renderer.addClass(this.document.body, 'ard-prevent-touch-actions');
    }
    this._writeValueFromEvent(event, this._grabbedHandleId());
  }

  //! position calculators
  protected _percentValueToValue(percent: number, handleId: number): SliderRange {
    const minMaxDifference = Math.abs(this.min() - this.max());
    let newVal = percent * minMaxDifference + this.min();
    //round to 9 decimal places to avoid floating point arithmetic errors
    //9 is an arbitrary number that just works well. ¯\_(ツ)_/¯
    newVal = roundToPrecision(newVal, 9);

    const minimumDistanceInSteps = this.step() * this.minimumDistance();
    const currValue = this.unnormalizedValue();
    const newValObj = { from: currValue.from, to: currValue.to };
    if (handleId === 1) {
      if (newVal >= currValue.to - minimumDistanceInSteps) {
        if (this.selectionBehavior() === ArdRangeSelectionBehavior.Block) {
          newVal = currValue.to - minimumDistanceInSteps;
        } else if (this.selectionBehavior() === ArdRangeSelectionBehavior.Push) {
          newValObj.to = newVal + minimumDistanceInSteps;
        } else {
          // Allow - do nothing
        }
      }
      newValObj.from = newVal;
    } else {
      if (newVal <= currValue.from + minimumDistanceInSteps) {
        if (this.selectionBehavior() === ArdRangeSelectionBehavior.Block) {
          newVal = currValue.from + minimumDistanceInSteps;
        } else if (this.selectionBehavior() === ArdRangeSelectionBehavior.Push) {
          newValObj.from = newVal - minimumDistanceInSteps;
        } else {
          // Allow - do nothing
        }
      }
      newValObj.to = newVal;
    }
    return newValObj;
  }

  protected readonly _handlePositions = computed<[number, number]>(() => {
    const minMaxDifference = Math.abs(this.min() - this.max());
    const value = this.unnormalizedValue();
    const pos1 = (value.from - this.min()) / minMaxDifference;
    const pos2 = (value.to - this.min()) / minMaxDifference;
    return [pos1, pos2];
  });

  //! handle focus monitors
  readonly currentHandle = signal<1 | 2 | null>(null);
  onHandleFocus(event: FocusEvent, handleId: 1 | 2) {
    if (this.disabled() || this.readonly()) return;
    this.onFocus(event);

    this.currentHandle.set(handleId);
  }
  override onBlur(event: FocusEvent) {
    super.onBlur(event);
    this.currentHandle.set(null);
  }
}
