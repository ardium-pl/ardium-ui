import { Directive, TemplateRef } from '@angular/core';
import { ArdFormFieldFramePrefix, FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdPlaceholderContext } from '../../types/templates.types';

@Directive({ standalone: false, selector: 'ard-number-input > ng-template[ard-placeholder-tmp]' })
export class ArdNumberInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<ArdPlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-number-input > ng-template[ard-prefix-tmp]' })
export class ArdNumberInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-number-input > ng-template[ard-suffix-tmp]' })
export class ArdNumberInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

export interface ArdNumberInputPlaceholder extends TemplateRef<ArdPlaceholderContext> {}
export interface ArdNumberInputPrefix extends ArdFormFieldFramePrefix {}
export interface ArdNumberInputSuffix extends ArdFormFieldFramePrefix {}
