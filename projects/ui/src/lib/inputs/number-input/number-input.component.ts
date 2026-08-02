import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  forwardRef,
  Inject,
  Input,
  input,
  output,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty, NumberLike } from '@ardium-ui/devkit';
import { roundToPrecision } from 'more-rounding';
import { isDefined } from 'simple-bool';
import { _FormFieldComponentBase } from '../../_internal/form-field-component';
import { contextToInputs } from '../../_internal/utils/context-to-inputs';
import { ButtonAppearance, ButtonVariant } from '../../buttons/general-button.types';
import { FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { OneAxisAlignment } from '../../types/alignment.types';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { Nullable } from '../../types/utility.types';
import { NumberInputModel, NumberInputModelHost } from '../input-utils';
import { ARD_NUMBER_INPUT_DEFAULTS, ArdNumberInputDefaults } from './number-input.defaults';
import {
  ArdNumberInputPlaceholderTemplateDirective,
  ArdNumberInputPrefixTemplateDirective,
  ArdNumberInputSuffixTemplateDirective,
} from './number-input.directives';
import { ArdNumberInputMinMaxBehavior } from './number-input.types';

@Component({
  standalone: false,
  selector: 'ard-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumNumberInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumNumberInputComponent,
    },
  ],
})
export class ArdiumNumberInputComponent
  extends _FormFieldComponentBase
  implements ControlValueAccessor, NumberInputModelHost, AfterViewInit
{
  protected override readonly _DEFAULTS!: ArdNumberInputDefaults;
  constructor(@Inject(ARD_NUMBER_INPUT_DEFAULTS) defaults: ArdNumberInputDefaults) {
    super(defaults);

    effect(() => {
      const allowFloat = this.allowFloat();
      const stepSize = this.stepSize();
      if (!allowFloat && stepSize % 1 !== 0) {
        throw new Error(
          `ARD-FT0071c: <ard-number-input>'s [stepSize] must be an integer when [allowFloat] is false, got "${stepSize}".`
        );
      }
    });

    // refresh input display when decimalSeparator changes
    effect(() => {
      this.decimalSeparator();
      // calling rewrite ensures element value includes new separator
      untracked(() => this.inputModel.rewriteValueAfterHostUpdate());
    });
  }

  //! input view
  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('textInput');

  protected readonly inputModel = new NumberInputModel(this);
  private _wasViewInit = false;
  ngAfterViewInit(): void {
    this._setInputAttributes();
    this._wasViewInit = true;
    //set the value
    if (this._valueBeforeInit) {
      this.writeValue(this._valueBeforeInit);
      delete this._valueBeforeInit;
    }
  }

  //! placeholder
  readonly placeholder = input<Nullable<string>>(this._DEFAULTS.placeholder);

  readonly placeholderTemplate = contentChild(ArdNumberInputPlaceholderTemplateDirective);

  readonly shouldDisplayPlaceholder = computed<boolean>(() => !!this.placeholder() && !this.inputModel.stringValue());

  //! prefix and suffix templates
  readonly prefixTemplate = contentChild(ArdNumberInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdNumberInputSuffixTemplateDirective);

  readonly prefixSuffixTemplateContext = computed<FormFieldFrameTemplateContext>(() => ({
    hasError: this.hasError(),
    disabled: this.disabled(),
    readonly: this.readonly(),
    isSuccess: this.isSuccess(),
    isFocused: this.isFocused(),
  }));

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  readonly prefixComponentInputs = contextToInputs(this.prefixSuffixTemplateContext, this.prefixComponent);
  readonly suffixComponentInputs = contextToInputs(this.prefixSuffixTemplateContext, this.suffixComponent);

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly alignText = input<OneAxisAlignment>(this._DEFAULTS.alignText);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed((): string => {
    return [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      `ard-text-align-${this.alignText()}`,
      `ard-quick-change-${!this.noButtons()}`,
      this.compact() ? 'ard-compact' : '',
    ].join(' ');
  });

  readonly buttonVariant = computed((): ButtonVariant => {
    if (this.variant() === FormElementVariant.Rounded) return ButtonVariant.Rounded;
    if (this.variant() === FormElementVariant.Pill) return ButtonVariant.Pill;
    if (this.variant() === FormElementVariant.Sharp) return ButtonVariant.Sharp;
    return ButtonVariant.Rounded;
  });
  readonly buttonAppearance = computed<ButtonAppearance>(() => {
    if (this.appearance() === FormElementAppearance.Outlined && this.variant() !== FormElementVariant.Pill) {
      return ButtonAppearance.Outlined;
    }
    return ButtonAppearance.Transparent;
  });

  //! other inputs
  readonly inputAttrs = input<Record<string, any>>({});

  //! control value accessor's write value implementation
  writeValue(v: any) {
    this.inputModel.writeValue(v, false);

    if (this.isFocused()) return;
    this.inputModel.updateOnBlur(true);
  }

  //! value two-way binding
  protected _valueBeforeInit?: string | null = null;
  @Input()
  set value(v: string | number | null) {
    if (typeof v === 'number') v = v.toString();
    if (!this._wasViewInit) {
      this._valueBeforeInit = v;
      return;
    }
    this.writeValue(v);
  }
  readonly valueChange = output<number | null>();

  //! event emitters
  readonly inputEvent = output<number | null>({ alias: 'input' });
  readonly changeEvent = output<number | null>({ alias: 'change' });
  readonly clearEvent = output<MouseEvent>({ alias: 'clear' });
  readonly quickChangeEvent = output<{
    readonly direction: 1 | -1;
    readonly value: number;
  }>({ alias: 'quickChange' });

  //! min/max and number type
  readonly min = input<number, NumberLike>(this._DEFAULTS.min, { transform: v => coerceNumberProperty(v, this._DEFAULTS.min) });
  readonly max = input<number, NumberLike>(this._DEFAULTS.max, { transform: v => coerceNumberProperty(v, this._DEFAULTS.max) });

  readonly minMaxBehavior = input<ArdNumberInputMinMaxBehavior>(this._DEFAULTS.minMaxBehavior);

  readonly maxDecimalPlaces = input<number, NumberLike>(this._DEFAULTS.maxDecimalPlaces, {
    transform: v => {
      const newValue = coerceNumberProperty(v, this._DEFAULTS.maxDecimalPlaces);
      if (newValue < 0) {
        throw new Error(
          `ARD-FT0072a: Cannot set <ard-number-input>'s [maxDecimalPlaces] to a negative value, got "${newValue}".`
        );
      }
      if (newValue % 1 !== 0) {
        throw new Error(
          `ARD-FT0072b: Cannot set <ard-number-input>'s [maxDecimalPlaces] to a non-integer value, got "${newValue}".`
        );
      }
      return newValue;
    },
  });
  readonly fixedDecimalPlaces = input<boolean, BooleanLike>(this._DEFAULTS.fixedDecimalPlaces, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly decimalSeparator = input<string, string>(this._DEFAULTS.decimalSeparator, {
    transform: (v: any) => {
      if (typeof v !== 'string' || v.length !== 1) {
        throw new Error(`ARD-FT0073: <ard-number-input>'s [decimalSeparator] must be a single character, got "${v}".`);
      }
      return v;
    },
  });

  readonly allowFloat = input<boolean, BooleanLike>(this._DEFAULTS.allowFloat, { transform: v => coerceBooleanProperty(v) });

  //! incerement/decrement buttons
  readonly noButtons = input<boolean, BooleanLike>(this._DEFAULTS.noButtons, { transform: v => coerceBooleanProperty(v) });

  readonly keepFocusOnQuickChangeButton = input<boolean, BooleanLike>(this._DEFAULTS.keepFocusOnQuickChangeButton, {
    transform: v => coerceBooleanProperty(v),
  });

  readonly stepSize = input<number, NumberLike>(this._DEFAULTS.stepSize, {
    transform: v => {
      const newValue = coerceNumberProperty(v, 1);
      if (newValue === 0) {
        throw new Error(`ARD-FT0071a: Cannot set <ard-number-input>'s [stepSize] to 0.`);
      }
      if (newValue < 0) {
        throw new Error(`ARD-FT0071b: Cannot set <ard-number-input>'s [stepSize] to a negative value, got "${newValue}".`);
      }
      return newValue;
    },
  });

  onQuickChangeButtonClick(direction: 1 | -1, event?: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    let num = this.inputModel.numberValue();
    const hasAnyValue = isDefined(num);
    if (!num) num = 0;

    if (direction === 1 && num >= this.max() && hasAnyValue) return;
    if (direction === -1 && num <= this.min() && hasAnyValue) return;

    if (event) event.stopPropagation();

    const newValue = num + this.stepSize() * direction;
    //round to 9 decimal places to avoid floating point arithmetic errors
    //9 is an arbitrary number that just works well. ¯\_(ツ)_/¯
    const newValuePrecise = roundToPrecision(newValue, 9);

    this.writeValue(newValuePrecise);
    this.quickChangeEvent.emit({ direction, value: newValuePrecise });
    this._emitChange();
    this._emitTouched();

    this._focusInputIfCantQuickChange();
  }
  private _focusInputIfCantQuickChange(): void {
    if (this.keepFocusOnQuickChangeButton()) return;
    if (!this.canDecrement() || !this.canIncrement()) this.focus();
  }

  private _isQuickChangeButtonFocused = false;
  onQuickChangeButtonMouseup(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    // prevent the event from reaching the parent element
    if (this.keepFocusOnQuickChangeButton()) {
      this._isQuickChangeButtonFocused = true;
      setTimeout(() => {
        this._isQuickChangeButtonFocused = false;
      }, 0);
    }
  }

  readonly canIncrement = computed<boolean>(() => {
    const num = this.inputModel.numberValue();
    return !isDefined(num) || num < this.max();
  });
  readonly canDecrement = computed<boolean>(() => {
    const num = this.inputModel.numberValue();
    return !isDefined(num) || num > this.min();
  });

  //! event handlers
  onInput(newVal: string): void {
    if (this.disabled() || this.readonly()) return;

    const valueHasChanged = this.inputModel.writeValue(newVal, true);
    if (!valueHasChanged) return;
    this._emitInput();
  }
  protected _emitInput(): void {
    this.inputEvent.emit(this.inputModel.numberValue());
    this._emitChange();
  }

  //focus, blur, change
  onFocusMaster(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    this.onFocus(event);
  }
  onBlurMaster(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    this.onBlur(event);

    this.inputModel.updateOnBlur();
  }
  //change
  onChange(event: Event): void {
    event.stopPropagation();
    this._emitChange();
  }
  protected _emitChange(): void {
    const v = this.inputModel.numberValue();
    this.valueChange.emit(v);
    this.changeEvent.emit(v);
    this._onChangeRegistered?.(v);
  }

  //smart focus
  onMouseup(): void {
    if (this.disabled() || this.readonly()) return;
    const selection = window.getSelection();
    if (selection && selection.type === 'Range') return;

    if (this._isQuickChangeButtonFocused) return;
    this.focus();
  }

  // copy
  onCopy(event: ClipboardEvent): void {
    if (
      this.value &&
      //does the selection cover the entire input
      ((this.inputEl()?.nativeElement.selectionStart === 0 &&
        this.inputEl()?.nativeElement.selectionEnd === this.inputEl()?.nativeElement.value.length) ||
        //or is zero-wide
        this.inputEl()?.nativeElement.selectionStart === this.inputEl()?.nativeElement.selectionEnd)
    ) {
      event.clipboardData?.setData('text/plain', String(this.value));
      event.preventDefault();
    }
  }

  //! helpers
  protected _setInputAttributes() {
    const input = this.inputEl()!.nativeElement;
    const attributes: Record<string, string> = {
      type: 'text',
      autocorrect: 'off',
      autocapitalize: 'off',
      autocomplete: 'off',
      tabindex: String(this.tabIndex),
      ...this.inputAttrs,
    };

    for (const key of Object.keys(attributes)) {
      input.setAttribute(key, String(attributes[key]));
    }
  }
}
