import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumButtonModule, ArdiumCheckboxModule, ArdiumIconModule, ArdiumInputModule, ArdiumRadioModule, ArdiumSelectModule } from '../../../../../ui/src/public-api';
import { ButtonPage } from './button.page';

@NgModule({
  declarations: [ButtonPage],
  imports: [
    CommonModule,
    ArdiumButtonModule,
    ArdiumRadioModule,
    ArdiumCheckboxModule,
    ArdiumSelectModule,
    ArdiumInputModule,
    ArdiumIconModule,
  ],
})
export class ButtonModule {}
