import { Overlay, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    Renderer2,
    Signal,
    ViewContainerRef,
    WritableSignal,
    computed,
    contentChild,
    effect,
    inject,
    input,
    output,
    signal,
    untracked,
    viewChild,
} from '@angular/core';
import { BooleanLike, NumberLike, coerceArrayProperty, coerceBooleanProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import { roundToMultiple, roundToPrecision } from 'more-rounding';
import { isDefined } from 'simple-bool';
import { _NgModelComponentBase, _NgModelComponentDefaults, _ngModelComponentDefaults } from '../_internal/ngmodel-component';
import { SimpleComponentColor } from '../types/colors.types';
import { ArdRangeSelectionBehavior } from './range-slider/range-slider.types';
import { ArdSliderTooltipDirective } from './slider.directive';
import {
    SliderDecorationPosition,
    SliderLabelObject,
    SliderTooltipBehavior,
    SliderTooltipFormatFn,
    _InternalSliderLabelObject,
} from './slider.types';

export interface _AsbtractSliderDefaults extends _NgModelComponentDefaults {
  noTooltip: boolean;
  showValueTicks: boolean;
  formatTooltipFn: SliderTooltipFormatFn;
  min: number;
  max: number;
  step: number;
  shiftMultiplier: number;
  labelPosition: SliderDecorationPosition;
  labels: SliderLabelObject[] | number[] | null;
  color: SimpleComponentColor;
  compact: boolean;
  tooltipPosition: SliderDecorationPosition;
  tooltipBehavior: SliderTooltipBehavior;
  selectionBehavior: ArdRangeSelectionBehavior;
  minimumDistance: number;
  emitTouchedOnEveryChange: boolean;
}

export const _asbtractSliderDefaults: _AsbtractSliderDefaults = {
  ..._ngModelComponentDefaults,
  noTooltip: false,
  showValueTicks: false,
  formatTooltipFn: v => v,
  min: 0,
  max: 100,
  step: 1,
  shiftMultiplier: 5,
  labelPosition: SliderDecorationPosition.Bottom,
  labels: [],
  color: SimpleComponentColor.Primary,
  compact: false,
  tooltipPosition: SliderDecorationPosition.Top,
  tooltipBehavior: SliderTooltipBehavior.Auto,
  selectionBehavior: ArdRangeSelectionBehavior.Allow,
  minimumDistance: 0,
  emitTouchedOnEveryChange: false,
};

@Directive()
export abstract class _AbstractSlider<T> extends _NgModelComponentBase {
  abstract readonly componentId: string;
  abstract readonly componentName: string;

  protected override readonly _DEFAULTS!: _AsbtractSliderDefaults;

  public readonly elementRef = viewChild<ElementRef<HTMLElement>>('track');

  protected readonly document = inject(DOCUMENT);
  protected readonly renderer = inject(Renderer2);
  protected readonly overlay = inject(Overlay);
  protected readonly scrollStrategyOpts = inject(ScrollStrategyOptions);
  protected readonly viewContainerRef = inject(ViewContainerRef);

  //! min, max, step sizes
  readonly min = input<number, NumberLike>(this._DEFAULTS.min, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.min),
  });
  readonly max = input<number, NumberLike>(this._DEFAULTS.max, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.max),
  });

  readonly step = input<number, NumberLike>(this._DEFAULTS.step, {
    transform: v => {
      const step = coerceNumberProperty(v, this._DEFAULTS.step);
      if (step === 0) {
        throw new Error(`ARD-FT${this.componentId}1a: Cannot set <ard-${this.componentName}>'s [step] to 0.`);
      }
      if (step < 0) {
        throw new Error(
          `ARD-FT${this.componentId}1b: Cannot set <ard-${this.componentName}>'s [step] to a negative value, got ${step}.`
        );
      }
      return step;
    },
  });

  readonly minMaxStepValueCleanup = effect(() => {
    this.min();
    this.max();
    this.step();
    untracked(() => this.cleanupValueAfterMinMaxStepChange());
  });
  readonly minMaxErrorCheck = effect(() => {
    const min = this.min();
    const max = this.max();
    if (min >= max) {
      throw new Error(
        `ARD-FT${this.componentId}0: Cannot set <ard-${this.componentName}>'s [min] to a value greater than or equal to [max], got min=${min} and max=${max}.`
      );
    }
  });

  readonly shiftMultiplier = input<number, NumberLike>(this._DEFAULTS.shiftMultiplier, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.shiftMultiplier),
  });

  protected readonly _stepSizeComputed = computed<number>(() => this.step() / Math.abs(this.min() - this.max()));

  //! value ticks
  readonly showValueTicks = input<boolean, BooleanLike>(this._DEFAULTS.showValueTicks, {
    transform: v => coerceBooleanProperty(v),
  });

  protected readonly _tickArray = computed<string[]>(() => {
    const newArr: number[] = [];

    let positionPercentCumulative = 0;
    while (positionPercentCumulative < 100) {
      newArr.push(positionPercentCumulative);
      positionPercentCumulative += this._stepSizeComputed() * 100;
      positionPercentCumulative = roundToPrecision(positionPercentCumulative, 6);
    }
    newArr.push(100);

    return newArr.map(v => `${v}%`);
  });

  //! labels
  private _transformLabelInput = (labels: SliderLabelObject[] | number[] | string | null | undefined): SliderLabelObject[] => {
    if (!isDefined(labels) || (Array.isArray(labels) && labels.length === 0)) {
      return [];
    }
    if (typeof labels === 'string') {
      labels = coerceArrayProperty(labels).map(Number);
    }
    if (isDefined(labels[0]) && typeof labels[0] === 'number') {
      return (labels as number[]).map(label => ({ label, value: label }));
    }
    return labels as SliderLabelObject[];
  };

  readonly labelPosition = input<SliderDecorationPosition>(this._DEFAULTS.labelPosition);

  readonly labels = input<SliderLabelObject[], SliderLabelObject[] | number[] | string | null | undefined>(
    this._transformLabelInput(this._DEFAULTS.labels),
    { transform: v => this._transformLabelInput(v) }
  );

  readonly labelObjects = computed<_InternalSliderLabelObject[]>(() => {
    const v = this.labels();
    if (!isDefined(v) || v.length === 0) {
      return [];
    }
    return v.map(label => {
      const v = this._clampValue(label.value);
      return {
        label: String(label.label),
        positionPercent: `${this._valueToPercent(v) * 100}%`,
      };
    });
  });

  //! appearance
  readonly color = input<SimpleComponentColor>(SimpleComponentColor.Primary);

  readonly compact = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed<string>(() =>
    [
      `ard-color-${this.color()}`,
      `ard-labels-${this.labelPosition()}`,
      `ard-tooltip-${this.tooltipPosition()}`,
      this.compact() ? 'ard-compact' : '',
    ].join(' ')
  );

  //! determining transition
  readonly sliderTransition = computed(() => {
    const x = this._totalSteps();
    //this is determined using this graph: https://www.geogebra.org/calculator/nqgnhpap
    //capped at y=80
    //this specific graph is chosen because it looks the best in my opinion
    const formulaResult = (20 * (x + 200)) / (x + 20) - 80;
    const formulaResultRounded = roundToPrecision(formulaResult, 3);

    if (formulaResultRounded < 0) return '0';

    const transitionDuration = Math.min(80, formulaResultRounded);
    return transitionDuration + 'ms';
  });
  private readonly _totalSteps = computed<number>(() => (this.max() - this.min()) / this.step());

  //! value input & output
  //! abstract here
  protected abstract readonly _value: WritableSignal<T>;
  @Input()
  set value(newValue: T) {
    this.writeValue(newValue);
  }
  get value(): T {
    return this._value();
  }
  readonly valueChange = output<T>();

  //! writeValue
  //! abstract here
  abstract override writeValue(v: any): void; //* abstact

  abstract cleanupValueAfterMinMaxStepChange(): void; //* abstact

  //! methods for programmatic manipulation
  abstract reset(): void;

  protected _offset(offset: number, hasShift: boolean, handleId = 1): void {
    const stepSize = this._stepSizeComputed() * (hasShift ? this.shiftMultiplier() : 1);
    let newPercent = this._handlePositions()[handleId - 1] + stepSize * offset;
    newPercent = this._clampPercentValue(newPercent);
    this._setValueFromPercent(newPercent);
    if (this.emitTouchedOnEveryChange()) {
      this._emitTouched();
    }
  }
  protected _decrement(event: KeyboardEvent, forceShift: boolean = false): void {
    this._offset(-1, forceShift || event.shiftKey);
  }
  protected _increment(event: KeyboardEvent, forceShift: boolean = false): void {
    this._offset(+1, forceShift || event.shiftKey);
  }

  //! helper methods
  protected _clampValue(v: number): number {
    //clamp between min and max
    v = Math.min(v, this.max());
    v = Math.max(v, this.min());
    //round to the nearest step
    v -= this.min();
    v = roundToMultiple(v, this.step());
    v += this.min();
    return v;
  }
  protected _valueToPercent(v: number): number {
    const minMaxDifference = Math.abs(this.min() - this.max());
    return (v - this.min()) / minMaxDifference;
  }
  protected _emitChange(): void {
    const v = this.value;
    this._onChangeRegistered?.(v);
    this.valueChange.emit(v);
  }

  //! tooltip
  readonly noTooltip = input<boolean, BooleanLike>(this._DEFAULTS.noTooltip, { transform: v => coerceBooleanProperty(v) });

  readonly tooltipFormatFn = input<SliderTooltipFormatFn>(this._DEFAULTS.formatTooltipFn);

  readonly tooltipTemplate = contentChild(ArdSliderTooltipDirective);

  readonly tooltipPosition = input<SliderDecorationPosition>(SliderDecorationPosition.Top);
  readonly tooltipBehavior = input<SliderTooltipBehavior>(SliderTooltipBehavior.Auto);

  //! event handlers
  protected readonly _grabbedHandleId = signal<null | number>(null);
  protected _shouldCheckForMovement = false;
  protected _bodyHasClass = false;

  readonly emitTouchedOnEveryChange = input<boolean, BooleanLike>(this._DEFAULTS.emitTouchedOnEveryChange, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly isSliderHandleGrabbed = computed(() => !!this._grabbedHandleId());

  readonly grabbedHandleEffect = effect(() => {
    if (this.isSliderHandleGrabbed()) {
      this.renderer.addClass(this.document.body, 'ard-body-slider-handle-grabbed');
    } else {
      this.renderer.removeClass(this.document.body, 'ard-body-slider-handle-grabbed');
    }
  });

  abstract onTrackHitboxPointerDown(event: MouseEvent | TouchEvent): void; //* abstact

  onPointerDownOnHandle(event: MouseEvent | TouchEvent, handleId = 1): void {
    if (this.disabled() || this.readonly()) return;
    this._grabbedHandleId.set(handleId);
    this._shouldCheckForMovement = true;
    if (!this._bodyHasClass) {
      this._bodyHasClass = true;
      this.renderer.addClass(this.document.body, 'ard-prevent-touch-actions');
    }
  }

  abstract onPointerMove(event: MouseEvent | TouchEvent): void; //* abstact

  @HostListener('document:pointerup')
  @HostListener('document:touchend')
  onPointerUp(): void {
    if (this.disabled() || this.readonly()) return;
    if (!this._shouldCheckForMovement) return;
    if (this.emitTouchedOnEveryChange()) {
      this._emitTouched();
    }
    this._grabbedHandleId.set(null);
    this._shouldCheckForMovement = false;
    if (this._bodyHasClass) {
      this._bodyHasClass = false;
      this.renderer.removeClass(this.document.body, 'ard-prevent-touch-actions');
    }
  }

  //! position calculators
  protected abstract readonly _handlePositions: Signal<[number, number]>;

  readonly handlePositionsPercent = computed<[string, string]>(() => [
    this._handlePositions()[0] * 100 + '%',
    this._handlePositions()[1] * 100 + '%',
  ]);

  protected _setValueFromPercent(percent: number, handleId: number | null = 1): void {
    if (!handleId) return;
    if (this._handlePositions()[handleId - 1] === percent) return;
    this._value.set(this._percentValueToValue(percent, handleId));

    this._emitChange();
  }
  protected _writeValueFromEvent(event: MouseEvent | TouchEvent, handleId?: number | null): void {
    if (this.disabled() || this.readonly()) return;
    const percent = this._getPercentValueFromEvent(event);
    this._setValueFromPercent(percent, handleId);
  }
  protected abstract _percentValueToValue(percent: number, handleId?: number): T; //* abstact

  protected _getElementRect(): DOMRect {
    return this.elementRef()!.nativeElement.getBoundingClientRect();
  }
  protected _clampPercentValue(percent: number): number {
    //clamp between 0 and 1
    percent = Math.min(percent, 1);
    percent = Math.max(percent, 0);
    //round to the nearest step
    percent = roundToMultiple(percent, this._stepSizeComputed());
    return percent;
  }
  protected _getPercentValueFromEvent(event: MouseEvent | TouchEvent): number {
    const rect = this._getElementRect();
    let position: number;
    if (event instanceof MouseEvent) {
      position = event.clientX;
    } else {
      position = event.targetTouches[0].clientX;
    }
    const percent = (position - rect.left) / rect.width;
    return this._clampPercentValue(percent);
  }
  //! key press handlers
  @HostListener('keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (this.disabled() || this.readonly()) return;
    switch (event.code) {
      case 'ArrowLeft':
      case 'ArrowDown': {
        this._decrement(event);
        return;
      }
      case 'ArrowRight':
      case 'ArrowUp': {
        this._increment(event);
        return;
      }
      case 'PageDown': {
        this._decrement(event, true);
        return;
      }
      case 'PageUp': {
        this._increment(event, true);
        return;
      }
      case 'Home': {
        this._decrement(event, true);
        // TODO: should go to min directly
        return;
      }
      case 'End': {
        this._increment(event, true);
        // TODO: should go to max directly
        return;
      }
    }
  }
}
