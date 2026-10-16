import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumDividerModule } from '../../../../../ui/src/public-api';
import { DividerPage } from './divider.page';

@NgModule({
  declarations: [DividerPage],
  imports: [CommonModule, ArdiumDividerModule],
})
export class DividerModule {}
