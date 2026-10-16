import { Directive, TemplateRef } from '@angular/core';
import { ArdFormFieldFramePrefix, ArdFormFieldFrameSuffix, FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdPlaceholderContext } from '../../types/templates.types';
import { TemplateComponent } from '../../types/utility.types';
import { PasswordInputRevealButtonContext } from './password-input.types';

@Directive({
  standalone: false,
  selector: 'ard-password-input > ng-template[ard-placeholder-tmp]',
})
export class ArdPasswordInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<ArdPlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-password-input > ng-template[ard-prefix-tmp]' })
export class ArdPasswordInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-password-input > ng-template[ard-suffix-tmp]' })
export class ArdPasswordInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-password-input > ng-template[ard-reveal-tmp]' })
export class ArdPasswordInputRevealButtonTemplateDirective {
  constructor(public template: TemplateRef<PasswordInputRevealButtonContext>) {}
}

export interface ArdPassowrdInputPlaceholder extends TemplateComponent<ArdPlaceholderContext> {}
export interface ArdPasswordInputPrefix extends ArdFormFieldFramePrefix {}
export interface ArdPasswordInputSuffix extends ArdFormFieldFrameSuffix {}
export interface ArdPasswordInputRevealButton extends TemplateComponent<PasswordInputRevealButtonContext> {}
