import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { ArdiumCheckboxModule } from '../../../../../ui/src/public-api';
import { CheckboxDefaultComponent } from './checkbox-default-component.component';
import { CheckboxPage } from './checkbox.page';

@NgModule({
  declarations: [CheckboxPage],
  imports: [
    CommonModule,
    ArdiumCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxDefaultComponent,
    FormField,
  ],
})
export class CheckboxModule {}
