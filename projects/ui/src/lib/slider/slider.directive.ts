import { Directive, TemplateRef } from '@angular/core';
import { TemplateComponent } from '../types/utility.types';
import { SliderTooltipContext } from './slider.types';

@Directive({
  standalone: false,
  selector: 'ng-template[ard-slider-tooltip-tmp]',
})
export class ArdSliderTooltipDirective {
  constructor(public template: TemplateRef<SliderTooltipContext>) {}
}

export interface ArdSliderTooltip extends TemplateComponent<SliderTooltipContext> {}
