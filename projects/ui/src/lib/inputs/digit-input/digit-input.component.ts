import { AutofillMonitor } from '@angular/cdk/text-field';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
    computed,
    effect,
    forwardRef,
    inject,
    input,
    output,
    signal,
    viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { Subscription } from 'rxjs';
import { _FormFieldComponentBase } from '../../_internal/form-field-component';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { ARD_DIGIT_INPUT_DEFAULTS, ArdDigitInputDefaults } from './digit-input.defaults';
import { DigitInputModel } from './digit-input.model';
import { DigitInputAutoFillParseFn, DigitInputConfig, DigitInputShape, DigitInputTransform } from './digit-input.types';
import { DigitInputModelHost } from './digit-input.utils';

@Component({
  standalone: false,
  selector: 'ard-digit-input',
  templateUrl: './digit-input.component.html',
  styleUrls: ['./digit-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumDigitInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumDigitInputComponent,
    },
  ],
})
export class ArdiumDigitInputComponent
  extends _FormFieldComponentBase
  implements ControlValueAccessor, DigitInputModelHost, OnInit, AfterViewInit, OnDestroy
{
  protected override readonly _DEFAULTS!: ArdDigitInputDefaults;
  constructor(@Inject(ARD_DIGIT_INPUT_DEFAULTS) defaults: ArdDigitInputDefaults) {
    super(defaults);

    effect(() => {
      if (this.configArrayData().length === this._oldConfigArrayDataLength) return;

      this._oldConfigArrayDataLength = this.configArrayData().length;
      this._emitChange();
    });
  }

  private readonly _autoFillMonitor = inject(AutofillMonitor);

  //! inputs ref
  readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('input');

  readonly inputAttrs = input<Record<string, any>>(this._DEFAULTS.inputAttrs);

  private _setInputAttributes() {
    const inputs = this.inputs();
    for (const input of inputs) {
      const inputEl = input.nativeElement;
      const attributes: Record<string, string> = {
        autocorrect: 'off',
        autocapitalize: 'off',
        autocomplete: 'off',
        ...this.inputAttrs(),
      };

      for (const key of Object.keys(attributes)) {
        inputEl.setAttribute(key, attributes[key]);
      }
    }
  }

  //! auto-fill
  readonly autoFillParseFn = input<DigitInputAutoFillParseFn>(this._DEFAULTS.autoFillParseFn);

  readonly isAutofilled = signal<boolean>(false);
  private readonly _wasAutofillValueRead = signal<boolean>(false);

  private _autoFillSubs: Subscription[] = [];
  private _subscribeToAutoFillOnInputs() {
    const inputs = this.inputs();
    for (const input of inputs) {
      const sub = this._autoFillMonitor.monitor(input).subscribe(event => {
        this.isAutofilled.set(event.isAutofilled);
      });
      this._autoFillSubs.push(sub);
    }
  }

  private _unsubscribeFromAutoFill() {
    const inputs = this.inputs();
    for (const input of inputs) {
      this._autoFillMonitor.stopMonitoring(input);
    }
    for (const sub of this._autoFillSubs) {
      sub.unsubscribe();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._unsubscribeFromAutoFill();
  }

  //! data model
  private readonly model = new DigitInputModel(this);

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly shape = input<DigitInputShape>(this._DEFAULTS.shape);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed((): string =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-shape-${this.shape()}`,
      this.compact() ? 'ard-compact' : '',
      this.isAutofilled() ? 'ard-autofilled' : '',
    ].join(' ')
  );

  //! model access points
  readonly config = input.required<void, DigitInputConfig>({
    transform: v => this.model.setConfig(v),
  });
  readonly configArrayData = this.model.configArrayData;

  readonly transform = input<DigitInputTransform>(this._DEFAULTS.transform);

  private _oldConfigArrayDataLength = -1;
  override ngOnInit(): void {
    super.ngOnInit();
    this._oldConfigArrayDataLength = this.configArrayData().length;
  }

  isInputEmpty(index: number): boolean {
    return !this.model.isDefinedAtIndex(index);
  }

  //! control value accessor's write value implementation
  private _valueBeforeViewInit?: any;
  writeValue(v: any): void {
    if (!this._wasViewInit) {
      this._valueBeforeViewInit = v;
      return;
    }
    this._writeValue(v);
  }
  private _writeValue(v: any): boolean {
    return this.model.writeValue(v);
  }

  private _wasViewInit = false;
  ngAfterViewInit(): void {
    this._wasViewInit = true;

    if (this._valueBeforeViewInit) {
      this._writeValue(this._valueBeforeViewInit);
    }

    this._setInputAttributes();
    this._subscribeToAutoFillOnInputs();
  }

  //! value two-way binding
  readonly outputAsString = input<boolean, BooleanLike>(this._DEFAULTS.outputAsString, { transform: v => coerceBooleanProperty(v) });

  readonly outputControlValueAccessorOnFinish = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  @Input()
  set value(v: string | (string | null)[] | null) {
    this.writeValue(v);
  }
  readonly valueChange = output<string | (string | null)[] | null>();

  readonly stringValue = this.model.stringValue;

  readonly emittableValue = computed((): string | (string | null)[] | null => {
    if (this.outputAsString()) return this.model.stringValue();
    return this.model.valueWithStatics();
  });

  //! event emitters
  readonly finishedValue = output<string | (string | null)[] | null>();

  readonly focusIndexEvent = output<number>({ alias: 'focusIndex' });
  readonly blurIndexEvent = output<number>({ alias: 'blurIndex' });

  //! event handlers
  onPaste(event: ClipboardEvent, index: number): void {
    if (this.disabled() || this.readonly()) return;

    const value = event.clipboardData?.getData('text');
    event.stopPropagation();
    event.preventDefault();
    if (!value) return;

    this._handleMultiDigitChange(value, index);
  }
  onInput(event: Event, index: number): void {
    if (this.disabled() || this.readonly()) return;

    const value = (event.target as HTMLInputElement).value;
    if (this.isAutofilled()) {
      if (!this._wasAutofillValueRead()) {
        this._wasAutofillValueRead.set(true);
        setTimeout(() => {
          this._wasAutofillValueRead.set(false);

          const parsedValue = this.autoFillParseFn()(value);

          this._handleMultiDigitChange(parsedValue, 0);
        }, 0);
      }
      return;
    }
    const wasValidCharacter = this._updateSingleInputValue(value, index);
    if (!wasValidCharacter) return;
    this.focusByIndex(index + 1);
  }
  private _handleMultiDigitChange(value: string, startIndex: number): void {
    const maxLength = this.inputs().length - startIndex;
    value
      .slice(0, maxLength)
      .split('')
      .forEach((char, i) => {
        this.model.resetInputValue(startIndex + i);
        this.model.validateInputAndSetValue(char, startIndex + i);
      });

    this.focusByIndex(startIndex - 1 + Math.min(value.length, maxLength));

    this._emitChange();
  }
  private _updateSingleInputValue(value: string, index: number): boolean {
    const changeResult = this.model.validateInputAndSetValue(value, index);

    if (changeResult?.wasChanged) {
      this._emitChange();
    }

    return changeResult?.wasValidChar ?? false;
  }
  focusByIndex(index: number): boolean;
  focusByIndex(index: number, tryFocusingNext: boolean, direction: 1 | -1): boolean;
  focusByIndex(index: number, tryFocusingNext?: boolean, direction?: 1 | -1): boolean {
    if (index < 0 || index >= this.inputs().length) return false;
    const nextEl = this.inputs()[index]?.nativeElement;
    if (!nextEl) return false;

    if (nextEl.getAttribute('data-ard-static') !== null) {
      return this.focusByIndex(index + (direction ?? 1));
    }
    nextEl.focus();
    if (tryFocusingNext && direction && document.activeElement !== nextEl) {
      return this.focusByIndex(index + direction);
    }
    return document.activeElement === nextEl;
  }
  //focus, blur, change
  onFocusMaster(event: FocusEvent, index: number): void {
    if (this.disabled() || this.readonly()) return;

    this.focusIndexEvent.emit(index);
    (event.target as HTMLInputElement).setSelectionRange(0, 1);

    this.onFocus(event);
  }
  onBlurMaster(event: FocusEvent, index: number): void {
    if (this.disabled() || this.readonly()) return;

    this.blurIndexEvent.emit(index);
    this.onBlur(event);
  }
  protected _emitChange(): void {
    const v = this.emittableValue();
    if (!this.outputControlValueAccessorOnFinish() || this.model.isValueFull()) this._onChangeRegistered?.(v);
    this.valueChange.emit(v);
    if (this.model.isValueFull()) {
      this.finishedValue.emit(v);
    }
  }
  onKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled() || this.readonly()) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        this.focusByIndex(index - 1, true, -1);
        return;
      case 'ArrowRight':
        this.focusByIndex(index + 1, true, +1);
        return;
      case 'Home':
        this.focusByIndex(0, true, 1);
        return;
      case 'End':
        this.focusByIndex(this.inputs.length - 1, true, -1);
        return;
      case 'Backspace':
      case 'Delete':
        this._updateSingleInputValue('', index);
        this.focusByIndex(index - 1, true, -1);
        event.preventDefault();
        return;
    }
  }
}
