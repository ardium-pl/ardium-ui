import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumIconModule, ArdiumSliderModule } from '../../../../../../ui/src/public-api';
import { SliderPage } from './slider.page';

@NgModule({
  declarations: [SliderPage],
  imports: [CommonModule, ArdiumSliderModule, ArdiumIconModule, ReactiveFormsModule],
  exports: [SliderPage],
})
export class SliderModule {}
