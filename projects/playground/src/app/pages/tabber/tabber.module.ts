import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumTabberModule } from '../../../../../ui/src/public-api';
import { TabberPage } from './tabber.page';

@NgModule({
  declarations: [TabberPage],
  imports: [CommonModule, ArdiumTabberModule],
})
export class TabberModule {}
