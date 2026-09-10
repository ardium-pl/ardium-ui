import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumHoldModule } from '@ardium-pl/devkit';
import { ArdiumButtonModule } from '../../buttons/button/button.module';
import { ArdiumNumberInputComponent } from './number-input.component';
import {
    ArdNumberInputPlaceholderTemplateDirective,
    ArdNumberInputPrefixTemplateDirective,
    ArdNumberInputSuffixTemplateDirective,
} from './number-input.directives';

@NgModule({
  declarations: [
    ArdiumNumberInputComponent,
    ArdNumberInputPlaceholderTemplateDirective,
    ArdNumberInputPrefixTemplateDirective,
    ArdNumberInputSuffixTemplateDirective,
  ],
  imports: [CommonModule, ArdiumHoldModule, ArdiumButtonModule],
  exports: [
    ArdiumNumberInputComponent,
    ArdNumberInputPlaceholderTemplateDirective,
    ArdNumberInputPrefixTemplateDirective,
    ArdNumberInputSuffixTemplateDirective,
  ],
})
export class ArdiumNumberInputModule {}
