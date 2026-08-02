import { Directive, TemplateRef } from '@angular/core';
import { FormFieldFrameTemplateContext } from '../../form-field-frame';

@Directive({ standalone: false, selector: 'ard-hex-input > ng-template[ard-placeholder-tmp]' })
export class ArdHexInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-hex-input ng-template[ard-prefix-tmp]' })
export class ArdHexInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-hex-input ng-template[ard-suffix-tmp]' })
export class ArdHexInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}
