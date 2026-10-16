import { Directive, TemplateRef } from '@angular/core';
import { ArdFormFieldFramePrefix, ArdFormFieldFrameSuffix, FormFieldFrameTemplateContext } from '../../form-field-frame';
import { ArdPlaceholderContext } from '../../types/templates.types';
import { TemplateComponent } from '../../types/utility.types';

@Directive({ standalone: false, selector: 'ard-hex-input > ng-template[ard-placeholder-tmp]' })
export class ArdHexInputPlaceholderTemplateDirective {
  constructor(public template: TemplateRef<ArdPlaceholderContext>) {}
}

@Directive({ standalone: false, selector: 'ard-hex-input ng-template[ard-prefix-tmp]' })
export class ArdHexInputPrefixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-hex-input ng-template[ard-suffix-tmp]' })
export class ArdHexInputSuffixTemplateDirective {
  constructor(public template: TemplateRef<FormFieldFrameTemplateContext>) {}
}

export interface ArdHexInputPlaceholder extends TemplateComponent<ArdPlaceholderContext> {}
export interface ArdHexInputPrefix extends ArdFormFieldFramePrefix {}
export interface ArdHexInputSuffix extends ArdFormFieldFrameSuffix {}
