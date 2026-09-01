import { Directive, TemplateRef } from '@angular/core';
import { CheckboxTemplateContext } from './checkbox.types';

@Directive({ standalone: false, selector: 'ard-checkbox > ng-template[ard-checkbox-tmp]' })
export class ArdCheckboxTemplateDirective {
  constructor(public template: TemplateRef<CheckboxTemplateContext>) {}
}

@Directive({ standalone: false, selector: 'ard-checkbox > ng-template[ard-label-tmp]' })
export class ArdCheckboxLabelTemplateDirective {
  constructor(public template: TemplateRef<undefined>) {}
}
