import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumPasswordInputModule } from '../../../../../../ui/src/public-api';
import { PasswordInputDefaultPrefixDemoComponent } from './default-prefix-suffix.component';
import { PasswordInputPage } from './password-input.page';

@NgModule({
  declarations: [PasswordInputPage],
  imports: [CommonModule, ArdiumPasswordInputModule, PasswordInputDefaultPrefixDemoComponent],
})
export class PasswordInputModule {}
