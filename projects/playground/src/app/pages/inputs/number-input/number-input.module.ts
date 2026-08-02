import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArdiumFormFieldModule, ArdiumNumberInputModule } from 'projects/ui/src/public-api';
import { NumberInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { NumberInputPage } from './number-input.page';

@NgModule({
  declarations: [NumberInputPage],
  imports: [CommonModule, FormsModule, ArdiumNumberInputModule, ReactiveFormsModule, ArdiumFormFieldModule, JsonPipe, NumberInputDefaultPrefixDemoComponent],
})
export class NumberInputModule {}
