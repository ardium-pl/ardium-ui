import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumSlideToggleModule } from '../../../../../ui/src/public-api';
import { SlideTogglePage } from './slide-toggle.page';

@NgModule({
  declarations: [SlideTogglePage],
  imports: [CommonModule, ArdiumSlideToggleModule, FormsModule],
})
export class SlideToggleModule {}
