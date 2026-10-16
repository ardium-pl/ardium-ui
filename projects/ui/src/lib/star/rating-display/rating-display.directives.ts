import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../../types/utility.types';
import { ArdRatingDisplayStarTemplateContext } from './rating-display.types';

@Directive({
  standalone: false,
  selector: 'ard-rating-display > ng-template[ard-star-tmp]',
})
export class ArdRatingDisplayStarTemplateDirective {
  constructor(public template: TemplateRef<ArdRatingDisplayStarTemplateContext>) {}
}

export interface ArdRatingDisplayStar extends TemplateComponent<ArdRatingDisplayStarTemplateContext> {}