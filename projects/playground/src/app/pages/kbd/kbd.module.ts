import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumKbdModule } from '../../../../../ui/src/public-api';
import { KbdPage } from './kbd.page';

@NgModule({
  declarations: [KbdPage],
  imports: [CommonModule, ArdiumKbdModule],
})
export class KbdModule {}
