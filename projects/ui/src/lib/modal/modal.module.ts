import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumIconButtonModule } from '../buttons/icon-button/icon-button.module';
import { ArdiumIconModule } from '../icon/icon.module';
import { ArdiumModalComponent } from './modal.component';
import { ArdModalCloseIconTemplateDirective, ArdModalHeadingTemplateDirective } from './modal.directives';

@NgModule({
  declarations: [ArdiumModalComponent, ArdModalCloseIconTemplateDirective, ArdModalHeadingTemplateDirective],
  imports: [CommonModule, ArdiumIconButtonModule, ArdiumIconModule, A11yModule],
  exports: [ArdiumModalComponent, ArdModalCloseIconTemplateDirective, ArdModalHeadingTemplateDirective],
})
export class ArdiumModalModule {}
