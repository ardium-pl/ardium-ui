import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Inject,
  Input,
  input,
  TemplateRef,
  Type,
  ViewEncapsulation
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { delay, startWith, Subject } from 'rxjs';
import { _FocusableComponentBase } from '../_internal/focusable-component';
import { contextToInputs } from '../_internal/utils/context-to-inputs';
import { FormElementAppearance, FormElementVariant } from '../types/theming.types';
import { Nullable } from '../types/utility.types';
import { ARD_FORM_FIELD_FRAME_DEFAULTS, ArdFormFieldFrameDefaults } from './form-field-frame.defaults';
import { ArdFormFieldPrefixTemplateDirective, ArdFormFieldSuffixTemplateDirective } from './form-field-frame.directives';
import { ArdFormFieldFramePrefixSuffix, FormFieldFrameTemplateContext } from './form-field-frame.types';

@Component({
  standalone: false,
  selector: 'ard-form-field-frame',
  templateUrl: './form-field-frame.component.html',
  styleUrls: ['./form-field-frame.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumFormFieldFrameComponent extends _FocusableComponentBase {
  protected override readonly _DEFAULTS!: ArdFormFieldFrameDefaults;
  constructor(@Inject(ARD_FORM_FIELD_FRAME_DEFAULTS) defaults: ArdFormFieldFrameDefaults) {
    super(defaults);
  }

  readonly hasError = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly isSuccess = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! focused state
  @Input({ alias: 'isFocused' })
  set _setIsFocused(v: boolean) {
    this.isFocused.set(v);
  }

  //! appearance
  /**
   * The appearance of the component, aka the styling.
   */
  readonly appearance = input<FormElementAppearance>(FormElementAppearance.Outlined);
  /**
   * The variant of the component, aka the shape.
   */
  readonly variant = input<FormElementVariant>(FormElementVariant.Rounded);

  /**
   * Whether to use the compact styling or not.
   */
  readonly compact = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  private readonly _enableTransitions = toSignal(new Subject<boolean>().asObservable().pipe(startWith(true), delay(0)));

  readonly ngClasses = computed<string>(() =>
    [
      `ard-appearance-${this.appearance()}`,
      `ard-variant-${this.variant()}`,
      this.compact() ? 'ard-compact' : '',
      this.hasError() ? 'ard-has-error' : '',
      this.isSuccess() ? 'ard-is-success' : '',
      this.isFocused() && !this.readonly() ? 'ard-focused' : 'ard-unfocused',
      this._enableTransitions() ? 'ard-enable-transitions' : '',
    ].join(' ')
  );

  //! prefix & suffix
  readonly prefixTemplateInput = input<Nullable<TemplateRef<FormFieldFrameTemplateContext>>>(undefined, {
    alias: 'prefixTemplate',
  });
  readonly suffixTemplateInput = input<Nullable<TemplateRef<FormFieldFrameTemplateContext>>>(undefined, {
    alias: 'suffixTemplate',
  });
  readonly prefixTemplate = contentChild(ArdFormFieldPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdFormFieldSuffixTemplateDirective);

  readonly prefixSuffixTemplateContext = computed<FormFieldFrameTemplateContext>(() => ({
    hasError: this.hasError(),
    disabled: this.disabled(),
    readonly: this.readonly(),
    isSuccess: this.isSuccess(),
    isFocused: this.isFocused(),
  }));

  readonly prefixComponentInput = input<Nullable<Type<ArdFormFieldFramePrefixSuffix>>>(undefined, {
    alias: 'prefixComponent',
  });
  readonly suffixComponentInput = input<Nullable<Type<ArdFormFieldFramePrefixSuffix>>>(undefined, {
    alias: 'suffixComponent',
  });
  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  readonly prefixComponentInputs = contextToInputs(this.prefixSuffixTemplateContext, this.prefixComponent);
  readonly suffixComponentInputs = contextToInputs(this.prefixSuffixTemplateContext, this.suffixComponent);
}
