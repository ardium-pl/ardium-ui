import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../../types/utility.types';
import { ArdStarButtonStarTemplateContext } from './star-button.types';

@Directive({
  standalone: false,
  selector: 'ard-star-button > ng-template[ard-star-tmp]',
})
export class ArdStarButtonStarTemplateDirective {
  constructor(public template: TemplateRef<ArdStarButtonStarTemplateContext>) {}
}

export interface ArdStarButtonStarIcon extends TemplateComponent<ArdStarButtonStarTemplateContext> {}