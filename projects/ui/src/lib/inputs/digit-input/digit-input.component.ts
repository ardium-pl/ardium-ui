import { AutofillMonitor } from '@angular/cdk/text-field';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  Inject,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  untracked,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
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
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: ArdiumDigitInputComponent,
    },
  ],
})
export class ArdiumDigitInputComponent
  extends _FormFieldComponentBase
  implements
    DigitInputModelHost,
    AfterViewInit,
    OnDestroy,
    Omit<FormValueControl<string | null>, 'readonly' | 'disabled' | 'required'>
{
  protected override readonly _DEFAULTS!: ArdDigitInputDefaults;
  constructor(@Inject(ARD_DIGIT_INPUT_DEFAULTS) defaults: ArdDigitInputDefaults) {
    super(defaults);

    // listen to value changes
    effect(() => {
      const v = this.value() ?? '';
      untracked(() => this.model.validateInputAndSetValueMultiple(v, 0, true));
    });
    // emit value & finish event
    effect(() => {
      const isFull = this.model.isValueFull();
      if (this.outputOnFinish()) {
        if (isFull) {
          this.value.set(this.model.stringValue());
        } else if (this.model.isValueEmpty()) {
          this.value.set(null);
        }
      } else {
        this.value.set(this.model.stringValue());
      }
      if (isFull) {
        this.finishValue.emit(this.model.stringValue());
      }
    });
    // update input attrs
    effect(() => {
      this._setInputAttributes();
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
  private _wasAutofillValueRead = false;

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

  isInputEmpty(index: number): boolean {
    return !this.model.isDefinedAtIndex(index);
  }

  ngAfterViewInit(): void {
    this._subscribeToAutoFillOnInputs();
  }

  //! value two-way binding
  /**
   * @deprecated - Renamed to `[outputOnFinish]`.
   */
  readonly outputControlValueAccessorOnFinish = input<undefined, never>(undefined, { transform: () => undefined });
  readonly outputOnFinish = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly value = model<string | null>(null);
  readonly stringValue = this.model.stringValue;

  //! event emitters
  /**
   * @deprecated - Renamed to `(finishValue)`.
   */
  readonly finishedValue = output<never>();
  readonly finishValue = output<string>();

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
    if (this.isAutofilled() || value.length > 2) {
      if (!this._wasAutofillValueRead) {
        this._wasAutofillValueRead = true;
        setTimeout(() => {
          this._wasAutofillValueRead = false;

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
    this.model.validateInputAndSetValueMultiple(value, startIndex);

    const maxLength = this.inputs().length - startIndex;
    this.focusByIndex(startIndex - 1 + Math.min(value.length, maxLength));
  }
  private _updateSingleInputValue(value: string, index: number): boolean {
    const changeResult = this.model.validateInputAndSetValue(value, index);

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
