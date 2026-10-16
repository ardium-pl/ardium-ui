import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumChipModule } from '../../../../../ui/src/public-api';
import { ChipsPage } from './chips.page';

@NgModule({
  declarations: [ChipsPage],
  imports: [CommonModule, ArdiumChipModule],
})
export class ChipsModule {}
