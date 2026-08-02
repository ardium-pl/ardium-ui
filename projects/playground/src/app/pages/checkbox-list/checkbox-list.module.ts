import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ArdiumCheckboxListModule } from 'projects/ui/src/public-api';
import { CheckboxListDefaultLabelDemoComponent } from './default-label-component.component';
import { CheckboxListPage } from './checkbox-list.page';

@NgModule({
  declarations: [CheckboxListPage],
  imports: [CommonModule, ArdiumCheckboxListModule, ReactiveFormsModule, JsonPipe, CheckboxListDefaultLabelDemoComponent],
})
export class CheckboxListModule {}
