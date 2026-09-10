import {
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewEncapsulation,
    computed,
    input,
    model,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, getEventRelativePos } from '@ardium-pl/devkit';
import * as Color from 'color';
import { round, roundToMultiple, roundToPrecision } from 'more-rounding';
import { _NgModelComponentBase, _ngModelComponentDefaults } from '../../_internal/ngmodel-component';
import {
    ArdColorPickerColorReferenceTemplateDirective,
    ArdColorPickerHueIndicatorTemplateDirective,
    ArdColorPickerOpacityIndicatorTemplateDirective,
    ArdColorPickerShadeIndicatorTemplateDirective,
} from './color-picker.directives';
import {
    ColorPickerColorReferenceContext,
    ColorPickerIndicatorContext,
    ColorPickerVariant,
    _ColorPickerInputsSectionType,
} from './color-picker.types';

const validHexColorRegex = /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i;
const validHexAlphaColorRegex = /^#[0-9a-f]{4}(?:[0-9a-f]{4})?$/i;

interface TripleInputObject {
  value: number;
  max: number;
}

@Component({
  standalone: false,
  selector: 'ard-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumColorPickerComponent extends _NgModelComponentBase implements OnInit, OnChanges {
  constructor() {
    super(_ngModelComponentDefaults); // stub definition for now. Will change when fixing the component.
  }

  readonly withOpacity = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  // if (this.focusedArea === 'opacity') this.focusedArea = null; // TODO

  readonly referenceColor = model<Color>(Color('transparent'));

  private _wasReferenceColorSet = false;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['referenceColor']?.firstChange) {
      this._wasReferenceColorSet = true;
    }
  }

  //! appearance
  readonly wrapperClasses = input<string>('');

  readonly variant = input<ColorPickerVariant>(ColorPickerVariant.Rounded);

  readonly vertical = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) }); //TODO implement in CSS

  readonly ngClasses = computed(() =>
    [this.wrapperClasses(), `ard-variant-${this.variant()}`, this.vertical() ? 'ard-vertical' : ''].join(' ')
  );

  //! value-related
  private _value: Color = Color('red');
  @Input()
  set value(v: any) {
    this.writeValue(v);
  }
  get value(): Color {
    return this._value;
  }

  @Input()
  set colorHue(v: any) {
    const hue = coerceNumberProperty(v, 0);
    this.value.hue(hue);
  }
  get colorHue(): number {
    return this.value.hue();
  }

  @Input()
  set colorSaturation(v: any) {
    const saturation = coerceNumberProperty(v, 100);
    this.value.saturationl(saturation);
  }
  get colorSaturation(): number {
    return this.value.saturationl();
  }

  @Input()
  set colorValue(v: any) {
    const value = coerceNumberProperty(v, 100);
    this.value.value(value);
  }
  get colorValue(): number {
    return this.value.value();
  }

  @Input()
  set colorOpacity(v: any) {
    const opacity = coerceNumberProperty(v, 1);
    this.value.alpha(opacity);
  }
  get colorOpacity(): number {
    return this.value.alpha();
  }

  readonly valueChange = output<Color>();
  readonly colorHueChange = output<number>();
  readonly colorSaturationChange = output<number>();
  readonly colorValueChange = output<number>();
  readonly colorOpacityChange = output<number>();

  writeValue(v: any) {
    this._value = Color(v);

    this._updateCurrentShadeMapColor();
    this._updateCurrentOpacityMapColor();
    this._updateHexInputValue();
    this._updateTripleInputValues();
  }

  ngOnInit(): void {
    if (this._wasReferenceColorSet) return;

    this._wasReferenceColorSet = true;
    this.referenceColor.set(Color(this.value));

    this._updateHexInputValue();
  }

  //! creating new value from interactions
  readonly shadeMapEl = viewChild<ElementRef<HTMLDivElement>>('shadeMap');
  readonly hueMapEl = viewChild<ElementRef<HTMLDivElement>>('hueMap');
  readonly opacityMapEl = viewChild<ElementRef<HTMLDivElement>>('opacityMap');

  readonly focusedArea = signal<'shade' | 'hue' | 'opacity' | null>(null);

  onShadeAreaMouseDown(event: MouseEvent): void {
    this._isMouseDown = true;
    this._updateShadeFromEvent(event);
  }
  onHueAreaMouseDown(event: MouseEvent): void {
    this._isMouseDown = true;
    this._updateHueFromEvent(event);
  }
  onOpacityAreaMouseDown(event: MouseEvent): void {
    this._isMouseDown = true;
    this._updateOpacityFromEvent(event);
  }

  private _isMouseDown = false;
  @HostListener('document:pointerup')
  @HostListener('document:touchend')
  onDocumentMouseUp(): void {
    this._isMouseDown = false;
  }

  @HostListener('document:pointermove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onDocumentMousemove(event: MouseEvent | TouchEvent): void {
    if (!this.focusedArea() || !this._isMouseDown) return;

    if (!(event instanceof TouchEvent)) event.preventDefault();

    if (this.focusedArea() === 'shade') {
      this._updateShadeFromEvent(event);
      return;
    }
    if (this.focusedArea() === 'hue') {
      this._updateHueFromEvent(event);
      return;
    }
    this._updateOpacityFromEvent(event);
  }

  private _updateShadeFromEvent(event: MouseEvent | TouchEvent): void {
    const shadeMapEl = this.shadeMapEl();
    if (!shadeMapEl) return;
    const { left, right, top, bottom } = getEventRelativePos(event, shadeMapEl);

    const shadeMapWidth = left + right;
    const newSaturationRaw = (left / shadeMapWidth) * 100;
    const newSaturation = round(Math.max(0, Math.min(100, newSaturationRaw)));

    const shadeMapHeight = top + bottom;
    const newValueRaw = (bottom / shadeMapHeight) * 100;
    const newValue = round(Math.max(0, Math.min(100, newValueRaw)));

    const oldSaturation = this.value.saturationv();
    const oldValue = this.value.value();

    if (oldSaturation === newSaturation && oldValue === newValue) return;

    this.value = Color(this.value).saturationv(newSaturation).value(newValue);

    this._emitChange();
    this._updateCurrentOpacityMapColor();
    //emit specific events
    if (oldSaturation !== this.value.saturationv()) this.colorSaturationChange.emit(this.value.saturationv());
    if (oldValue !== this.value.value()) this.colorValueChange.emit(this.value.value());
  }
  private _updateHueFromEvent(event: MouseEvent | TouchEvent): void {
    const hueMapEl = this.hueMapEl();
    if (!hueMapEl) return;
    const { top, bottom } = getEventRelativePos(event, hueMapEl);

    const hueMapHeight = top + bottom;
    const newHueRaw = (top / hueMapHeight) * 360;
    const newHue = round(Math.max(0, Math.min(360, newHueRaw)));
    const newHueExact = newHue === 360 ? 359.99 : newHue;

    if (this.value.hue() === newHueExact) return;

    this.value = Color(this.value).hue(newHueExact);

    this._emitChange();
    this.colorHueChange.emit(this.value.hue());
    this._updateCurrentShadeMapColor();
    this._updateCurrentOpacityMapColor();
  }
  private _updateOpacityFromEvent(event: MouseEvent | TouchEvent): void {
    if (!this.withOpacity) return;

    const opacityMapEl = this.opacityMapEl();
    if (!opacityMapEl) return;
    const { top, bottom } = getEventRelativePos(event, opacityMapEl);

    const hueMapHeight = top + bottom;
    const newOpacityRaw = bottom / hueMapHeight;
    const newOpacity = roundToPrecision(Math.max(0, Math.min(1, newOpacityRaw)), 2);

    if (this.value.alpha() === newOpacity) return;

    this.value = Color(this.value).alpha(newOpacity);

    this._emitChange();
    this.colorOpacityChange.emit(this.value.alpha());
  }

  //! displaying the maps correctly
  currentShadeMapColor: Color = this.value;
  private _updateCurrentShadeMapColor(): void {
    this.currentShadeMapColor = Color.hsv(this.value.hue(), 100, 100);
  }
  currentOpacityMapColor: Color = this.value;
  private _updateCurrentOpacityMapColor(): void {
    if (!this.withOpacity) return;
    this.currentOpacityMapColor = Color.hsv(this.value.hue(), this.value.saturationv(), this.value.value());
  }

  getShadeIndicatorPosition(): { '--top': string; '--left': string } {
    return {
      '--top': 100 - this.value.value() + '%',
      '--left': this.value.saturationv() + '%',
    };
  }
  getHueIndicatorPosition(): { '--top': string } {
    return {
      '--top': this.value.hue() / 3.6 + '%',
    };
  }
  getOpacityIndicatorPosition(): { '--top': string } {
    return {
      '--top': 100 - this.value.alpha() * 100 + '%',
    };
  }

  //! inputs section
  inputTypes: _ColorPickerInputsSectionType[] = Object.values(_ColorPickerInputsSectionType);
  currentInputType: _ColorPickerInputsSectionType = _ColorPickerInputsSectionType.HEX;

  onCurrentInputTypeChange(value: _ColorPickerInputsSectionType[]): void {
    this.currentInputType = value[0];

    if (this.currentInputType !== _ColorPickerInputsSectionType.HEX) {
      this._updateTripleInputValues();
    }
  }

  hexInputValue: string = this.value.hex();
  private _updateHexInputValue(): void {
    if (this.currentInputType !== _ColorPickerInputsSectionType.HEX) return;

    const HEX = this.value;
    this.hexInputValue = HEX.hex().replace('#', '');
    this.tripleInputData4.value = HEX.alpha() * 100;
  }

  tripleInputData1: TripleInputObject = {
    value: 0,
    max: 0 /* temporary value */,
  };
  tripleInputData2: TripleInputObject = {
    value: 0,
    max: 0 /* temporary value */,
  };
  tripleInputData3: TripleInputObject = {
    value: 0,
    max: 0 /* temporary value */,
  };
  tripleInputData4: TripleInputObject = { value: 0, max: 100 };
  private _updateTripleInputValues(): void {
    if (this.currentInputType === _ColorPickerInputsSectionType.HEX) return;

    switch (this.currentInputType) {
      case _ColorPickerInputsSectionType.RGB: {
        const RGB = this.value.rgb();
        this.tripleInputData1.value = RGB.red();
        this.tripleInputData1.max = 255;
        this.tripleInputData2.value = RGB.green();
        this.tripleInputData2.max = 255;
        this.tripleInputData3.value = RGB.blue();
        this.tripleInputData3.max = 255;
        this.tripleInputData4.value = RGB.alpha() * 100;
        break;
      }
      case _ColorPickerInputsSectionType.HSL: {
        const HSL = this.value.hsl();
        this.tripleInputData1.value = HSL.hue();
        this.tripleInputData1.max = 360;
        this.tripleInputData2.value = HSL.saturationl();
        this.tripleInputData2.max = 100;
        this.tripleInputData3.value = HSL.lightness();
        this.tripleInputData3.max = 100;
        this.tripleInputData4.value = HSL.alpha() * 100;
        break;
      }
      case _ColorPickerInputsSectionType.HSV: {
        const HSV = this.value.hsv();
        this.tripleInputData1.value = HSV.hue();
        this.tripleInputData1.max = 360;
        this.tripleInputData2.value = HSV.saturationv();
        this.tripleInputData2.max = 100;
        this.tripleInputData3.value = HSV.value();
        this.tripleInputData3.max = 100;
        this.tripleInputData4.value = HSV.alpha() * 100;
        break;
      }

      default:
        break;
    }
  }

  onHexInputChange(value: string): void {
    if (this.withOpacity()) {
      if (!value.match(validHexAlphaColorRegex)) return;
    } else if (!value.match(validHexColorRegex)) return;

    this.value = value;
  }

  // eslint-disable-next-line
  onTripleInputChange(value: number | null, index: number): void {} //TODO

  //! events
  protected _emitChange() {
    const v = this.value;
    this._onChangeRegistered?.(v);
    this.valueChange.emit(v);
  }

  //! template customization
  @Input() shadeIndicatorTemplate?: TemplateRef<any>;
  @Input() hueIndicatorTemplate?: TemplateRef<any>;
  @Input() opacityIndicatorTemplate?: TemplateRef<any>;
  @Input() colorReferenceTemplate?: TemplateRef<any>;
  @ContentChild(ArdColorPickerShadeIndicatorTemplateDirective, {
    read: TemplateRef,
  })
  shadeIndicatorTemplateChild?: TemplateRef<any>;
  @ContentChild(ArdColorPickerHueIndicatorTemplateDirective, {
    read: TemplateRef,
  })
  hueIndicatorTemplateChild?: TemplateRef<any>;
  @ContentChild(ArdColorPickerOpacityIndicatorTemplateDirective, {
    read: TemplateRef,
  })
  opacityIndicatorTemplateChild?: TemplateRef<any>;
  @ContentChild(ArdColorPickerColorReferenceTemplateDirective, {
    read: TemplateRef,
  })
  colorReferenceTemplateChild?: TemplateRef<any>;

  getIndicatorContext(): ColorPickerIndicatorContext {
    return {
      $implicit: this.value,
    };
  }
  getColorReferenceContext(): ColorPickerColorReferenceContext {
    return {
      color: this.value,
      $implicit: this.value,
      referenceColor: this.referenceColor(),
    };
  }

  //! keyboard controls
  onKeydown(event: KeyboardEvent): void {
    const hasShift = event.shiftKey;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        if (this.focusedArea() !== 'shade') return;
        this.nudgeColorSaturation(event.key === 'ArrowRight' ? 1 : -1, hasShift);
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        switch (this.focusedArea()) {
          case 'shade':
            this.nudgeColorValue(event.key === 'ArrowUp' ? 1 : -1, hasShift);
            break;
          case 'hue':
            this.nudgeColorHue(event.key === 'ArrowDown' ? 1 : -1, hasShift);
            break;
          case 'opacity':
            this.nudgeColorOpacity(event.key === 'ArrowUp' ? 1 : -1, hasShift);
            break;

          default:
            console.error(
              new Error(
                `ARD-IS2026: <ard-color-picker> encountered an unexpected value of focusedArea: "${this.focusedArea()}". Please report this issue to the creators.`
              )
            );
            break;
        }
        break;
    }
  }
  nudgeColorSaturation(direction: 1 | -1, hasShift?: boolean): void {
    const v = this.value;
    let diff = (direction * 100) / 255;
    let newVal: number;
    if (hasShift) {
      diff = (diff * 255) / 10;
      newVal = v.saturationv() + diff;
      newVal = roundToMultiple(newVal, Math.abs(diff)); //round to tens
    } else {
      newVal = v.saturationv() + diff;
    }
    const newValClamped = Math.max(0, Math.min(100, newVal));
    this.value = Color(v).saturationv(newValClamped);
  }
  nudgeColorValue(direction: 1 | -1, hasShift?: boolean): void {
    const v = this.value;
    let diff = (direction * 100) / 255;
    let newVal: number;
    if (hasShift) {
      diff = (diff * 255) / 10;
      newVal = v.value() + diff;
      newVal = roundToMultiple(newVal, Math.abs(diff)); //round to tens
    } else {
      newVal = v.value() + diff;
    }
    const newValClamped = Math.max(0, Math.min(100, newVal));
    this.value = Color(v).value(newValClamped);
  }
  nudgeColorHue(direction: 1 | -1, hasShift?: boolean): void {
    const v = this.value;
    let diff = direction as number,
      newVal: number;
    if (hasShift) {
      diff = direction * 30;
      newVal = v.hue() + diff;
      newVal = roundToMultiple(newVal, Math.abs(diff)); //round to tens
    } else {
      newVal = v.hue() + diff;
    }
    const newValClamped = Math.max(0, Math.min(359.99, newVal));
    this.value = Color(v).hue(newValClamped);
  }
  nudgeColorOpacity(direction: 1 | -1, hasShift?: boolean): void {
    const v = this.value;
    let diff = direction * 0.01;
    let newVal: number;
    if (hasShift) {
      diff = diff * 10;
      newVal = v.alpha() + diff;
      newVal = roundToPrecision(newVal, 1); //round to one place
    } else {
      newVal = v.alpha() + diff;
    }
    const newValClamped = Math.max(0, Math.min(1, newVal));
    this.value = Color(v).alpha(newValClamped);
  }
}
