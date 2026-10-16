import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumIconModule, ArdiumRatingDisplayModule, ArdiumRatingInputModule, ArdiumStarButtonModule, ArdiumStarModule } from '../../../../../ui/src/public-api';
import { StarsPage } from './stars.page';

@NgModule({
  declarations: [StarsPage],
  imports: [
    CommonModule,
    ArdiumStarModule,
    ArdiumStarButtonModule,
    ArdiumRatingDisplayModule,
    ArdiumRatingInputModule,
    ArdiumIconModule,
  ],
})
export class StarsModule {}
