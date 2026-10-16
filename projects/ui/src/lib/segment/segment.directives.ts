import { Directive, TemplateRef } from '@angular/core';
import { ArdOptionSimple, OptionContext } from '../types/item-storage.types';
import { TemplateComponent } from '../types/utility.types';

@Directive({ standalone: false, selector: 'ng-template[ard-segm-option-tmp]' })
export class ArdSegmentOptionTemplateDirective {
  constructor(readonly template: TemplateRef<OptionContext<ArdOptionSimple>>) {}
}

export interface ArdSegmentOption extends TemplateComponent<OptionContext<ArdOptionSimple>> {}
