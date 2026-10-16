import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumCheckboxModule, ArdiumIconButtonModule, ArdiumIconModule, ArdiumInputModule, ArdiumSelectModule } from '../../../../../ui/src/public-api';
import { IconButtonPage } from './icon-button.page';

@NgModule({
  declarations: [IconButtonPage],
  imports: [
    CommonModule,
    ArdiumIconButtonModule,
    ArdiumSelectModule,
    ArdiumInputModule,
    ArdiumCheckboxModule,
    ArdiumIconModule,
  ],
})
export class IconButtonModule {}
