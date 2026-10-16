import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../types/utility.types';
import { ArdStarIconContext } from './star.types';

@Directive({
  standalone: false,
  selector: 'ard-star > ng-template[ard-star-icon-tmp]',
})
export class ArdStarIconTemplateDirective {
  constructor(public template: TemplateRef<ArdStarIconContext>) {}
}

export interface ArdStarIcon extends TemplateComponent<ArdStarIconContext> {}