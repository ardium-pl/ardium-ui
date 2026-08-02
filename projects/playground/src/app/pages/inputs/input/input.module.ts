import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArdiumIconModule, ArdiumInputModule } from 'projects/ui/src/public-api';
import { InputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { InputPage } from './input.page';

@NgModule({
  declarations: [InputPage],
  imports: [CommonModule, ArdiumInputModule, FormsModule, ArdiumIconModule, InputDefaultPrefixDemoComponent],
})
export class InputModule {}
