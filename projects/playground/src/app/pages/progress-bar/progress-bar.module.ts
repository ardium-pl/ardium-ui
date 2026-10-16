import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumProgressBarModule } from '../../../../../ui/src/public-api';
import { ProgressBarPage } from './progress-bar.page';

@NgModule({
  declarations: [ProgressBarPage],
  imports: [CommonModule, ArdiumProgressBarModule],
})
export class ProgressBarModule {}
