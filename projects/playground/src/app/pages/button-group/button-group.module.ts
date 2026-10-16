import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumButtonGroupModule, ArdiumButtonModule, ArdiumDividerModule, ArdiumIconModule } from '../../../../../ui/src/public-api';
import { ButtonGroupPage } from './button-group.page';

@NgModule({
  declarations: [ButtonGroupPage],
  imports: [CommonModule, ArdiumButtonGroupModule, ArdiumButtonModule, ArdiumIconModule, ArdiumDividerModule],
})
export class ButtonGroupModule {}
