import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  computed,
  contentChild,
  forwardRef,
  input,
  model,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty, coerceNumberProperty } from '@ardium-ui/devkit';
import { isAnyString, isDefined } from 'simple-bool';
import { _FormFieldComponentBase } from '../../_internal/form-field-component';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { Nullable } from '../../types/utility.types';
import { ARD_PASSWORD_INPUT_DEFAULTS, ArdPasswordInputDefaults } from './password-input.defaults';
import {
  ArdPasswordInputPlaceholderTemplateDirective,
  ArdPasswordInputPrefixTemplateDirective,
  ArdPasswordInputRevealButtonTemplateDirective,
  ArdPasswordInputSuffixTemplateDirective,
} from './password-input.directives';
import { PasswordInputRevealButtonContext } from './password-input.types';

@Component({
  standalone: false,
  selector: 'ard-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumPasswordInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumPasswordInputComponent,
    },
  ],
})
export class ArdiumPasswordInputComponent extends _FormFieldComponentBase implements ControlValueAccessor, OnInit, OnDestroy {
  protected override readonly _DEFAULTS!: ArdPasswordInputDefaults;
  constructor(@Inject(ARD_PASSWORD_INPUT_DEFAULTS) defaults: ArdPasswordInputDefaults) {
    super(defaults);
  }

  //! input view
  readonly textInputEl = viewChild<ElementRef<HTMLInputElement>>('textInput');

  override ngOnInit(): void {
    super.ngOnInit();
    this._setInputAttributes();
  }

  readonly placeholder = input<string>(this._DEFAULTS.placeholder);

  //! prefix & suffix
  readonly prefixTemplate = contentChild(ArdPasswordInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdPasswordInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  //! placeholder
  readonly placeholderTemplate = contentChild(ArdPasswordInputPlaceholderTemplateDirective);

  readonly shouldDisplayPlaceholder = computed(() => !!this.placeholder() && !this.value());

  //! revealing
  readonly revealable = input<boolean, BooleanLike>(this._DEFAULTS.revealable, { transform: v => coerceBooleanProperty(v) });
  readonly holdToReveal = input<boolean, BooleanLike>(this._DEFAULTS.holdToReveal, { transform: v => coerceBooleanProperty(v) });

  readonly autoHideTimeoutMs = input<Nullable<number>, any>(this._DEFAULTS.autoHideTimeoutMs, {
    transform: v => coerceNumberProperty(v, this._DEFAULTS.autoHideTimeoutMs),
  });

  readonly revealed = model<boolean>(this._DEFAULTS.revealed);

  private _hideTimeout: NodeJS.Timeout | null = null;
  toggleReveal(newState = !this.revealed()): void {
    this.revealed.set(newState);

    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }
    const timeout = this.autoHideTimeoutMs();
    if (timeout && newState) {
      this._hideTimeout = setTimeout(() => this.revealed.set(false), timeout);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.holdToReveal() && this.revealed()) {
      this.revealed.set(false);
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
    }
  }

  readonly revealTemplate = contentChild(ArdPasswordInputRevealButtonTemplateDirective);

  readonly revealButtonContext = computed(
    (): PasswordInputRevealButtonContext => ({
      $implicit: this.revealed(),
    })
  );

  //! appearance
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);

  readonly compact = input<boolean, BooleanLike>(this._DEFAULTS.compact, { transform: v => coerceBooleanProperty(v) });

  readonly ngClasses = computed(() =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      this.compact() ? 'ard-compact' : '',
      this.revealable() ? 'ard-revealable' : '',
    ].join(' ')
  );

  //! other inputs
  readonly inputAttrs = input<Record<string, any>>(this._DEFAULTS.inputAttrs);

  //! control value accessor's write value implementation
  writeValue(v: any) {
    if (!isAnyString(v) && isDefined(v)) {
      //warn when using non-string/non-null value
      console.warn(
        new Error(
          `ARD-WA0020: Trying to set <ard-password-input>'s value to "${v}" (of type ${typeof v}), expected string or null.`
        )
      );
      //normalize the value
      v = v?.toString?.() ?? String(v);
      return;
    }
    this._writeValue(v ?? null);
  }
  protected _writeValue(v: string | null): boolean {
    const oldVal = this.value();
    this.value.set(v);
    return oldVal !== v;
  }
  //! value two-way binding
  readonly value = model<string | null>(null);

  //! event handlers
  onInput(newVal: string): void {
    const valueHasChanged = this._writeValue(newVal);
    if (!valueHasChanged) return;
    this._emitChange();
  }
  protected _emitChange(): void {
    const v = this.value();
    this._onChangeRegistered?.(v);
  }
  //focus, blur, change
  onChange(event: Event): void {
    event.stopPropagation();
    this._emitChange();
  }

  // copy
  onCopy(event: ClipboardEvent): void {
    const textInputEl = this.textInputEl();
    const v = this.value();
    if (
      v &&
      textInputEl &&
      //does the selection cover the entire input
      ((textInputEl.nativeElement.selectionStart === 0 &&
        textInputEl.nativeElement.selectionEnd === textInputEl.nativeElement.value.length) ||
        //or is zero-wide
        textInputEl.nativeElement.selectionStart === textInputEl.nativeElement.selectionEnd)
    ) {
      event.clipboardData?.setData('text/plain', v);
      event.preventDefault();
    }
  }
  //! helpers
  protected _setInputAttributes() {
    const input = this.textInputEl()?.nativeElement;
    if (!input) return;

    const attributes: Record<string, string> = {
      type: 'text',
      autocorrect: 'off',
      autocapitalize: 'off',
      autocomplete: 'off',
      tabindex: String(this.tabIndex()),
      ...this.inputAttrs(),
    };

    for (const key of Object.keys(attributes)) {
      input.setAttribute(key, String(attributes[key]));
    }
  }
}
