import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../../types/utility.types';
import { ArdRatingInputStarButtonTemplateContext } from './rating-input.types';

@Directive({
  standalone: false,
  selector: 'ard-rating-input > ng-template[ard-star-button-tmp]',
})
export class ArdRatingInputStarButtonTemplateDirective {
  constructor(public template: TemplateRef<ArdRatingInputStarButtonTemplateContext>) {}
}

export interface ArdRatingInputStarButton extends TemplateComponent<ArdRatingInputStarButtonTemplateContext> {}