import { Directive, TemplateRef } from '@angular/core';
import { ArdFormFieldFramePrefix, FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdPlaceholderContext } from '../../types/templates.types';
import { TemplateComponent } from '../../types/utility.types';

@Directive({ standalone: false, selector: 'ard-input > ng-template[ard-placeholder-tmp]' })
export class ArdInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<ArdPlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-input > ng-template[ard-prefix-tmp]' })
export class ArdInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-input > ng-template[ard-suffix-tmp]' })
export class ArdInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

export interface ArdInputPlaceholder extends TemplateComponent<ArdPlaceholderContext> {}
export interface ArdInputPrefix extends ArdFormFieldFramePrefix {}
export interface ArdInputSuffix extends ArdFormFieldFramePrefix {}