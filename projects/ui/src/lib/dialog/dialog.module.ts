import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumButtonModule } from '../buttons/button/button.module';
import { ArdiumModalModule } from '../modal/modal.module';
import { ArdiumDialogComponent } from './dialog.component';
import {
  ArdDialogButtonsTemplateDirective,
  ArdDialogCloseIconTemplateDirective,
  ArdDialogHeadingTemplateDirective,
} from './dialog.directives';

@NgModule({
  declarations: [
    ArdiumDialogComponent,
    ArdDialogButtonsTemplateDirective,
    ArdDialogCloseIconTemplateDirective,
    ArdDialogHeadingTemplateDirective,
  ],
  imports: [CommonModule, ArdiumButtonModule, ArdiumModalModule],
  exports: [
    ArdiumDialogComponent,
    ArdDialogButtonsTemplateDirective,
    ArdDialogCloseIconTemplateDirective,
    ArdDialogHeadingTemplateDirective,
  ],
})
export class ArdiumDialogModule {}
