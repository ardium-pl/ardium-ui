import { Directive, TemplateRef } from '@angular/core';
import { ArdModalHeadingTemplateContext } from './modal.types';

@Directive({ standalone: false, selector: 'ard-modal > ng-template[ard-close-icon-tmp]' })
export class ArdModalCloseIconTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}

@Directive({ standalone: false, selector: 'ard-modal > ng-template[ard-heading-tmp]' })
export class ArdModalHeadingTemplateDirective {
  constructor(public template: TemplateRef<ArdModalHeadingTemplateContext>) {}
}
