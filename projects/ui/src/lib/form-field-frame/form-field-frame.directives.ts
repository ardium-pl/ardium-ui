import { Directive, TemplateRef } from '@angular/core';
import { FormFieldFrameTemplateContext } from './form-field-frame.types';

@Directive({ standalone: false, selector: 'ard-form-field-frame > ng-template[ard-prefix-tmp]' })
export class ArdFormFieldPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-form-field-frame > ng-template[ard-suffix-tmp]' })
export class ArdFormFieldSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}
