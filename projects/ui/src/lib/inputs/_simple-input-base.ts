import { AfterViewInit, computed, Directive, ElementRef, input, Input, output, viewChild } from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import {
    _FormFieldComponentBase,
    _FormFieldComponentDefaults,
    _formFieldComponentDefaults,
} from '../_internal/form-field-component';
import { SimpleOneAxisAlignment } from './../types/alignment.types';
import { FormElementAppearance, FormElementVariant } from './../types/theming.types';
import { Nullable } from './../types/utility.types';
import { ArdInputType } from './input-types';
import { InputModel } from './input-utils';

export interface _SimpleInputComponentDefaults extends _FormFieldComponentDefaults {
  appearance: FormElementAppearance;
  variant: FormElementVariant;
  compact: boolean;
  placeholder: string;
  alignText: SimpleOneAxisAlignment;
  clearable: boolean;
  clearButtonTitle: string;
  inputAttrs: Record<string, any>;
  maxLength: Nullable<number>;
  autoTrim: boolean;
  type: ArdInputType;
}

export const _simpleInputComponentDefaults: _SimpleInputComponentDefaults = {
  ..._formFieldComponentDefaults,
  appearance: FormElementAppearance.Outlined,
  variant: FormElementVariant.Rounded,
  compact: false,
  placeholder: '',
  alignText: SimpleOneAxisAlignment.Left,
  clearable: false,
  clearButtonTitle: 'Clear',
  inputAttrs: {},
  maxLength: undefined,
  autoTrim: false,
  type: 'text',
};

@Directive()
export abstract class _SimpleInputComponentBase extends _FormFieldComponentBase implements AfterViewInit {
  protected override readonly _DEFAULTS!: _SimpleInputComponentDefaults;

  //! input view
  readonly textInputEl = viewChild<ElementRef<HTMLInputElement>>('textInput');

  protected readonly inputModel = new InputModel(this);
  private _wasViewInit = false;
  ngAfterViewInit(): void {
    this._wasViewInit = true;
    this._setInputAttributes();
    //set the value
    if (this._valueBeforeInit) {
      this.writeValue(this._valueBeforeInit);
      delete this._valueBeforeInit;
    }
  }

  readonly placeholder = input<string>(this._DEFAULTS.placeholder);
  readonly clearButtonTitle = input<string>(this._DEFAULTS.clearButtonTitle);

  //! prefix & suffix
  abstract readonly prefixTemplate: any;
  abstract readonly suffixTemplate: any;

  //! placeholder
  abstract readonly placeholderTemplate: any;

  readonly shouldDisplayPlaceholder = computed<boolean>(() => Boolean(this.placeholder()) && !this.inputModel.value());

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly alignText = input<SimpleOneAxisAlignment>(this._DEFAULTS.alignText);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed((): string =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-text-align-${this.alignText()}`,
      this.compact() ? 'ard-compact' : '',
      this.clearable() ? 'ard-clearable' : '',
    ].join(' ')
  );

  //! other inputs
  readonly type = input<ArdInputType>(this._DEFAULTS.type);

  readonly inputAttrs = input<Record<string, any>>(this._DEFAULTS.inputAttrs);

  //! number attribute setters/getters
  readonly maxLength = input<Nullable<number>, any>(this._DEFAULTS.maxLength, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.maxLength),
  });

  readonly maxLengthAsInt = computed<number>(() => this.maxLength() ?? 2_147_483_647);

  //! no-value attribute setters/getters
  readonly clearable = input<boolean, BooleanLike>(this._DEFAULTS.clearable, { transform: v => coerceBooleanProperty(v) });

  readonly autoTrim = input<boolean, BooleanLike>(this._DEFAULTS.autoTrim, { transform: v => coerceBooleanProperty(v) });

  //! control value accessor's write value implementation
  writeValue(v: any) {
    this.inputModel.writeValue(v);
  }
  //! value two-way binding
  protected _valueBeforeInit?: string | null = null;
  @Input()
  set value(v: string | null) {
    if (!this._wasViewInit) {
      this._valueBeforeInit = v;
      return;
    }
    this.writeValue(v);
  }
  get value(): string | null {
    return this.inputModel.value();
  }
  readonly valueChange = output<string | null>();

  //! event emitters
  readonly inputEvent = output<string | null>({ alias: 'input' });
  readonly changeEvent = output<string | null>({ alias: 'change' });
  readonly clearEvent = output<MouseEvent>({ alias: 'clear' });

  //! event handlers
  onInput(newVal: string): void {
    if (this.disabled() || this.readonly()) return;

    const valueHasChanged = this.inputModel.writeValue(newVal);
    if (!valueHasChanged) return;
    this._emitInput();
  }
  protected _emitInput(): void {
    this._onChangeRegistered?.(this.value);
    this.inputEvent.emit(this.value);
    this.valueChange.emit(this.value);
  }
  //focus, blur, change
  onFocusMaster(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;

    this.onFocus(event);
  }
  onBlurMaster(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;

    this.onBlur(event);

    if (!this.autoTrim()) return;

    this.inputModel.trim();
    this._emitChange();
    this._emitInput();
  }
  onChange(event: Event): void {
    event.stopPropagation();
    this._emitChange();
  }
  protected _emitChange(): void {
    this.changeEvent.emit(this.inputModel.value());
  }
  // clear button
  readonly shouldShowClearButton = computed<boolean>(
    () => this.clearable() && !this.disabled() && !this.readonly() && Boolean(this.inputModel.value())
  );
  onClearButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    event.stopPropagation();
    this.inputModel.clear();
    this._emitChange();
    this._emitInput();
    this.clearEvent.emit(event);
    this.focus();
  }

  //! copy event
  onCopy(event: ClipboardEvent): void {
    if (
      this.value &&
      //does the selection cover the entire input
      ((this.textInputEl()?.nativeElement.selectionStart === 0 &&
        this.textInputEl()?.nativeElement.selectionEnd === this.textInputEl()?.nativeElement.value.length) ||
        //or is zero-wide
        this.textInputEl()?.nativeElement.selectionStart === this.textInputEl()?.nativeElement.selectionEnd)
    ) {
      event.clipboardData?.setData('text/plain', this.value);
      event.preventDefault();
    }
  }
  //! helpers
  protected _setInputAttributes() {
    const input = this.textInputEl()!.nativeElement;
    const attributes: Record<string, string> = {
      autocorrect: 'off',
      autocapitalize: 'off',
      autocomplete: 'off',
      tabindex: String(this.tabIndex()),
      type: this.type(),
      ...this.inputAttrs(),
    };

    for (const key of Object.keys(attributes)) {
      input.setAttribute(key, String(attributes[key]));
    }
  }
}
