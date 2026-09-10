import { computed, contentChild, contentChildren, Directive, inject, input } from '@angular/core';
import { BooleanLike, coerceBooleanProperty } from '@ardium-pl/devkit';
import { isFunction } from 'simple-bool';
import { SimpleOneAxisAlignment } from '../types/alignment.types';
import { ArdiumAutoErrorComponent } from './auto-error/auto-error.component';
import { ArdiumErrorDirective } from './error/error.directive';
import { ARD_FORM_FIELD_CONTROL, ArdFormFieldControl } from './form-field-child.token';
import { ARD_FORM_FIELD_DEFAULTS } from './form-field.defaults';
import { ArdiumHintErrorDirective } from './hint-error/hint-error.directive';
import { ArdiumHintDirective } from './hint/hint.directive';
import { ArdiumLabelComponent } from './label/label.component';

@Directive()
export abstract class _FormFieldBase {
  protected readonly _DEFAULTS = inject(ARD_FORM_FIELD_DEFAULTS);

  readonly defaultHintAlign = input<SimpleOneAxisAlignment>(this._DEFAULTS.defaultHintAlign);

  public readonly alignHintToLeftByDefault = computed(() => this.defaultHintAlign() === SimpleOneAxisAlignment.Left);

  readonly control = contentChild<ArdFormFieldControl>(ARD_FORM_FIELD_CONTROL);

  get controlHasError() {
    const fnOrValue = this.control()?.hasError;
    return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
  }
  get controlIsSuccess() {
    const fnOrValue = this.control()?.isSuccess;
    return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
  }
  get controlDisabled() {
    const fnOrValue = this.control()?.disabled;
    return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
  }
  get controlHtmlId() {
    const fnOrValue = this.control()?.htmlId;
    return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
  }
  // get controlRequired() {
  //   const fnOrValue = this.control()?.required;
  //   return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
  // }

  readonly label = contentChild<ArdiumLabelComponent>(ArdiumLabelComponent);

  readonly hints = contentChildren(ArdiumHintDirective);
  readonly errors = contentChildren(ArdiumErrorDirective);
  readonly autoErrors = contentChildren(ArdiumAutoErrorComponent);
  readonly hintErrors = contentChildren(ArdiumHintErrorDirective);

  readonly hasAnyHint = computed<boolean>(() => this.hints().length > 0 || this.hintErrors().length > 0);
  readonly hasAnyError = computed<boolean>(
    () => this.errors().length > 0 || (this.autoErrors().length > 0 && this.autoErrors().some(e => e.hasError()))
  );
  readonly reserveHintLine = input<boolean, BooleanLike>(this._DEFAULTS.reserveHintLine, {
    transform: v => coerceBooleanProperty(v),
  });

  ngOnInit(): void {
    if (!this.control()) {
      throw new Error(
        `ARD-FT5110: Form field component requires any control (input) to be present within the element. Found none.`
      );
    }
  }
}
