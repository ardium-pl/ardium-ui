import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  ElementRef,
  forwardRef,
  Inject,
  input,
  model,
  output,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty } from '@ardium-pl/devkit';
import { _FormFieldComponentBase } from '../../_internal/form-field-component';
import { contextToInputs } from '../../_internal/utils/context-to-inputs';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { ArdPlaceholderContext } from '../../types/templates.types';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { Nullable } from '../../types/utility.types';
import { CaseTransformerType } from '../input-types';
import { ARD_HEX_INPUT_DEFAULTS, ArdHexInputDefaults } from './hex-input.defaults';
import {
  ArdHexInputPlaceholderTemplateDirective,
  ArdHexInputPrefixTemplateDirective,
  ArdHexInputSuffixTemplateDirective,
} from './hex-input.directives';
import { HexInputModel, HexInputModelHost } from './hex-input.model';

@Component({
  standalone: false,
  selector: 'ard-hex-input',
  templateUrl: './hex-input.component.html',
  styleUrls: ['./hex-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => ArdiumHexInputComponent),
    },
  ],
})
export class ArdiumHexInputComponent extends _FormFieldComponentBase implements HexInputModelHost, AfterViewInit {
  protected override readonly _DEFAULTS!: ArdHexInputDefaults;
  constructor(@Inject(ARD_HEX_INPUT_DEFAULTS) defaults: ArdHexInputDefaults) {
    super(defaults);
  }
  //! input view
  readonly textInputEl = viewChild<ElementRef<HTMLInputElement>>('textInput');

  protected readonly inputModel = new HexInputModel(this);
  ngAfterViewInit(): void {
    this._setInputAttributes();
  }

  //! prefix & suffix
  readonly prefixTemplate = contentChild(ArdHexInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdHexInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  //! placeholder
  readonly placeholder = input<Nullable<string>>(this._DEFAULTS.placeholder);

  readonly placeholderTemplate = contentChild(ArdHexInputPlaceholderTemplateDirective);

  readonly shouldDisplayPlaceholder = computed((): boolean => Boolean(this.placeholder()) && !this.inputModel.stringValue());

  readonly placeholderTemplateContext = computed<ArdPlaceholderContext>(() => ({
    $implicit: this.placeholder(),
    placeholder: this.placeholder(),
  }));

  readonly placeholderComponent = this._DEFAULTS.PlaceholderComponent;

  readonly placeholderComponentInputs = contextToInputs(this.placeholderTemplateContext, this.placeholderComponent);

  //! appearance
  //all handled in ard-form-field-frame component
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  //! settings
  readonly case = input<CaseTransformerType>(this._DEFAULTS.case);

  readonly maxDigits = input<Nullable<number>, any>(this._DEFAULTS.maxDigits, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.maxDigits),
  });
  readonly maxDigitsAsInt = computed<number>(() => this.maxDigits() ?? 2_147_483_647);

  readonly hideHash = input<boolean, BooleanLike>(this._DEFAULTS.hideHash, { transform: v => coerceBooleanProperty(v) });
  readonly showHash = computed(() => !this.hideHash());

  //! clear button
  readonly clearable = input<boolean, BooleanLike>(this._DEFAULTS.clearable, { transform: v => coerceBooleanProperty(v) });

  readonly clearButtonTitle = input<string>(this._DEFAULTS.clearButtonTitle);

  readonly shouldShowClearButton = computed<boolean>(() => this.clearable() && !this.disabled() && Boolean(this.value()));

  onClearButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    event.stopPropagation();
    this.inputModel.clear();
    this.clearEvent.emit();
    this.focus();
  }

  //! other inputs
  readonly inputAttrs = input<Record<string, any>>({});

  //! value two-way binding
  readonly value = model<string | null>(null);

  //! event emitters
  readonly clearEvent = output<void>({ alias: 'clear' });

  //! event handlers
  onInput(newVal: string, event: Event): void {
    if (this.disabled() || this.readonly()) return;

    event.stopPropagation();
    this.inputModel.updateValue(newVal);
  }

  //smart focus
  onMouseup(): void {
    if (this.disabled() || this.readonly()) return;
    const selection = window.getSelection();
    if (selection && selection.type === 'Range') return;

    this.focus();
  }

  onCopy(event: ClipboardEvent): void {
    if (
      this.value() &&
      //does the selection cover the entire input
      ((this.textInputEl()?.nativeElement.selectionStart === 0 &&
        this.textInputEl()?.nativeElement.selectionEnd === this.textInputEl()?.nativeElement.value.length) ||
        //or is zero-wide
        this.textInputEl()?.nativeElement.selectionStart === this.textInputEl()?.nativeElement.selectionEnd)
    ) {
      event.clipboardData?.setData('text/plain', this.value() ?? '');
      event.preventDefault();
    }
  }

  //! helpers
  protected _setInputAttributes() {
    const input = this.textInputEl()!.nativeElement;
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
