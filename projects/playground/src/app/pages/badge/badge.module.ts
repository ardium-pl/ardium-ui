import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  ArdiumBadgeModule,
  ArdiumButtonModule,
  ArdiumCheckboxModule,
  ArdiumInputModule,
  ArdiumRadioModule,
  ArdiumSegmentModule,
  ArdiumSelectModule,
} from '../../../../../ui/src/public-api';
import { BadgePage } from './badge.page';

@NgModule({
  declarations: [BadgePage],
  imports: [
    CommonModule,
    ArdiumBadgeModule,
    ArdiumButtonModule,
    ArdiumSelectModule,
    ArdiumSegmentModule,
    ArdiumInputModule,
    ArdiumCheckboxModule,
    ArdiumRadioModule,
  ],
})
export class BadgeModule {}
