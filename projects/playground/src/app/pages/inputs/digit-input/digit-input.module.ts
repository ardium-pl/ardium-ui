import { CdkAutofill } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumDigitInputModule } from '../../../../../../ui/src/public-api';
import { DigitInputPage } from './digit-input.page';

@NgModule({
  declarations: [DigitInputPage],
  imports: [CommonModule, ArdiumDigitInputModule, ReactiveFormsModule, CdkAutofill],
})
export class DigitInputModule {}
