import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumRangeSliderModule } from '../../../../../../ui/src/public-api';
import { RangeSliderPage } from './range-slider.page';

@NgModule({
  declarations: [RangeSliderPage],
  imports: [CommonModule, ArdiumRangeSliderModule, ReactiveFormsModule],
})
export class RangeSliderModule {}
