import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumSpinnerModule } from '../../../../../ui/src/public-api';
import { SpinnerPage } from './spinner.page';

@NgModule({
  declarations: [SpinnerPage],
  imports: [CommonModule, ArdiumSpinnerModule],
})
export class SpinnerModule {}
