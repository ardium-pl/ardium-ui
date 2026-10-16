import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../types/utility.types';
import { TabberLabelContext } from './tabber.types';

@Directive({
  standalone: false,
  selector: 'ng-template[ard-tabber-label-tmp]',
})
export class ArdTabberLabelTemplateDirective {
  constructor(public template: TemplateRef<TabberLabelContext>) {}
}

export interface ArdTabberLabel extends TemplateComponent<TabberLabelContext> {}