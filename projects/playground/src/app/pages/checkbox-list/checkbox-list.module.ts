import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { ArdiumCheckboxListModule } from '../../../../../ui/src/public-api';
import { CheckboxListPage } from './checkbox-list.page';
import { CheckboxListDefaultLabelDemoComponent } from './default-label-component.component';

@NgModule({
  declarations: [CheckboxListPage],
  imports: [
    CommonModule,
    ArdiumCheckboxListModule,
    ReactiveFormsModule,
    JsonPipe,
    CheckboxListDefaultLabelDemoComponent,
    FormField,
  ],
})
export class CheckboxListModule {}
