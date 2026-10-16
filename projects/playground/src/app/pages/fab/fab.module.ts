import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumCheckboxModule, ArdiumFabModule, ArdiumIconModule, ArdiumInputModule, ArdiumSelectModule } from '../../../../../ui/src/public-api';
import { FabPage } from './fab.page';

@NgModule({
  declarations: [FabPage],
  imports: [CommonModule, ArdiumFabModule, ArdiumIconModule, ArdiumSelectModule, ArdiumCheckboxModule, ArdiumInputModule],
})
export class FabModule {}
