import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { ArdiumIconModule, ArdiumInputModule } from '../../../../../../ui/src/public-api';
import { InputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { InputPage } from './input.page';

@NgModule({
  declarations: [InputPage],
  imports: [
    CommonModule,
    ArdiumInputModule,
    FormsModule,
    ArdiumIconModule,
    InputDefaultPrefixDemoComponent,
    ReactiveFormsModule,
    FormField,
  ],
})
export class InputModule {}
