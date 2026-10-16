import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumButtonModule, ArdiumCardModule, ArdiumFabModule, ArdiumIconModule } from '../../../../../ui/src/public-api';
import { CardPage } from './card.page';

@NgModule({
  declarations: [CardPage],
  imports: [CommonModule, ArdiumCardModule, ArdiumButtonModule, ArdiumFabModule, ArdiumIconModule],
})
export class CardModule {}
