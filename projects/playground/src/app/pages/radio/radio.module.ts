import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumRadioModule } from '../../../../../ui/src/public-api';
import { RadioPage } from './radio.page';

@NgModule({
  declarations: [RadioPage],
  imports: [CommonModule, ArdiumRadioModule, ReactiveFormsModule],
})
export class RadioModule {}
